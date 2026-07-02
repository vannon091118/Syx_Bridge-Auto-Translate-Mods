/**
 * runtime_score.test.js — Unit + Smoke Tests für runtime_score.js
 *
 * BU-026: Migriert auf Jest-Test-Framework (describe/it/expect statt
 * manuelle pass/fail-Zähler + console.log).
 *
 * Tests: 13 Checks (T1-T13) — 6 Formeln, Persona-Classifier, Edge-Cases
 * Spec: core/archive/docs/CALCULATION_AND_INTEGRATION_2026-06-21.md §5
 */

const path = require('path');
const {
  computeGlobalRuntimeScore,
  classifyUserPersona,
  INLINE_MATRIX,
  DEFAULT_POPULATION,
  VALID_FORMULAS
} = require(path.join(__dirname, '..', 'Translation', 'runtime_score.js'));

function approx(actual, expected, tolerance = 0.01) {
  return Math.abs(actual - expected) <= tolerance;
}

describe('runtime_score — Unit Tests', () => {

  // ── T1: Weighted mit REVISED-Σw=1.0 → ≈90.1% ─────────────────
  test('T1: Weighted Σw=1.0 → ≈90.105', () => {
    const r = computeGlobalRuntimeScore(INLINE_MATRIX, DEFAULT_POPULATION, 'weighted');
    expect(approx(r.globalScore, 90.105, 0.01)).toBe(true);
    expect(r.coverage).toBe(8);
    expect(r.perCategory.length).toBe(8);
  });

  // ── T2: Weighted mit halbierten Weights → same Score ─────────
  test('T2: Weighted bleibt stabil nach Weight-Halbierung', () => {
    const halfWeights = {};
    for (const k of Object.keys(DEFAULT_POPULATION)) halfWeights[k] = DEFAULT_POPULATION[k] / 2;
    const r = computeGlobalRuntimeScore(INLINE_MATRIX, halfWeights, 'weighted');
    expect(approx(r.globalScore, 90.105, 0.01)).toBe(true);
  });

  // ── T3: Geometric all-100 → 100% ──────────────────────────────
  test('T3: Geometric mit allen P=100 → 100%', () => {
    const all100 = {};
    for (const k of Object.keys(INLINE_MATRIX)) all100[k] = { pMin: 100, pMax: 100, mid: 100, label: k };
    const r = computeGlobalRuntimeScore(all100, DEFAULT_POPULATION, 'geometric');
    expect(approx(r.globalScore, 100, 0.01)).toBe(true);
  });

  // ── T4: Geometric mit einem P=0 → 0% ──────────────────────────
  test('T4: Geometric mit einem zero-cat → 0%', () => {
    const withZero = { ...INLINE_MATRIX };
    withZero['casual'] = { pMin: 0, pMax: 0, mid: 0, label: 'zero' };
    const r = computeGlobalRuntimeScore(withZero, DEFAULT_POPULATION, 'geometric');
    expect(approx(r.globalScore, 0, 0.001)).toBe(true);
  });

  // ── T5: Harmonic ≤ Arithmetic ─────────────────────────────────
  test('T5: Harmonic ≤ Arithmetic (mathematisch korrekt)', () => {
    const r = computeGlobalRuntimeScore(INLINE_MATRIX, DEFAULT_POPULATION, 'harmonic');
    const rArith = computeGlobalRuntimeScore(INLINE_MATRIX, DEFAULT_POPULATION, 'arithmetic');
    expect(r.globalScore).toBeLessThanOrEqual(rArith.globalScore + 0.001);
    expect(r.globalScore).toBeLessThan(rArith.globalScore);
  });

  // ── T6: Weights-Mismatch → kein Crash ──────────────────────────
  test('T6: Weights-Mismatch (5 weights, 8 cats) — kein Crash', () => {
    const partialWeights = {
      'casual': 0.4, 'mid-range-with-keys': 0.3, 'mid-range-no-keys': 0.2,
      'schwache-hw': 0.05, 'power-ollama': 0.05
    };
    const r = computeGlobalRuntimeScore(INLINE_MATRIX, partialWeights, 'weighted');
    expect(Number.isFinite(r.globalScore)).toBe(true);
    expect(r.globalScore).toBeGreaterThan(0);
    expect(r.coverage).toBe(8);
  });

  // ── T7: Empty matrix → 0 ──────────────────────────────────────
  test('T7: Empty matrix → 0', () => {
    const r = computeGlobalRuntimeScore({}, DEFAULT_POPULATION, 'weighted');
    expect(r.globalScore).toBe(0);
    expect(r.coverage).toBe(0);
  });

  // ── T8: Single category → weighted == arithmetic ──────────────
  test('T8: Single category — weighted == arithmetic', () => {
    const oneCat = { 'only-cat': { pMin: 50, pMax: 60, mid: 55, label: 'only' } };
    const oneWeight = { 'only-cat': 1.0 };
    const rWeighted = computeGlobalRuntimeScore(oneCat, oneWeight, 'weighted');
    const rArith = computeGlobalRuntimeScore(oneCat, oneWeight, 'arithmetic');
    expect(approx(rWeighted.globalScore, rArith.globalScore, 0.001)).toBe(true);
    expect(approx(rWeighted.globalScore, 55, 0.001)).toBe(true);
  });

});

describe('runtime_score — Persona-Classifier Smoke', () => {

  // ── T9: 4GB RAM, no GPU → schwache-hw ─────────────────────────
  test('T9: 4GB RAM, no GPU → "schwache-hw"', () => {
    const p = classifyUserPersona({ ram: 4, display: true, numApiKeys: 0, hasOllama: false, hasPython: false });
    expect(p).toBe('schwache-hw');
  });

  // ── T10: 8GB RAM, 1 Key → mid-range-with-keys ─────────────────
  test('T10: 8GB RAM, 1 Key → "mid-range-with-keys"', () => {
    const p = classifyUserPersona({ ram: 8, display: true, numApiKeys: 1, hasOllama: false, hasPython: false });
    expect(p).toBe('mid-range-with-keys');
  });

  // ── T11: 16GB RAM, hasOllama → power-ollama ───────────────────
  test('T11: 16GB RAM, hasOllama=true → "power-ollama"', () => {
    const p = classifyUserPersona({ ram: 16, display: true, numApiKeys: 5, hasOllama: true, hasPython: false });
    expect(p).toBe('power-ollama');
  });

});

describe('runtime_score — Edge-Cases', () => {

  // ── T12: Invalid formula throws ────────────────────────────────
  test('T12: Ungültige Formel wirft Error', () => {
    expect(() => computeGlobalRuntimeScore(INLINE_MATRIX, DEFAULT_POPULATION, 'invalid-mode')).toThrow();
  });

  // ── T13: All valid formulas execute without crash ──────────────
  test('T13: Alle 6 Formeln laufen ohne Crash', () => {
    for (const f of VALID_FORMULAS) {
      expect(() => computeGlobalRuntimeScore(INLINE_MATRIX, DEFAULT_POPULATION, f)).not.toThrow();
    }
  });

});
