#!/usr/bin/env node
/**
 * verify_commit_msg.js — Vereinfachter Commit-Layer (v0.22a)
 * 
 * Sammelt ALLE fehlenden Pflichtfelder und gibt sie gebuendelt
 * in EINER Fehlermeldung aus. Keine stufige Abfrage mehr.
 * 
 * PFLICHT: MODEL, IMPULSE, Datei-Referenzen, Wortzahl
 * OPTIONAL: Sidejoke, Plot-Chain-Verweis, Arc-Referenz
 * 
 * Exit 0 = PASS
 * Exit 1 = BLOCKED
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ─── Git-Repo finden ──────────────────────────────────────────────
let repoRoot;
try {
  repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  process.chdir(repoRoot);
} catch (e) {
  console.error('BLOCKED: Git-Umgebung nicht verfuegbar.');
  process.exit(1);
}

// ─── Commit-Message lesen ──────────────────────────────────────────
const msgPathArg = process.argv[2];
if (!msgPathArg) {
  console.error('BLOCKED: Keine Commit-Message-Datei angegeben.');
  console.error('USAGE: node verify_commit_msg.js <path-to-commit-msg>');
  process.exit(1);
}

const msgFile = path.resolve(msgPathArg);
if (!fs.existsSync(msgFile)) {
  console.error(`BLOCKED: Datei nicht gefunden: ${msgFile}`);
  process.exit(1);
}

const commitMsg = fs.readFileSync(msgFile, 'utf8');
if (!commitMsg.trim()) {
  console.error('BLOCKED: Commit-Message ist leer.');
  process.exit(1);
}

// ─── Writing Rules laden ───────────────────────────────────────────
const rulesPath = path.join(repoRoot, 'core/scripts/commit_lore/writing_rules.json');
let rules = null;
if (fs.existsSync(rulesPath)) {
  try {
    rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
  } catch (e) {
    console.warn('WARN: writing_rules.json konnte nicht geparst werden.');
  }
}

const minWordsConfig = rules?.rules?.commit_diary?.min_words || {
  STANDARD: 150,
  'TEST-ASSET': 80,
  TRIVIAL: 30,
  'LORE-ONLY': 50
};

// ─── Staged Files lesen ────────────────────────────────────────────
let stagedFiles = [];
try {
  stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean);
} catch (e) {
  console.error('BLOCKED: Konnte staged Files nicht lesen.');
  process.exit(1);
}

if (stagedFiles.length === 0) {
  console.error('BLOCKED: Keine Dateien fuer den Commit gestaged.');
  process.exit(1);
}

// ─── Kategorie bestimmen ───────────────────────────────────────────
const allLore = stagedFiles.every(f => {
  const norm = f.replace(/\\/g, '/');
  return norm.includes('commit_lore/') ||
         norm.includes('archive/docs/') ||
         norm.endsWith('PLOT_LORE.md') ||
         norm.endsWith('plotchain.json');
});

const allDocs = stagedFiles.every(f => /\.(md|txt)$/i.test(f));
let smallDiff = false;
try {
  const stat = execSync('git diff --cached --stat', { encoding: 'utf8' }).trim();
  const insMatch = stat.match(/(\d+) insertions?/);
  const delMatch = stat.match(/(\d+) deletions?/);
  const insertions = insMatch ? parseInt(insMatch[1]) : 0;
  const deletions = delMatch ? parseInt(delMatch[1]) : 0;
  smallDiff = (insertions + deletions) < 15 && stagedFiles.length <= 3;
} catch (_) {}

const allTests = stagedFiles.every(f => {
  const norm = f.replace(/\\/g, '/');
  return norm.startsWith('tests/') || norm.startsWith('core/tests/') || norm.startsWith('test_mods/');
});

const category = allLore ? 'LORE-ONLY' :
  allTests ? 'TEST-ASSET' :
    allDocs || smallDiff ? 'TRIVIAL' :
      'STANDARD';

const minWords = minWordsConfig[category] || minWordsConfig['STANDARD'] || 150;

// ─── ALLE Pruefungen sammeln ───────────────────────────────────────
const errors = [];

// 1. Wortzahl
const wordCount = commitMsg.split(/\s+/).filter(Boolean).length;
if (wordCount < minWords) {
  errors.push(`[WORTZAHL] ${wordCount}/${minWords} Woerter (Kategorie: ${category}).`);
}

// 2. MODEL-Token
if (!/\[MODEL:([a-z0-9._-]+)\]/i.test(commitMsg)) {
  errors.push('[MODEL] Token fehlt. Beispiel: [MODEL:mimo-v2.5-pro]');
}

// 3. IMPULSE-Token
const impulseMatch = commitMsg.match(/\[IMPULSE:(.{5,}?)\]/i);
if (!impulseMatch) {
  errors.push('[IMPULSE] Token fehlt. Dokumentiere den User-Auftrag. Beispiel: [IMPULSE:Refactore den Router]');
}

// 4. Datei-Referenzen
function buildCandidates(filePath) {
  const norm = filePath.replace(/\\/g, '/');
  const basename = norm.split('/').pop();
  const dotIdx = basename.lastIndexOf('.');
  const stem = dotIdx > 0 ? basename.slice(0, dotIdx) : basename;
  return [basename, stem];
}

const missingFiles = [];
for (const file of stagedFiles) {
  const cands = buildCandidates(file);
  const mentioned = cands.some(c => commitMsg.includes(c));
  if (!mentioned) missingFiles.push(file);
}

if (missingFiles.length > 0) {
  errors.push(`[FILES] ${missingFiles.length} Datei(en) nicht referenziert:`);
  for (const f of missingFiles.slice(0, 10)) {
    errors.push(`    - ${f}`);
  }
  if (missingFiles.length > 10) {
    errors.push(`    ... und ${missingFiles.length - 10} weitere`);
  }
}

// 5. Unresolved Placeholders
const placeholderRegex = /\{[A-Z][A-Z0-9_]+\}/g;
const placeholders = [...commitMsg.matchAll(placeholderRegex)].map(m => m[0]);
if (placeholders.length > 0) {
  errors.push(`[PLACEHOLDER] Unresolvte Templates: ${[...new Set(placeholders)].join(', ')}`);
}

// ─── AUSWERTUNG ────────────────────────────────────────────────────
if (errors.length > 0) {
  console.error('');
  console.error('═══════════════════════════════════════════');
  console.error('  COMMIT BLOCKED — PFLICHTFELDER FEHLEN');
  console.error('═══════════════════════════════════════════');
  console.error('');
  for (const err of errors) {
    console.error(`  ${err}`);
  }
  console.error('');
  console.error('  Optional: [REF:<id>], Arc-Name, Sidejoke aus dem Pool');
  console.error('');
  process.exit(1);
}

// ─── PASS ──────────────────────────────────────────────────────────
console.log('');
console.log('═══════════════════════════════════════════');
console.log('  COMMIT VERIFIED');
console.log('═══════════════════════════════════════════');
console.log('');
for (const f of stagedFiles) {
  console.log(`  + ${f}`);
}
console.log('');
console.log(`  ${stagedFiles.length} Datei(en) — ${wordCount} Woerter — ${category}`);
console.log('');
process.exit(0);
