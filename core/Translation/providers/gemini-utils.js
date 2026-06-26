'use strict';

/**
 * gemini-utils.js — Gemini-spezifische Hilfsfunktionen
 * Extrahiert aus client-factory.js (v0.24).
 *
 * buildGeminiSchema() — erzeugt das JSON-Schema für Gemini's
 *   responseSchema (controlled generation).
 * buildGeminiRequest() — baut den kompletten Gemini-API-Request
 *   mit GenerationConfig (temperature, responseMimeType, responseSchema).
 *
 * Beide Funktionen sind reine Funktionen ohne externe Abhängigkeiten.
 */

function buildGeminiSchema(expectedCount, mode = 'text') {
  const itemType = mode === 'flags' ? 'boolean' : 'string';
  return {
    type: 'array',
    minItems: expectedCount,
    maxItems: expectedCount,
    items: { type: itemType }
  };
}

function buildGeminiRequest(prompt, mode = 'text', expectedCount = 0) {
  const request = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: mode === 'flags' ? 0 : 0.1
    }
  };

  if (expectedCount > 0) {
    request.generationConfig.responseMimeType = 'application/json';
    request.generationConfig.responseSchema = buildGeminiSchema(expectedCount, mode);
  }

  return request;
}

module.exports = { buildGeminiSchema, buildGeminiRequest };
