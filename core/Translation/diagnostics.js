/**
 * diagnostics.js — DB Diagnostic Tool
 *
 * DB-Persistenz-Verteilung (v0.24): Nutzt admin-db.js + run-metrics-db.js
 * statt direktem db.js-Import. Fallback auf db.js wenn DAOs nicht verfuegbar.
 */

function _getDb() {
  return require('../DB/db');
}

/**
 * Runs a set of diagnostic checks on the database.
 */
async function runDiagnostics() {
  const db = _getDb();

  console.log('\n--- DATABASE DIAGNOSTICS ---');

  // DB-Persistenz-Verteilung: Nutze Domain-DAOs wenn verfuegbar
  const runMetricsDb = global._runMetricsDb || null;
  const adminDb = global._adminDb || null;

  // 1. Table Check
  const tables = runMetricsDb
    ? await runMetricsDb.getSchemaInfo()
    : await db.all("SELECT name FROM sqlite_master WHERE type='table'");
  console.log('Tables:', tables.map(t => t.name).join(', '));

  // 2. Translation Counts
  const total = adminDb
    ? { c: await adminDb.getTranslationCount() }
    : await db.get('SELECT count(*) c FROM translations');
  console.log('Total Translations:', total.c);

  const auditCounts = adminDb
    ? await adminDb.getAuditStageCounts()
    : await db.all('SELECT audit_stage, count(*) c FROM translations GROUP BY audit_stage');
  auditCounts.forEach(r => {
    const stage = r.audit_stage === 0 ? 'Draft' : r.audit_stage === 1 ? 'Verified' : 'Polished';
    console.log(`  Stage ${stage}: ${r.c}`);
  });

  // 3. Log Status
  const logCount = runMetricsDb
    ? { c: await runMetricsDb.getLogCount() }
    : await db.get('SELECT count(*) c FROM logs');
  console.log('Total Logs:', logCount.c);

  const latestLogs = runMetricsDb
    ? await runMetricsDb.getLatestLogs(5)
    : await db.all('SELECT * FROM logs ORDER BY id DESC LIMIT 5');
  console.log('\nLatest 5 Logs:');
  latestLogs.forEach(l => console.log(`  [${l.timestamp}] [${l.level}] ${l.message}`));

  // 4. Run Status
  const latestRun = runMetricsDb
    ? await runMetricsDb.getLatestRun()
    : await db.get('SELECT * FROM runs ORDER BY id DESC LIMIT 1');
  if (latestRun) {
    console.log(`\nLast Run: #${latestRun.id} (${latestRun.mode}) - Status: ${latestRun.status}`);
  }
}

/**
 * Clears the translation cache for a specific language.
 * USE WITH CAUTION.
 */
async function clearCache(lang = 'German') {
  const adminDb = global._adminDb || null;
  if (adminDb) {
    const deleted = await adminDb.clearTranslationCache(lang);
    console.log(`[OK] ${deleted} Eintraege geloescht.`);
    return;
  }
  const db = _getDb();
  console.log(`[DANGER] Loesche alle ${lang} Uebersetzungen...`);
  const result = await db.run('DELETE FROM translations WHERE target_lang = ?', [lang]);
  console.log(`[OK] ${result.changes} Eintraege geloescht.`);
}

module.exports = {
  runDiagnostics,
  clearCache
};
