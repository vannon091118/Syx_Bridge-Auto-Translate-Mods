# Projekt Dokumentation: Songs of Syx AI Translation Bridge

## Handshake-Vermerk

Version: `0.16.0`

> 📋 **Doku-Vermerk (15.06.2026):** Der vollständige Technical Review mit 12 Prüfpunkten liegt unter **[TECHNICAL_REVIEW_2026-06-15.md](../../TECHNICAL_REVIEW_2026-06-15.md)**. Beide P1-Bugs behoben: Provider-Capability-Matrix ✅ + Lokale-Modelle-Opt-in ✅. Nächster P1: OpenRouter JSON-Retry.

Diese Dokumentation beschreibt den produktiven Stand der Bridge. Das System nutzt eine modulare Architektur mit Web-GUI (Dashboard) und CLI-Modus.

## Produktiver Stand In `0.16.0`

- `index.js`: Operativer Einstiegspunkt und Starter für CLI/GUI.
- `src/gui/`: Web-Dashboard Kern (Express + Socket.io).
- `runtime-ops.js`: Mod-Laufoperationen, `_Info.txt`-Pflege und BridgeCore-Ausgabe.
- `translation-runtime.js`: Batch-Übersetzung, Audit, Polish, Cache, Glossar-Lernen und Stress-Test-Integration.
- `text-core.js`: Zentrale Textlogik für Shielding, Promptbau, Parsing und Replacement.
- `context-packets.js`: Statische und dynamische Risiko-Scores, Prompt-Kontext.
- `dispatcher.js`: Einheitliche Routing-Pipeline mit `resolveTranslateRoute()` als Single Source of Truth.
- `config-runtime.js`: Provider-Konfiguration, Key-Rotation mit Per-Key-Cooldown, Modell-Discovery.
- `planner.js`: Steuert die produktiven `single`- und `sync`-Läufe.
- `exporter.js`: Dateiausgabe und Bündelung (Native vs. Patch Mode).

## Routing-Pipeline (0.16.0)

Der Dispatcher ist jetzt die zentrale Routing-Instanz für alle Translate-Stage-Entscheidungen.

### Provider Capability Matrix (NEU)

`PROVIDER_CAPABILITIES` in `router.js` definiert welche Stages ein Provider unterstützt:

| Provider | translate | audit | polish |
|----------|-----------|-------|--------|
| google_free | ✅ | ❌ | ❌ |
| argos | ✅ | ❌ | ❌ |
| ollama | ✅ | ✅ | ✅ |
| openrouter | ✅ | ✅ | ✅ |
| groq | ✅ | ✅ | ✅ |
| gemini | ✅ | ✅ | ✅ |
| player2 | ✅ | ✅ | ✅ |

`buildRoutePlan()` filtert Provider jetzt auch nach Stage-Fähigkeit — google_free und argos erscheinen nicht mehr in audit/polish Route-Plans.

### Lokale Modelle Opt-in (NEU)

`LOCAL_MODELS_ENABLED=false` (Default) sperrt Ollama und Player2 im Router. Erst nach explizitem Opt-in des Users (GUI Toggle) werden lokale LLMs freigegeben. **Argos bleibt immer verfügbar** (leichtgewichtig, Offline-Fallback, Multi-Language).

### Risk Routing

1. **UI-Strings** (>80%): → Google Free / Argos (kostenlos)
2. **Low-Risk** (AvgRisk < 1.5): → Argos / Google Free (schnell)
3. **Ambiguous** (1.5-4.0): → Stress-Test via Google Free Pre-Flight, dann ggf. Eskalation
4. **High-Risk** (≥4.0 oder Long Text): → Qualitäts-Modell (Polish-Provider)
5. **Default**: → User-konfigurierter Primary Provider

Die Routing-Entscheidung ist stage-gated: Nur `translate` nutzt diese Logik. `polish` und `audit` verwenden ihre konfigurierten Provider direkt.

`translateBatch()` delegiert komplett an den Dispatcher und akzeptiert optionales `routeOverride` für korrekte Fallback-Kette.

## Key-Rotation mit Per-Key-Cooldown

`ConfigRuntime.rotateApiKey()` rotiert durch API-Keys mit Cooldown-Awareness:

- Keys mit aktivem 429-Cooldown werden übersprungen
- 60s Cooldown bei proaktivem Quota-Warn (`handleRateLimits`)
- 30s Cooldown bei 429-Fehler (Catch-Blocks)
- Abgelaufene Cooldowns werden automatisch aufgeräumt

## Stress-Test-System

`googleFreePreflight()` testet ambiguous-risk Batches via Google Translate Free:

- Bei >70% Pass-Rate: Google Free wird direkt verwendet
- Bei marginalen Ergebnissen: Dynamische Risk-Scores werden angepasst, Batch eskaliert zum Qualitäts-Modell
- Ergebnisse werden in `translations.stress_test_passed` + `stress_tested_at` persistiert
- Technische Spec für dedizierte `stress_test_results`-Tabelle: `docs/STRESS_TEST_SPEC.md`

## Architektur

- `db.js`: Datenbankzugriff, Migrationen (translations, glossary_terms, stress_test_results)
- `scanner.js`: Mod- und Dateierkennung
- `extractor.js`: String-Extraktion und Hashing
- `text-core.js`: Textlogik und Prompt-/Parse-Kern
- `context-packets.js`: Statische + dynamische Risiko-Scores, Prompt-Kontext
- `glossary.js`: Terminologie-Memory mit Guarded Terms
- `router.js`: Provider- und Fallback-Logik mit Cost-Class-Sortierung
- `dispatcher.js`: Einheitliche Routing-Pipeline (`resolveTranslateRoute`)
- `config-runtime.js`: Provider-Konfiguration, Key-Rotation mit Per-Key-Cooldown, Modell-Discovery
- `translation-runtime.js`: Batch-Übersetzung, Stress-Test, Audit, Polish, Cache
- `runtime-ops.js`: Mod-Laufoperationen
- `planner.js`: Laufplanung und Orchestrierung
- `exporter.js`: Dateiausgabe und Bündelung
- `validator.js`: QA-Validierung
- `logger.js`: Datei- und DB-Logging
- `ui.js`: Interaktive Menues
- `gui/`: Web-Dashboard (Express + Socket.io)

## Geplant (nächste Sessionen)

- **P1 — OpenRouter JSON-Retry:** Bei Parse-Failure mit strikterem Prompt wiederholen (Spec: Technical Review 15.06.2026)
- **P2 — Dynamic Risk integrieren:** `scoreDynamicRisk()` in `enrichWithContext()` aufrufen (Spec: Technical Review 15.06.2026)
- Dedizierte `stress_test_results`-Tabelle + `getStressTestHistory()` für `scoreDynamicRisk()` (Spec: `docs/STRESS_TEST_SPEC.md`)
- **P2 — Revision System:** `translation_revisions`-Tabelle mit `is_active`/`is_reference` Flags (Spec: Technical Review 15.06.2026)
- Model Validation Engine: `model_registry.js` + Argos-Sprachmodell-Prüfung (Plan: `docs/MULTI_LANGUAGE_MODEL_PLAN.md`)
- Per-Key-Health-Tracking: Laufendes Monitoring statt nur Start-Check
- Dynamische Batch-Größe bei Fallback-Provider-Wechsel
- Dispatcher mit Modprofilen und Dateitypen koppeln
- Workshop-/Exporter-Pfade weiter aus `index.js` herausziehen

## Diagnose

Relevante Artefakte:

- `translations.db`
- `log.txt`
- `runs.jsonl`

Checks:

- Syntax: `npm test`
- Rekonstruktion: `npm run reconstruct`
