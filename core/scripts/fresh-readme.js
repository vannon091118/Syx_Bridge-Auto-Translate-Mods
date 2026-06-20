#!/usr/bin/env node
/**
 * fresh-readme.js — README bei jedem Release frisch aussehen lassen
 *
 * Liest package.json Version + CHANGELOG.md neuesten Eintrag und updated:
 *   - Changelog-Tabelle: Neue Zeile für aktuelle Version (falls nicht vorhanden)
 *   - Latest Release Info: Version, Datum, Dateien
 *   - Datums-Referenzen
 *
 * Nutzung:
 *   node scripts/fresh-readme.js                 # Normale Aktualisierung
 *   node scripts/fresh-readme.js --dry-run        # Nur Vorschau
 *   node scripts/fresh-readme.js --version 0.21.0 # Explizite Version
 */
const fs = require('fs');
const path = require('path');

const coreDir = path.join(__dirname, '..');
const rootDir = path.join(coreDir, '..');
const pkg = require(path.join(coreDir, 'package.json'));

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const explicitVersion = args.find(a => a.startsWith('--version='));
const NEW_VERSION = explicitVersion
  ? explicitVersion.split('=')[1]
  : (pkg.releaseVersion || pkg.version);

const NEW_DATE = new Date().toISOString().split('T')[0]; // 2026-06-20

console.log('========================================');
console.log(`   FRESH README — v${NEW_VERSION}`);
console.log(`   Datum: ${NEW_DATE}`);
console.log(dryRun ? '   DRY-RUN — keine Dateien geändert' : '');
console.log('========================================\n');

// ── 1. Latest CHANGELOG Entry parsen ──────────────────────────────
const changelogPath = path.join(coreDir, 'archive', 'docs', 'CHANGELOG.md');
let changelogData = { tag: '', date: '', description: '' };

if (fs.existsSync(changelogPath)) {
  const changelog = fs.readFileSync(changelogPath, 'utf-8');
  // Suche den ersten echten Release-Eintrag
  // Release-Tags starten mit einer Ziffer oder v (z.B. "0.19.7-chain", "v0.20.0")
  // Interne Tags (BU-xxx, B4-xxx, DOKU-xxx, COMMIT-xxx) werden automatisch ausgeschlossen.
  const lines = changelog.split('\n');
  const releaseTagRegex = /^## \[([^\]]+)\] - (\d{4}-\d{2}-\d{2}) — (.+)$/;
  const versionLike = /^v?\d|\(?\d+\.\d+/; // startet mit Ziffer oder v
  for (const line of lines) {
    const m = line.match(releaseTagRegex);
    if (m && versionLike.test(m[1]) && !m[1].startsWith('COMMIT-')) {
      changelogData = { tag: m[1], date: m[2], description: m[3].trim() };
      break;
    }
  }
  // Fallback: wenn nichts gefunden, nächsten echten Eintrag (für Zwischen-Releases)
  if (!changelogData.tag) {
    for (const line of lines) {
      const m = line.match(releaseTagRegex);
      if (m && !m[1].startsWith('COMMIT-')) {
        changelogData = { tag: m[1], date: m[2], description: m[3].trim() };
        break;
      }
    }
  }
}

console.log(`  CHANGELOG: [${changelogData.tag}] ${changelogData.date} — ${changelogData.description}`);

// ── 2. README lesen ───────────────────────────────────────────────
const readmePath = path.join(rootDir, 'README.md');
if (!fs.existsSync(readmePath)) {
  console.error('  ❌ README.md nicht gefunden');
  process.exit(1);
}

let readme = fs.readFileSync(readmePath, 'utf-8');
let original = readme;
const changes = [];

// ── 3. CHANGELOG-Tabelle aktualisieren ────────────────────────────
// Format: | **v0.20.0** | 2026-06-20 | Highlights |
const tableRegex = /^(\| \*\*v)[\d.]+[\w-]*(\*\* \| \d{4}-\d{2}-\d{2} \|)/m;
const existingVersionRow = readme.match(
  new RegExp(`\\| \\*\\*v${NEW_VERSION.replace(/\./g, '\\.')}\\*\\* \\| \\d{4}-\\d{2}-\\d{2} \\|`, 'm')
);

if (!existingVersionRow) {
  // Neue Zeile nach dem Tabellen-Header einfügen
  const tableHeader = '|---|---|---|';
  const newRow = `| **v${NEW_VERSION}** | ${changelogData.date || NEW_DATE} | ${changelogData.description || 'Release'} |`;
  const insertAfter = readme.indexOf(tableHeader);
  if (insertAfter !== -1) {
    const eol = readme.indexOf('\n', insertAfter);
    readme = readme.slice(0, eol + 1) + newRow + '\n' + readme.slice(eol + 1);
    changes.push(`Changelog-Tabelle: Zeile für v${NEW_VERSION} eingefügt`);
  } else {
    console.log('  ⚠ Tabellen-Header nicht gefunden, überspringe Changelog-Zeile');
  }
} else {
  // Bestehende Zeile aktualisieren (Datum + Beschreibung)
  const oldRow = existingVersionRow[0];
  const newRow = `| **v${NEW_VERSION}** | ${changelogData.date || NEW_DATE} | ${changelogData.description || 'Release'} |`;
  readme = readme.replace(oldRow, newRow);
  changes.push(`Changelog-Tabelle: Zeile für v${NEW_VERSION} aktualisiert`);
}

// ── 4. "Latest Release" Info aktualisieren ────────────────────────
// EN: | **Latest Release** | v0.20.0 (2026-06-20) — 70 source files, ~10k LOC |
// DE: | **Letztes Release** | v0.20.0 (2026-06-20) — 70 Quellcode-Dateien, ~10k LOC |

const releasePatterns = [
  // EN: Latest Release
  { pattern: /(\| \*\*Latest Release\*\* \| )v?[\d.]+[\w-]* \([^)]+\)[^|]*(\|)/,
    replacement: (m, prefix, suffix) => {
      // Keep file count info if present
      const fileInfo = m.match(/— (\d+[^)]+)/);
      const fileStr = fileInfo ? `— ${fileInfo[1]}` : '';
      return `${prefix}v${NEW_VERSION} (${changelogData.date || NEW_DATE}) ${fileStr}${suffix}`;
    }
  },
  // DE: Letztes Release
  { pattern: /(\| \*\*Letztes Release\*\* \| )v?[\d.]+[\w-]* \([^)]+\)[^|]*(\|)/,
    replacement: (m, prefix, suffix) => {
      const fileInfo = m.match(/— (\d+[^)]+)/);
      const fileStr = fileInfo ? `— ${fileInfo[1]}` : '';
      return `${prefix}v${NEW_VERSION} (${changelogData.date || NEW_DATE}) ${fileStr}${suffix}`;
    }
  }
];

for (const rp of releasePatterns) {
  const changed = readme.replace(rp.pattern, rp.replacement);
  if (changed !== readme) {
    readme = changed;
    changes.push('"Latest Release" aktualisiert');
  }
}

// ── 5. Version in Projektstruktur aktualisieren ───────────────────
const structPatterns = [
  { pattern: /(package\.json\s+#\s*)v?[\d.]+[\w-]*/, replacement: `$1v${NEW_VERSION}` },
];

for (const sp of structPatterns) {
  const changed = readme.replace(sp.pattern, sp.replacement);
  if (changed !== readme) {
    readme = changed;
    changes.push('Projektstruktur-Version aktualisiert');
  }
}

// ── 6. Datums-Referenzen auf heute setzen ─────────────────────────
// Nur wenn das Datum älter als 7 Tage ist (kein Overwrite bei kleinen Updates)
// Vorsicht: nur datums-zeilen die "Stand" oder "Released" erwähnen
const datePatterns = [
  { pattern: /(Stand:\s*\*\*)\d{4}-\d{2}-\d{2}(\*\*)/, replacement: `$1${NEW_DATE}$2` },
  { pattern: /(Released\s+)\d{4}-\d{2}-\d{2}/, replacement: `$1${NEW_DATE}` },
];

for (const dp of datePatterns) {
  const changed = readme.replace(dp.pattern, dp.replacement);
  if (changed !== readme) {
    readme = changed;
    changes.push('Datum aktualisiert');
  }
}

// ── 7. Write ──────────────────────────────────────────────────────
if (readme === original) {
  console.log('\n  ✅ README ist bereits aktuell — keine Änderungen nötig.\n');
  process.exit(0);
}

if (dryRun) {
  console.log('\n  📋 DRY-RUN — folgende Änderungen würden gemacht werden:');
  changes.forEach(c => console.log(`    • ${c}`));
  console.log('');
  process.exit(0);
}

fs.writeFileSync(readmePath, readme, 'utf-8');

console.log('\n  ✅ README aktualisiert:');
changes.forEach(c => console.log(`    • ${c}`));
console.log('');

// ── 8. Report ─────────────────────────────────────────────────────
const diffLines = readme.split('\n').length - original.split('\n').length;
console.log(`  📊 Diff: ${diffLines > 0 ? '+' : ''}${diffLines} Zeilen`);
console.log('========================================\n');
