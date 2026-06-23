/**
 * translation-dnt.js — DNT (Do Not Translate) Double-Shielding
 *
 * BUG-FS-003: Argos and Google Free translate __SHLD_N__ shield tokens as
 * normal text, corrupting the placeholder restoration. This module applies a
 * second "Do Not Translate" layer using _DNT_N_ tokens which are even less
 * likely to be translated.
 *
 * H1-Note: DNT is intentionally NOT applied to LLM providers (Gemini, Groq,
 * OpenRouter, etc.). LLMs reliably preserve __SHLD_N__ tokens and understand
 * "do not modify this token" instructions. DNT double-shielding would add
 * unnecessary complexity and token-translation risk for LLMs.
 *
 * S-008: Extracted from translation-runtime.js for modularity.
 */

/**
 * Apply DNT double-shielding to entries before sending to non-LLM providers.
 * Replaces __SHLD_N__ tokens with _DNT_N_ tokens.
 *
 * @param {Array} entries - Array of entry objects with .protectedText
 * @returns {{ dntTexts: string[], dntMaps: Map[] }}
 */
function dntShieldEntries(entries) {
  const dntMaps = [];
  const dntTexts = entries.map(e => {
    const dntMap = new Map();
    let idx = 0;
    const text = (e.protectedText || '').replace(/__SHLD_\d+__/g, (match) => {
      const token = `_DNT_${idx++}_`;
      dntMap.set(token, match);
      return token;
    });
    dntMaps.push(dntMap);
    return text;
  });
  return { dntTexts, dntMaps };
}

/**
 * Restore DNT tokens back to __SHLD_N__ tokens after provider response.
 *
 * @param {string[]} rawTranslations - Raw translation strings from provider
 * @param {Map[]} dntMaps - DNT token maps from dntShieldEntries
 * @returns {string[]}
 */
function dntRestoreTranslations(rawTranslations, dntMaps) {
  return rawTranslations.map((t, i) => {
    const map = dntMaps[i];
    if (!map || map.size === 0) return t;
    let result = String(t || '');
    for (const [dntToken, shldToken] of map) {
      // P1-Fix: Case-insensitive replacement because MT providers
      // (Argos/Google) may alter token casing (e.g. _DNT_0_ → _dnt_0_)
      const regex = new RegExp(dntToken.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      const before = result;
      result = result.replace(regex, shldToken);
      if (result === before) {
        // BU-029: console.warn → console.log (Hygiene — kein echter Fehler, nur Info)
        console.log(`[DNT] Token ${dntToken} nicht in Google/Argos-Response gefunden — Token ging vermutlich verloren.`);
      }
    }
    return result;
  });
}

module.exports = { dntShieldEntries, dntRestoreTranslations };
