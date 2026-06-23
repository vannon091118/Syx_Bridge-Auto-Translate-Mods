#!/usr/bin/env node
/**
 * update_plot.js — Vereinfachter Plot-Chain Writer (v0.22a)
 * 
 * Fuegt EINEN minimalen Eintrag zur plotchain.json hinzu.
 * Format: { id, timestamp, summary, ref_to }
 * 
 * Optional: Haengt Dialog an PLOT_LORE.md an.
 * Optional: --ref=<id> fuer freiwaehlbaren Rueckbezug.
 * 
 * USAGE:
 *   node update_plot.js "Kurze Zusammenfassung was passiert ist"
 *   node update_plot.js "Zusammenfassung" --ref=plot-2026-06-22T20:00:00
 *   node update_plot.js "Zusammenfassung" --lore="Dialog-Text fuer PLOT_LORE.md"
 *   node update_plot.js "Zusammenfassung" --model=mimo-v2.5-pro
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ─── Repo-Root finden ──────────────────────────────────────────────
let repoRoot;
try {
  repoRoot = execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
  process.chdir(repoRoot);
} catch (e) {
  repoRoot = path.resolve(__dirname, '../../..');
  console.warn(`WARN: Kein Git-Repo. Fallback: ${repoRoot}`);
}

const plotchainPath = path.join(__dirname, 'plotchain.json');
const plotPath = path.join(repoRoot, 'core/archive/docs/PLOT_LORE.md');

// ─── Argument-Parsing ──────────────────────────────────────────────
const args = process.argv.slice(2);
let summary = '';
let refTo = null;
let loreText = null;
let modelId = null;

for (const arg of args) {
  if (arg.startsWith('--ref=')) {
    refTo = arg.slice('--ref='.length);
  } else if (arg.startsWith('--lore=')) {
    loreText = arg.slice('--lore='.length);
  } else if (arg.startsWith('--model=')) {
    modelId = arg.slice('--model='.length);
  } else if (!arg.startsWith('--')) {
    if (!summary) summary = arg;
  }
}

if (!summary) {
  console.error('BLOCKED: Keine Zusammenfassung angegeben.');
  console.error('USAGE: node update_plot.js "Zusammenfassung" [--ref=<id>] [--lore="Text"] [--model=name]');
  process.exit(1);
}

// ─── Plotchain laden ───────────────────────────────────────────────
let plotchain = [];
if (fs.existsSync(plotchainPath)) {
  try {
    plotchain = JSON.parse(fs.readFileSync(plotchainPath, 'utf8'));
  } catch (e) {
    console.error('Fehler beim Lesen von plotchain.json, starte neu.');
  }
}

// ─── Neuen Node erstellen ──────────────────────────────────────────
const now = new Date();
const isoTimestamp = now.toISOString().substring(0, 19);
const nodeId = `plot-${isoTimestamp}`;

// Letzter Node als parent_id (Kettenlogik)
const lastNode = plotchain.length > 0 ? plotchain[plotchain.length - 1] : null;
const parentId = lastNode ? lastNode.id : 'none';

// ref_to: Frei waehlbar. Wenn nicht angegeben, automatisch letzter Node.
const refToResolved = refTo || parentId;

const newNode = {
  id: nodeId,
  timestamp: isoTimestamp.replace('T', ' '),
  summary: summary,
  ref_to: refToResolved
};

// Optional: model_id
if (modelId) {
  newNode.model_id = modelId;
}

plotchain.push(newNode);
fs.writeFileSync(plotchainPath, JSON.stringify(plotchain, null, 2), 'utf8');
console.log(`Plot-Knoten ${nodeId} gespeichert.`);
console.log(`  Zusammenfassung: "${summary.substring(0, 80)}${summary.length > 80 ? '...' : ''}"`);
console.log(`  Verweis auf: ${refToResolved}`);

// ─── Optional: PLOT_LORE.md Dialog anhaengen ───────────────────────
if (loreText) {
  if (!fs.existsSync(plotPath)) {
    const header = '# PLOT LORE — SyxBridge\n\nPersistenter Dokumentations-Layer. Jeder Commit kann einen Eintrag erzeugen.\n\n---\n';
    fs.writeFileSync(plotPath, header, 'utf8');
  }

  const timestamp = now.toISOString().replace('T', ' ').substring(0, 19);
  const entry = `\n### [${timestamp}]\n${loreText}\n`;
  fs.appendFileSync(plotPath, entry, 'utf8');
  console.log('  Dialog in PLOT_LORE.md angehaengt.');
}

// ─── Optional: Commit-Hash zu cross_references.json ────────────────
const crossRefPath = path.join(__dirname, 'cross_references.json');
try {
  let crossRefs = [];
  if (fs.existsSync(crossRefPath)) {
    crossRefs = JSON.parse(fs.readFileSync(crossRefPath, 'utf8'));
  }

  let currentHash = null;
  try {
    currentHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch (_) {}

  if (currentHash && !crossRefs.includes(currentHash)) {
    crossRefs.push(currentHash);
    fs.writeFileSync(crossRefPath, JSON.stringify(crossRefs, null, 2), 'utf8');
    console.log(`  Hash ${currentHash} zu cross_references.json hinzugefuegt.`);
  }
} catch (e) {
  // Stille Fehler — cross_references ist optional
}
