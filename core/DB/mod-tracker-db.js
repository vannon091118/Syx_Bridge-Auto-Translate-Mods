/**
 * mod-tracker-db.js — Domain Persistence: Mods, Files, Strings, Processed Files
 *
 * Extrahiert aus planner.js + reset_now.js (DB-Persistenz-Verteilung).
 * Enthält alle DB-Operationen für Mod-Tracking (nicht Übersetzungen).
 *
 * Factory-Pattern: createModTrackerDb(dbManager) → { upsertMod, upsertFile, ... }
 * DI-kompatibel — wird von planner.js, reset_now.js, index.js konsumiert.
 */

function createModTrackerDb(dbManager) {

  // ── Mods ──────────────────────────────────────────────────────────────

  async function upsertMod(modId, sourcePath) {
    await dbManager.run(
      `INSERT INTO mods (mod_id, folder_name, source_path)
       VALUES (?, ?, ?)
       ON CONFLICT(mod_id) DO UPDATE SET last_seen = CURRENT_TIMESTAMP`,
      [modId, modId, sourcePath]
    );
    return dbManager.get('SELECT * FROM mods WHERE mod_id = ?', [modId]);
  }

  // ── Files ─────────────────────────────────────────────────────────────

  async function getFilesByModId(modId) {
    return dbManager.all(
      'SELECT id, relative_path, source_hash FROM files WHERE mod_id = ?',
      [modId]
    );
  }

  async function getFileByPath(modId, relativePath) {
    return dbManager.get(
      'SELECT id, source_hash FROM files WHERE mod_id = ? AND relative_path = ?',
      [modId, relativePath]
    );
  }

  async function upsertFile(modId, relativePath, fileType, fileHash) {
    const existing = await getFileByPath(modId, relativePath);
    if (existing) {
      await dbManager.run(
        'UPDATE files SET source_hash = ?, last_scan = CURRENT_TIMESTAMP WHERE id = ?',
        [fileHash, existing.id]
      );
    } else {
      await dbManager.run(
        'INSERT INTO files (mod_id, relative_path, file_type, source_hash) VALUES (?, ?, ?, ?)',
        [modId, relativePath, fileType, fileHash]
      );
    }
  }

  // ── Processed Files ───────────────────────────────────────────────────

  async function markProcessed(sourcePath, targetLang, mtimeMs, hash, outputPath) {
    await dbManager.run(
      `INSERT INTO processed_files (source_path, target_lang, mtime_ms, hash, output_path, processed_at)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(source_path, target_lang)
       DO UPDATE SET mtime_ms = excluded.mtime_ms, hash = excluded.hash,
         output_path = excluded.output_path, processed_at = CURRENT_TIMESTAMP`,
      [sourcePath, targetLang, mtimeMs, hash, outputPath]
    );
  }

  async function getProcessedFile(sourcePath, targetLang) {
    return dbManager.get(
      'SELECT mtime_ms, hash, processed_at FROM processed_files WHERE source_path = ? AND target_lang = ?',
      [sourcePath, targetLang]
    );
  }

  async function clearProcessedFiles() {
    return dbManager.run('DELETE FROM processed_files');
  }

  async function countProcessedFiles() {
    const row = await dbManager.get('SELECT COUNT(*) as cnt FROM processed_files');
    return row ? row.cnt : 0;
  }

  // ── Runtime operations from index.js ──────────────────────────────────

  async function shouldSkipFile(filePath, outPath, targetLang, fs, fsp, getHash) {
    if (!fs.existsSync(outPath)) return false;
    const stat = await fsp.stat(filePath);
    const content = await fsp.readFile(filePath, 'utf-8');
    const currentHash = getHash(content);
    const row = await getProcessedFile(filePath, targetLang);
    if (row && row.hash === currentHash) return true;
    if (row && Number(row.mtime_ms) === Math.floor(stat.mtimeMs)) return true;
    return false;
  }

  return {
    upsertMod,
    getFilesByModId,
    getFileByPath,
    upsertFile,
    markProcessed,
    getProcessedFile,
    clearProcessedFiles,
    countProcessedFiles,
    shouldSkipFile,
  };
}

module.exports = { createModTrackerDb };
