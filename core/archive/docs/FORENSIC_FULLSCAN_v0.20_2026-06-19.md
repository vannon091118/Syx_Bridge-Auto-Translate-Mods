# 🔬 FORENSIC FULLSCAN — SyxBridge v0.20.0-pre-release

> **Typ:** Persistenter forensischer Vollscan (Baseline)
> **Datum:** 2026-06-19
> **Scope:** Gesamtes Repository (exkl. `node_modules/`, `.git/`, `release/`)
> **Methodik:** 13 Subagenten + manuelle Datei-Verifikation + Thinker-Synthese
> **Grundregel:** Jede Behauptung ist an Datei+Zeile belegbar. Kein "vermutlich", kein "üblicherweise".
> **Hash-Referenz:** `core/translations.db` — 6.540 translations, 29.082 revisions, 1.384 glossary_terms

---

## 1. INVENTAR-ÜBERSICHT

### Dateien nach Verzeichnis

| Verzeichnis | Dateien | Zweck |
|-------------|---------|-------|
| `core/` (root) | 4 | Entry Point, Package, ESLint, License |
| `core/src/` | 25 | Core Engine (Runtime, Quality, DB, Routing, etc.) |
| `core/src/gui/` | 3 | Web-Dashboard (Express + SSE + Vanilla JS) |
| `core/src/providers/` | 1 | Provider-Client-Factory (9 Provider) |
| `core/src/plugins/` | 2 | GamePlugin (abstract) + SongsOfSyxPlugin (concrete) |
| `core/src/adapters/` | 1 | GameAdapter (abstract interface, 17 Methoden) |
| `core/scripts/` | 22 | Operational, Maintenance, DB, Testing, Runtime |
| `core/tests/` | 9 | Smoke-Tests + E2E-Tests (manuelles Check-Framework) |
| `core/archive/` | ~40 | Dokumentation, DB-Snapshots, Freeze-Berichte, Pläne |
| `V70/`, `V71/` | je 7 | Game-Assets (Dummy-Textdateien für Mod-Struktur) |
| **Root** | 6 | README, TUTORIAL, _Info.txt, .gitignore, AGENTS.md, TREE.md |

**Gesamt (geschätzt):** ~130 Source-Files | ~35.000 LOC | 22 Scripts | 9 Tests

### DB-Snapshot (2026-06-19)

| Tabelle | Zeilen | Zweck |
|---------|--------|-------|
| `translations` | **6.540** | Primäre Übersetzungstabelle |
| `translation_revisions` | **29.082** | Vollständige Revisionshistorie |
| `glossary_terms` | **1.384** | Terminologie-Gedächtnis (davon 181 guarded) |
| `processed_files` | 399 | Datei-Processing-Tracker |
| `runs` | 53 | Ausführungs-Historie |
| `logs` | 23.157 | Datenbank-Logs |
| `sqlite_sequence` | 4 | Auto-Increment-Tracker |
| `files`, `mods`, `strings`, `tasks` | 0 | V2-Tabellen (angelegt, nicht befüllt) |

---

## 2. ARCHITEKTUR-GRAPH

### Inheritance Chain (Vererbung)

```
GameAdapter (core/src/adapters/GameAdapter.js:11)
  │ 17 abstrakte Methoden: getMetadataFileName, parseMetadata, formatMetadata,
  │   getCoreModFolderName, getCoreModMetadata, applyPatchModifications,
  │   getBackupDirectoryName, isBackupDirectory, isVersionDirectory,
  │   getOverrideHeader, formatPatchNotice, getParserFormat, classifyFile,
  │   isTranslatableFile, scanMod
  │
  └─ GamePlugin extends GameAdapter (core/src/plugins/GamePlugin.js:18)
       │ 10 zusätzliche Methoden: serializeTranslation, extractTextValue,
       │   validateTranslation, getPromptContext, getLoreTerms, getGameTerms,
       │   getPathRules, getFileHeader
       │
       └─ SongsOfSyxPlugin extends GamePlugin (core/src/plugins/SongsOfSyxPlugin.js:15)
            Implementiert ALLE 27 Methoden für Songs of Syx V71
```

### Composition (Dependency Injection)

```
index.js (Entry Point)
├── activePlugin = new SongsOfSyxPlugin()              [Zeile 86]
├── gameAdapter = activePlugin                          [Zeile 87]
├── buildBatchPrompt._plugin = activePlugin              [Zeile 88]
├── configRuntime = new ConfigRuntime(CONFIG)            [Zeile 146]
├── routingEngine = new Router(CONFIG, helpers)          [Zeile 147]
├── createTranslationRuntime({...40 Dependencies})       [Zeilen 440-467]
│   ├── Dispatcher (routingEngine, config)               [translation-runtime.js:62]
│   ├── ProviderClients (9 API-Call-Funktionen)          [translation-runtime.js:68]
│   ├── TranslationQuality (Scoring, Heuristiken)        [translation-runtime.js:77]
│   ├── TranslationDb (DB-Wrapper)                       [translation-runtime.js:83]
│   └── PolishArbiter (A/B Polish Orchestrator)         [translation-runtime.js:115]
└── createRuntimeOps({...})                              [Zeilen 430-458]
```

### Datenfluss (Übersetzungspipeline)

```
ensureTranslations() [translation-runtime.js:527, ~354 Zeilen]
  │
  ├─ 1. Cache-Phase: getCachedTranslations() + needsRefresh-Prüfung
  │     → FIX-1/3/4/6: polish_single, native_runtime, score<30 automatisch heilen
  │
  ├─ 2. Native-Phase: classifyNativeDecision() für Eigennamen/Glossary
  │     → native_runtime (q=94) / native_glossary (q=88)
  │
  ├─ 3. Translate-Phase: translateBatchWithRouting() → dispatcher.runRoute()
  │     → resolveTranslateRoute() [dispatcher.js:64]:
  │         Tier 1: UI-Strings → google_free/argos
  │         Tier 2: Low-Risk → LLM-Free-Tiers (nvidia, openrouter/free, groq)
  │         Tier 3: Ambiguous → Stress-Test via Google Free Preflight
  │         Tier 4: High-Risk → Quality-Model (Polisher-Provider)
  │
  ├─ 4. QA-Phase: flagPotentialErrors() + PolishArbiter.runAbPolishing()
  │     → Guarded Terms (181 aktiv) via getGuardedTerminology()
  │     → Terminology-Violation-Retry (max 2 Attempts)
  │
  └─ 5. Deep-Polish-Phase: runDeepPolishBatch() (Auto-Trigger)
        → Retry-Mechanismus (2 Versuche, 5s Pause)
```

### GUI-Architektur

```
gui/server.js (Express, ~450 Zeilen)
├── GET  /              → index.html
├── GET  /api/config    → Config-Daten + Provider-Status
├── GET  /api/logs      → SSE-Stream (EventSource)
├── GET  /api/provider-status → Provider-Gesundheit
├── GET  /api/action/:action  → CLI-Aktionen (sync, reset, etc.)
├── POST /api/key-check → API-Key-Validierung
├── GET  /api/db/search → DB-Volltextsuche
├── POST /api/db/update → Einzelübersetzung editieren
├── GET  /api/revisions → Revisionshistorie
├── POST /api/revisions/restore → Revision wiederherstellen
└── GET  /api/models/:provider → Verfügbare Modelle

gui/public/app.js (Vanilla JS, ~1000 Zeilen)
├── EventSource('/api/logs') → Live-Log-Stream        [Zeile 517]
├── fetch('/api/config')     → Konfiguration laden     [Zeile 298]
├── fetch('/api/db/search')  → DB-Suche                [Zeile 756]
├── fetch('/api/db/update')  → Übersetzung editieren   [Zeile 810]
└── canvas-basierte Live-Statistiken (FPS-Loop)        [Zeile 70]
```

---

## 3. FUNKTIONS-/IMPORTKETTEN

### Kritische Import-Pfade (Top-Down)

```
translation-runtime.js (zentrale Orchestrierung)
  ├── context-packets.js     → normalizeTranslationEntry, mergeEntryContexts, buildContextPacket
  ├── dispatcher.js          → createDispatcher
  ├── polish-arbiter.js      → createPolishArbiter
  ├── cli-progress.js        → Fortschrittsanzeige
  ├── providers/client-factory.js → createProviderClients (9 Provider-APIs)
  ├── translation-quality.js → createTranslationQuality (Scoring, Guarded Terms)
  └── translation-db.js      → createTranslationDb (Cache, Save, Glossary)

router.js (Provider-Routing)
  ├── (keine internen Core-Imports — reine Logik)
  └── PROVIDER_CAPABILITIES [Zeilen 3-15] — 9 Provider: google_free, argos, fcm,
        ollama, openrouter, groq, gemini, player2, nvidia

client-factory.js (Provider-API-Calls)
  ├── axios (HTTP)
  └── 9 Export-Funktionen: callGeminiBatch, callGroqBatch, callOpenRouterBatch,
        callOllamaBatch, callArgosBatch, callPlayer2Batch, callNvidiaBatch,
        callFcmBatch, callGoogleTranslateFree, executeStageRequest
```

### Größte Funktionen (>100 Zeilen)

| Funktion | Datei:Zeile | Größe | Risiko |
|----------|-------------|-------|--------|
| `ensureTranslations()` | translation-runtime.js:527 | ~354 Zeilen | 🔴 GOD FUNCTION |
| `translateBatch()` | translation-runtime.js:222 | ~200 Zeilen | 🟠 Hoch |
| `buildRoutePlan()` | router.js:237 | ~100 Zeilen | 🟡 Mittel |
| `resolveTranslateRoute()` | dispatcher.js:64 | ~90 Zeilen | 🟡 Mittel |

### Fehlende Boundary-Tests

- `GamePlugin` ↔ `SongsOfSyxPlugin`: **Keine Tests** (bekanntes Issue F.B, README.md)
- `GameAdapter` Interface-Compliance: **Keine Contracts** (nur `throw new Error('Not implemented')` als informelle Guards)
- Kein Test-Framework (kein Jest, Mocha, Vitest) — manuelle `check()`-Funktionen mit `process.exit()`

---

## 4. AUFFÄLLIGKEITEN NACH KATEGORIE

### 🔴 CRITICAL (P0)

| ID | Fund | Datei:Zeile | Impact |
|----|------|-------------|--------|
| — | *Keine P0-Funde* | — | Alle bekannten P0-Issues wurden in vorherigen Sprints gefixt |

### 🟠 HIGH (P1)

| ID | Fund | Datei:Zeile | Impact |
|----|------|-------------|--------|
| **GOD-001** | `ensureTranslations()` — 354 Zeilen Monolith | translation-runtime.js:527 | Maintainability: Single Point of Failure, schwer testbar, schwer erweiterbar |
| **CODE-001** | CodeRabbit-Auto-Fix aus PR #5 nicht manuell re-verifiziert | README.md Known Issues F.C | Correctness: automatische Änderungen könnten unentdeckte Bugs enthalten |
| **STATE-001** | `consecutiveGrammarFailures` als modul-scoped Mutable | translation-runtime.js:46 | Correctness: Wird pro Lauf zurückgesetzt, aber bei asynchronen Interleaves könnte State korrumpieren |

### 🟡 MEDIUM (P2)

| ID | Fund | Datei:Zeile | Impact |
|----|------|-------------|--------|
| **DRIFT-001** | Live-Core `core/src/` Drift vom Release-Snapshot | README.md F.A | Maintainability: PR #5 änderte nur Vendored, nicht Source |
| **BOUND-001** | Plugin-Boundary ohne Boundary-Tests | README.md F.B | Correctness: Interface-Änderungen in GamePlugin brechen SongsOfSyxPlugin unbemerkt |
| **DB-001** | 14 ALTER TABLE Versuche bei JEDEM Startup | db.js:100-149 | Performance: SQLite muss jedes Mal Exceptions catchen |
| **TEST-001** | Kein Test-Framework — manuelle `check()` + `process.exit()` | tests/*.js | Maintainability: Keine CI-fähigen Tests, keine Coverage-Metriken |
| **IMPORT-001** | `_dbGet` ist Alias auf `dbGet`, aber Code verwendet beide | translation-runtime.js:50 | Maintainability: Verwirrend — `_dbGet` suggeriert interne/andere Semantik |
| **CANCEL-001** | Keine AbortController für externe API-Calls | client-factory.js (alle Calls) | Correctness: SIGINT stoppt Ollama, aber Gemini/Groq-Calls laufen blind weiter |

### 🟢 LOW (P3)

| ID | Fund | Datei:Zeile | Impact |
|----|------|-------------|--------|
| **AUDIT-001** | Audit-`.jsonl`-Daten committed | README.md F.D | Hygiene: Binäre/Analyse-Daten gehören in `.gitignore` |
| **LOG-001** | `debug_payloads.txt` wird in CWD geschrieben | logger.js:6 | Hygiene: Debug-Datei im Projekt-Root |
| **STRESS-001** | `_properNounAllowlist` zweimal dupliziert | translation-runtime.js:319, 340 | Maintainability: DRY-Verstoß — identische Liste an 2 Stellen |
| **NULL-001** | `console.warn` bei leeren Caches statt Info | translation-runtime.js:695 | UX: "Warnung" für erwarteten Zustand (erster Run) |
| **SCRIPT-001** | 17 nicht-modulare Scripts ohne `module.exports` | core/scripts/ | Maintainability: Können nicht programmatisch aufgerufen werden |

---

## 5. VERÄNDERUNG SEIT LETZTEM VOLLSCAN

> **Status:** Dies ist der **erste dokumentierte Vollscan**. Dient als Baseline für alle zukünftigen Vergleiche.

### Als kürzlich migriert/geändert identifiziert (via Code-Marker)

| Marker | Beschreibung | Datei(en) |
|--------|-------------|-----------|
| `BU-002` | SongsOfSyxAdapter → SongsOfSyxPlugin Migration | index.js:28 |
| `BUG-FS-003` | DNT Double-Shielding für Argos/Google Free | translation-runtime.js:139, 359, 368 |
| `BUG-FS-004` | consecutiveGrammarFailures-Reset vor Deep Polish | translation-runtime.js:759 |
| `BUG-009` | Target-Language-Erkennung in Batch-Pipeline | translation-runtime.js:313 |
| `QO-FIX-1` | polish_single stale Refresh | translation-runtime.js:695 |
| `QO-FIX-2` | Deep Polish Retry-Mechanismus | translation-runtime.js:797 |
| `QO-FIX-3+4` | native_runtime dynamische Re-Evaluierung | translation-runtime.js:695 |
| `QO-FIX-5` | Auto-Guard-Migration (181 Terms) | db.js:263-295 |
| `QO-FIX-6` | Score<30 needsRefresh | translation-runtime.js:695 |

### DB-Wachstum (Snapshot-Trend)

| Metrik | Snap 16 (Quickfix) | Snap 17 (Pre-v0.20) | Snap 18 (JETZT) |
|--------|-------------------|---------------------|-----------------|
| Translations | 6.131 | 6.294 | **6.540** |
| Stale-Rate | 34.6% | 35.6% | **34.3%** |
| Stage-2-Rate | 64.8% | 66.0% | **71.7%** |
| Flagged | 1.729 | 1.725 | **2.444** |
| Glossary | 1.151 | N/A | **1.384** |
| Revisions | 6.131 | 6.294 | **29.082** |

---

## 6. OFFENE FRAGEN

### Nicht verifizierbar (benötigen weiteren Research oder Live-Tests)

1. **AbortController-Frage:** Was passiert bei `SIGINT` während eines laufenden Gemini/Groq/OpenRouter API-Calls? `client-factory.js` verwendet `axios.post()` ohne `AbortController` oder `signal`. Der Call läuft bis zum Timeout (60s) weiter — potenzieller Key-Verbrauch ohne Nutzen.

2. **Race Condition `consecutiveGrammarFailures`:** `ensureTranslations()` setzt den Zähler auf 0 zurück (`translation-runtime.js:528`). Wenn zwei `ensureTranslations()`-Aufrufe asynchron interleaven, könnte der zweite Lauf den Zähler des ersten zurücksetzen. In der Praxis: passiert das? Node ist Single-Threaded, aber `await`-Gaps erlauben Interleaving.

3. **SQLite Busy-Retries:** `busy_timeout = 5000` (db.js:80) — reichen 5 Sekunden für alle Concurrent-Access-Szenarien? GUI-Server liest parallel zur Translation-Pipeline.

4. **Plugin-Hot-Swap:** Kann der User theoretisch ein anderes Plugin (anderes Spiel) laden ohne Neustart? `activePlugin` ist module-scoped in `index.js` — müsste für Multi-Game-Support dynamisch austauschbar sein.

5. **Steam Workshop vs. AppData Dual-Path:** Die Dokumentation sagt "übersetzte Dateien werden in BEIDE Verzeichnisse kopiert" — ist das im aktuellen Code tatsächlich implementiert? `runtime-ops.js:368` enthält einen Kommentar dazu, aber der tatsächliche Kopiervorgang müsste in `exporter.js` oder `runtime-ops.js` verifiziert werden.

6. **NVIDIA 0% Nutzung in Snap 18:** `nvidia`-Provider taucht in Snapshot 18 mit 0 Treffern auf — ist der Key konfiguriert aber der Provider wird geroutet? Oder fehlt der Key?

---

## 7. METHODIK & SUBAGENT-MATRIX

| Agent | Phase | Fokus | Ergebnisse |
|-------|-------|-------|------------|
| basher | 0 | DB-Bootstrap-Snapshot | 11 Tabellen, 6.540 translations |
| basher | 1 | Vollinventar (find) | ~130 Source-Files identifiziert |
| code-searcher | 2.1 | Dependency Graph | 200+ require()-Matches, keine Zirkel |
| code-searcher | 2.2 | Exports Inventory | 217 module.exports, keine Duplikate |
| code-searcher | 2.3 | Function Inventory | 219 named functions, 1 God Function |
| code-searcher | 2.4 | DB Access Patterns | 161 SQL-Queries, parametrisiert |
| code-searcher | 2.5 | Logging + Markers | 16 TODO/FIXME/BUG, ~60 console.log |
| code-searcher | 2.6 | Global State | 88 process.env, 2 global.* |
| code-searcher | 2.7 | Core Source Analyse | 115 functions in core/src/ |
| code-searcher | 2.8 | GUI + Server | Express-Endpoints, SSE-Streaming |
| code-searcher | 2.9 | Providers | 9 Provider, withRetry-Wrapper |
| code-searcher | 2.10 | Plugins + Adapters | 27 Methoden in SongsOfSyxPlugin |
| code-searcher | 2.11 | Scripts | 22 Scripts, 5 modular |
| code-searcher | 2.12 | Tests | 9 Tests, manuelles Check-Framework |
| code-searcher | 2.13 | Entry Point | index.js Orchestrator |
| thinker-with-files-gemini | 5 | Synthese | Architektur-Graph, Kategorien |

---

*Forensischer Vollscan v0.20.0-pre-release — Baseline. Nächster Scan: nach v0.20 Release.*
*Hash-Referenz: `core/translations.db` — 6.540 translations, 29.082 revisions.*
