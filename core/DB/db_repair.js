#!/usr/bin/env node
/**
 * db_repair.js — Repariert DB-Einträge die vom db_audit.js als fehlerhaft identifiziert wurden.
 *
 * DB-Persistenz-Verteilung (v0.24): Re-exportiert aus admin-db.js.
 * Alle Repair-Logik lebt jetzt in admin-db.js. Diese Datei existiert für
 * Backward-Compat (CLI-Aufruf via node core/DB/db_repair.js --execute).
 *
 * Usage:
 *   node core/DB/db_repair.js              # Dry Run
 *   node core/DB/db_repair.js --execute    # Führt die Reparaturen durch
 */

'use strict';

const dbManager = require('./db');
const { createAdminDb } = require('./admin-db');

const DRY_RUN = !process.argv.includes('--execute');

// Re-export repair functions for backward compat (gui-handlers.js now uses admin-db directly)
const adminDb = createAdminDb(dbManager);
module.exports = {
  repairNativeStale: () => adminDb.repairNativeStale(),
  repairUnflaggedStale: () => adminDb.repairUnflaggedStale(),
  repairShieldLeaks: () => adminDb.repairShieldLeaks(),
  repairLowScore: () => adminDb.repairLowScore(),
  repairJavaNoise: () => adminDb.repairJavaNoise(),
  repairOrphanedRevisions: () => adminDb.repairOrphanedRevisions(),
  repairCleanupStaleRetranslate: () => adminDb.repairCleanupStaleRetranslate(),
};

// ═════════════════════════════════════════════════════════════════════
// CLI MAIN (backward compat)
// ═════════════════════════════════════════════════════════════════════

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  SyxBridge — DB Repair                                 ║');
  console.log(`║  Modus: ${DRY_RUN ? 'DRY RUN (keine Änderungen)' : 'EXECUTE'}       ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  await dbManager.init();
  const db = dbManager.db();
  const q = (sql, params) => db.prepare(sql).all(...(params || []));
  const q1 = (sql, params) => db.prepare(sql).get(...(params || []));

  let totalFixed = 0;
  const runRepair = async (label, countQuery, repairFn, dryMsg) => {
    const rows = await q(countQuery);
    const count = rows[0].c;
    console.log(`\n── ${label} ──`);
    console.log(`  Gefunden: ${count}`);
    if (!DRY_RUN && count > 0) {
      const changes = await repairFn();
      console.log(`  ✓ ${changes} Einträge repariert.`);
      totalFixed += changes;
    } else if (DRY_RUN) {
      console.log(`  → ${dryMsg || `Würde ${count} Einträge reparieren.`}`);
    }
    return count;
  };

  await runRepair(
    '1. NATIVE_STALE (native_runtime, src=tgt)',
    'SELECT COUNT(*) as c FROM translations WHERE provider=\'native_runtime\' AND source_text=translation',
    () => adminDb.repairNativeStale()
  );

  await runRepair(
    '2. UNFLAGGED_STALE (src=tgt, nicht native_runtime)',
    'SELECT COUNT(*) as c FROM translations WHERE source_text=translation AND flagged=0 AND provider NOT IN (\'native_runtime\',\'native_proper_noun\',\'native_non_translatable\')',
    () => adminDb.repairUnflaggedStale()
  );

  await runRepair(
    '3. SHIELD_LEAK (unreplaced tokens)',
    'SELECT COUNT(*) as c FROM translations WHERE (translation LIKE \'%__SHLD_%\' OR translation LIKE \'%[[%\' OR translation LIKE \'%]]%\') AND flag_reason NOT LIKE \'%shield_leak%\'',
    () => adminDb.repairShieldLeaks()
  );

  await runRepair(
    '4. LOW_SCORE (Score < 30)',
    'SELECT COUNT(*) as c FROM translations WHERE quality_score<30 AND quality_score>0 AND flagged=0',
    () => adminDb.repairLowScore()
  );

  await runRepair(
    '5. JAVA_NOISE (view.sett/world.map)',
    'SELECT COUNT(*) as c FROM translations WHERE source_text LIKE \'%view.sett%\' OR source_text LIKE \'%world.map%\'',
    () => adminDb.repairJavaNoise()
  );

  const orphanRevs = await q('SELECT COUNT(*) as c FROM translation_revisions WHERE source_text NOT IN (SELECT source_text FROM translations)');
  console.log('\n── 6. ORPHANED_REVISIONS ──');
  console.log(`  Gefunden: ${orphanRevs[0].c}`);
  if (!DRY_RUN && orphanRevs[0].c > 0) {
    const changes = await adminDb.repairOrphanedRevisions();
    console.log(`  ✓ ${changes} Einträge gelöscht.`);
    totalFixed += changes;
  }

  const staleOrphans = await q('SELECT COUNT(*) as c FROM translations WHERE flag_reason=\'stale_retranslate\' AND source_text!=translation');
  const staleStill = await q('SELECT COUNT(*) as c FROM translations WHERE flag_reason=\'stale_retranslate\' AND source_text=translation');
  console.log('\n── 7. STALE_RETRANSLATE_CLEANUP ──');
  console.log(`  Orphan-Flags: ${staleOrphans[0].c}, Still-Stale: ${staleStill[0].c}`);
  if (!DRY_RUN) {
    const result = await adminDb.repairCleanupStaleRetranslate();
    totalFixed += result.orphanFlagsCleared + result.staleReset;
  }

  console.log('\n═══════════════════════════════════════════════════════════');
  console.log(`  ${DRY_RUN ? 'DRY RUN' : 'REPARATUR ABGESCHLOSSEN'}`);
  console.log(`  Gesamt repariert: ${totalFixed} Einträge`);
  console.log('═══════════════════════════════════════════════════════════');
  if (DRY_RUN) console.log('\n  → Mit --execute ausführen um die Änderungen zu schreiben.');
  process.exit(0);
}

if (require.main === module) main().catch(e => {
  console.error('[FATAL]', e.message);
  process.exit(1);
});
