# 📖 INDEX — core/src/gui/ (2 Dateien, 2.167 LOC)

> **Generiert:** 2026-06-23 | **Version:** v0.22.0
> **Zweck:** Referenzbuch für die GUI-Schicht (HTTP-Server + Client-Dashboard)
> **CL-Refs:** Kanonische Quelle ist `../INDEX.md`. Lokale CL-Refs sind Kurzform. Bei Konflikt gilt `../INDEX.md`.

---

## server.js (650 LOC)
*Klasse: `GuiServer extends EventEmitter` — HTTP-Server mit SSE, REST-API, 25+ Endpoints*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 6 | `class GuiServer extends EventEmitter` | **Hauptklasse** |
| 21 | `http.createServer((req, res) => {...})` | HTTP-Request-Handler |
| 22 | `/` + `/public/` | Static Files (HTML, JS, CSS) |
| 72 | `/api/session` | Session-Tracking (Idle-Shutdown) |
| 96 | `/api/config` GET/POST | Live-Konfiguration lesen/schreiben |
| 115 | `/api/system-health` | System-Health (Argos, Ollama, DB) |
| 136 | `/api/models/status` | Modell-Status (Argos+Ollama) |
| 149 | `/api/models/argos/languages` | Installierte Argos-Sprachen |
| 165 | `/api/models/install` | Sprache/Modell installieren |
| 180 | `/api/models/ollama/pull` | Ollama Pull starten |
| 190 | `/api/models/ollama/pulls` | Aktive Pull-Jobs |
| 201 | `/api/models/:provider` | Provider-Modell-Liste |
| 213 | `/api/provider-status` | Key-Validität + Rate-Limits |
| 225 | `/api/backups` | Backup-Liste |
| 241 | `/api/backups/restore` | Backup wiederherstellen |
| 258 | `/api/db/search` | DB-Suche (mit Limit) |
| 276 | `/api/db/update` | DB-Eintrag aktualisieren |
| 290 | `/api/glossary/guarded` | Geschützte Begriffe lesen |
| 304 | `/api/glossary/guard` | Begriff schützen |
| 315 | `/api/action/:action` | Aktionen auslösen (sync, stop, ...) |
| 326 | `/api/preflight-status` | PREFLIGHT-Warnung (DB-Repair-Blink) |
| 338 | `/api/db-repair` | DB-Reparatur auslösen |
| 356 | `/api/fcm-rankings` | FCM Live-Rankings |
| 373 | `/api/runtime-score` | Runtime-Score aus current_score.json |
| 390 | `/api/run-evaluation` | Letzter Durchlauf Self-Evaluation |
| 408 | `/api/key-check` | Einzelnen Key testen |
| 423 | `/api/revisions` | Revision-History laden |
| 438 | `/api/revisions/restore` | Revision wiederherstellen |
| 454 | `/api/logs` | **SSE** — Echtzeit-Logs + Status + DB-Samples |
| 520 | `this.logWatcherInterval` | Log-File-Watcher (inkrementell) |

**CHANGELOG-Ref (4× gui/server.js):**
- [CL:0.15.0-alpha] GUI Overhaul, HTTP-Server + SSE erstellt
- [CL:0.19.6-fcm] /api/fcm-rankings + /api/key-check + /api/revisions Endpoints
- [CL:0.19.7] FCM Proxy + NVIDIA Status-Dots, /api/health erweitert
- [CL:0.22.0-GUI] /api/preflight-status, /api/db-repair, /api/runtime-score, /api/run-evaluation, /api/session

---

## public/app.js (1517 LOC)
*Client-Dashboard: Real-Time Stats, Settings, DB-Browser, Pipeline-Viz, Runtime-Score, FCM, Revisionen*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 70 | `tick(now)` | **Haupt-Tick** (requestAnimationFrame) |
| 237 | `setBackgroundState(state, duration)` | UI-State setzen (Running/Success/Error) |
| 256 | `updateBackgroundStatus()` | Status-Übergang erkennen (Run→Idle) |
| 276 | `togglePatchOverride()` | Patch-Override Toggle (Opt-in) |
| 305 | `async _toggleBridge()` | Bridge starten/stoppen |
| 314 | `async _toggleMode()` | NATIVE/PATCH Toggle |
| 325 | `updateModeUI()` | Mode-UI + Kontrollfeld aktualisieren |
| 391 | `updatePipeline(phase)` | Pipeline-Phase viz (SCAN→LLM→QA→SAVE) |
| 414 | `renderProviderStats()` | Provider-Stats mit API-Health rendern |
| 464 | `async fetchProviderStatus()` | Provider-Status laden |
| 471 | `updateBatchRecommendation()` | Batch-Empfehlung (isFreeModel-Mirror) |
| 500 | `async triggerAction(action)` | Action auslösen |
| 513 | `connectLogs()` | **SSE-Verbindung** (Logs+Status+Payloads+Samples) |
| 596 | `openKeyModal()` | API-Key-Modal öffnen |
| 604 | `closeKeyModal()` | Modal schließen |
| 609 | `renderKeySections()` | Key-Sektionen rendern |
| 677 | `async _saveKeysFromModal()` | Keys speichern |
| 701 | `async checkSingleKey(provider, btnEl)` | Einzelnen Key testen |
| 728 | `async checkAllKeys(provider)` | Alle Keys testen |
| 753 | `async searchDb()` | **DB-Suche** |
| 764 | `renderDbTable()` | DB-Tabelle rendern (Mehrzeilen) |
| 801 | `async _saveDbEntry(idx)` | DB-Eintrag speichern |
| 834 | `async openRevisions(sourceText, targetLang)` | Revisionen öffnen |
| 893 | `async restoreRevision(revisionId)` | Revision wiederherstellen |
| 918 | `async _toggleLocalModels()` | Lokale Modelle Toggle |
| 934 | `async onProviderChange()` | Provider-Wechsel |
| 961 | `async saveConfig(silent)` | Config speichern |
| 988 | `async loadInitialConfig()` | Config laden (PATCH_MODE_ENABLED Check) |
| 1044 | `async fetchHealth()` | **Health-Check** + Status-Dots |
| 1086 | `async fetchModelStatus()` | Modell-Status laden |
| 1098 | `renderModelStatus(status)` | Modell-Status rendern (Argos+Ollama Pulls) |
| 1170 | `async _installArgosFromUI()` | Argos installieren |
| 1196 | `async _pullOllamaModel()` | Ollama-Modell pullen |
| 1225 | `async refreshFcmRankings()` | FCM Rankings refresh |
| 1252 | `renderFcmRankings(rankings)` | FCM Rankings rendern (Tier+Ping+USE) |
| 1283 | `async useModelFromFcm(modelId)` | FCM Modell als Primary setzen |
| 1329 | `setInterval(() => {...})` | FCM Auto-Refresh (60s) |
| 1339 | `async fetchPreflightStatus()` | PREFLIGHT-Status + DB-Repair-Button |
| 1373 | `async runDbRepair()` | DB-Repair auslösen (4 Blink-Tiers) |
| 1428 | `startSettingsPolling()` | Lazy-Load Settings-Polling |
| 1437 | `stopSettingsPolling()` | Settings-Polling stoppen |
| 1443 | `async loadBackups()` | Backups laden |
| 1475 | `async restoreBackup(modId)` | Backup wiederherstellen |
| 1500 | `toggleRuntimeScoreMin()` | Runtime-Score Panel min/max |
| 1510 | `async fetchRuntimeScore()` | Runtime-Score laden |
| 1530 | `renderRuntimeScore(data)` | 8 Kategorien + Global-Score rendern |
| 1580 | `async fetchRunEvaluation()` | Run Self-Evaluation laden |
| 1600 | `renderRunEvaluation(data)` | Letzter Durchlauf Metriken rendern |
| 1640 | `toggleStreamView()` | DB↔LLM Stream-View Toggle |

**CHANGELOG-Ref (5× gui/public/app.js):**
- [CL:0.15.0-alpha] GUI Overhaul, Neon Progress Border, tick(), connectLogs(), SSE-Verbindung
- [CL:0.19.7] FCM Proxy + NVIDIA Status-Dots, fetchHealth()
- [CL:0.19.6-fcm] FCM Rankings Panel + Key-Check + USE-Button, renderFcmRankings()
- [CL:0.20.0-alpha.3] subPhase-Indikator + Input-Lock + Heartbeat-Staleness, updatePipeline()
- [CL:0.22.0-GUI] Runtime-Score (minimiert), fetchPreflightStatus, runDbRepair, fetchRunEvaluation, toggleStreamView

---

*📖 GUI-INDEX v0.22.0 — 2 Dateien, 2.167 LOC, ~55 Funktionen*

> **Letztes Update:** 2026-06-23 — Version auf v0.22.0 aktualisiert, Runtime-Score, Preflight, Run-Evaluation, Stream-Toggle aufgenommen
