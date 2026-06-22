# 🤝 HANDSHAKE — 2026-06-22 — Item 0a abgeschlossen

> **Session:** Routing-Engine v0.22 Kampagne — Item 0 (Fundament-Bugfixes)
> **Abgeschlossener Subtask:** 0a — "Auto"-Modus kein permanentes Einfrieren mehr
> **Nächster Subtask:** 0b — isFreeModel() erkennt nur OpenRouters Namenskonvention
> **Status:** ✅ ABGESCHLOSSEN. Warte auf "weiter" vom Operator.

---

## Was wurde gemacht

**ensurePrimaryModel(), ensureGroqModel(), ensureOllamaModel()** in `config-runtime.js`
überschrieben PRIMARY_MODEL/AUDITOR_MODEL permanent mit einem konkreten Modellnamen.
"auto" existierte danach nicht mehr als Zustand. Das widerspricht der Vision:
Routing soll PRO TASK neu entscheiden, nicht einmal raten und dann ewig dabei bleiben.

**Fix:** Auflösung in `EFFECTIVE_PRIMARY_MODEL` / `EFFECTIVE_AUDITOR_MODEL` (runtime-resolved
Properties auf dem CONFIG-Objekt). PRIMARY_MODEL/AUDITOR_MODEL bleiben als "auto" erhalten.
`persistConfigToEnv()` persistiert weiterhin "auto". Jeder Lauf evaluiert neu.

## Geänderte Dateien

- `core/src/config-runtime.js` — 8 Zuweisungen von PRIMARY_MODEL/AUDITOR_MODEL → EFFECTIVE_PRIMARY_MODEL/EFFECTIVE_AUDITOR_MODEL
- `core/src/dispatcher.js` — resolveProviderModel() liest EFFECTIVE_* || FALLBACK
- `core/src/router.js` — buildRoutePlan() liest EFFECTIVE_* || FALLBACK
- `core/src/translation-runtime.js` — getBestAvailableQualityModel() nutzt EFFECTIVE_PRIMARY_MODEL
- `core/index.js` — getModelForProvider() nutzt EFFECTIVE_PRIMARY_MODEL
- `core/src/providers/client-factory.js` — callPlayer2Batch Fallback nutzt EFFECTIVE_PRIMARY_MODEL
- `core/tests/item0a_auto_freeze_test.js` — NEU: 4 Verifikationstests
- `CHANGELOG.md` — [ITEM-0a] Eintrag
- `core/archive/docs/FREEZE/FREEZE_INDEX_2.md` — §19 Eintrag
- `core/archive/docs/HANDSHAKE_2026-06-22_item-0a.md` — Diese Datei

## Testergebnisse

- **4/4 Tests bestanden:** auto erhalten, zweiter Lauf evaluiert neu, ensureGroqModel überschreibt nicht, konkretes Modell unverändert
- **Syntax-Check:** Alle 6 Module laden ohne Fehler
- **Code-Review:** deepseek approved (mit EFFECTIVE_POLISHER_MODEL-Bereinigung)

## ⚠️ ANNAHMEN

Keine. Alle Entscheidungen waren eindeutig aus der Problembeschreibung.

## Für den nächsten Agenten (Item 0b)

Vor dem Start von 0b MUSS der Echtheits-Check durchgeführt werden:
1. Dieses HANDSHAKE lesen
2. CHANGELOG.md prüfen ob Item 0b schon erwähnt ist
3. Code in router.js (isFreeModel, estimateCostClass) eigenständig verifizieren
4. NICHT blind glauben dass 0a erledigt ist — selbst den Code prüfen

---

*ICH WERDE GEMINI NICHT REIN LASSEN — Item 0a ABGESCHLOSSEN.*
