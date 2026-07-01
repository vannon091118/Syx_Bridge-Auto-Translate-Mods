/**
 * run-metrics-db.js — Domain Persistence: Runs, Tasks, Logs, Model-Task-Metrics
 *
 * Extrahiert aus planner.js + db.js (DB-Persistenz-Verteilung).
 * Enthält alle DB-Operationen für Run-Tracking und Modell-Metriken.
 *
 * Factory-Pattern: createRunMetricsDb(dbManager) → { createRun, finishRun, ... }
 */

function createRunMetricsDb(dbManager) {

  // ── Runs ──────────────────────────────────────────────────────────────

  async function createRun(mode) {
    const result = await dbManager.run(
      'INSERT INTO runs (mode, status) VALUES (?, ?)',
      [mode, 'running']
    );
    return result.lastInsertRowid;
  }

  async function finishRun(id, status, message = '') {
    await dbManager.run(
      'UPDATE runs SET finished_at = CURRENT_TIMESTAMP, status = ? WHERE id = ?',
      [status, id]
    );
  }

  async function getLatestRun() {
    return dbManager.get('SELECT * FROM runs ORDER BY id DESC LIMIT 1');
  }

  // ── Logs ──────────────────────────────────────────────────────────────

  async function getLogCount() {
    const row = await dbManager.get('SELECT count(*) c FROM logs');
    return row ? row.c : 0;
  }

  async function getLatestLogs(limit = 5) {
    return dbManager.all('SELECT * FROM logs ORDER BY id DESC LIMIT ?', [limit]);
  }

  // ── Model Task Metrics ────────────────────────────────────────────────

  function getMetricsSnapshot() {
    const db = dbManager.db();
    if (!db) return {};
    try {
      const rows = db.prepare(
        'SELECT model, provider, task_type, target_lang, avg_quality, success_count, fail_count, total_calls FROM model_task_metrics'
      ).all();
      const map = {};
      for (const r of rows) {
        const key = `${r.provider}:${r.model}:${r.task_type}`;
        map[key] = {
          avg_quality: r.avg_quality,
          success_count: r.success_count,
          fail_count: r.fail_count,
          total_calls: r.total_calls,
        };
      }
      return map;
    } catch (e) {
      return {};
    }
  }

  // ── Diagnostics ───────────────────────────────────────────────────────

  async function getSchemaInfo() {
    const db = dbManager.db();
    if (!db) return [];
    try {
      return db.prepare('SELECT name FROM sqlite_master WHERE type=\'table\'').all();
    } catch (e) {
      return [];
    }
  }

  async function getTableColumns(tableName) {
    const db = dbManager.db();
    if (!db) return [];
    try {
      return db.prepare(`PRAGMA table_info(${tableName})`).all();
    } catch (e) {
      return [];
    }
  }

  return {
    createRun,
    finishRun,
    getLatestRun,
    getLogCount,
    getLatestLogs,
    getMetricsSnapshot,
    getSchemaInfo,
    getTableColumns,
  };
}

module.exports = { createRunMetricsDb };
