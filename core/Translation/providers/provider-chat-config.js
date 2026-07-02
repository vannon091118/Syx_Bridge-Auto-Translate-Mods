'use strict';

/**
 * provider-chat-config.js — Zentrale Provider-Chat-Konfiguration
 * Extrahiert aus client-factory.js (v0.24).
 *
 * Factory-Funktion die die Chat-Configuration für alle OpenAI-
 * kompatiblen Provider zurückgibt. Die config-abhängigen
 * URLs (OpenAI, Custom API) werden live aus config bezogen.
 */

function getProviderChatConfig(config) {
  return {
    groq: {
      getUrl: () => 'https://api.groq.com/openai/v1/chat/completions',
      timeout: 60000,
      requiresKey: true,
      authType: 'bearer',
      handleRateLimits: true,
      markKeyStatus: true,
      jsonRetry: true
    },
    openrouter: {
      getUrl: () => 'https://openrouter.ai/api/v1/chat/completions',
      timeout: 60000,
      requiresKey: true,
      authType: 'bearer',
      extraHeaders: { 'HTTP-Referer': 'https://github.com/vannon/syx-bridge' },
      handleRateLimits: true,
      markKeyStatus: true,
      jsonRetry: true
    },
    nvidia: {
      getUrl: () => 'https://integrate.api.nvidia.com/v1/chat/completions',
      timeout: 90000,
      requiresKey: true,
      authType: 'bearer',
      handleRateLimits: true,
      markKeyStatus: true,
      jsonRetry: true
    },
    openai: {
      getUrl: () => `${config.OPENAI_URL || 'https://api.openai.com/v1'}/chat/completions`,
      timeout: 60000,
      requiresKey: true,
      authType: 'bearer',
      handleRateLimits: true,
      markKeyStatus: true,
      jsonRetry: true
    },
    custom_api: {
      getUrl: () => `${config.CUSTOM_API_URL || 'http://localhost:8080/v1'}/chat/completions`,
      timeout: 60000,
      requiresKey: false,
      authType: 'bearer-optional',
      handleRateLimits: false,
      markKeyStatus: true,
      jsonRetry: true,
      noKeyRotation: true
    }
  };
}

module.exports = { getProviderChatConfig };
