#!/usr/bin/env node
/**
 * update-badges.js — README-Badges aus Live-Testergebnissen generieren
 *
 * Führt `npm test` aus, parst die PASS/FAIL/ERROR-Zahlen und updated:
 *   - shields.io Test-Badge in README.md
 *   - Inline-Tabellen (DE + EN) mit aktuellen Test-Zahlen
 *
 * Nutzung:
 *   node scripts/update-badges.js             # Normal — updated README
 *   node scripts/update-badges.js --dry-run   # Nur Vorschau, kein Write
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const coreDir = path.join(__dirname, '..');
const rootDir = path.join(coreDir, '..');
const readmePath = path.join(rootDir, 'README.md');

const dryRun = process.argv.includes('--dry-run');

// ── 1. npm test ausführen ──────────────────────────────────────────
console.log('▶ npm test wird ausgeführt...\n');
let testOutput;
try {
  testOutput = execSync('npm test', { cwd: coreDir, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
} catch (e) {
  // npm test kann mit Exit-Code >0 enden (z.B. bei ESLint-Warnings), Output trotzdem parsen
  testOutput = e.stdout || '';
  if (e.stderr) testOutput += '\n' + e.stderr;
}

// ── 2. Test-Zahlen parsen ──────────────────────────────────────────
// Suche nach "X passing" / "X PASS" oder "✓ X tests" Mustern
const passPatterns = [
  /(\d+)\s+passing/i,
  /(\d+)\s+PASS\b/,
  /PASS:\s*(\d+)/i,
];
const failPatterns = [
  /(\d+)\s+failing/i,
  /(\d+)\s+FAIL\b/,
  /FAIL:\s*(\d+)/i,
];
const errorPatterns = [
  /(\d+)\s+errors?/i,
  /ERROR:\s*(\d+)/i,
];

let totalPass = 0;
let totalFail = 0;
let totalError = 0;

// Aggregiere alle Matches (mehrere Test-Runs im Output)
for (const p of passPatterns) {
  const matches = [...testOutput.matchAll(new RegExp(p.source, 'gi'))];
  for (const m of matches) {
    totalPass += parseInt(m[1], 10);
  }
}
for (const p of failPatterns) {
  const matches = [...testOutput.matchAll(new RegExp(p.source, 'gi'))];
  for (const m of matches) {
    totalFail += parseInt(m[1], 10);
  }
}
for (const p of errorPatterns) {
  const matches = [...testOutput.matchAll(new RegExp(p.source, 'gi'))];
  for (const m of matches) {
    totalError += parseInt(m[1], 10);
  }
}

// Falls kein Match: versuche ESLint-Output (0 errors → clean)
if (totalPass === 0 && totalFail === 0) {
  const eslintMatch = testOutput.match(/✖\s+(\d+)\s+problems?\s+\((\d+)\s+errors?,\s*(\d+)\s+warnings?\)/);
  if (eslintMatch) {
    totalError += parseInt(eslintMatch[2], 10);
  }
}

console.log(`  Test-Ergebnisse: ${totalPass} PASS · ${totalFail} FAIL · ${totalError} ERROR\n`);

if (totalPass === 0 && totalFail === 0 && totalError === 0) {
  console.log('  ⚠ Keine Test-Zahlen im Output gefunden — überspringe Update.');
  console.log('  Output-Endung für Debug:\n');
  console.log(testOutput.slice(-500));
  process.exit(0);
}

// ── 3. Badge-Farbe bestimmen ───────────────────────────────────────
let badgeColor = '10B981'; // grün — clean
if (totalFail > 0 || totalError > 0) {
  badgeColor = 'DC2626'; // rot — failures
} else if (totalPass === 0) {
  badgeColor = '6B7280'; // grau — unbekannt
}

// ── 4. Badge-Text encoden ──────────────────────────────────────────
const badgeText = `${totalPass} PASS · ${totalFail} FAIL`;
const encodedBadgeText = encodeURIComponent(badgeText);

const newBadgeUrl = `https://img.shields.io/badge/tests-${encodedBadgeText}-${badgeColor}?style=for-the-badge&logo=checkmarx&logoColor=white`;
const inlineText = `**${badgeText}**`;

// ── 5. README updaten ──────────────────────────────────────────────
if (!fs.existsSync(readmePath)) {
  console.error('  ❌ README.md nicht gefunden');
  process.exit(1);
}

let readme = fs.readFileSync(readmePath, 'utf-8');
const original = readme;
const changes = [];

// 5a. Shields.io Badge-URL
const badgeRegex = /<img src="https:\/\/img\.shields\.io\/badge\/tests-[^"]+" alt="Tests"\/>/;
if (badgeRegex.test(readme)) {
  const oldBadge = readme.match(badgeRegex)[0];
  const newBadge = `<img src="${newBadgeUrl}" alt="Tests"/>`;
  readme = readme.replace(oldBadge, newBadge);
  changes.push(`Badge-URL: "${badgeText}"`);
} else {
  console.log('  ⚠ Shields.io Badge nicht gefunden');
}

// 5b. DE Inline-Tabelle: | Test-Suite | **N PASS · N FAIL** | 🟢 |
const deTableRegex = /\| Test-Suite \| \*\*\d+ PASS · \d+ FAIL\*\* \| 🟢 \|/;
if (deTableRegex.test(readme)) {
  const oldDe = readme.match(deTableRegex)[0];
  const newDe = `| Test-Suite | ${inlineText} | 🟢 |`;
  readme = readme.replace(oldDe, newDe);
  changes.push(`DE Inline-Tabelle: "${badgeText}"`);
}

// 5c. EN Inline-Tabelle: | Test suite | **N PASS · N FAIL** | 🟢 |
const enTableRegex = /\| Test suite \| \*\*\d+ PASS · \d+ FAIL\*\* \| 🟢 \|/;
if (enTableRegex.test(readme)) {
  const oldEn = readme.match(enTableRegex)[0];
  const newEn = `| Test suite | ${inlineText} | 🟢 |`;
  readme = readme.replace(oldEn, newEn);
  changes.push(`EN Inline-Tabelle: "${badgeText}"`);
}

// ── 6. Write ──────────────────────────────────────────────────────
if (readme === original) {
  console.log('  ✅ README-Badges bereits aktuell.\n');
  process.exit(0);
}

if (dryRun) {
  console.log('  📋 DRY-RUN — folgende Änderungen würden gemacht werden:');
  changes.forEach(c => console.log(`    • ${c}`));
  console.log('');
  process.exit(0);
}

fs.writeFileSync(readmePath, readme, 'utf-8');
console.log('  ✅ README-Badges aktualisiert:');
changes.forEach(c => console.log(`    • ${c}`));
console.log('');
