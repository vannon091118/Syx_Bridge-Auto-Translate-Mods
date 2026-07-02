/**
 * jest.config.js — SyxBridge Test Framework (BU-026)
 *
 * Langfristiger Fix: Jest als Test-Framework ersetzt die manuellen
 * pass/fail-Zaehler + console.log-Patterns in Test-Dateien.
 *
 * Konfiguration:
 *   - CommonJS (kein Transform noetig)
 *   - Node-Umgebung
 *   - Test-Muster: tests dir, .test.js and .spec.js
 *   - 30s Timeout (LLM-Tests koennen laenger dauern)
 *   - Verbose fuer detaillierte Test-Namen
 */

module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.js',
    '**/tests/**/*.spec.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/archive/'
  ],
  transform: {},
  verbose: true,
  testTimeout: 30000,
  bail: false,
  clearMocks: true,
  restoreMocks: true
};
