#!/usr/bin/env node
/**
 * verify_flag_separation.js — L6 Flag-Trennungs-Scanner
 *
 * Prüft AGENTS.md §18 (DOKU-FLAG ↔ RUNTIME-FLAG TRENNUNG):
 * - DOKU-FLAG: Status-Marker ohne Code-Bedeutung (NUR in .md-Dateien)
 * - RUNTIME-FLAG: Beeinflusst Programmverhalten (Code + Config + DB)
 * - Kollisionsregel: Ein Begriff darf NIE in beiden Universen auftauchen
 *
 * Usage:
 *   node core/scripts/verify_flag_separation.js
 *   node core/scripts/verify_flag_separation.js --verbose
 *   node core/scripts/verify_flag_separation.js --future
 *
 * Exit-Codes:
 *   0 = keine Kollisionen gefunden (Trennung intakt)
 *   1 = Kollisionen gefunden (Trennung verletzt)
 *   2 = Scan-Fehler
 */

const fs = require('fs');
const path = require('path');

// ── Root-Resolution (robust gegen Aufruf von überall) ────────────────
const SCRIPT_DIR = __dirname;
const PROJECT_ROOT = path.join(SCRIPT_DIR, '..', '..');

const ARGS = new Set(process.argv.slice(2));
const VERBOSE = ARGS.has('--verbose');
const FUTURE_MODE = ARGS.has('--future');

// ── Future-Mode: DOKU-Patterns ohne korrespondierendes RUNTIME-Pattern ──
// Ein DOKU-Pattern gilt als "mit RUNTIME korrespondierend" wenn entweder:
//   a) sein normalized Name in den RUNTIME_FLAG_PATTERN-Namen vorkommt, ODER
//   b) einer seiner Synonyme (via SYNONYM_MAP) im RUNTIME-Bereich existiert
// Fehlt beides → es ist ein "Future"-Pattern: nur dokumentiert, nicht codiert.

// ── German↔English Synonym-Map fuer Konzept-Kollisionen ──────────────
// AGENTS.md §18: "VERIFIZIERT vs. kuenftiges DB-Feld 'verified'" als Risiko
const SYNONYM_MAP = [
  { german: 'VERIFIZIERT',   english: ['verified', 'verify'] },
  { german: 'BEHOBEN',       english: ['fixed', 'resolved'] },
  { german: 'OFFEN',         english: ['open', 'pending'] },
  { german: 'AKTIV',         english: ['active', 'enabled'] },
  { german: 'ENTFERNT',      english: ['removed', 'deleted'] },
  { german: 'GESPERRT',      english: ['locked', 'blocked', 'disabled'] },
  { german: 'ABGESCHLOSSEN', english: ['completed', 'finished', 'done'] },
  { german: 'VERWORFEN',     english: ['rejected', 'discarded', 'abandoned'] },
];

// ── Universum 1: DOKU-FLAGs (NUR in .md-Dateien) ────────────────────
const DOKU_FLAG_PATTERNS = [
  { name: 'BEHOBEN',       regex: /\bBEHOBEN\b/g,       type: 'status' },
  { name: 'OFFEN',         regex: /\bOFFEN\b/g,         type: 'status' },
  { name: 'IN ARBEIT',     regex: /\bIN ARBEIT\b/g,     type: 'status' },
  { name: 'VERWORFEN',     regex: /\bVERWORFEN\b/g,     type: 'status' },
  { name: 'VERIFIZIERT',   regex: /\bVERIFIZIERT\b/g,   type: 'status' },
  { name: 'ABGESCHLOSSEN', regex: /\bABGESCHLOSSEN\b/g, type: 'status' },
  { name: 'PENDING',       regex: /\bPENDING\b/g,       type: 'status' },
  { name: 'ENTFERNT',      regex: /\bENTFERNT\b/g,      type: 'status' },
  { name: 'GEHEILT',       regex: /\bGEHEILT\b/g,       type: 'status' },
  { name: 'BU-ID',         regex: /\bBU-\d{3}\b/g,      type: 'id' },
  { name: 'DD-ID',         regex: /\bDD-\d{3}\b/g,      type: 'id' },
  { name: 'QUALITY-OFFENSIVE', regex: /\bQUALITY-OFFENSIVE\b/g, type: 'phase' },
  { name: 'CHAIN-HARDENING',   regex: /\bCHAIN-HARDENING\b/g,   type: 'phase' },
  { name: 'DOCU-CLEAN',        regex: /\bDOCU-CLEAN\b/g,        type: 'phase' },
];

// ── Universum 2: RUNTIME-FLAGs (NUR in Code/Config/DB) ──────────────
const RUNTIME_FLAG_PATTERNS = [
  // Env-Flags
  { name: '*_ENABLED',    regex: /[A-Z][A-Z_]+_ENABLED/g, type: 'env-flag' },
  { name: '*_MODE',       regex: /[A-Z][A-Z_]+_MODE/g,    type: 'config' },
  { name: '*_MODEL',      regex: /[A-Z][A-Z_]+_MODEL/g,   type: 'config' },
  { name: '*_PROVIDER',   regex: /[A-Z][A-Z_]+_PROVIDER/g, type: 'config' },
  // Config-Keys
  { name: 'NATIVE_MODE',  regex: /\bNATIVE_MODE\b/g,      type: 'config' },
  { name: 'GRAMMAR_CHECK',regex: /\bGRAMMAR_CHECK\b/g,    type: 'config' },
  { name: 'DRY_RUN',      regex: /\bDRY_RUN\b/g,          type: 'config' },
  { name: 'TARGET_LANG',  regex: /\bTARGET_LANG\b/g,      type: 'config' },
  // DB-Spalten
  { name: 'flagged',      regex: /\bflagged\b/g,           type: 'db-column' },
  { name: 'audit_stage',  regex: /\baudit_stage\b/g,      type: 'db-column' },
  { name: 'polish_status',regex: /\bpolish_status\b/g,    type: 'db-column' },
  { name: 'is_guarded',   regex: /\bis_guarded\b/g,       type: 'db-column' },
  { name: 'is_active',    regex: /\bis_active\b/g,        type: 'db-column' },
  { name: 'requires_deep_polish', regex: /\brequires_deep_polish\b/g, type: 'db-column' },
  { name: 'quality_score',regex: /\bquality_score\b/g,    type: 'db-column' },
  { name: 'review_count', regex: /\breview_count\b/g,     type: 'db-column' },
  { name: 'stress_test_passed', regex: /\bstress_test_passed\b/g, type: 'db-column' },
  { name: 'flag_reason',  regex: /\bflag_reason\b/g,      type: 'db-column' },
  { name: 'overwrite_fallback_used', regex: /\boverwrite_fallback_used\b/g, type: 'db-column' },
  { name: 'source_hash',  regex: /\bsource_hash\b/g,       type: 'db-column' },
  { name: 'placeholder_review_count', regex: /\bplaceholder_review_count\b/g, type: 'db-column' },
  // Runtime-Metrics
  { name: 'flaggedForReview', regex: /\bflaggedForReview\b/g, type: 'runtime' },
  { name: 'isEnabledFlag',    regex: /\bisEnabledFlag\b/g,    type: 'runtime' },
  { name: 'parseEnvFlag',     regex: /\bparseEnvFlag\b/g,     type: 'runtime' },
  { name: 'patchOverrideEnabled', regex: /\bpatchOverrideEnabled\b/g, type: 'gui-toggle' },
  // CLI-Mode
  { name: '--gui',     regex: /'--gui'/g,     type: 'cli' },
  { name: '--auto',    regex: /'--auto'/g,    type: 'cli' },
  { name: '--dry-run', regex: /'--dry-run'/g, type: 'cli' },
];

// ── File-Crawler ─────────────────────────────────────────────────────
function getAllFiles(dir, ext, excludeDirs = []) {
  const results = [];
  const exclude = new Set(['node_modules', '.git', '.claude', 'release', 'archive', 'dbold', ...excludeDirs]);
  function walk(current) {
    if (!fs.existsSync(current)) return;
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue;
      if (exclude.has(entry.name)) continue;
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.name.endsWith(ext)) {
        results.push(fullPath);
      }
    }
  }
  walk(dir);
  return results;
}

function scanFile(filePath, patterns, targetList, fileType) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');
    const relPath = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
    for (let i = 0; i < lines.length; i++) {
      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;
        let match;
        while ((match = pattern.regex.exec(lines[i])) !== null) {
          targetList.push({
            pattern: pattern.name, type: pattern.type,
            file: relPath, line: i + 1, column: match.index,
            text: match[0], fileType
          });
        }
      }
    }
  } catch (e) {
    scanErrors.push({ file: filePath, message: e.message });
    console.error(`  Fehler beim Lesen von ${filePath}: ${e.message}`);
  }
}

// ── Kollisionserkennung (direkt) ─────────────────────────────────────
function findCollisions(dokus, runtime) {
  for (const r of runtime) {
    const term = r.text.toLowerCase().replace(/[^a-z0-9_]/g, '').trim();
    if (!term || term.length < 3) continue;
    const dokusMatches = dokus.filter(d => {
      const dTerm = d.text.toLowerCase().replace(/[^a-z0-9_]/g, '');
      return dTerm === term;
    });
    if (dokusMatches.length > 0) {
      const key = `${r.pattern}:${dokusMatches[0].pattern}`;
      if (!collisions.find(c => c.key === key)) {
        const rtFiles = [...new Set(runtime.filter(rr => rr.pattern === r.pattern).map(rr => `${rr.file}:${rr.line}`))];
        const dkFiles = [...new Set(dokusMatches.map(d => `${d.file}:${d.line}`))];
        collisions.push({ key, term: r.pattern, termRaw: r.text, type: r.type, dokusFiles: dkFiles, runtimeFiles: rtFiles });
      }
    }
  }
}

// ── Kollisionserkennung (konzeptuell, DE↔EN) ────────────────────────
function findConceptCollisions(dokus, runtime) {
  const results = [];
  for (const syn of SYNONYM_MAP) {
    const hitsInRuntime = runtime.filter(r =>
      syn.english.some(en => r.text.toLowerCase() === en.toLowerCase())
    );
    const hitsInDoku = dokus.filter(d => d.text === syn.german);
    if (hitsInRuntime.length > 0 && hitsInDoku.length > 0) {
      results.push({
        german: syn.german, english: syn.english[0],
        dokuFiles: [...new Set(hitsInDoku.map(d => `${d.file}:${d.line}`))],
        runtimeFiles: [...new Set(hitsInRuntime.map(r => `${r.file}:${r.line}`))]
      });
    }
  }
  return results;
}

// ── Main ─────────────────────────────────────────────────────────────
function main() {
  console.log('\n═══════════════════════════════════════════');
  console.log('  L6 DOKU-FLAG ↔ RUNTIME-FLAG TRENNUNG');
  console.log('═══════════════════════════════════════════\n');

  // Phase 1: .md nach DOKU-FLAGs
  console.log('[1/3] Scanne .md-Dateien nach DOKU-FLAGs...');
  const mdDirs = [
    PROJECT_ROOT,
    path.join(PROJECT_ROOT, 'core', 'archive', 'docs'),
    path.join(PROJECT_ROOT, 'core', 'archive', 'docs', 'plans'),
    path.join(PROJECT_ROOT, 'core', 'archive', 'docs', 'FREEZE'),
    path.join(PROJECT_ROOT, 'core', 'src'),
    path.join(PROJECT_ROOT, 'core', 'scripts'),
    path.join(PROJECT_ROOT, 'core', 'tests'),
  ];
  for (const mdDir of mdDirs) {
    for (const f of getAllFiles(mdDir, '.md', ['dbold'])) {
      scanFile(f, DOKU_FLAG_PATTERNS, dokusFlagsFound, 'doku');
    }
  }
  console.log(`   ${dokusFlagsFound.length} DOKU-FLAG-Referenzen`);
  if (VERBOSE) {
    const tally = {};
    for (const d of dokusFlagsFound) { tally[d.pattern] = (tally[d.pattern] || 0) + 1; }
    for (const [p, c] of Object.entries(tally).sort((a,b) => b[1]-a[1])) {
      console.log(`     ${p}: ${c}`);
    }
  }

  // Phase 2: .js nach RUNTIME-FLAGs
  console.log('\n[2/3] Scanne .js-Dateien nach RUNTIME-FLAGs...');
  const jsDirs = [
    path.join(PROJECT_ROOT, 'core', 'src'),
    path.join(PROJECT_ROOT, 'core', 'scripts'),
    path.join(PROJECT_ROOT, 'core', 'tests'),
    path.join(PROJECT_ROOT, 'tests'),
  ];
  for (const jsDir of jsDirs) {
    for (const f of getAllFiles(jsDir, '.js')) {
      scanFile(f, RUNTIME_FLAG_PATTERNS, runtimeFlagsFound, 'runtime');
    }
  }
  console.log(`   ${runtimeFlagsFound.length} RUNTIME-FLAG-Referenzen`);
  if (VERBOSE) {
    const tally = {};
    for (const r of runtimeFlagsFound) { tally[r.pattern] = (tally[r.pattern] || 0) + 1; }
    for (const [p, c] of Object.entries(tally).sort((a,b) => b[1]-a[1])) {
      console.log(`     ${p}: ${c}`);
    }
  }

  // Scan-Fehler-Check: Exit 2 wenn Dateien nicht gelesen werden konnten
  if (scanErrors.length > 0) {
    console.log(`\n  ❌ SCAN-FEHLER: ${scanErrors.length} Datei(en) konnten nicht gelesen werden.`);
    if (VERBOSE) {
      for (const se of scanErrors) {
        console.log(`     ${se.file}: ${se.message}`);
      }
    }
    process.exit(2);
  }

  // Phase 3: Future-Mode (DOKU-Patterns ohne RUNTIME-Äquivalent)
  if (FUTURE_MODE) {
    console.log('\n[3/3] Future-Mode: DOKU-Patterns ohne korrespondierendes RUNTIME-Pattern...');
    const future = findFuturePatterns(dokusFlagsFound, runtimeFlagsFound);
    if (future.length === 0) {
      console.log('\n  ✅ ALLE DOKU-Patterns haben ein RUNTIME-Äquivalent.');
      console.log(`     ${dokusFlagsFound.length} DOKU-FLAGs, ${runtimeFlagsFound.length} RUNTIME-FLAGs — vollstaendig abgebildet.\n`);
      process.exit(0);
    }
    console.log(`\n  🔮 ${future.length} Future-Pattern(s) — nur in Doku, kein RUNTIME-Äquivalent:\n`);
    for (const f of future) {
      const aliasInfo = f.aliasMatch ? ` (verwandt: ${f.aliasMatch})` : '';
      console.log(`  🔮 ${f.pattern}${aliasInfo}`);
      console.log(`     ${f.count} Vorkommen in Doku`);
      console.log(`     ${f.files.slice(0, 5).join('\n     ')}\n`);
    }
    console.log('─────────────────────────────────────────────');
    console.log('  Hinweis: Future-Patterns sind dokumentierte Konzepte ohne');
    console.log('  Code-Implementierung. Entweder geplant (Feature-Gap) oder');
    console.log('  rein informative Doku-Status-Marker (erwartet).\n');
    process.exit(0);
  }

  // Phase 4: Kollisionen (normal mode)
  console.log('\n[3/3] Pruefe auf Kollisionen zwischen den Universen...');
  findCollisions(dokusFlagsFound, runtimeFlagsFound);
  const conceptCollisions = findConceptCollisions(dokusFlagsFound, runtimeFlagsFound);

  const totalCollisions = collisions.length + conceptCollisions.length;
  if (totalCollisions === 0) {
    console.log('\n  ✅ KEINE KOLLISIONEN — Trennung ist intakt.');
    console.log(`     ${dokusFlagsFound.length} DOKU-FLAGs, ${runtimeFlagsFound.length} RUNTIME-FLAGs — kein Begriff in beiden Universen.\n`);
    process.exit(0);
  }

  console.log(`\n  ❌ ${totalCollisions} KOLLISION(EN) GEFUNDEN (${collisions.length} direkt + ${conceptCollisions.length} konzeptuell):\n`);

  // Sortieren: DB-Columns zuerst, dann Config, dann Rest
  const prio = ['db-column', 'env-flag', 'config', 'runtime', 'status', 'cli', 'id', 'phase', 'gui-toggle'];
  const sorter = (a, b) => (prio.indexOf(a.type) === -1 ? 99 : prio.indexOf(a.type)) - (prio.indexOf(b.type) === -1 ? 99 : prio.indexOf(b.type));
  collisions.sort(sorter);

  for (const c of collisions) {
    console.log(`  ❌ ${c.term} (${c.type})`);
    console.log(`     DOKU:    ${c.dokusFiles.slice(0, 5).join(', ')}${c.dokusFiles.length>5 ? ' +'+(c.dokusFiles.length-5)+' mehr':''}`);
    console.log(`     RUNTIME: ${c.runtimeFiles.slice(0, 5).join(', ')}${c.runtimeFiles.length>5 ? ' +'+(c.runtimeFiles.length-5)+' mehr':''}\n`);
  }
  for (const cc of conceptCollisions) {
    console.log(`  ⚠️ ${cc.german} ↔ ${cc.english} (konzeptuell)`);
    console.log(`     DOKU:    ${cc.dokuFiles.slice(0, 3).join(', ')}${cc.dokuFiles.length>3 ? ' +'+(cc.dokuFiles.length-3)+' mehr':''}`);
    console.log(`     RUNTIME: ${cc.runtimeFiles.slice(0, 3).join(', ')}${cc.runtimeFiles.length>3 ? ' +'+(cc.runtimeFiles.length-3)+' mehr':''}\n`);
  }

  const tally = {};
  for (const c of collisions) { tally[c.type] = (tally[c.type] || 0) + 1; }
  console.log('─────────────────────────────────────────────');
  for (const [type, count] of Object.entries(tally)) { console.log(`  ${type}: ${count}`); }
  console.log('\n  Empfehlung: Kollisionen manuell bereinigen.');
  console.log('  - DOKU-Begriff umbenennen oder');
  console.log('  - Code-Begriff umbenennen oder');
  console.log('  - False-Positive in Ausnahme-Liste aufnehmen.\n');
  process.exit(1);
}


// ── Future-Erkennung ───────────────────────────────────────────────────
function findFuturePatterns(dokus, runtime) {
  const dokusByPattern = {};
  for (const d of dokus) {
    if (!dokusByPattern[d.pattern]) dokusByPattern[d.pattern] = [];
    dokusByPattern[d.pattern].push(d);
  }

  // Normalize helper: strip non-alphanum, lowercase
  const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Build normalized set of all runtime pattern names
  const runtimeNames = new Set(runtime.map(r => normalize(r.pattern)));

  // Build set of ALL unique runtime terms (individual words inside pattern names)
  const runtimeTokens = new Set();
  for (const r of runtime) {
    const tokens = r.pattern.split(/[_\s-]+/);
    for (const t of tokens) runtimeTokens.add(normalize(t));
  }

  // Build set of ALL unique matched runtime text values (actual flag values in code)
  const runtimeTexts = new Set(runtime.map(r => normalize(r.text)));

  // Build synonym map: english terms -> set of german equivalents
  const enToDe = {};
  for (const syn of SYNONYM_MAP) {
    for (const en of syn.english) {
      if (!enToDe[en]) enToDe[en] = new Set();
      enToDe[en].add(normalize(syn.german));
    }
  }

  const results = [];

  for (const [patternName, instances] of Object.entries(dokusByPattern)) {
    const norm = normalize(patternName);

    // Check 1: Direct pattern name or value match in runtime
    if (runtimeNames.has(norm) || runtimeTexts.has(norm)) continue;

    // Check 2: Check if any runtime token matches (e.g., "QUALITY" in "QUALITY-OFFENSIVE" matches "quality_score")
    const tokens = patternName.split(/[_\s-]+/);
    const tokenMatches = tokens.filter(t => {
      const tn = normalize(t);
      return tn.length >= 3 && runtimeTokens.has(tn);
    });

    // Check 3: Synonym map — is this a German status word that maps to an English runtime term?
    let aliasMatch = null;
    for (const syn of SYNONYM_MAP) {
      if (normalize(syn.german) === norm) {
        const enMatch = syn.english.some(en => runtimeTexts.has(normalize(en)) || runtimeNames.has(normalize(en)));
        if (!enMatch) {
          // German term with NO English runtime match → future pattern
          aliasMatch = syn.english[0];
        } else {
          // Has English runtime match → skip (future-done)
          aliasMatch = null;
          tokenMatches.length = 0; // mark as matched
          break;
        }
      }
    }
    // Check 4: Synonym-matched (aliasMatch !== null) → future, else skip
    if (aliasMatch === null && tokenMatches.length === 0) continue;
    if (tokenMatches.length > 0) continue; // has partial runtime token match

    // No runtime equivalent found → future pattern
    results.push({
      pattern: patternName,
      type: instances[0].type,
      count: instances.length,
      files: [...new Set(instances.map(d => `     ${d.file}:${d.line}`))],
      aliasMatch
    });
  }

  // Sort: phase-type first (planned features), then status (inherently doku-only), then ids
  const prio = ['phase', 'status', 'id'];
  results.sort((a, b) => (prio.indexOf(a.type) === -1 ? 99 : prio.indexOf(a.type)) - (prio.indexOf(b.type) === -1 ? 99 : prio.indexOf(b.type)));
  return results;
}

// ── Datastores ───────────────────────────────────────────────────────
let dokusFlagsFound = [];
let runtimeFlagsFound = [];
let collisions = [];
let scanErrors = [];

main();
