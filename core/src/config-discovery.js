/**
 * config-discovery.js — Model-Metriken, Ranking, Filtering.
 *
 * Extrahiert aus config-runtime.js (S-004 im PLAN.md).
 * Enthält: Metrics-Cache, Model-Ranking, LLM-Filterung, Provider-Konstanten.
 *
 * @module config-discovery
 */

// ── Provider-Fallback-Konstanten ────────────────────────────────────
const OPENROUTER_FREE_MODEL = 'openrouter/free';
const GROQ_FALLBACK_MODELS   = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'gemma2-9b-it'];
const OLLAMA_FALLBACK_MODELS = ['llama3.2', 'llama3.1', 'mistral', 'gemma3', 'gemma4', 'phi4'];
// NVIDIA-Fallbacks aktualisiert 2026-06-21: nemotron-mini deaktiviert (deprecated),
// 49b durch 70b ersetzt (aktueller Catalog-Stand). Siehe build.nvidia.com/models.
const NVIDIA_FALLBACK_MODELS  = ['meta/llama-3.3-70b-instruct', 'meta/llama-3.1-8b-instruct', 'nvidia/llama-3.1-nemotron-70b-instruct'];
const MODEL_BLACKLIST = ['whisper', 'stt', 'tts', 'embedding', 'bert', 'vision', 'guard', 'moderation', 'rerank'];

// ── Metrics Cache (P0-4: ZWEI Caches) ──────────────────────────────
// _metricsCache: aggregiert (für rankModel/filterLLMs)
// _metricsCacheByTask: per-task (für getModelMetrics/getDynamicScore)
let _metricsCache = null;
let _metricsCacheByTask = null;

/**
 * Setzt BEIDE Metrik-Caches.
 * @param {Object} snapshot — Output von db.getMetricsSnapshot()
 */
function setMetricsCache(snapshot) {
  if (!snapshot || Object.keys(snapshot).length === 0) {
    _metricsCache = null;
    _metricsCacheByTask = null;
    return;
  }

  // Cache 1: PER-TASK (ungefiltert, task_type bleibt erhalten)
  _metricsCacheByTask = {};
  for (const [key, val] of Object.entries(snapshot)) {
    if (val.total_calls > 0) {
      _metricsCacheByTask[key] = {
        avg_quality: val.avg_quality || 0,
        total_calls: val.total_calls || 0
      };
    }
  }

  // Cache 2: AGGREGIERT pro Provider+Model
  const agg = {};
  for (const [key, val] of Object.entries(snapshot)) {
    const lastColon = key.lastIndexOf(':');
    const providerModel = key.substring(0, lastColon);
    if (!agg[providerModel]) agg[providerModel] = { weightedSum: 0, totalCalls: 0 };
    agg[providerModel].weightedSum += (val.avg_quality || 0) * (val.total_calls || 0);
    agg[providerModel].totalCalls += (val.total_calls || 0);
  }
  _metricsCache = {};
  for (const [pm, a] of Object.entries(agg)) {
    _metricsCache[pm] = a.totalCalls > 0
      ? { avg_quality: Math.round(a.weightedSum / a.totalCalls), total_calls: a.totalCalls }
      : { avg_quality: 0, total_calls: 0 };
  }
}

// ── Model Utilities ─────────────────────────────────────────────────

function isUsableTextModel(model) {
  const name = String(model || '').toLowerCase();
  if (!name || name === 'auto') return false;
  return !MODEL_BLACKLIST.some(term => name.includes(term));
}

/**
 * DB-gestütztes Model-Ranking.
 * @param {string} model
 * @param {string} [provider='openrouter']
 * @returns {number} 0-100 (avg_quality) oder 0
 */
function rankModel(model, provider = 'openrouter') {
  if (!_metricsCache || !model) return 0;
  const key = `${provider}:${model}`;
  const entry = _metricsCache[key];
  return entry ? entry.avg_quality : 0;
}

/**
 * Liefert avg_quality + total_calls für Erfolgsraten-Schätzung.
 * Nutzt _metricsCacheByTask (task_type-bewusst) mit Fallback auf aggregierten Cache.
 * @param {string} provider
 * @param {string} model
 * @param {string} [taskType='translate']
 * @returns {{ avg_quality: number, total_calls: number }|null}
 */
function getModelMetrics(provider, model, taskType = 'translate') {
  if (!provider || !model) return null;
  if (_metricsCacheByTask) {
    const taskKey = `${provider}:${model}:${taskType}`;
    const taskEntry = _metricsCacheByTask[taskKey];
    if (taskEntry && taskEntry.total_calls > 0) {
      return { avg_quality: taskEntry.avg_quality, total_calls: taskEntry.total_calls, task_type: taskType };
    }
  }
  if (_metricsCache) {
    const key = `${provider}:${model}`;
    const entry = _metricsCache[key];
    if (entry && entry.total_calls > 0) {
      return { avg_quality: entry.avg_quality, total_calls: entry.total_calls, task_type: taskType };
    }
  }
  return null;
}

/**
 * Filtert und sortiert Modelle nach Qualität.
 * Lazy require('./router') um Zirkular-Import bei Load-Time zu vermeiden.
 */
function filterLLMs(models, freeOnly = false) {
  return [...new Set([...(freeOnly ? [OPENROUTER_FREE_MODEL] : []), ...(models || [])])]
    .filter(isUsableTextModel)
    .filter(model => !freeOnly || require('./router').isFreeModel('openrouter', model))
    .sort((a, b) => rankModel(b, 'openrouter') - rankModel(a, 'openrouter') || String(a).localeCompare(String(b)));
}

function getDefaultModelForProvider(provider) {
  const { PROVIDER_REGISTRY } = require('./router');
  const reg = PROVIDER_REGISTRY[provider];
  return reg ? reg.defaultModel : 'auto';
}

module.exports = {
  OPENROUTER_FREE_MODEL,
  GROQ_FALLBACK_MODELS,
  OLLAMA_FALLBACK_MODELS,
  NVIDIA_FALLBACK_MODELS,
  MODEL_BLACKLIST,
  setMetricsCache,
  isUsableTextModel,
  rankModel,
  getModelMetrics,
  filterLLMs,
  getDefaultModelForProvider,
};
