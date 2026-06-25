'use strict';

// ── Run Self-Evaluation Engine ─────────────────────────────────────
// Wandelt Planner-Stats in eine gewichtete Self-Evaluation (0-100%).
// 8 Kategorien, weighted — analog zur FOREIGN_MACHINE_PROBABILITY.
// Extrahiert aus gui-handlers.js (v0.23.0 — Modularisierung).

const RUN_CATEGORY_DESCRIPTIONS = {
  'cache-efficiency': 'Anteil der aus dem Cache bedienten Übersetzungen. Hoher Wert = wenig API-Kosten, schnelle Läufe.',
  'translation-success': 'Anteil der erfolgreich übersetzten Einträge (kein Fallback auf Source-Text). Kernmetrik der Pipeline.',
  'quality-depth': 'Anteil der Einträge die Deep Polish / Qualitätskontrolle erreicht haben. Hoher Wert = bessere Endqualität.',
  'native-efficiency': 'Anteil der ohne API-Request gelösten Einträge (Proper-Nouns, Glossary-Terms). Spart Credits + Zeit.',
  'shield-health': 'Anteil der erfolgreich wiederhergestellten Platzhalter-Tokens. Niedrig = riskante Datei-Ausgabe.',
  'batch-stability': 'Anteil der fehlerfreien Batches. Niedrig = viele Provider-Fehler oder Quality-Issues.',
  'coverage': 'Anteil der gefundenen Strings die tatsächlich übersetzt wurden (vs. übersprungen/gefiltert).',
  'db-integrity': 'Anteil der nicht-flagged Einträge in der DB. Niedrig = viele problematische Übersetzungen gespeichert.'
};

function computeRunEvaluation(stats) {
  if (!stats || !stats.totalUnique) {
    return null; // No run data yet
  }

  const total = stats.totalUnique || 1;
  const translated = stats.newTranslations || 0;
  const cached = stats.cacheHits || 0;
  const nativeReuse = stats.nativeReuseCount || 0;
  const verified = stats.verifiedCount || 0;
  const qaFailures = stats.qaFailures || 0;
  const shieldTotal = stats.shieldStats?.totalTokens || 0;
  const shieldUnrestored = stats.shieldStats?.totalUnrestored || 0;
  const stringsWithLoss = stats.shieldStats?.stringsWithLoss || 0;
  const filesScanned = stats.filesScanned || 0;

  // ── Per-Category Scores (0-100) ─────────────────────────────────
  const cacheEfficiency = Math.min(100, (cached / total) * 100);
  const translationSuccess = Math.min(100, Math.max(0, ((total - qaFailures) / total) * 100));
  const qualityDepth = Math.min(100, (verified / total) * 100);
  const nativeEfficiency = Math.min(100, (nativeReuse / total) * 100);
  const shieldHealth = shieldTotal > 0
    ? Math.min(100, Math.max(0, ((shieldTotal - shieldUnrestored) / shieldTotal) * 100))
    : 100; // No shield tokens = nothing to restore = perfect score
  const batchStability = translated > 0
    ? Math.min(100, Math.max(0, ((translated - qaFailures) / translated) * 100))
    : 100;
  const coverage = filesScanned > 0
    ? Math.min(100, (total / filesScanned) * 100)
    : 0;
  // DB Integrity: estimated from qaFailures as proxy (real DB query would be expensive)
  const dbIntegrity = total > 0
    ? Math.min(100, Math.max(0, ((total - qaFailures) / total) * 100))
    : 100;

  // ── Weighted Global Score ────────────────────────────────────────
  const weights = {
    'cache-efficiency': 0.15,
    'translation-success': 0.25,
    'quality-depth': 0.20,
    'native-efficiency': 0.10,
    'shield-health': 0.10,
    'batch-stability': 0.10,
    'coverage': 0.05,
    'db-integrity': 0.05
  };

  const scores = {
    'cache-efficiency': { p: cacheEfficiency, w: weights['cache-efficiency'], desc: RUN_CATEGORY_DESCRIPTIONS['cache-efficiency'] },
    'translation-success': { p: translationSuccess, w: weights['translation-success'], desc: RUN_CATEGORY_DESCRIPTIONS['translation-success'] },
    'quality-depth': { p: qualityDepth, w: weights['quality-depth'], desc: RUN_CATEGORY_DESCRIPTIONS['quality-depth'] },
    'native-efficiency': { p: nativeEfficiency, w: weights['native-efficiency'], desc: RUN_CATEGORY_DESCRIPTIONS['native-efficiency'] },
    'shield-health': { p: shieldHealth, w: weights['shield-health'], desc: RUN_CATEGORY_DESCRIPTIONS['shield-health'] },
    'batch-stability': { p: batchStability, w: weights['batch-stability'], desc: RUN_CATEGORY_DESCRIPTIONS['batch-stability'] },
    'coverage': { p: coverage, w: weights['coverage'], desc: RUN_CATEGORY_DESCRIPTIONS['coverage'] },
    'db-integrity': { p: dbIntegrity, w: weights['db-integrity'], desc: RUN_CATEGORY_DESCRIPTIONS['db-integrity'] }
  };

  let globalScore = 0;
  let perCategory = [];
  for (const [id, s] of Object.entries(scores)) {
    const contribution = s.p * s.w;
    globalScore += contribution;
    perCategory.push({ id, p: s.p, w: s.w, contribution, desc: s.desc });
  }

  // Sort by contribution descending
  perCategory.sort((a, b) => b.contribution - a.contribution);

  return {
    globalScore,
    formula: 'weighted',
    coverage: perCategory.length,
    perCategory,
    computedAt: new Date().toISOString(),
    runTimestamp: stats.lastHeartbeat || null,
    rawMetrics: {
      totalUnique: total,
      cacheHits: cached,
      newTranslations: translated,
      nativeReuse,
      verifiedCount: verified,
      qaFailures,
      shieldTotal,
      shieldUnrestored,
      stringsWithLoss,
      filesScanned
    }
  };
}

module.exports = { computeRunEvaluation, RUN_CATEGORY_DESCRIPTIONS };
