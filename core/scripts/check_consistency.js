#!/usr/bin/env node
/**
 * check_consistency.js — Konsistenz-Checker fuer SyxBridge
 *
 * BU-030: Modularisiert — alle Check-Funktionen geben Issues-Arrays
 * zurueck statt in globale Variablen zu schreiben.
 * Funktionen koennen jetzt programmatisch importiert werden.
 *
 * Findet:
 * 1. Namens-Inkonsistenzen (X-Bridge in oeffentlichen Dateien, falsche Version)
 * 2. Stale .env-Dateien (Root .env obwohl core/.env existiert)
 * 3. Stale Versions-Referenzen (alte Version in Dateien die sync-version.js nicht abdeckt)
 * 4. Doppelte/dead Imports
 * 5. TODO/FIXME/HACK Marker die vergessen wurden
 * 6. Vendor-Drift (Manifest Cross-Check)
 * 7. Archive-Bloat
 *
 * Usage: node scripts/check_consistency [--fix]
 * Exit: 0 = alles ok, 1 = Issues gefunden
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Issue Factory (BU-030: pure function, kein globaler State) ─────────
function makeIssue(category, file, line, message, severity = 'WARN') {
  // Normalisiere file-Pfade fuer programmatische Nutzung
  let relFile = file;
  if (!path.isAbsolute(relFile)) {
    relFile = path.resolve(relFile);
  }
  return { category, file: relFile, line, message, severity };
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf-8'); } catch { return null; }
}

function computeSha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

/**
 * checkNaming(opts) — Prueft ob "X-Bridge" in oeffentlichen Dateien vorkommt.
 * BU-030: Gibt Issues-Array zurueck statt in globale Variable zu schreiben.
 */
function checkNaming(opts) {
  const issues = [];
  const { ROOT, CORE } = opts;
  // X-Bridge darf NUR in archive/docs/VISION.md vorkommen (intern)
  // Nicht in README.md, package.json, index.js, gui, etc.
  const publicFiles = [
    path.join(ROOT, 'README.md'),
    path.join(CORE, 'package.json'),
    path.join(CORE, 'index.js'),
    path.join(CORE, 'GUI', 'server.js'),
    path.join(CORE, 'GUI', 'public', 'index.html'),
    path.join(CORE, 'GUI', 'public', 'app.js'),
    path.join(CORE, 'Translation', 'cli-progress.js'),
  ];

  for (const file of publicFiles) {
    const content = readFileSafe(file);
    if (!content) continue;
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      // Match "X-Bridge" as a project name (not in comments explaining the vision)
      if (/\bX-Bridge\b/.test(lines[i]) && !lines[i].includes('Zukunftsname') && !lines[i].includes('Post-v0.20')) {
        issues.push(makeIssue('NAMING', file, i + 1, `"X-Bridge" in oeffentlicher Datei — sollte "SyxBridge" sein: ${lines[i].trim().substring(0, 80)}`, 'ERROR'));
      }
    }
  }
  return issues;
}

/**
 * checkEnvFiles(opts) — Prueft .env Museum und Backup-Dateien.
 * BU-030: Gibt Issues-Array zurueck statt in globale Variable zu schreiben.
 */
function checkEnvFiles(opts) {
  const issues = [];
  const { ROOT, CORE } = opts;
  const rootEnv = path.join(ROOT, '.env');
  const coreEnv = path.join(CORE, '.env');

  if (fs.existsSync(rootEnv) && fs.existsSync(coreEnv)) {
    const rootStat = fs.statSync(rootEnv);
    const coreStat = fs.statSync(coreEnv);
    // Root .env ist ein Artefakt wenn core/.env juenger ist
    if (coreStat.mtimeMs > rootStat.mtimeMs) {
      issues.push(makeIssue('ENV_MUSEUM', rootEnv, 0,
        `Root .env (${rootStat.mtime.toISOString()}) ist aelter als core/.env (${coreStat.mtime.toISOString()}) — wahrscheinlich P5-Bug-Artefakt. Kann geloescht werden.`, 'WARN'));
    }
  }

  // .env.e2e-live-backup pruefen
  const e2eBackup = path.join(CORE, '.env.e2e-live-backup');
  if (fs.existsSync(e2eBackup)) {
    const gitignore = readFileSafe(path.join(ROOT, '.gitignore')) || '';
    if (!gitignore.includes('.env.e2e-live-backup')) {
      issues.push(makeIssue('ENV_MUSEUM', e2eBackup, 0,
        'E2E-Backup-.env nicht in .gitignore — kann versehentlich committed werden.', 'ERROR'));
    } else {
      // Info: exists but gitignored — ok
    }
  }
  return issues;
}

/**
 * checkVersions(opts) — Prueft auf stale Versions-Referenzen.
 * BU-030: Gibt Issues-Array zurueck statt in globale Variable zu schreiben.
 */
function checkVersions(opts) {
  const issues = [];
  const { CURRENT_VERSION, CORE, ROOT } = opts;
  // sync-version.js deckt 7 Dateien ab. Pruefe ob andere Dateien alte Versionen enthalten.
  const stalePattern = /v0\.1[0-9]\.\d+[a-z]?/g;

  // Files NOT covered by sync-version.js that might have stale versions
  const uncheckedFiles = [
    path.join(CORE, 'Translation', 'text-core.js'),
    path.join(CORE, 'Translation', 'dispatcher.js'),
    path.join(CORE, 'Translation', 'router.js'),
    path.join(CORE, 'DB', 'db.js'),
    path.join(CORE, 'Translation', 'exporter.js'),
    path.join(CORE, 'Translation', 'validator.js'),
    path.join(CORE, 'index.js'),
    path.join(CORE, 'archive', 'docs', 'MASTER_DOC.md'),
    path.join(CORE, 'archive', 'docs', 'STATUS.md'),
    path.join(CORE, 'archive', 'docs', 'VISION.md'),
    path.join(ROOT, 'AGENTS.md'),
  ];

  for (const file of uncheckedFiles) {
    const content = readFileSafe(file);
    if (!content) continue;
    const lines = content.split(/\r?\n/);
    for (let i = 0; i < lines.length; i++) {
      const matches = lines[i].match(stalePattern);
      if (matches) {
        for (const match of matches) {
          if (match !== CURRENT_VERSION && match !== `v${CURRENT_VERSION}`) {
            issues.push(makeIssue('STALE_VERSION', file, i + 1,
              `Alte Version "${match}" (aktuell: ${CURRENT_VERSION}): ${lines[i].trim().substring(0, 80)}`, 'WARN'));
          }
        }
      }
    }
  }
  return issues;
}

/**
 * checkArchive(opts) — Prueft Archive-Ordner auf Bloat.
 * BU-030: Gibt Issues-Array zurueck statt in globale Variable zu schreiben.
 */
function checkArchive(opts) {
  const issues = [];
  const { CORE } = opts;
  const archiveDir = path.join(CORE, 'archive');
  if (!fs.existsSync(archiveDir)) return issues;

  let totalSize = 0;
  function walk(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) { walk(fullPath); continue; }
      const stat = fs.statSync(fullPath);
      totalSize += stat.size;
    }
  }
  walk(archiveDir);

  if (totalSize > 5 * 1024 * 1024) {
    issues.push(makeIssue('ARCHIVE', archiveDir, 0,
      `Archive-Ordner ist ${(totalSize / 1024 / 1024).toFixed(1)} MB — pruefen ob alles noch gebraucht wird.`, 'WARN'));
  }
  return issues;
}

/**
 * checkForgottenMarkers(opts) — Prueft auf vergessene TODO/FIXME/HACK Marker.
 * BU-030: Gibt Issues-Array zurueck statt in globale Variable zu schreiben.
 */
function checkForgottenMarkers(opts) {
  const issues = [];
  const { CORE } = opts;
  // Post-Restructuring: core/src/ no longer exists.
  // Scan the actual source directories: Translation/, DB/, GUI/, commit-layer/
  const sourceDirs = [
    path.join(CORE, 'Translation'),
    path.join(CORE, 'DB'),
    path.join(CORE, 'GUI'),
    path.join(CORE, 'commit-layer'),
    path.join(CORE, 'scripts'),
  ];

  function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'public') {
        scanDir(fullPath);
        continue;
      }
      if (!entry.isFile() || !entry.name.endsWith('.js')) continue;
      const content = readFileSafe(fullPath);
      if (!content) continue;
      const lines = content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip comments that are clearly documentation
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
          // Only flag if it looks like a forgotten action item
          if (/\b(FIXME|HACK)\b/.test(line) && !line.includes('@codebuff')) {
            issues.push(makeIssue('MARKER', fullPath, i + 1,
              `Vergessener Marker: ${line.trim().substring(0, 100)}`, 'INFO'));
          }
        }
      }
    }
  }

  for (const dir of sourceDirs) {
    scanDir(dir);
  }
  // Self-exclude
  const selfPath = path.resolve(__filename);
  return issues.filter(i => {
    if (i.category === 'MARKER') {
      const resolved = path.resolve(i.file);
      return resolved !== selfPath;
    }
    return true;
  });
}

/**
 * checkVendorDrift(opts) — Prueft auf Manifest-Drift im Vendored-Release.
 * BU-030: Gibt Issues-Array zurueck statt in globale Variable zu schreiben.
 */
function checkVendorDrift(opts) {
  const issues = [];
  const { CORE, CURRENT_VERSION } = opts;
  const vendorVersion = CURRENT_VERSION;
  const vendorDir = path.join(CORE, 'release', `SyxBridge_v${vendorVersion}`);
  const manifestPath = path.join(vendorDir, '.build-manifest.json');

  if (!fs.existsSync(vendorDir)) {
    issues.push(makeIssue('VENDOR_DRIFT', vendorDir, 0,
      `Vendored-Snapshot fehlt: ${vendorDir} — bitte 'npm run release' ausfuehren.`, 'WARN'));
    return issues;
  }

  if (!fs.existsSync(manifestPath)) {
    issues.push(makeIssue('VENDOR_DRIFT', manifestPath, 0,
      `Kein .build-manifest.json in 'SyxBridge_v${vendorVersion}' — Drift-Detection nicht moeglich (aelterer Build?).`, 'INFO'));
    return issues;
  }

  let manifest;
  try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  } catch (e) {
    issues.push(makeIssue('VENDOR_DRIFT', manifestPath, 0,
      `.build-manifest.json nicht parsbar: ${e.message}`, 'ERROR'));
    return issues;
  }

  const manifestFiles = new Map(manifest.files.map(f => [f.path, f.sha256]));

  // Recompute current vendor SHA256
  const currentHashes = new Map();
  function walk(dir, relBase = '') {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.name === '.build-manifest.json') continue;
      const fullPath = path.join(dir, entry.name);
      const relPath = path.join(relBase, entry.name).replace(/\\/g, '/');
      if (entry.isDirectory()) {
        walk(fullPath, relPath);
      } else if (entry.isFile()) {
        currentHashes.set(relPath, computeSha256(fullPath));
      }
    }
  }
  walk(vendorDir);

  // Check 1: Files deleted from vendor
  for (const [f] of manifestFiles) {
    if (!currentHashes.has(f)) {
      issues.push(makeIssue('VENDOR_DRIFT', path.join(vendorDir, f), 0,
        `Manifest-Eintrag fehlt im Vendored: '${f}' — Datei wurde geloescht.`, 'ERROR'));
    }
  }

  // Check 2: Files added to vendor (not in manifest)
  for (const f of currentHashes.keys()) {
    if (!manifestFiles.has(f)) {
      issues.push(makeIssue('VENDOR_DRIFT', path.join(vendorDir, f), 0,
        `Nicht im Manifest: '${f}' — Datei wurde ohne 'npm run release' ins Vendored geschrieben.`, 'ERROR'));
    }
  }

  // Check 3: Hash mismatches (modified)
  for (const [f, origHash] of manifestFiles) {
    if (currentHashes.has(f) && currentHashes.get(f) !== origHash) {
      issues.push(makeIssue('VENDOR_DRIFT', path.join(vendorDir, f), 0,
        `Drift: '${f}' wurde direkt im Vendored editiert. Bitte in core/src/ mergen und 'npm run release'.`, 'ERROR'));
    }
  }
  return issues;
}

// ── Main checker (BU-030: ruft alle Checks auf, sammelt Issues) ─────
function runConsistencyCheck(opts) {
  const issues = [
    ...checkNaming(opts),
    ...checkEnvFiles(opts),
    ...checkVersions(opts),
    ...checkArchive(opts),
    ...checkForgottenMarkers(opts),
    ...checkVendorDrift(opts)
  ];
  // Normalisiere Pfade relativ zu ROOT
  return issues.map(i => ({ ...i, file: path.relative(opts.ROOT, i.file) }));
}

// ── CLI (BU-030: require.main guard) ──────────────────────────────────
if (require.main === module) {
  const ROOT = path.join(__dirname, '..', '..');
  const CORE = path.join(__dirname, '..');
  const pkg = require(path.join(CORE, 'package.json'));
  const CURRENT_VERSION = pkg.releaseVersion || pkg.version;

  const opts = { ROOT, CORE, CURRENT_VERSION };
  const issues = runConsistencyCheck(opts);

  const errors = issues.filter(i => i.severity === 'ERROR');
  const warnings = issues.filter(i => i.severity === 'WARN');
  const infos = issues.filter(i => i.severity === 'INFO');

  console.log(`\n${'='.repeat(50)}`);
  console.log(`  KONSISTENZ-CHECKER — SyxBridge v${CURRENT_VERSION}`);
  console.log(`${'='.repeat(50)}\n`);

  if (issues.length === 0) {
    console.log('✅ Keine Inkonsistenzen gefunden.\n');
    process.exit(0);
  }

  if (errors.length > 0) {
    console.log(`\n🔴 ERRORS (${errors.length}):`);
    for (const issue of errors) {
      console.log(`  [${issue.category}] ${issue.file}${issue.line ? ':' + issue.line : ''}`);
      console.log(`    ${issue.message}`);
    }
  }

  if (warnings.length > 0) {
    console.log(`\n🟡 WARNINGS (${warnings.length}):`);
    for (const issue of warnings) {
      console.log(`  [${issue.category}] ${issue.file}${issue.line ? ':' + issue.line : ''}`);
      console.log(`    ${issue.message}`);
    }
  }

  if (infos.length > 0) {
    console.log(`\n🔵 INFO (${infos.length}):`);
    for (const issue of infos) {
      console.log(`  [${issue.category}] ${issue.file}${issue.line ? ':' + issue.line : ''}`);
      console.log(`    ${issue.message}`);
    }
  }

  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  ${errors.length} Errors, ${warnings.length} Warnings, ${infos.length} Info`);
  console.log(`${'─'.repeat(50)}\n`);

  process.exit(errors.length > 0 ? 1 : 0);
}

module.exports = {
  checkNaming,
  checkEnvFiles,
  checkVersions,
  checkArchive,
  checkForgottenMarkers,
  checkVendorDrift,
  runConsistencyCheck,
  makeIssue
};
