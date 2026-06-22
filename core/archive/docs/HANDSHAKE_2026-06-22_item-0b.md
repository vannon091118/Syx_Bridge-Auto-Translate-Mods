# 🤝 HANDSHAKE — Item 0b — 2026-06-22

> **Von:** Buffy (deepseek-v4-pro) → **An:** Nächster Agent / Operator
> **Status:** ✅ ABGESCHLOSSEN. Warte auf "weiter" vom Operator.

---

## Was wurde gemacht

`isFreeModel()` von reiner Namens-Heuristik auf Provider-bewusste Free-Erkennung umgestellt.

### Neue Architektur

- **`isFreeModel(provider, model)`** in `router.js` — akzeptiert jetzt beide Parameter
- Provider-spezifische Logik:
  - `ollama`, `player2`, `argos`, `google_free`, `fcm`: immer frei
  - `openrouter`: dynamischer Cache (gefüllt via `fetchOpenRouterModels()` → pricing-Parsing)
  - `nvidia`: statische Liste (3 Modelle, Quelle: build.nvidia.com/models)
  - `groq`: null = alle Modelle free-tier (API unterscheidet nicht)
  - `gemini`: statische Liste (8 Modelle, Quelle: ai.google.dev)
- `estimateCostClass()` nutzt jetzt das neue `isFreeModel(provider, model)` — Groq/NVIDIA/Gemini Free-Modelle bekommen cost 2 statt 4/5
- `fetchOpenRouterModels()` parst `pricing.prompt === "0" && pricing.completion === "0"` und füllt den Cache via `setOpenRouterFreeModels()`

### Alten Code entfernt
- Namens-Heuristik in 4 Stellen: `isFreeModel()`, `filterLLMs()`, `getBatchProfile()`, `app.js`

### Geänderte Dateien
- `core/src/router.js` — isFreeModel, estimateCostClass, statische Listen, Exports
- `core/src/config-runtime.js` — fetchOpenRouterModels Pricing-Parse, filterLLMs
- `core/src/providers/client-factory.js` — getBatchProfile Duplikat ersetzt
- `core/src/gui/public/app.js` — Frontend-Mirror

---

## Was NICHT gemacht wurde (für nächsten Agenten)

1. `rankModel()` in config-runtime.js nutzt weiterhin Namens-Heuristik (+100/+50/+20/+10) — das ist Item 6+9 der Routing-Kampagne
2. Frontend `app.js` hat keinen Zugriff auf den OpenRouter-Free-Cache — Batch-Size-Recommendation nutzt vereinfachten Mirror (Doku-Vermerk)
3. Keine API-Endpoints für Free-Model-Abfrage erstellt (kommt mit Item 10)

---

## Verifikation

- 13/13 Logik-Tests bestanden
- Module: router.js, config-runtime.js, client-factory.js laden ohne Fehler
- Code-Review: deepseek approved (dead import + redundantes require gefunden und gefixt)

---

## Für Subtask 0c

1. `translation-quality.js` Z.124-127 — `reusedWords`-Prüfung auf falsch-negative Bewertungen analysieren
2. 50 zufällige Einträge mit quality_score 40-65 aus echter DB ziehen
3. Händisch + zweiter Agent prüfen: wie viele sind tatsächlich korrekt übersetzt?
4. CHANGELOG: [ITEM-0b] steht bereits — nächster Eintrag [ITEM-0c]
