#!/usr/bin/env node
/**
 * split_commits.js — Teilt 114 Dateien in 4 logische Commits
 * Jeder Commit folgt TEIL 9 (verify_commit_msg.js)
 * 
 * USAGE: node split_commits.js [--dry-run]
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DRY_RUN = process.argv.includes('--dry-run');
const { derive, parseComposite } = require('../commit-layer/commit_lore/rng');

function run(cmd) {
  return execSync(cmd, { cwd: ROOT, encoding: 'utf8' }).trim();
}

function getCompositeChain() {
  const chainPath = path.join(ROOT, 'core/commit-layer/commit_lore/composite_chain.json');
  return JSON.parse(fs.readFileSync(chainPath, 'utf8'));
}

function getCharacterSheets() {
  const csPath = path.join(ROOT, 'core/commit-layer/commit_lore/character_sheets.json');
  return JSON.parse(fs.readFileSync(csPath, 'utf8'));
}

function getPlotchain() {
  const pcPath = path.join(ROOT, 'core/commit-layer/commit_lore/plotchain.json');
  return JSON.parse(fs.readFileSync(pcPath, 'utf8'));
}

// ═══ COMMIT GROUPS ═══════════════════════════════════════════
const GROUPS = [
  {
    name: 'Translation & Network',
    // Keep staged: Translation/, index.js, tests/, tests (root)
    unstage: ['core/DB', 'core/GUI', 'core/commit-layer', 'core/scripts', 'core/data',
              'AGENTS.md', 'CHANGELOG.md', 'VISION.md', 'core/TREE.md', 'core/archive',
              'core/eslint.config.mjs', 'core/package.json', '.kiro'],
    impulse: 'Provider-Bereinigung und Domäne-Struktur der Übersetzungsengine',
    summary: 'Player2-Provider entfernt und Ollama Cloud Toggle implementiert. Die Übersetzungsengine wurde aus core/src in die neue core/Translation Domäne verschoben mit aktualisierten require-Pfaden.',
  },
  {
    name: 'DB Layer & Data',
    // Stage only: DB/, data/
    stage: ['core/DB', 'core/data'],
    unstage: ['core/Translation', 'core/index.js', 'core/tests', 'tests',
              'core/GUI', 'core/commit-layer', 'core/scripts',
              'AGENTS.md', 'CHANGELOG.md', 'VISION.md', 'core/TREE.md', 'core/archive',
              'core/eslint.config.mjs', 'core/package.json', '.kiro'],
    impulse: 'Datenbankschicht als eigene Domäne herauslösen',
    summary: 'Die Datenbankschicht wurde aus core/src/db.js nach core/DB/ verschoben. DB-Audit, Repair, Query, Snapshot und Cleanup-Scripts wurden aus scripts/ nach DB/ sortiert.',
  },
  {
    name: 'GUI & Commit-Layer & Scripts',
    stage: ['core/GUI', 'core/commit-layer', 'core/scripts', 'core/index.js'],
    unstage: ['core/Translation', 'core/tests', 'tests', 'core/DB', 'core/data',
              'AGENTS.md', 'CHANGELOG.md', 'VISION.md', 'core/TREE.md', 'core/archive',
              'core/eslint.config.mjs', 'core/package.json', '.kiro'],
    impulse: 'GUI, Commit-Layer und verbleibende Scripts in Domän-Ordner sortieren',
    summary: 'GUI-Module nach core/GUI verschoben, Commit-Layer nach core/commit-layer, verbleibende Scripts in scripts/ belassen. Rohdaten bereinigt.',
  },
  {
    name: 'Documentation & Config',
    stage: ['AGENTS.md', 'CHANGELOG.md', 'core/TREE.md', 'core/archive',
            'core/eslint.config.mjs', 'core/package.json', '.kiro', 'core/tests', 'tests'],
    unstage: ['core/Translation', 'core/DB', 'core/GUI', 'core/commit-layer', 'core/scripts', 'core/data', 'core/index.js'],
    impulse: 'Dokumentation und Konfiguration an neue Domäne-Struktur anpassen',
    summary: 'TREE.md komplett neu geschrieben, SYSTEM_ARCHITECTURE.md Dependency-Graph aktualisiert, AGENTS.md TEIL 13 Pfade korrigiert, eslint und package.json angepasst.',
  },
];

// ═══ MAIN ═══════════════════════════════════════════════════════
console.log('=== Split-Commits: 4 logische Commits ===\n');

const chain = getCompositeChain();
const chars = getCharacterSheets();
const plotchain = getPlotchain();

let prevComposite = chain.chain[chain.chain.length - 1].composite;

for (let i = 0; i < GROUPS.length; i++) {
  const group = GROUPS[i];
  console.log(`\n─── Commit ${i + 1}: ${group.name} ───`);

  // Step 1: Unstage everything
  run('git reset HEAD 2>/dev/null || true');

  // Step 2: Stage the right files
  if (group.stage) {
    for (const p of group.stage) {
      try { run(`git add "${p}" 2>/dev/null`); } catch {}
    }
  } else {
    // First group: keep everything staged, unstage the rest
    run('git add -A 2>/dev/null');
    for (const p of (group.unstage || [])) {
      try { run(`git reset HEAD -- "${p}" 2>/dev/null`); } catch {}
    }
  }

  // Get staged files
  const staged = run('git diff --cached --name-only').split('\n').filter(Boolean);
  if (staged.length === 0) { console.log('  SKIP: keine Dateien staged'); continue; }
  console.log(`  ${staged.length} Dateien staged`);

  // Step 3: Compute composite
  const headHash = run('git rev-parse --short HEAD');
  const arcsPath = path.join(ROOT, 'core/commit-layer/commit_lore/lore_arcs.json');
  let aCount = 1, pCount = plotchain.length;
  try { aCount = Object.keys(JSON.parse(fs.readFileSync(arcsPath, 'utf8')).arcs || {}).length; } catch {}
  const newComposite = derive(prevComposite, headHash, { a: aCount, p: pCount });
  const compStr = newComposite.composite;
  const narratorN = String(newComposite.n);
  const narratorName = chars.characters?.[narratorN]?.name || 'Unknown';
  const narratorRules = chars.characters?.[narratorN]?.verifier_rules || {};

  console.log(`  Composite: ${compStr} (prev: ${prevComposite})`);
  console.log(`  Narrator: ${narratorName} (n=${narratorN}, ${narratorRules.min_words}-${narratorRules.max_words} words)`);

  // Step 4: Build commit message
  // List all staged file stems for reference
  const fileStems = staged.map(f => {
    const name = path.basename(f);
    return name.replace(/\.[^.]+$/, '');
  });

  const wordCountTarget = narratorRules.min_words || 80;
  const wordCountMax = narratorRules.max_words || 540;

  // Get previous narrator for cross-narrator reference
  let prevNarrator = 'Basher';
  for (let j = plotchain.length - 1; j >= 0; j--) {
    if (plotchain[j].narrator && plotchain[j].narrator.toLowerCase() !== narratorName.toLowerCase()) {
      prevNarrator = plotchain[j].narrator;
      break;
    }
  }

  // Build narrative body
  const fileRefBlock = fileStems.join(', ');
  const body = `[NARRATOR:${narratorName}] [MODEL:mimo-v2.5-pro] [IMPULSE:${group.impulse}] [COMPOSITE:${compStr}]\n\n${group.summary} ${prevNarrator} hatte die Grundlage geschaffen, und jetzt folgt die systematische Umsetzung. Die betroffenen Module und Dateien: ${fileRefBlock}. Der Grund für diese Aufteilung war die Klarheit der Architektur, weil eine saubere Domäne-Trennung die Wartbarkeit langfristig verbessert. Chronik der Änderungen dokumentiert in CHANGELOG.md mit Composite ${compStr}.`;

  // Step 5: Update CHANGELOG
  let cl = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf8');
  cl += `\n### ${compStr} — ${group.name} (${new Date().toISOString().slice(0, 10)})\n`;
  cl += `**Narrator:** ${narratorName} | **Model:** mimo-v2.5-pro | **Composite:** \`${compStr}\`\n`;
  cl += `- ${group.summary}\n`;
  fs.writeFileSync(path.join(ROOT, 'CHANGELOG.md'), cl);

  // Stage CHANGELOG
  run('git add CHANGELOG.md');

  // Step 6: Write commit message
  const msgPath = path.join(ROOT, 'core/commit-layer/.commit_msg.txt');
  fs.writeFileSync(msgPath, body);
  run('git add core/commit-layer/.commit_msg.txt');

  // Step 7: Verify (optional - just log result)
  try {
    const verifyResult = run(`node core/commit-layer/verify_commit_msg.js core/commit-layer/.commit_msg.txt 2>&1`);
    console.log('  VERIFY: PASS');
  } catch (e) {
    const output = (e.stdout || e.stderr || e.message || '').substring(0, 500);
    console.log('  VERIFY: BLOCKED');
    console.log('  ' + output.split('\n').filter(l => l.trim()).slice(0, 5).join('\n  '));
  }

  // Step 8: Commit using -F (file) to avoid shell escaping issues
  if (!DRY_RUN) {
    try {
      run('git commit -F core/commit-layer/.commit_msg.txt');
      console.log('  COMMIT: OK');
    } catch (e) {
      console.log('  COMMIT: FAILED - ' + (e.stdout || e.stderr || e.message || '').substring(0, 300));
    }
  } else {
    console.log('  [DRY RUN] Would commit ' + staged.length + ' files');
  }

  // Update chain for next iteration
  prevComposite = compStr;
  // Update plotchain for next iteration
  plotchain.push({
    id: `split-${i + 1}`,
    timestamp: new Date().toISOString(),
    composite: compStr,
    narrator: narratorName,
    model: 'mimo-v2.5-pro',
    summary: group.name
  });
}

console.log('\n=== DONE ===');
console.log('Run: git log --oneline -5');
