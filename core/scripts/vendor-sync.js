#!/usr/bin/env node
/**
 * vendor-sync.js — Bidirektionaler Vendor-Sync (Phase 2)
 *
 * Löst Drift zwischen Live-Core (core/src/, start.bat, etc.)
 * und dem Release-Bundle (core/release/SyxBridge_vX.XX/) auf.
 *
 * Richtungen:
 *   forward  — Source → Release  (Source neuer → Release aktualisieren)
 *   reverse  — Release → Source  (Release neuer → Source aktualisieren)
 *   auto     — mtime entscheidet (default)
 *
 * Safety:
 *   - --dry-run (default): zeigt was passieren WÜRDE, macht nichts
 *   - --apply: führt Sync tatsächlich aus
 *   - Reverse-Sync: erstellt .bak-Backup vor Überschreiben
 *   - Manifest wird nach Sync automatisch aktualisiert
 *   - Exclude-Listen aus release.js werden respektiert
 *
 * Usage:
 *   node scripts/vendor-sync --dry-run                    # Preview (default)
 *   node scripts/vendor-sync --apply                      # Auto-Sync
 *   node scripts/vendor-sync --apply --direction forward  # Nur Source→Release
 *   node scripts/vendor-sync --apply --direction reverse  # Nur Release→Source
 *   node scripts/vendor-sync --release SyxBridge_v0.20.0-pre-release --apply
 *
 * Exit: 0 = sync erfolgreich (oder nichts zu tun), 1 = Fehler
 *
 * Referenziert von AGENTS.md § FIX-KATEGORIEN — 🟡 Spezialfall
 * CHANGELOG-Ref: [CL:VENDOR-SYNC-PHASE2]
 */

const fs = require('fs');
const path = require('path');

const {
  ROOT, CORE, RELEASE_ROOT,
  ROOT_SOURCE_FILES, MOD_ASSET_DIRS, CORE_RUNTIME_FILES,
  computeSha256, readFileSafe,
  findLatestRelease, walkRelease, releaseToSource,
} = require('./vendor-utils');

// Exclude-Listen aus release.js — werden bei Reverse-Sync respektiert
const EXCLUDE_BASENAMES = new Set([
  '.env', '.env.e2e-live-backup', '.gitignore', '.gitattributes',
  '.gitkeep', '.claude',
  'translations.db', 'translations.db-shm', 'translations.db-wal',
  'log.txt', 'runs.jsonl', 'debug_payloads.txt',
  'server_output.txt', 'stdout.log', 'stderr.log', 'nul',
  'VISION.md', 'MASTER_DOC.md', 'STATUS.md', 'AUDIT_REPORT.md',
  'TODO.md', 'TODO.md.bak-20260616-140600',
  'README.md.bak-20260616-141518',
  'TECHNICAL_REVIEW_2026-06-15.md', 'PATCH_REVIEW_2026-06-16.md',
  'SESSION_REPORT_v0.19.5-prerelease.md',
  'DB_REPORT_v0.19.5.D17.06.U17.06.md',
]);

const EXCLUDE_DIRS = new Set([
  'node_modules', '.git', '.claude', 'backups', 'patches',
  'release', 'archive', 'dbold', 'tests', 'docs', 'plans',
]);

// ── Helpers ───────────────────────────────────────────────────────────

function isExcludedByBasename(filePath) {
  const basename = path.basename(filePath);
  if (EXCLUDE_BASENAMES.has(basename)) return true;
  if (/\.bak-/.test(basename)) return true;
  return false;
}

function isExcludedByDir(filePath) {
  const parts = filePath.replace(/\\/g, '/').split('/');
  for (const part of parts) {
    if (EXCLUDE_DIRS.has(part)) return true;
  }
  return false;
}

// ── Sync Operations ───────────────────────────────────────────────────

const actions = [];

function addAction(type, direction, sourcePath, releasePath, detail) {
  actions.push({ type, direction, sourcePath, releasePath, detail });
}

/**
 * Forward sync: Source → Release
 * Kopiert Source-Datei ins Release-Verzeichnis.
 */
function syncForward(sourcePath, releaseAbsPath, dryRun) {
  if (dryRun) {
    addAction('FORWARD', '→', sourcePath, releaseAbsPath,
      'Source → Release (würde kopiert)');
    return true;
  }

  try {
    const releaseDir = path.dirname(releaseAbsPath);
    if (!fs.existsSync(releaseDir)) {
      fs.mkdirSync(releaseDir, { recursive: true });
    }
    fs.copyFileSync(sourcePath, releaseAbsPath);
    addAction('FORWARD', '→', sourcePath, releaseAbsPath,
      'Source → Release (kopiert)');
    return true;
  } catch (e) {
    addAction('FORWARD_FAIL', '→✗', sourcePath, releaseAbsPath,
      `Fehler beim Kopieren: ${e.message}`);
    return false;
  }
}

/**
 * Reverse sync: Release → Source
 * Kopiert Release-Datei zurück ins Source-Verzeichnis.
 * Erstellt .bak-Backup vor Überschreiben.
 */
function syncReverse(releaseAbsPath, sourcePath, dryRun) {
  // Sicherheits-Check: Exclude-Listen
  if (isExcludedByBasename(sourcePath) || isExcludedByDir(sourcePath)) {
    addAction('REVERSE_SKIP', '←⊘', releaseAbsPath, sourcePath,
      'Übersprungen — Datei steht auf Exclude-Liste');
    return false;
  }

  if (dryRun) {
    addAction('REVERSE', '←', releaseAbsPath, sourcePath,
      'Release → Source (würde kopiert, .bak-Backup)');
    return true;
  }

  try {
    // Backup erstellen
    const bakPath = sourcePath + '.bak';
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, bakPath);
    }

    // Release-Datei ins Source-Verzeichnis kopieren
    const sourceDir = path.dirname(sourcePath);
    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
    }
    fs.copyFileSync(releaseAbsPath, sourcePath);

    addAction('REVERSE', '←', releaseAbsPath, sourcePath,
      'Release → Source (kopiert, .bak-Backup erstellt)');
    return true;
  } catch (e) {
    addAction('REVERSE_FAIL', '←✗', releaseAbsPath, sourcePath,
      `Fehler beim Reverse-Kopieren: ${e.message}`);
    return false;
  }
}

// ── Update .build-manifest.json ───────────────────────────────────────

function updateManifest(releasePath) {
  const manifestPath = path.join(releasePath, '.build-manifest.json');
  if (!fs.existsSync(manifestPath)) return;

  const manifest = JSON.parse(readFileSafe(manifestPath));
  const releaseFiles = walkRelease(releasePath, releasePath);

  const newEntries = [];
  for (const rf of releaseFiles) {
    if (rf.relPath === '.build-manifest.json') continue;
    newEntries.push({ path: rf.relPath, sha256: computeSha256(rf.absPath) });
  }
  newEntries.sort((a, b) => a.path.localeCompare(b.path));

  manifest.files = newEntries;
  manifest.file_count = newEntries.length;
  manifest.generated_at = new Date().toISOString();

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
}

// ── Main Sync Logic ───────────────────────────────────────────────────

function runVendorSync(targetRelease, direction, dryRun) {
  let release;
  if (targetRelease) {
    const releasePath = path.join(RELEASE_ROOT, targetRelease);
    if (!fs.existsSync(releasePath)) {
      console.error(`❌ Release '${targetRelease}' nicht gefunden in ${RELEASE_ROOT}`);
      process.exit(1);
    }
    release = { name: targetRelease, path: releasePath };
  } else {
    release = findLatestRelease();
  }

  if (!release) {
    console.log('⚠️  Kein Release-Bundle gefunden.');
    process.exit(0);
  }

  const manifestPath = path.join(release.path, '.build-manifest.json');
  const hasManifest = fs.existsSync(manifestPath);

  console.log(`\n${'='.repeat(60)}`);
  console.log(`  VENDOR SYNC — ${release.name}`);
  console.log(`  Richtung: ${direction.toUpperCase()}`);
  console.log(`  Modus: ${dryRun ? 'DRY-RUN (keine Änderungen)' : 'APPLY (Änderungen werden ausgeführt)'}`);
  console.log(`${'='.repeat(60)}\n`);

  const releaseFiles = walkRelease(release.path, release.path);

  // ── Phase 1: Analyse ───────────────────────────────────────────────
  const syncCandidates = [];

  for (const rf of releaseFiles) {
    if (rf.relPath === '.build-manifest.json') continue;

    const mapping = releaseToSource(rf.relPath);
    if (!mapping) continue; // ORPHANED — keine Source-Pendant, kann nicht syncen

    if (!fs.existsSync(mapping.sourcePath)) {
      // MISSING_SOURCE — Source existiert nicht. Nur Reverse-able wenn Datei im Release vorhanden.
      if (direction === 'reverse' || direction === 'auto') {
        syncCandidates.push({ type: 'MISSING_SOURCE', sourcePath: mapping.sourcePath,
          releasePath: rf.absPath, relPath: rf.relPath, direction: 'reverse' });
      }
      continue;
    }

    const sourceHash = computeSha256(mapping.sourcePath);
    const releaseHash = computeSha256(rf.absPath);

    if (sourceHash === releaseHash) continue; // Identisch — nichts zu tun

    const sourceMtime = fs.statSync(mapping.sourcePath).mtime;
    const releaseMtime = fs.statSync(rf.absPath).mtime;

    let syncDir;
    if (direction === 'forward') {
      syncDir = 'forward';
    } else if (direction === 'reverse') {
      syncDir = 'reverse';
    } else {
      // auto: mtime entscheidet
      syncDir = sourceMtime > releaseMtime ? 'forward' : 'reverse';
    }

    syncCandidates.push({
      type: 'DRIFT',
      sourcePath: mapping.sourcePath,
      releasePath: rf.absPath,
      relPath: rf.relPath,
      direction: syncDir,
      sourceMtime,
      releaseMtime,
      sourceHash,
      releaseHash
    });
  }

  // ── Phase 2: Ausführung ────────────────────────────────────────────
  if (syncCandidates.length === 0) {
    console.log('✅ KEIN DRIFT — Live-Core und Release sind synchron.');
    console.log(`   Release: ${release.path}`);
    console.log(`   Dateien: ${releaseFiles.length}`);
    console.log('');
    process.exit(0);
  }

  let forwardCount = 0;
  let reverseCount = 0;
  let failCount = 0;
  let skipCount = 0;

  for (const cand of syncCandidates) {
    const ageDiff = cand.sourceMtime && cand.releaseMtime
      ? ` (Source: ${cand.sourceMtime.toISOString().slice(0, 19)}, Release: ${cand.releaseMtime.toISOString().slice(0, 19)})`
      : '';

    if (cand.type === 'MISSING_SOURCE') {
      console.log(`  ← [MISSING] ${cand.relPath}`);
      console.log('    Release-Datei vorhanden, Source fehlt. Reverse-Sync würde sie wiederherstellen.');
      if (!dryRun) {
        const ok = syncReverse(cand.releasePath, cand.sourcePath, dryRun);
        if (ok) reverseCount++; else failCount++;
      } else {
        reverseCount++;
      }
    } else if (cand.direction === 'forward') {
      console.log(`  → [DRIFT]  ${cand.relPath}${ageDiff}`);
      if (!dryRun) {
        const ok = syncForward(cand.sourcePath, cand.releasePath, dryRun);
        if (ok) forwardCount++; else failCount++;
      } else {
        forwardCount++;
      }
    } else {
      console.log(`  ← [DRIFT]  ${cand.relPath}${ageDiff}`);
      if (!dryRun) {
        const ok = syncReverse(cand.releasePath, cand.sourcePath, dryRun);
        if (ok) {
          reverseCount++;
        } else if (isExcludedByBasename(cand.sourcePath) || isExcludedByDir(cand.sourcePath)) {
          skipCount++;
        } else {
          failCount++;
        }
      } else {
        reverseCount++;
      }
    }
  }

  // ── Manifest aktualisieren ─────────────────────────────────────────
  if (!dryRun && (forwardCount > 0 || reverseCount > 0)) {
    updateManifest(release.path);
    console.log('\n  📋 .build-manifest.json aktualisiert');
  }

  // ── Summary ────────────────────────────────────────────────────────
  console.log(`\n${'─'.repeat(60)}`);
  console.log(`  Forward  (Source→Release): ${forwardCount}`);
  console.log(`  Reverse  (Release→Source): ${reverseCount}`);
  console.log(`  Übersprungen (Exclude):    ${skipCount}`);
  console.log(`  Fehlgeschlagen:            ${failCount}`);
  console.log(`${'─'.repeat(60)}`);

  if (dryRun) {
    console.log('\n💡 DRY-RUN — keine Änderungen vorgenommen.');
    console.log('   Verwende --apply um den Sync auszuführen.\n');
  } else {
    console.log('\n✅ SYNC ABGESCHLOSSEN.\n');
    if (forwardCount > 0) {
      console.log('⚠️  Forward-Sync hat den Release-Ordner aktualisiert.');
      console.log('   Das Release-ZIP ist jetzt stale. Führe release.js für einen vollständigen Build aus.\n');
    }
    if (reverseCount > 0) {
      console.log('⚠️  Reverse-Sync hat Source-Dateien überschrieben.');
      console.log('   .bak-Backups wurden erstellt. Prüfe die Änderungen mit `git diff`.\n');
    }
  }

  const totalActions = forwardCount + reverseCount;
  if (failCount > 0) {
    process.exit(1);
  }
  process.exit(0);
}

// ── CLI ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let targetRelease = null;
let direction = 'auto';
let dryRun = true;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--release' && i + 1 < args.length) {
    targetRelease = args[++i];
  } else if (args[i] === '--direction' && i + 1 < args.length) {
    direction = args[++i];
    if (!['forward', 'reverse', 'auto'].includes(direction)) {
      console.error(`❌ Ungültige Richtung: "${direction}". Erwartet: forward, reverse, auto`);
      process.exit(1);
    }
  } else if (args[i] === '--apply') {
    dryRun = false;
  } else if (args[i] === '--dry-run') {
    dryRun = true;
  }
}

runVendorSync(targetRelease, direction, dryRun);
