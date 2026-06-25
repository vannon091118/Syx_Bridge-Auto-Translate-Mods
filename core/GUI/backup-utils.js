'use strict';

const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');

// ── Utility-Funktionen für Backups & Display-Namen ────────────────
// Extrahiert aus gui-handlers.js (v0.23.0 — Modularisierung).
// Verwendet von: gui-handlers.js, index.js (fullReset, restoreAllBackups), reset_now.js

/**
 * Reads the display name from a mod's metadata file.
 * Delegates file name and parsing to the adapter (v0.20 H6).
 * Falls back to the directory basename if metadata is missing or invalid.
 *
 * @param {string} dirPath
 * @param {object} [adapter]  GameAdapter/GamePlugin instance
 */
function readDisplayName(dirPath, adapter) {
  const metaFile = adapter?.getMetadataFileName?.() ?? '_Info.txt';
  const infoPath = path.join(dirPath, metaFile);
  if (fs.existsSync(infoPath)) {
    try {
      const content = fs.readFileSync(infoPath, 'utf-8');
      if (adapter?.parseMetadata) {
        const meta = adapter.parseMetadata(content);
        if (meta && meta.NAME) return String(meta.NAME).trim();
      } else {
        // Generic fallback: look for NAME: "..." pattern
        const match = content.match(/^\s*NAME:\s*"?(.*?)"?,?\s*$/im);
        if (match) return match[1].trim();
      }
    } catch (e) {}
  }
  return path.basename(dirPath);
}

/**
 * Recursively collects all files in a directory.
 */
async function collectAllFiles(dir, baseDir = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = await fsp.readdir(dir, { withFileTypes: true });
  const results = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectAllFiles(fullPath, baseDir);
    return [{ filePath: fullPath, relativePath: path.relative(baseDir, fullPath), name: entry.name }];
  }));
  return results.flat();
}

/**
 * Restores all files from backupDir into targetDir, then removes any files
 * in targetDir that are not present in backupDir (1:1 restore).
 */
async function restoreBackup(backupDir, targetDir) {
  if (!fs.existsSync(backupDir)) return;

  // 1. Copy all files from backupDir to targetDir
  const backupFiles = await collectAllFiles(backupDir);
  for (const file of backupFiles) {
    if (file.name === '.backup_info.json') continue;
    const targetFilePath = path.join(targetDir, file.relativePath);
    await fsp.mkdir(path.dirname(targetFilePath), { recursive: true });
    await fsp.copyFile(file.filePath, targetFilePath);
  }

  // 2. Scan targetDir and delete any files that are not in backupDir
  if (fs.existsSync(targetDir)) {
    const targetFiles = await collectAllFiles(targetDir);
    const backupFileSet = new Set(backupFiles.map(f => f.relativePath));
    for (const file of targetFiles) {
      if (!backupFileSet.has(file.relativePath)) {
        await fsp.rm(file.filePath, { force: true });

        // Clean up parent directories if empty
        let parent = path.dirname(file.filePath);
        while (parent !== targetDir) {
          const files = await fsp.readdir(parent);
          if (files.length === 0) {
            await fsp.rmdir(parent);
            parent = path.dirname(parent);
          } else {
            break;
          }
        }
      }
    }
  }
}

module.exports = { readDisplayName, restoreBackup, collectAllFiles };
