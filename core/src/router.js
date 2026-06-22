// ─── Provider Capability Matrix ──────────────────────────────────────────────
// Definiert welche Stages ein Provider unterstützt.
// google_free + argos können NUR übersetzen, nicht auditieren/polish/vergleichen.
const PROVIDER_CAPABILITIES = {
  google_free:  { translate: true,  audit: false, polish: false, compare: false, review: false },
  argos:        { translate: true,  audit: false, polish: false, compare: false, review: false },
  fcm:          { translate: true,  audit: true,  polish: true,  compare: true,  review: true  },
  ollama:       { translate: true,  audit: true,  polish: true,  compare: true,  review: true  },
  openrouter:   { translate: true,  audit: true,  polish: true,  compare: true,  review: true  },
  groq:         { translate: true,  audit: true,  polish: true,  compare: true,  review: true  },
  gemini:       { translate: true,  audit: true,  polish: true,  compare: true,  review: true  },
  player2:      { translate: true,  audit: true,  polish: true,  compare: true,  review: true  },
  nvidia:       { translate: true,  audit: true,  polish: true,  compare: true,  review: true  }
};

// ─── Free-Model Static Lists (Provider ohne API-Pricing) ─────────────────────
// Quellen: API-Dokumentation + manuelle Recherche, Stand Juni 2026.
// Provider die Pricing via API ausliefern (OpenRouter) nutzen dynamische
// Erkennung — siehe setOpenRouterFreeModels() unten.

// NVIDIA NIM Free-Tier Modelle
// Quelle: build.nvidia.com/models (Juni 2026) — Modelle mit "Free"-Tag
// Rate-Limit: 40 RPM. Kostenlose Credits: 5000/Monat.
const NVIDIA_FREE_MODELS = new Set([
  'meta/llama-3.3-70b-instruct',
  'meta/llama-3.1-8b-instruct',
  'nvidia/llama-3.1-nemotron-70b-instruct',
]);

// Groq Free-Tier Modelle
// Quelle: console.groq.com/docs/models (Juni 2026)
// Groq Free-Tier gibt Zugriff auf ALLE gelisteten Modelle — Einschränkung
// liegt NUR in Rate-Limits (TPM/RPD), nicht in Modell-Verfügbarkeit.
// null = Sonderwert: ALLE Groq-Modelle sind im Free-Tier nutzbar.
const GROQ_FREE_MODELS = null;

// Gemini Free-Tier Modelle
// Quelle: ai.google.dev/gemini-api/docs/models (Juni 2026)
// Google AI Studio Free-Tier: 15 RPM für Flash-Modelle, 2 RPM für Pro.
const GEMINI_FREE_MODELS = new Set([
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-preview',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
  'gemini-1.5-pro',
]);

// ─── OpenRouter Free-Model Cache (wird von config-runtime.js befüllt) ────────
// Dynamische Liste via /api/v1/models → pricing.prompt === "0" && pricing.completion === "0"
// Fallback (vor API-Abruf): Namens-Heuristik für openrouter/free + :free-Endungen
let _openRouterFreeCache = null;

function setOpenRouterFreeModels(modelIds) {
  _openRouterFreeCache = new Set(modelIds.map(m => m.toLowerCase()));
}

// ─── Free-model detection (Provider-aware) ───────────────────────────────────
function isFreeModel(provider, model) {
  const name = String(model || '').toLowerCase();

  // Immer freie Provider (lokal / offline / known-free)
  if (provider === 'ollama' || provider === 'player2') return true;
  if (provider === 'argos') return true;
  if (provider === 'google_free') return true;
  if (provider === 'fcm') return true;

  // OpenRouter: dynamischer Cache (gefüllt via fetchOpenRouterModels)
  if (provider === 'openrouter') {
    if (_openRouterFreeCache && _openRouterFreeCache.size > 0) {
      return _openRouterFreeCache.has(name);
    }
    // Bootstrap-Fallback vor erstem API-Call: Namens-Heuristik
    return name === 'openrouter/free' || name.endsWith(':free') || name.includes('/free');
  }

  // NVIDIA: statische Liste (API liefert kein Pricing)
  if (provider === 'nvidia') {
    return NVIDIA_FREE_MODELS.has(name);
  }

  // Groq: alle Modelle sind im Free-Tier (nur Rate-Limits unterscheiden)
  if (provider === 'groq') {
    return GROQ_FREE_MODELS === null || GROQ_FREE_MODELS.has(name);
  }

  // Gemini: statische Liste (API liefert kein Tier-Feld)
  if (provider === 'gemini') {
    return GEMINI_FREE_MODELS.has(name);
  }

  return false;
}

// ─── Cost class: lower = cheaper / preferred ─────────────────────────────────
// 0 = fully local/offline  →  10 = absolute last resort
function estimateCostClass(provider, model) {
  // BUGFIX (Argos overuse): Argos is now cost class 10 — ABSOLUTE LAST RESORT.
  if (provider === 'argos') return 10;
  if (provider === 'google_free') return 9;
  if (provider === 'ollama' || provider === 'player2') return 1;
  if (provider === 'fcm') return 1.5;
  // FREE IST SCOPE: alle per isFreeModel() erkannten Modelle → cost 2
  // (OpenRouter free, Groq free tier, NVIDIA free, Gemini free tier)
  if (isFreeModel(provider, model)) return 2;
  // Paid cloud providers (wenn Modell nicht als free erkannt)
  if (provider === 'openrouter' || provider === 'groq' || provider === 'nvidia') return 4;
  if (provider === 'gemini') return 5;
  return 6;
}

function isEnabledFlag(value, defaultValue = true) {
  if (value === undefined || value === null || value === '') return defaultValue;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  return ['1', 'true', 'yes', 'on'].includes(normalized);
}

// ─── Default model per provider: always prefer the cheapest/free option ───────
// No hardcoded vendor-specific model names here; the config-runtime discovers
// real models at startup and overwrites PRIMARY_MODEL / AUDITOR_MODEL / POLISHER_MODEL.
const PROVIDER_DEFAULTS = {
  gemini: 'auto',
  groq: 'auto',
  openrouter: 'openrouter/free',   // always start with the free route
  ollama: 'auto',
  player2: 'auto',
  fcm: 'auto',                     // FCM daemon proxy (localhost:19280/v1)
  google_free: 'google-translate-free',
  argos: 'argos-translate-local'
};

// ─── HTTP Error → Human-readable Action Translator ───────────────────────────
// Jeder Fehlercode bekommt eine menschenlesbare Bedeutung + Handlungsempfehlung.
// Wird von handleFailure() genutzt, damit Logs nicht nur "status code 404" zeigen,
// sondern "Groq: Modell 'auto' nicht gefunden (404) → Modell-Name oder API-URL prüfen".
function translateHttpError(status) {
  const map = {
    400: { severity: 'fatal',    meaning: 'Ungültige Anfrage',            action: 'API-Endpunkt oder Payload prüfen. Modell-Name möglicherweise falsch.' },
    401: { severity: 'fatal',    meaning: 'Key ungültig',                 action: 'API-Key ist abgelaufen oder wurde revoked. Neuen Key generieren.' },
    402: { severity: 'fatal',    meaning: 'Zahlung erforderlich',         action: 'Guthaben aufgeladen? Free-Tier-Limit erreicht? Konto prüfen.' },
    403: { severity: 'fatal',    meaning: 'Zugriff verweigert',           action: 'Key hat nicht die nötigen Rechte für dieses Modell. Key-Scope prüfen.' },
    404: { severity: 'fatal',    meaning: 'Modell/Endpunkt nicht gefunden', action: 'Modell-Name existiert nicht oder API-URL ist falsch. Modell-Liste des Providers prüfen.' },
    408: { severity: 'transient', meaning: 'Timeout (Anfrage dauerte zu lange)', action: 'Provider überlastet oder Netzwerk langsam. Automatischer Retry.' },
    429: { severity: 'transient', meaning: 'Rate-Limit — zu viele Anfragen', action: 'Aktuelles Zeitfenster erschöpft. Cooldown oder Key-Rotation aktiv.' },
    500: { severity: 'transient', meaning: 'Provider-Serverfehler',       action: 'Interner Fehler beim Provider. Automatischer Retry.' },
    502: { severity: 'transient', meaning: 'Bad Gateway',                 action: 'Provider-Gateway nicht erreichbar. Meist nach <60s behoben.' },
    503: { severity: 'transient', meaning: 'Provider überlastet/Wartung', action: 'Provider temporär nicht verfügbar. Automatischer Retry mit Cooldown.' },
    504: { severity: 'transient', meaning: 'Gateway Timeout',             action: 'Upstream-Provider antwortet nicht. Automatischer Retry.' }
  };
  // Status 0 = Netzwerkfehler (keine HTTP-Response erhalten)
  if (status === 0) return { severity: 'transient', meaning: 'Netzwerkfehler', action: 'Keine Internetverbindung oder Provider offline. DNS/Proxy prüfen.' };
  return map[status] || { severity: 'unknown', meaning: `HTTP ${status}`, action: 'Unbekannter Status-Code. Doku des Providers konsultieren.' };
}

module.exports.translateHttpError = translateHttpError;

class Router {
  constructor(config = {}, helpers = {}) {
    this.config = config;
    this.helpers = {
      getApiKey: helpers.getApiKey || (() => null),
      isProviderHealthy: helpers.isProviderHealthy || (() => true),
      isArgosInstalled: helpers.isArgosInstalled || (() => false)
    };
    this.providers = new Map();
  }

  syncDefaults(defaults = {}) {
    for (const [id, data] of Object.entries(defaults)) {
      const current = this.providers.get(id) || {};
      this.providers.set(id, {
        id,
        enabled: true,
        failureCount: 0,
        cooldownUntil: 0,
        lastErrorStatus: 0,
        lastErrorMeaning: '',
        lastErrorAction: '',
        lastCooldownMs: 0,
        flaggedForReview: false,
        ...current,
        ...data
      });
    }
  }

  getProvider(id) {
    return this.providers.get(id) || { id, enabled: true, failureCount: 0, cooldownUntil: 0, lastErrorStatus: 0, lastErrorMeaning: '', lastErrorAction: '', lastCooldownMs: 0, flaggedForReview: false };
  }

  hasAccess(id) {
    // R2-Fix: google_free abschaltbar via GOOGLE_FREE_ENABLED Config-Flag.
    // Default: true (Backward-Compat). User kann google_free deaktivieren wenn LLM-Provider verfügbar.
    if (id === 'google_free') return isEnabledFlag(this.config.GOOGLE_FREE_ENABLED, true);
    if (id === 'argos') return this.helpers.isArgosInstalled();
    // FCM: local daemon proxy — accessible unless explicitly disabled via FCM_ENABLED=false
    if (id === 'fcm') return isEnabledFlag(this.config.FCM_ENABLED, true);
    // Lokale LLM-Modelle (Ollama, Player2) nur mit explizitem Opt-in
    // (Hardware-Schutz: lokale LLMs können GPU/CPU überlasten)
    if (id === 'ollama' || id === 'player2') {
      if (!isEnabledFlag(this.config.LOCAL_MODELS_ENABLED, false)) return false;
      if (id === 'player2') return isEnabledFlag(this.config.PLAYER2_ENABLED, false);
      return true;
    }
    return !!this.helpers.getApiKey(id);
  }

  isAvailable(id) {
    const provider = this.getProvider(id);
    if (provider.enabled === false) return false;
    // Cooldown does NOT block availability — the escalating backoff
    // and key rotation handle rate-limiting at the API level.
    // During cooldown, the next key will be tried automatically.
    if (!this.helpers.isProviderHealthy(id)) return false;
    return this.hasAccess(id);
  }

  // Returns the configured model for a provider, defaulting to the free-tier option.
  // Callers that pass 'auto' expect runtime auto-discovery by config-runtime.
  getDefaultModelForProvider(provider) {
    return PROVIDER_DEFAULTS[provider] || 'auto';
  }

  handleFailure(id, error) {
    const provider = this.getProvider(id);
    const previousStatus = provider.lastErrorStatus || 0;
    provider.failureCount = (provider.failureCount || 0) + 1;

    const status = error && error.response ? error.response.status : 0;
    provider.lastErrorStatus = status;

    // Human-readable error translation for logs
    const errInfo = translateHttpError(status);
    provider.lastErrorAction = errInfo.action;
    provider.lastErrorMeaning = errInfo.meaning;

    if (status === 401 || status === 403) {
      // Auth errors: disable permanently (user must fix key)
      provider.enabled = false;
      provider.flaggedForReview = true;
      console.error(`[ROUTER] ${id}: ${errInfo.meaning} (${status}) → ${errInfo.action}`);
    } else if (status === 429) {
      // RATE LIMIT: Escalating cooldown instead of permanent disable.
      // Rationale: 429 means the current key/quotant is exhausted. Key rotation
      // in config-runtime handles switching keys automatically. Using escalating
      // cooldown (like 500 errors) allows the provider to recover after cooldown
      // expires, instead of being permanently disabled for the entire run.
      // Previous behavior (enabled=false) caused NVIDIA to have 0 entries in DB
      // despite being configured as PRIMARY_PROVIDER — a single 429 killed it.
      const baseCooldown429 = 30000; // 30s base for rate limits (longer than server errors)
      const previousCooldown = provider.lastCooldownMs || baseCooldown429;
      const escalatedCooldown = Math.min(previousCooldown * 2, 300000); // cap at 5 min
      provider.cooldownUntil = Date.now() + escalatedCooldown;
      provider.lastCooldownMs = escalatedCooldown;
      provider.flaggedForReview = (previousStatus === 429);
      if (provider.flaggedForReview) {
        console.error(`[ROUTER] ${id}: WIEDERHOLTER ${errInfo.meaning} → ${errInfo.action}`);
      } else {
        console.warn(`[ROUTER] ${id}: ${errInfo.meaning} → ${errInfo.action}`);
      }
    } else if (status >= 500 || status === 0) {
      // Server/Network errors: double the previous cooldown (escalating backoff)
      // Default cooldown 10s → ×2 on repeat → 20s → 40s → 80s (capped at 5min)
      const baseCooldown = 10000;
      const previousCooldown = provider.lastCooldownMs || baseCooldown;
      const escalatedCooldown = Math.min(previousCooldown * 2, 300000);
      provider.cooldownUntil = Date.now() + escalatedCooldown;
      provider.lastCooldownMs = escalatedCooldown;
      // Same error repeated on (likely) different key → flag for review
      if (previousStatus === status && status !== 0) {
        provider.flaggedForReview = true;
        console.error(`[ROUTER] ${id}: Wiederholter ${errInfo.meaning} (${status}) → ${errInfo.action}`);
      } else {
        console.warn(`[ROUTER] ${id}: ${errInfo.meaning} (${status}) → ${errInfo.action}`);
      }
    } else {
      // Known client errors (400, 404, 405, etc.) — these are FATAL, retry won't help
      // Examples: 404 = Modell nicht gefunden, 400 = ungültige Payload
      if (errInfo.severity === 'fatal') {
        // PERMANENT DISABLE for the session: retrying a dead endpoint (404),
        // invalid payload (400), or billing issue (402) will never succeed.
        // Unlike 401/403 (key-level) these may be model-specific, but the router
        // dispatches per-provider — re-enabling would just loop the same error.
        provider.enabled = false;
        provider.flaggedForReview = true;
        console.error(`[ROUTER] ${id}: ${errInfo.meaning} (${status}) → Provider DEAKTIVIERT. ${errInfo.action}`);
      } else {
        // Unknown or transient client errors: short cooldown, escalate on repeat
        const baseCooldown = 5000;
        const previousCooldown = provider.lastCooldownMs || baseCooldown;
        const escalatedCooldown = Math.min(previousCooldown * 2, 120000);
        provider.cooldownUntil = Date.now() + escalatedCooldown;
        provider.lastCooldownMs = escalatedCooldown;
        console.warn(`[ROUTER] ${id}: ${errInfo.meaning} (${status}) → ${errInfo.action}`);
      }
    }

    this.providers.set(id, provider);
  }

  reset(id) {
    if (id) {
      const provider = this.getProvider(id);
      provider.failureCount = 0;
      provider.cooldownUntil = 0;
      provider.enabled = true;
      provider.lastErrorStatus = 0;
      provider.lastErrorMeaning = '';
      provider.lastErrorAction = '';
      provider.lastCooldownMs = 0;
      provider.flaggedForReview = false;
      this.providers.set(id, provider);
      return;
    }

    for (const provider of this.providers.values()) {
      provider.failureCount = 0;
      provider.cooldownUntil = 0;
      provider.enabled = true;
      provider.lastErrorStatus = 0;
      provider.lastErrorMeaning = '';
      provider.lastErrorAction = '';
      provider.lastCooldownMs = 0;
      provider.flaggedForReview = false;
    }
  }

  getAllProviderStatuses() {
    const statuses = {};
    for (const [id, data] of this.providers.entries()) {
      statuses[id] = {
        enabled: data.enabled,
        failureCount: data.failureCount,
        cooldownUntil: data.cooldownUntil,
        inCooldown: data.cooldownUntil > Date.now(),
        lastErrorStatus: data.lastErrorStatus || 0,
        lastErrorMeaning: data.lastErrorMeaning || '',
        lastErrorAction: data.lastErrorAction || '',
        flaggedForReview: !!data.flaggedForReview
      };
    }
    return statuses;
  }

  /**
   * Prüft ob ein Provider eine bestimmte Stage-Rolle unterstützt.
   * Unbekannte Provider gelten als vollständig fähig (fail-open).
   */
  supportsRole(provider, role) {
    const caps = PROVIDER_CAPABILITIES[provider];
    if (!caps) return true; // Unbekannte Provider: assume capable
    return caps[role] !== false;
  }

  buildRoutePlan(role = 'translate', options = {}) {
    const plan = [];
    const seen = new Set();

    // ── 1. Determine user-configured provider/model for this role ─────────────
    let userProvider, userModel;
    if (role === 'audit') {
      userProvider = this.config.AUDITOR_PROVIDER;
      userModel    = this.config.EFFECTIVE_AUDITOR_MODEL || this.config.AUDITOR_MODEL;
    } else if (role === 'polish') {
      userProvider = this.config.POLISHER_PROVIDER;
      userModel    = this.config.POLISHER_MODEL;
    } else {
      userProvider = options.preferredProvider || this.config.PRIMARY_PROVIDER;
      userModel    = options.preferredModel    || this.config.EFFECTIVE_PRIMARY_MODEL || this.config.PRIMARY_MODEL;
    }

    // ── 2. Build ordered candidate list ──────────────────────────────────────
    // For polish and audit the fallback chain deliberately includes the free
    // OpenRouter tier so we always have a zero-cost fallback model available.
    const freeFallbacks = [
      { provider: 'openrouter', model: 'openrouter/free' },  // free tier fallback
      { provider: 'groq',       model: 'auto' },             // Groq free tier
      { provider: 'ollama',     model: 'auto' },
      { provider: 'google_free', model: 'google-translate-free' }
    ];

    // BUGFIX (Argos overuse): Argos moved to ABSOLUTE BOTTOM of every candidate list.
    // NVIDIA bumped to HIGH priority (position 2, right after user-configured provider)
    // since NVIDIA has a dedicated API key and delivers quality LLM translations.
    // Groq also promoted — its free tier offers better quality than google_free/argos.
    const candidatesByRole = {
      translate: [
        { provider: userProvider, model: userModel },
        { provider: 'nvidia',     model: 'auto' },             // ← HIGH PRIORITY (API key)
        { provider: 'groq',       model: 'auto' },             // ← promoted (free quality LLM)
        { provider: 'openrouter', model: 'openrouter/free' },
        { provider: 'fcm',        model: 'auto' },
        { provider: 'gemini',     model: 'auto' },
        { provider: 'openrouter', model: 'auto' },
        { provider: 'ollama',     model: 'auto' },
        { provider: 'player2',    model: 'auto' },
        { provider: 'google_free', model: 'google-translate-free' },
        { provider: 'argos',      model: 'argos-translate-local' }  // ← ABSOLUTE BOTTOM
      ],
      audit: [
        { provider: userProvider, model: userModel },
        { provider: 'nvidia',     model: 'auto' },
        { provider: 'groq',       model: 'auto' },
        ...freeFallbacks,
        { provider: 'fcm',        model: 'auto' },
        { provider: 'gemini',     model: 'auto' },
        { provider: 'openrouter', model: 'auto' }
      ],
      polish: [
        { provider: userProvider, model: userModel },
        { provider: 'nvidia',     model: 'auto' },
        { provider: 'groq',       model: 'auto' },
        ...freeFallbacks,
        { provider: 'fcm',        model: 'auto' },
        { provider: 'gemini',     model: 'auto' },
        { provider: 'openrouter', model: 'auto' }
      ]
    };

    // ── 3. Filter: skip providers we have no access to or that are disabled ───
    for (const cand of candidatesByRole[role] || []) {
      if (!cand || !cand.provider) continue;

      const providerId = cand.provider;
      const modelName  = cand.model || 'auto';
      const key = `${providerId}:${modelName}`;
      if (seen.has(key)) continue;

      const providerStatus = this.getProvider(providerId);
      const isHealthy  = this.isAvailable(providerId);
      const inCooldown = providerStatus.cooldownUntil && providerStatus.cooldownUntil > Date.now();

      // Hard-skip only if truly inaccessible (no key / user-disabled)
      if (!this.hasAccess(providerId) || providerStatus.enabled === false) continue;

      // Capability gate: skip providers that don't support this role
      // (e.g. google_free kann nicht auditieren/polishen)
      if (!this.supportsRole(providerId, role)) continue;

      seen.add(key);
      plan.push({
        provider: providerId,
        model: modelName,
        isUserPriority: (providerId === userProvider && modelName === userModel),
        isHealthy,
        inCooldown,
        costClass: estimateCostClass(providerId, modelName)
      });
    }

    // ── 4. Sort: healthy → user-priority → cheapest first → cooldown last ────
    // When a user-configured provider is healthy, it ALWAYS wins — regardless of
    // cost class. This ensures NVIDIA (or any explicit PRIMARY_PROVIDER) is never
    // undercut by free-tier providers the user didn't ask for.
    return plan.sort((a, b) => {
      if (a.isHealthy    !== b.isHealthy)    return a.isHealthy    ? -1 : 1;
      if (a.isUserPriority !== b.isUserPriority) return a.isUserPriority ? -1 : 1;
      // Only compare cost when neither candidate is the user's explicit choice
      if (a.costClass    !== b.costClass)    return a.costClass - b.costClass;
      return 0;
    });
  }
}

module.exports = Router;

// Re-export translateHttpError for external consumers (config-runtime key checks, etc.)
module.exports.translateHttpError = translateHttpError;
// Re-export free-model detection for client-factory.js + config-runtime.js
module.exports.isFreeModel = isFreeModel;
module.exports.setOpenRouterFreeModels = setOpenRouterFreeModels;
