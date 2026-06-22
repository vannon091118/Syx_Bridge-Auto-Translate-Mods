const { getGateCounter } = require('./gate-counter');
const { classifyPath } = require('./text-core');
const { getDynamicScore } = require('./router');

function createDispatcher(options) {
  const {
    config,
    routingEngine,
    extractErrorMessage,
    getMetricsSnapshot,
    plugin
  } = options;

  function resolveProviderModel(stage) {
    const primaryProvider = config.PRIMARY_PROVIDER;
    const primaryModel = config.EFFECTIVE_PRIMARY_MODEL || config.PRIMARY_MODEL;
        
    if (stage === 'polish') {
      const provider = config.POLISHER_PROVIDER || primaryProvider;
      const model = config.POLISHER_MODEL || (provider === primaryProvider ? primaryModel : '');
      return { provider, model };
    }
        
    if (stage === 'audit') {
      const provider = config.AUDITOR_PROVIDER || primaryProvider;
      const model = config.EFFECTIVE_AUDITOR_MODEL || config.AUDITOR_MODEL || (provider === primaryProvider ? primaryModel : '');
      return { provider, model };
    }
        
    return { provider: primaryProvider, model: primaryModel };
  }


  function buildStageRoutePlan(stage) {
    // Item 0d: Aktualisiere Metriken vor Route-Plan-Bau
    if (getMetricsSnapshot) {
      routingEngine.setMetricsSnapshot(getMetricsSnapshot());
    }
    const preferred = resolveProviderModel(stage);
    return routingEngine.buildRoutePlan(stage, {
      preferredProvider: preferred.provider,
      preferredModel: preferred.model
    });
  }

  /**
   * Item 0d: Waehle den besten Kandidaten aus einem Provider-Pool via DB-Metriken.
   * Filtert auf verfuegbare Provider, scored via getDynamicScore(), gibt Top-Scorer.
   * Rueckgabe: { provider, model, score } | null wenn kein Kandidat verfuegbar.
   */
  function pickBestFromPool(pool, taskType, metrics) {
    const candidates = pool
      .filter(c => c && c.provider && routingEngine.isAvailable(c.provider))
      .map(c => ({
        provider: c.provider,
        model: c.model || 'auto',
        score: getDynamicScore(c.provider, c.model || 'auto', taskType, metrics)
      }));

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }

  /**
   * Single source of truth for translate-stage routing decisions.
   * Item 0d: Dynamisches Routing — Provider-Auswahl innerhalb der Risiko-Tiers
   * erfolgt jetzt via DB-Metriken (model_task_metrics) statt hartcodierter Ketten.
   * Die Risiko-Tiers selbst bleiben als Kostenkontrolle bestehen.
   *
   * @returns {{ provider: string, model: string, reason: string, stressTestRequired: boolean }}
   */
  function resolveTranslateRoute(items) {
    const preferred = resolveProviderModel('translate');
    const totalRisk = items.reduce((sum, item) => sum + (item.riskScore || 0), 0);
    const avgRisk = items.length > 0 ? totalRisk / items.length : 0;
    const hasLongText = items.some(item => item.type === 'LONG_TEXT' || (item.source && item.source.length > 300));

    // Item 0d: Lade Metriken EINMAL pro Routing-Entscheidung (vermeidet doppelte DB-Queries).
    const metrics = getMetricsSnapshot ? getMetricsSnapshot() : null;
    if (metrics) routingEngine.setMetricsSnapshot(metrics);

    // ── Tier 1: UI-String optimization ──────────────────────────────────────
    const uiStringCount = items.filter(item => classifyPath(item.relativePath, plugin) === 'ui_string').length;
    if (uiStringCount >= items.length * 0.8) {
      // Item 0d: Dynamische Pool-Auswahl statt hartcodierter if/else-Kette.
      // Pool = alle Free/Cheap-Provider, sortiert nach DB-Qualitäts-Metriken.
      const uiPool = [
        preferred.provider !== 'google_free' && preferred.provider !== 'argos' ? preferred : null,
        { provider: 'nvidia', model: 'auto' },
        { provider: 'openrouter', model: 'openrouter/free' },
        { provider: 'groq', model: 'auto' },
        { provider: 'fcm', model: 'auto' },
        { provider: 'google_free', model: 'google-translate-free' },
        { provider: 'argos', model: 'argos-translate-local' }
      ].filter(Boolean);
      const best = pickBestFromPool(uiPool, 'translate', metrics);
      if (best) {
        console.log(`[DISPATCH] UI-String Batch (${uiStringCount}/${items.length}) -> ${best.provider} (score: ${best.score.toFixed(0)}) [dynamic]`);
        return { provider: best.provider, model: best.model, reason: 'ui_strings_dynamic', stressTestRequired: false };
      }
    }

    // ── Tier 2: Low-risk -> dynamische Pool-Auswahl ─────────────────────────
    if (avgRisk < 2.0) {
      // Bei explizitem non-free Primary: diesen priorisieren (User-Wunsch respektieren)
      const isFreePreferred = preferred.provider === 'argos' || preferred.provider === 'google_free';
      if (!isFreePreferred && routingEngine.isAvailable(preferred.provider)) {
        console.log(`[DISPATCH] Low-Risk (avgRisk: ${avgRisk.toFixed(1)}) -> ${preferred.provider} (konfigurierter Primary)`);
        return { provider: preferred.provider, model: preferred.model, reason: 'low_risk_primary', stressTestRequired: false };
      }
      // Item 0d: Dynamische Pool-Auswahl für Free/Cheap-Fallback
      const lowRiskPool = [
        { provider: 'nvidia', model: 'auto' },
        { provider: 'openrouter', model: 'openrouter/free' },
        { provider: 'groq', model: 'auto' },
        { provider: 'fcm', model: 'auto' },
        { provider: 'argos', model: 'argos-translate-local' },
        { provider: 'google_free', model: 'google-translate-free' }
      ];
      const best = pickBestFromPool(lowRiskPool, 'translate', metrics);
      if (best) {
        console.log(`[DISPATCH] Low-Risk (avgRisk: ${avgRisk.toFixed(1)}) -> ${best.provider} (score: ${best.score.toFixed(0)}) [dynamic]`);
        return { provider: best.provider, model: best.model, reason: 'low_risk_dynamic', stressTestRequired: false };
      }
    }

    // ── Tier 3: Ambiguous risk -> stress test required ──────────────────────
    if (avgRisk >= 2.0 && avgRisk < 6.0) {
      console.log(`[DISPATCH] Ambiguous-Risk (avgRisk: ${avgRisk.toFixed(1)}) -> Stress-Test erforderlich`);
      try { getGateCounter().record('dispatcher:avgRisk_tier3', 'keep', { phase: 'resolveTranslateRoute' }); } catch (_) {}
      return { provider: preferred.provider, model: preferred.model, reason: 'ambiguous_risk', stressTestRequired: true };
    }

    // ── Tier 4: High-risk -> quality model ──────────────────────────────────
    if (avgRisk >= 6.0 || hasLongText) {
      const qualityRoute = resolveProviderModel('polish');
      if (routingEngine.isAvailable(qualityRoute.provider)) {
        console.log(`[DISPATCH] High-Risk (avgRisk: ${avgRisk.toFixed(1)}) -> ${qualityRoute.provider} (Qualitaets-Modell)`);
        return { provider: qualityRoute.provider, model: qualityRoute.model, reason: 'high_risk', stressTestRequired: false };
      }
      console.log(`[DISPATCH] High-Risk, aber Qualitaets-Modell ${qualityRoute.provider} nicht erreichbar. Nutze Primary.`);
    }

    // ── Default: use user-configured primary provider ───────────────────────
    return { provider: preferred.provider, model: preferred.model, reason: 'default', stressTestRequired: false };
  }

  async function runRoute(stage, executor, items = []) {
    try { getGateCounter().record('dispatcher:runRoute', 'enter', { stage: (stage == null ? 'unknown' : String(stage)), items: Array.isArray(items) ? items.length : 0 }); } catch (_) {}
    // Only use translate-specific routing (stress test, UI-string, low-risk)
    // for the translate stage. Polish/audit always use their configured provider.
    const preferred = (items.length > 0 && stage === 'translate')
      ? resolveTranslateRoute(items)
      : resolveProviderModel(stage);
    const routePlan = routingEngine.buildRoutePlan(stage, {
      preferredProvider: preferred.provider,
      preferredModel: preferred.model
    });
        
    let lastError = null;
    if (routePlan.length === 0) {
      throw new Error(`Keine nutzbare Route fuer ${stage} verfuegbar.`);
    }

    let attemptIdx = 0;
    for (const route of routePlan) {
      try {
        try { getGateCounter().record('dispatcher:runRoute_attempt', String(attemptIdx), { provider: route && route.provider == null ? '' : String(route.provider), model: route && route.model == null ? '' : String(route.model), stage: stage == null ? 'unknown' : String(stage) }); } catch (_) {}
        console.log(`[DISPATCH] ${stage} -> ${route.provider} (${route.model || 'default'})`);
        return await executor(route);
      } catch (e) {
        try { getGateCounter().record('dispatcher:runRoute_attempt:fails', String(attemptIdx), { provider: route && route.provider == null ? '' : String(route.provider), error: e && e.message ? String(e.message) : String(e) }); } catch (_) {}
        if (e.message === 'ABORTED') throw e;
        routingEngine.handleFailure(route.provider, e);
        lastError = e;
        console.warn(`[DISPATCH] ${stage} ${route.provider} fehlgeschlagen: ${extractErrorMessage(e)}`);
      }
      attemptIdx++;
    }

    throw new Error(`Alle ${stage}-Routen fehlgeschlagen. Letzter Fehler: ${extractErrorMessage(lastError)}`);
  }

  return {
    resolveProviderModel,
    buildStageRoutePlan,
    resolveTranslateRoute,
    runRoute
  };
}

module.exports = {
  createDispatcher
};
