# 📖 INDEX — core/tests/ (10 Dateien, 2.300+ LOC)

> **Generiert:** 2026-06-21 | **Version:** v0.21-experimental (Session 4 Catch-up)
> **Zweck:** Referenzbuch für Tests — Smoke-Tests, E2E-Tests, Boundary-Tests, Runtime-Score-Tests
> **CL-Refs:** Kanonische Quelle ist `core/archive/docs/CHANGELOG.md`. Lokale CL-Refs sind Kurzform.

---

| Datei | LOC | Checks | Beschreibung |
|-------|-----|--------|--------------|
| e2e_bug1_native_mode.js | 394 | — | E2E: Native Mode Backup-Bug |
| e2e_p3_risk_scoring.js | — | 29/29 | E2E: Risk Scoring |
| e2e_p5_sprachauswahl.js | — | 31/31 | E2E: P5 Sprachauswahl |
| env-protection-smoke.js | — | 31/31 | .env-Protection-Test |
| gate-counter-smoke.js | — | PASS | Gate-Counter Telemetrie |
| parser_smoke.js | — | 26/26 | Parser (SoS, Raw, JSON) |
| plugin-boundary-contract.js | 271 | 73/73 | **Contract-Test (BU-023)** — Dynamische Interface-Erkennung, 7 Funktionen |
| plugin-boundary-smoke.js | 320 | 100/100 | **Plugin-Boundary** — 23 Methoden, 9 Sektionen |
| **runtime_score.test.js** | **150** | **13/13** | **Runtime-Score Unit + Persona-Smoke** — T1-T8 + T9-T11 Persona + T12/T13 Bonus |
| translation-runtime-smoke.js | 540 | — | Translation-Runtime Smoke |
| validator-smoke.js | — | 49/49 | **Validator** — 16 Tests, 49 Checks |

---

### plugin-boundary-smoke.js (320 LOC, 100 Checks)
*Verifiziert ALLE 23 Methoden: GameAdapter → GamePlugin → SongsOfSyxPlugin*

| Zeile | Test-Sektion | Checks |
|-------|-------------|--------|
| 19 | Test 1: Instance Chain | 3 (instanceof) |
| 24 | Test 2: GameAdapter Methods Existence | 15 |
| 29 | Test 3: GamePlugin Methods Existence | 8 |
| 35 | Test 4: Method Count | 2 |
| 107 | Test 5: GameAdapter Callability+Types | ~30 |
| 189 | Test 6: async scanMod() | 1 |
| 191 | Test 7: GamePlugin Callability+Types | ~25 |
| 267 | Test 8: Base Class Abstract Methods | 3 |
| 270 | Test 9: Edge Cases null/undefined | 5 |

**CHANGELOG-Ref (2× plugin-boundary):**
- [CL:F.B] Plugin-Boundary Smoke — 100/100 PASS, 23 Methoden verifiziert über 3 Ebenen
- [CL:BU-023] Plugin-Boundary Contract — 73/73 PASS, Dynamische Interface-Erkennung + Synthetischer Auto-Detection-Test

### plugin-boundary-contract.js (271 LOC, 73 Checks)
*Dynamischer Contract-Test: Interface-Extraktion via getOwnPropertyNames + 3 Verifikations-Layer*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 38 | `extractInterface()` | Dynamische Interface-Extraktion (GameAdapter+GamePlugin) |
| 80 | `verifyPluginContract(PluginClass, label, iface)` | Generische Contract-Verifikation (L1+L2+L3) |
| 165 | `runSyntheticAutoDetectionTest()` | Synthetischer Test: Dummy-Methode → Auto-Fail beweist |
| 199 | `runEdgeCaseTests()` | Null/undefined, Return-Types, Instance-Chain |

**CHANGELOG-Ref (1× plugin-boundary-contract.js):**
- [CL:BU-023] Dynamischer Contract-Test — 73/73 PASS, Interface-Änderungen werden sofort erkannt

### validator-smoke.js (49 Checks)
*Verifiziert validateFileMarkers mit 16 Tests*

| Zeile | Test | Checks |
|-------|------|--------|
| 16 | Empty string | 2 |
| 21 | Null input | 2 |
| 26 | Valid tags | 3 |
| 30 | Valid placeholders | 3 |
| 34 | Valid variables | 4 |
| 35 | Mixed markers | 5 |
| 250 | Shield restore OK | 4 |
| 281 | Shield restore FAIL | 4 |

**CHANGELOG-Ref (1× validator-smoke.js):**
- [CL:0.20.0-wip] Phase 2c — 16 Tests, 49 Checks für validateFileMarkers (Tags, Placeholder, Shield-OK, Shield-FAIL)

---

### runtime_score.test.js (150 LOC, 13 Checks)
*Unit + Persona-Smoke für runtime_score.js — folgt konventionellem SyxBridge-Pattern (kein Test-Framework, manuelle check() + exit-Codes per AGENTS.md)*

| Zeile | Test | Zweck |
|-------|------|-------|
| T1 | Weighted REVISED-Σw=1.0 | Score ≈ 90.105 (Spec §2.5) |
| T2 | Weighted halbierte Weights | Normalisierung: gleicher Score nach Σw=0.5 |
| T3 | Geometric all-100 | Score = 100 (∏100^(1/n) = 100) |
| T4 | Geometric P=0-Cat | Score = 0 (konservativ) |
| T5 | Harmonic ≤ Arithmetic | Korrekte mathematische Relation (nicht '≤ min') |
| T6 | Weights-Mismatch (5/8 cats) | Kein Crash, Σw=0 + Default → valide number |
| T7 | Empty matrix | Score = 0, coverage = 0, keine NaN |
| T8 | Single category | Weighted == Arithmetic (≈ 55) |
| T9 | Persona 4GB-RAM | → 'schwache-hw' |
| T10 | Persona 8GB-RAM 1 Key | → 'mid-range-with-keys' |
| T11 | Persona 16GB-RAM 5 Keys + Ollama | → 'power-ollama' (Reviewer-Fix: ollama-check vor key-count) |
| T12 | Invalid formula | Wirft (Defense-in-Depth) |
| T13 | All 6 formulas valid | Kein Crash bei weighted/arithmetic/geometric/harmonic/min/max |

**CHANGELOG-Ref (1× runtime_score.test.js):**
- [CL:RUNTIME-SCORE-CLI] 13/13 Tests (T1-T13) PASS — Math-Correctness, Persona-Classifier, Edge-Cases

---

*📖 Tests-INDEX v0.21 — 10 Dateien, ~2.450 LOC, 7 Smoke-Tests, 1 Contract-Test, 2 E2E-Tests, 1 Runtime-Score-Test*
