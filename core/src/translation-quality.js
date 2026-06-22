/**
 * translation-quality.js — Scoring, Heuristiken, Guardrails.
 *
 * Extracted from translation-runtime.js as part of the modularization.
 * Pure logic (mostly synchronous) — geändert wenn sich Scoring/Validation ändert.
 */

const { normalizeTranslationEntry } = require('./context-packets');

// QUAL-OFFENSIVE: Single Source of Truth für native_runtime Quality-Score.
// classifyNativeDecision('native_runtime', reason != 'glossary_exact') liefert q=94.
// Wenn dieser Wert in v0.20 angepasst wird, soll nur EINE Stelle geändert werden.
const NATIVE_RUNTIME_DEFAULT_QUALITY = 94;
// Gluecklicher Fall: native_glossary (reason='glossary_exact') nutzt q=88 — separater Wert.
const NATIVE_GLOSSARY_DEFAULT_QUALITY = 88;

function createTranslationQuality(options) {
  const {
    config,
    normalizeWhitespace,
    isProperNoun,
    shouldTranslate,
    dbAll,
    plugin
  } = options;

  // Game-specific gameplay terms for English detection (from plugin).
  // Base list: universal function words that are always English.
  // Plugin terms: game-specific words that signal untranslated content.
  const _baseEnglishTerms = [
    'the', 'and', 'with', 'for', 'from', 'your', 'their',
    'will', 'have', 'has', 'this', 'that', 'more', 'less', 'better', 'guide'
  ];
  const _gameTerms = plugin?.getGameTerms?.() ?? [];
  const _allEnglishTerms = [..._baseEnglishTerms, ..._gameTerms];
  const _englishRegex = new RegExp(
    `\\b(${_allEnglishTerms.map(t => t.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')).join('|')})\\b`,
    'g'
  );

  function isLikelyTargetLanguageText(text) {
    const value = normalizeWhitespace(text);
    if (!value || value.length < 4) return false;
    const lang = config.TARGET_LANG;

    if (lang === 'German') {
      if (/[äöüßÄÖÜ]/.test(value)) return true;
      const lower = value.toLowerCase();
      const hits = (lower.match(/\b(der|die|das|und|nicht|mit|fuer|für|fur|eine|einer|einen|ihre|seine|den|dem|des|von|ist|sind|wird|werden|zum|zur|bei|nach|ohne)\b/g) || []).length;
      if (hits >= 2) return true;
    } else if (lang === 'French') {
      if (/[éèêëàâîïôûùç]/.test(value)) return true;
      const lower = value.toLowerCase();
      const hits = (lower.match(/\b(le|la|les|un|une|des|et|pas|avec|pour|est|sont|dans|sur)\b/g) || []).length;
      if (hits >= 2) return true;
    } else if (lang === 'Spanish') {
      if (/[áéíóúüñ¿¡]/.test(value)) return true;
      const lower = value.toLowerCase();
      const hits = (lower.match(/\b(el|la|los|las|un|una|y|no|con|para|es|son|en|de)\b/g) || []).length;
      if (hits >= 2) return true;
    } else if (lang === 'Russian' || lang === 'Ukrainian') {
      if (/[а-яА-ЯёЁіІєЄґҐ]/.test(value)) return true;
      return false;
    }

    const lower = value.toLowerCase();
    const englishHits = (lower.match(_englishRegex) || []).length;
    if (englishHits > 0) return false;

    const tokens = lower.match(/[a-zÀ-ž]+/g) || [];
    if (tokens.length === 0) return false;

    if (['German', 'French', 'Spanish', 'Italian', 'Portuguese'].includes(lang)) {
      const morphologyHits = tokens.filter(token => /(ung|keit|heit|schaft|chen|lein|lich|isch|erei|tion|tions|te|ten|ter|tes|en|ment|age|ique|able|ante|amos|aron|iendo)$/i.test(token)).length;
      return morphologyHits >= Math.max(1, Math.ceil(tokens.length * 0.5));
    }

    return false;
  }

  function classifyNativeDecision(entry, glossaryMap) {
    const source = String(entry.source || '');
    const normalized = normalizeWhitespace(source);
    if (!normalized) return { reuse: true, translation: source, reason: 'empty' };

    if (isProperNoun(source)) {
      return { reuse: true, translation: source, reason: 'proper_noun' };
    }

    if (!shouldTranslate(source)) return { reuse: true, translation: source, reason: 'non_translatable' };
    if (isLikelyTargetLanguageText(source)) return { reuse: true, translation: source, reason: 'already_target_lang' };

    const glossary = glossaryMap.get(source);
    if (glossary && glossary.target_term) {
      return { reuse: true, translation: glossary.target_term, reason: 'glossary_exact' };
    }

    return { reuse: false, translation: source, reason: '' };
  }

  function scoreTranslationQuality(source, translation) {
    const src = normalizeWhitespace(source);  // E2-Note: normalizeWhitespace wird auch in inferFlagReason() aufgerufen.
    // Performance-Impact minimal (<1ms per call) — bewusste Redundanz zugunsten von Funktions-Isolation.
    let tgt = normalizeWhitespace(translation);

    // Subtask 0c Fix #1: Plugin-gesteuerte Metadaten-Extraktion.
    // Groq liefert Übersetzungen mit Game-spezifischen Metadaten (z.B. SoS:
    //   "[field=Tunnel | ctx:risk=2 | ...] | Quelle: \"echte Übersetzung"
    // Der Regex kommt vom Plugin (getTranslationMetadataPattern()) —
    // Multi-Game-Support: jedes Spiel definiert sein eigenes Pattern.
    // Extrahiere NUR die Übersetzung via Plugin-Capture-Group.
    const metaPattern = plugin?.getTranslationMetadataPattern?.();
    if (metaPattern) {
      const metaMatch = tgt.match(metaPattern);
      if (metaMatch) tgt = metaMatch[1].trim();
    }

    if (!tgt) return 0;
    if (/^\d+$/.test(tgt)) return 0;

    // Subtask 0c Fix #2: HARD-CAP für already-target-language von 50→80.
    // Diagnose: 26/37 DB-Einträge (40-65 Range) sind korrekte deutsche Quellen
    // die schon Deutsch sind — translation=source ist KORREKT, nicht fehlerhaft.
    // Cap 50 war zu niedrig und produzierte stale-Flags auf korrekten Texten.
    // Cap 80 verhindert Retranslation-Loops OHNE korrekte Texte zu bestrafen.
    // (Wenn src===tgt ABER NICHT Zielsprache → weiterhin 25 — unübersetzter Text.)
    if (src === tgt) return isLikelyTargetLanguageText(tgt) ? 80 : 25;

    let score = 70;

    // lenRatio wird NACH Metadaten-Strip berechnet (#1)
    const lenRatio = tgt.length / Math.max(1, src.length);
    if (lenRatio < 0.2) return 20;
    if (lenRatio >= 0.5 && lenRatio <= 3.0) score += 15;
    else if (lenRatio > 3.0) score -= 10;

    // isLikelyTargetLanguageText prüft NACH Metadaten-Strip (#1)
    const tgtLikely = isLikelyTargetLanguageText(tgt);
    if (tgtLikely) score += 15;

    const srcTokens = src.toLowerCase().split(/\s+/);
    const tgtLower = tgt.toLowerCase();
    const reusedWords = srcTokens.filter(w => w.length > 3 && new RegExp('\\b' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b').test(tgtLower)).length;
    // Subtask 0c Fix #3: reusedWords-Penalty nur wenn weder Source noch Target
    // als Zielsprache erkannt werden. Hohe Wort-Ueberlappung bei bereits-deutschen
    // Quellen oder bestaetigten Uebersetzungen ist ERWARTET (Eigennamen, Cognates,
    // minimale Interpunktions-/Praepositions-Korrekturen) — kein Fehlersignal.
    // Echt schlechte Uebersetzungen (EN→EN) scheitern an isLikelyTargetLanguageText
    // (englische Stopwoerter → false) und werden weiterhin bestraft.
    if (!tgtLikely && !isLikelyTargetLanguageText(src)) {
      if (srcTokens.length > 1 && reusedWords / srcTokens.length > 0.5) score -= 10;
    }

    return Math.max(0, Math.min(95, score));
  }

  function inferFlagReason(source, translation, provider, opts = {}) {
    const reasons = [];
    const src = normalizeWhitespace(source);
    const tgt = normalizeWhitespace(translation);
    if (opts.forcedFallback) reasons.push(opts.forcedFallback);
    if (!tgt) reasons.push('empty_translation');
    if (provider === 'google_free' && (opts.qualityScore ?? 100) < 80) reasons.push('free_machine_translation');
    if (src === tgt && !isLikelyTargetLanguageText(tgt)) reasons.push('source_reused');
    // Check BOTH new (__SHLD_) and legacy ([[N]]) shield token formats,
    // plus DNT double-shield tokens that leaked through MT providers.
    if (tgt.includes('__SHLD_') || tgt.includes('[[') || tgt.includes(']]') || tgt.toLowerCase().includes('_dnt_')) reasons.push('shield_leak');
    return reasons.join('|');
  }

  function checkTerminologyViolations(source, translation, strictTerms) {
    for (const term of strictTerms) {
      if (source.toLowerCase().includes(term.source_term.toLowerCase())) {
        if (!translation.toLowerCase().includes(term.target_term.toLowerCase())) {
          return `Fehlender geschuetzter Begriff: "${term.target_term}"`;
        }
      }
    }
    return null;
  }

  async function getGuardedTerminology(items) {
    try {
      const guarded = await dbAll('SELECT source_term, target_term FROM glossary_terms WHERE target_lang = ? AND is_guarded = 1', [config.TARGET_LANG]);
      if (!guarded || guarded.length === 0) return [];

      const activeTerms = [];
      const combinedSource = items.map(i => String(i.source || i.originalSource || i || '').toLowerCase()).join(' ');

      for (const term of guarded) {
        if (combinedSource.includes(term.source_term.toLowerCase())) {
          activeTerms.push(term);
        }
      }
      return activeTerms;
    } catch (e) {
      return [];
    }
  }

  return {
    isLikelyTargetLanguageText,
    classifyNativeDecision,
    scoreTranslationQuality,
    inferFlagReason,
    checkTerminologyViolations,
    getGuardedTerminology
  };
}

module.exports = { createTranslationQuality, NATIVE_RUNTIME_DEFAULT_QUALITY, NATIVE_GLOSSARY_DEFAULT_QUALITY };
