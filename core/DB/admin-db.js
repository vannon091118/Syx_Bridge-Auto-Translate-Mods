/**
 * admin-db.js — Domain Persistence: Repair, Audit, Diagnostics, Cleanup
 *
 * Extrahiert aus db_repair.js, diagnostics.js, cleanup_argos_stale.js,
 * db_audit.js, audit_db.js, live1_dryrun.js (DB-Persistenz-Verteilung).
 *
 * Factory-Pattern: createAdminDb(dbManager) → { repair*, diagnostic*, ... }
 * Alle Funktionen nehmen dbRun/dbGet/dbAll als Parameter oder nutzen dbManager.
 */

/* eslint-disable no-unused-vars -- imported for potential future use in diagnostic functions */
const { getHash, classifyString } = require('../Translation/extractor');
const { shouldTranslate } = require('../Translation/text-core');

function createAdminDb(dbManager) {

  // ══════════════════════════════════════════════════════════════════════
  // REPAIR FUNCTIONS (from db_repair.js)
  // ══════════════════════════════════════════════════════════════════════

  async function repairNativeStale() {
    const result = await dbManager.run(`
      UPDATE translations
      SET flagged = 1,
          flag_reason = 'stale_retranslate',
          audit_stage = 0,
          requires_deep_polish = 1,
          polish_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE provider = 'native_runtime'
        AND source_text = translation
        AND flagged = 0
    `);
    return result.changes;
  }

  async function repairUnflaggedStale() {
    const result = await dbManager.run(`
      UPDATE translations
      SET flagged = 1,
          flag_reason = 'stale_unflagged',
          audit_stage = 0,
          requires_deep_polish = 1,
          polish_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE source_text = translation
        AND flagged = 0
        AND provider NOT IN ('native_runtime', 'native_proper_noun', 'native_non_translatable')
    `);
    return result.changes;
  }

  async function repairShieldLeaks() {
    const result = await dbManager.run(`
      UPDATE translations
      SET flagged = 1,
          flag_reason = 'shield_leak_detected',
          audit_stage = 0,
          requires_deep_polish = 1,
          polish_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE (translation LIKE '%__SHLD_%' OR translation LIKE '%[[%' OR translation LIKE '%]]%')
        AND flag_reason NOT LIKE '%shield_leak%'
    `);
    return result.changes;
  }

  async function repairLowScore() {
    const result = await dbManager.run(`
      UPDATE translations
      SET flagged = 1,
          flag_reason = 'low_quality_score',
          audit_stage = 0,
          requires_deep_polish = 1,
          polish_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE quality_score < 30
        AND quality_score > 0
        AND flagged = 0
    `);
    return result.changes;
  }

  async function repairJavaNoise() {
    const result = await dbManager.run(`
      UPDATE translations
      SET flagged = 1,
          flag_reason = 'structural_noise',
          audit_stage = 0,
          requires_deep_polish = 0,
          polish_status = 'completed',
          updated_at = CURRENT_TIMESTAMP
      WHERE (source_text LIKE '%view.sett%' OR source_text LIKE '%world.map%')
        AND flagged = 0
    `);
    return result.changes;
  }

  async function repairOrphanedRevisions() {
    const result = await dbManager.run(`
      DELETE FROM translation_revisions
      WHERE source_text NOT IN (SELECT source_text FROM translations)
    `);
    return result.changes;
  }

  async function repairCleanupStaleRetranslate() {
    const orphanResult = await dbManager.run(`
      UPDATE translations
      SET flagged = 0,
          flag_reason = '',
          updated_at = CURRENT_TIMESTAMP
      WHERE flag_reason = 'stale_retranslate'
        AND source_text != translation
    `);
    const staleResult = await dbManager.run(`
      UPDATE translations
      SET audit_stage = 0,
          requires_deep_polish = 1,
          polish_status = 'pending',
          updated_at = CURRENT_TIMESTAMP
      WHERE flag_reason = 'stale_retranslate'
        AND source_text = translation
    `);
    return {
      orphanFlagsCleared: orphanResult.changes,
      staleReset: staleResult.changes,
    };
  }

  // ══════════════════════════════════════════════════════════════════════
  // DIAGNOSTIC FUNCTIONS (from diagnostics.js + live1_dryrun.js)
  // ══════════════════════════════════════════════════════════════════════

  async function getTranslationCount(targetLang) {
    const row = await dbManager.get('SELECT count(*) c FROM translations');
    return row ? row.c : 0;
  }

  async function getAuditStageCounts() {
    return dbManager.all(
      'SELECT audit_stage, count(*) c FROM translations GROUP BY audit_stage'
    );
  }

  async function getFlaggedCount() {
    const row = await dbManager.get(
      'SELECT COUNT(*) as c FROM translations WHERE flagged = 1'
    );
    return row ? row.c : 0;
  }

  async function getStaleCount() {
    const row = await dbManager.get(
      'SELECT COUNT(*) as c FROM translations WHERE translation = source_text'
    );
    return row ? row.c : 0;
  }

  async function getPendingPolishCount() {
    const row = await dbManager.get(
      'SELECT COUNT(*) as c FROM translations WHERE polish_status = \'pending\''
    );
    return row ? row.c : 0;
  }

  async function getFailedPolishCount() {
    const row = await dbManager.get(
      'SELECT COUNT(*) as c FROM translations WHERE polish_status = \'failed\''
    );
    return row ? row.c : 0;
  }

  async function getAverageQualityScore() {
    const row = await dbManager.get(
      'SELECT ROUND(AVG(quality_score),1) as a FROM translations'
    );
    return row ? row.a : 0;
  }

  async function getShieldLeakCount() {
    const row = await dbManager.get(
      'SELECT COUNT(*) as c FROM translations WHERE flag_reason = \'shield_leak\''
    );
    return row ? row.c : 0;
  }

  async function getCriticalRejectCount() {
    const row = await dbManager.get(
      'SELECT COUNT(*) as c FROM translations WHERE flag_reason = \'critical_reject\''
    );
    return row ? row.c : 0;
  }

  async function getProcessedFilesCount() {
    const row = await dbManager.get('SELECT COUNT(*) as c FROM processed_files');
    return row ? row.c : 0;
  }

  async function clearTranslationCache(lang = 'German') {
    const result = await dbManager.run(
      'DELETE FROM translations WHERE target_lang = ?',
      [lang]
    );
    return result.changes;
  }

  // ══════════════════════════════════════════════════════════════════════
  // REVISION & GLOSSARY DAO (from gui-handlers.js — REQ 8 decoupling)
  // ══════════════════════════════════════════════════════════════════════

  async function getTranslationBySourceLang(sourceText, targetLang) {
    return dbManager.get(
      'SELECT translation, provider, quality_score, risk_score, flagged, flag_reason, updated_at FROM translations WHERE source_text = ? AND target_lang = ?',
      [sourceText, targetLang]
    );
  }

  async function getRevisionsForEntry(sourceText, targetLang) {
    return dbManager.all(
      'SELECT revision_id, translation, source_text, provider, quality_score, risk_score, flagged, flag_reason, is_active, is_reference, created_at FROM translation_revisions WHERE source_text = ? AND target_lang = ? ORDER BY revision_id DESC',
      [sourceText, targetLang]
    );
  }

  async function getRevisionById(revisionId, sourceText, targetLang) {
    return dbManager.get(
      'SELECT translation, provider, quality_score, flagged, flag_reason FROM translation_revisions WHERE revision_id = ? AND source_text = ? AND target_lang = ?',
      [revisionId, sourceText, targetLang]
    );
  }

  async function archiveCurrentTranslation(sourceText, targetLang, translation, provider, qualityScore, riskScore, flagged, flagReason) {
    await dbManager.run(
      'UPDATE translation_revisions SET is_active = 0 WHERE source_text = ? AND target_lang = ?',
      [sourceText, targetLang]
    );
    await dbManager.run(
      `INSERT INTO translation_revisions (source_text, target_lang, translation, provider, quality_score, risk_score, flagged, flag_reason, is_active, is_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 0)`,
      [sourceText, targetLang, translation, provider || '', qualityScore || 0, riskScore || 0, flagged || 0, flagReason || '']
    );
  }

  async function restoreRevision(revisionId, sourceText, targetLang, translation) {
    await dbManager.run(
      'UPDATE translations SET translation = ?, updated_at = CURRENT_TIMESTAMP WHERE source_text = ? AND target_lang = ?',
      [translation, sourceText, targetLang]
    );
    await dbManager.run(
      'UPDATE translation_revisions SET is_active = 1 WHERE revision_id = ?',
      [revisionId]
    );
  }

  async function updateTranslation(sourceText, targetLang, translation) {
    await dbManager.run(
      'UPDATE translations SET translation = ?, updated_at = CURRENT_TIMESTAMP WHERE source_text = ? AND target_lang = ?',
      [translation, sourceText, targetLang]
    );
  }

  async function searchTranslations(query) {
    const sql = query
      ? 'SELECT * FROM translations WHERE source_text LIKE ? OR translation LIKE ? LIMIT 200'
      : 'SELECT * FROM translations ORDER BY updated_at DESC LIMIT 200';
    const params = query ? [`%${query}%`, `%${query}%`] : [];
    return dbManager.all(sql, params);
  }

  async function getGuardedTerms(targetLang) {
    return dbManager.all(
      'SELECT * FROM glossary_terms WHERE target_lang = ? AND is_guarded = 1 ORDER BY source_term ASC',
      [targetLang]
    );
  }

  async function upsertGuardedTerm(targetLang, sourceTerm, targetTerm, guardedBy = 'user') {
    await dbManager.run(
      `INSERT INTO glossary_terms (target_lang, source_term, target_term, is_guarded, guarded_by, updated_at)
       VALUES (?, ?, ?, 1, ?, CURRENT_TIMESTAMP)
       ON CONFLICT(target_lang, source_term, scope, mod_scope)
       DO UPDATE SET target_term = excluded.target_term, is_guarded = 1, guarded_by = excluded.guarded_by, updated_at = CURRENT_TIMESTAMP`,
      [targetLang, sourceTerm, targetTerm, guardedBy]
    );
  }

  return {
    // Repair
    repairNativeStale,
    repairUnflaggedStale,
    repairShieldLeaks,
    repairLowScore,
    repairJavaNoise,
    repairOrphanedRevisions,
    repairCleanupStaleRetranslate,
    // Diagnostics
    getTranslationCount,
    getAuditStageCounts,
    getFlaggedCount,
    getStaleCount,
    getPendingPolishCount,
    getFailedPolishCount,
    getAverageQualityScore,
    getShieldLeakCount,
    getCriticalRejectCount,
    getProcessedFilesCount,
    clearTranslationCache,
    // Revision & Glossary DAO
    getTranslationBySourceLang,
    getRevisionsForEntry,
    getRevisionById,
    archiveCurrentTranslation,
    restoreRevision,
    updateTranslation,
    searchTranslations,
    getGuardedTerms,
    upsertGuardedTerm
  };
}

module.exports = { createAdminDb };
