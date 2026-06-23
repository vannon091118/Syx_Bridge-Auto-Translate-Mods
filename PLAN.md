# 📋 SyxBridge — Master-Plan (v0.22.0)

> **Stand:** 2026-06-23 | **Konsolidiert aus:** MODULARISIERUNGS_PLAN, DEAD_CODE_REPORT, SCOPE_REPORT
> **Regel:** Max 4 Dateien pro Schritt. Alle Smoke-Tests müssen nach jedem Schritt bestehen.
> **Smoke-Test-Suite:** `node scripts/check_syntax.js` + `npm run test`

---

## 🔑 Legende

| Markierung | Bedeutung |
|------------|-----------|
| `[ ]` | Offen |
| `[~]` | In Arbeit |
| `[x]` | Erledigt |
| ⏱️ | Geschätzter Aufwand |
| 🔗 | Blockiert von (Schritt-ID) |
| 🔴🟡🟢 | Risiko: Hoch / Mittel / Niedrig |

---

## P0 — QUICK WINS (Sofort startbar, ~1.5h)

> Risikolos. Rein additive Extraktion + Deduplizierung. Keine Logik-Änderung.

### [ ] S-001: `shared-utils.js` extrahieren ⏱️ 30min 🟢

Gemeinsame Utilities die in mehreren Dateien dupliziert sind.

- **Ziel:** `core/src/shared-utils.js` (~80 LOC)
- **Funktionen:** `maskSecret()`, `collectFilesRecursive()`, `countMatches()`, `safeRecord()`
- **Quellen:** config-runtime.js:182, gui-handlers.js:78, scanner.js:35, gate-counter.js:22, context-packets.js:53, validator.js:62
- **Impact:** -60 LOC Deduplizierung
- **Tests:** parser_smoke, gate-counter-smoke, validator-smoke

### [ ] S-002: `vendor-utils.js` extrahieren ⏱️ 20min 🟢

Drei Funktionen sind in vendor-sync.js UND check_vendor_drift.js identisch dupliziert.

- **Ziel:** `core/scripts/vendor-utils.js` (~60 LOC)
- **Funktionen:** `findLatestRelease()`, `walkRelease()`, `releaseToSource()`
- **Impact:** -80 LOC Deduplizierung
- **Tests:** `node scripts/check_vendor_drift.js` (Dry-Run)

### [ ] S-003: Gate-Counter `safeRecord()` Wrapper ⏱️ 10min 🟢

Identisches `try { getGateCounter().record(...) } catch (_) {}` in 6 Dateien.

- **Ziel:** `safeRecord(gateId, action, meta)` in gate-counter.js
- **Consumer:** validator.js (2×), exporter.js (2×), dispatcher.js (5×), runtime-ops.js (1×)
- **Impact:** -12 LOC (15 Zeilen → 3 Zeilen Aufruf)
- **Tests:** gate-counter-smoke

### [ ] R-001: `maskKey` → `maskSecret` importieren ⏱️ 5min 🟢

`test_providers.js:84` hat eigene `maskKey()` — identisch mit `config-runtime.js:182 maskSecret()`.

- **Fix:** Import statt Duplikat
- **Tests:** `node scripts/test_providers.js --dry-run`

### [ ] R-006: `countMatches` Konsolidierung ⏱️ 10min 🟢

`validator.js` baut eigene Regex-Counts statt `context-packets.js:countMatches()` zu nutzen.

- **Fix:** Import + Aufruf
- **Tests:** validator-smoke

---

## P1 — RIMWORLD-BLOCKER (Voraussetzung für zweites Game) ⏱️ ~5h

> Blockiert RimWorld-Integration. Jeder Fix ist isoliert, aber Schema-Änderung (R-001) kommt zuerst.

### [ ] R-DB: DB-Schema `game_id` Spalte ⏱️ 2h 🔴

`PRIMARY KEY (source_text, target_lang)` — kein game_id. Gleicher String in SoS und RimWorld = Cache-Corruption.

- **Datei:** `db.js:147`
- **Fix:** `ALTER TABLE translations ADD COLUMN game_id TEXT NOT NULL DEFAULT 'songs_of_syx'`; PRIMARY KEY erweitern; ~15 Queries in translation-db.js + gui-handlers.js anpassen
- **Impact:** Schema-Migration — kritisch, Backup vorher!
- **Tests:** translation-runtime-smoke, gui-handler-smoke

### [ ] R-VAL: `validateFileSyntax()` Plugin-Delegation ⏱️ 1.5h 🟡

Zählt KEY:-Patterns (SoS-Format). XML hat keine KEY:-Zeilen → immer MISMATCH.

- **Datei:** `validator.js:90-94`
- **Fix:** `plugin.validateFileSyntax()` einführen oder Format-Parameter
- **Tests:** validator-smoke, plugin-boundary-smoke
- 🔗 R-DB (Schema muss stehen)

### [ ] R-SHIELD: `shieldPlaceholders()` Regex dynamisieren ⏱️ 1h 🟡

Regex `/<[^>]+>|__VAR\d+__|...` ist hardcodiert. RimWorld nutzt andere Tag-Formate.

- **Datei:** `extractor.js:149`
- **Fix:** `plugin.getPlaceholderRegex()` delegieren, Fallback auf aktuelle Regex
- **Tests:** parser_smoke, plugin-boundary-contract

### [ ] R-EXPORT: `__OVERWRITE`-Fallback entfernen ⏱️ 30min 🟢

`if (outputPath.includes('V71'))` — SoS-Versionslogik in der Engine.

- **Datei:** `exporter.js:74`
- **Fix:** Fallback entfernen, Plugin.getFileHeader() nutzen (wird bereits genutzt, aber umgangen)
- **Tests:** exporter-smoke (falls vorhanden), check_syntax

---

## P2 — SHORT-TERM: CONFIG-REFAKTORIERUNG (~2h)

> config-runtime.js (1.151 LOC) wird in 3 fokussierte Module aufgeteilt.

### [x] S-004: `config-discovery.js` extrahieren ⏱️ 1h 🟡

Model-Fetch-Logik (9 fetch-Funktionen + 2 check-Funktionen + withRetry).

- **Quelle:** config-runtime.js:243-500
- **Ziel:** `core/src/config-discovery.js` (~300 LOC)
- **Strategie:** Fetch-Funktionen als standalone exportieren, ConfigRuntime delegiert via require
- **Impact:** config-runtime.js → ~850 LOC
- **Tests:** test_providers.js, env-protection-smoke

### [x] S-005: `config-persist.js` extrahieren ⏱️ 30min 🟢

.env-Persistenz-Funktionen (persistConfigToEnv, readEnvValue, persistSingleEnvVar).

- **Quelle:** config-runtime.js:1028-1130
- **Ziel:** `core/src/config-persist.js` (~100 LOC)
- **Impact:** config-runtime.js → ~750 LOC
- **Tests:** env-protection-smoke

### [x] S-006: `config-keys.js` extrahieren ⏱️ 45min 🟡

Key-Management (maskSecret, parseKeys, rotateApiKey, markKeyCooldown, markKeyStatus).

- **Ziel:** `core/src/config-keys.js` (~150 LOC)
- **Tests:** test_providers.js, env-protection-smoke
- 🔗 S-001 (maskSecret muss in shared-utils stehen)

---

## P3 — MEDIUM-TERM: CORE-EXTRAKTIONEN (~4h)

> Grösster Impact. translation-runtime.js (1.431 LOC) und text-core.js (606 LOC) werden aufgeteilt.

### [ ] S-008: `translation-dnt.js` extrahieren ⏱️ 45min 🟡

DNT-Shielding + Google-Free-Preflight — isolierte Sub-Systeme.

- **Quelle:** translation-runtime.js:143-228
- **Ziel:** `core/src/translation-dnt.js` (~80 LOC)
- **Impact:** translation-runtime.js → ~1.350 LOC
- **Tests:** translation-runtime-smoke, plugin-boundary-smoke

### [ ] S-009: `text-prompts.js` extrahieren ⏱️ 1h 🟡

Prompt-Building (buildBatchPrompt, buildProofreadPrompt, summarizeGrammarContext).

- **Quelle:** text-core.js:253-398
- **Ziel:** `core/src/text-prompts.js` (~200 LOC)
- **Impact:** text-core.js → ~400 LOC
- **Tests:** parser_smoke, plugin-boundary-smoke

### [ ] S-007: `translation-phases.js` extrahieren ⏱️ 2h 🔴

Die 5 Phasen (cache, native, translate, qa, deepPolish) aus translation-runtime.

- **Quelle:** translation-runtime.js:703-1067
- **Ziel:** `core/src/translation-phases.js` (~400 LOC)
- **Impact:** translation-runtime.js → ~950 LOC
- **Strategie:** Phase-Funktionen als `(ctx, deps) => Promise<void>`, deps = { dispatcher, clients, quality, db, config }
- **Risiko:** 30+ Closure-Variablen müssen als deps-Objekt durchgereicht werden
- **Tests:** translation-runtime-smoke (VOLLSTÄNDIG!), plugin-boundary-smoke
- 🔗 S-004, S-008 (config-discovery + DNT müssen stehen)

---

## P4 — LONG-TERM: ARCHITEKTUR (~3.5h)

> Strukturelle Verbesserungen. Niedrige Dringlichkeit, aber hoher Langzeitwert.

### [ ] S-010: DB-Access vereinheitlichen ⏱️ 1h 🟡

5 verschiedene DB-Access-Layer → einheitlicher DI-basierter Zugang.

- **Betroffen:** planner.js, diagnostics.js (von direktem Import auf DI umstellen)
- **Impact:** Konsistenter DB-Pfad, weniger Migrations-Risiko
- **Tests:** Alle Smoke-Tests (DB ist überall)

### [ ] S-011: `gui-backup.js` extrahieren ⏱️ 20min 🟢

Backup-Logik (restoreBackup, collectAllFiles) aus gui-handlers.js.

- **Quelle:** gui-handlers.js:39-92
- **Ziel:** `core/src/gui-backup.js` (~60 LOC)
- **Impact:** gui-handlers.js → ~730 LOC

### [ ] S-012: Redundanz Quick Wins ⏱️ 20min 🟢

Kleinere Deduplizierungen:

- [ ] `parseBatchResponseWithMaps` inline auflösen (translation-runtime.js:145) — 5min
- [ ] `escapeTextValue`/`unescapeTextValue` Import-Kette in text-core.js bereinigen — 5min
- [ ] Watermark-Strip Helper `WATERMARK_CONFIG.stripMarkers()` einführen (5 Stellen) — 10min

### [ ] C-001: `export_stage2.js` nutzt eigene Logik statt `exporter.js` ⏱️ 1.5h 🟡

Duplizierte validateFileSyntax + __OVERWRITE-Header + BridgeCore-Logik.

- **Fix:** export_stage2.js soll `exporter.writeTranslatedFile()` nutzen
- **Tests:** `node scripts/export_stage2.js --dry-run`

### [ ] C-002: `DEFAULT_GAME` zentralisieren ⏱️ 30min 🟢

`process.env.GAME || 'songs_of_syx'` steht 6× in 4 Dateien.

- **Fix:** Zentralen DEFAULT_GAME in plugin-registry.js, alle Imports nutzen den
- **Betroffen:** index.js:93,113 | config-runtime.js:1024 | sos-runtime.js:10 | export_stage2.js:48

### [ ] GUI-HARDCODE: 6 Songs-of-Syx-Referenzen in GUI dynamisieren ⏱️ 1h 🟢

GUI hardcoded 'Songs of Syx' in Patch-Mode-Buttons.

- **Datei:** `gui/public/app.js:277-355`
- **Fix:** Texte via `plugin.getPromptContext().gameName` dynamisieren

### [ ] SOS-RUNTIME: SoS-spezifische Logik in Plugin verschieben ⏱️ 2h 🟡

`parseSoSConfig()` und `syncLauncherSettings()` sind SoS-spezifisch.

- **Fix:** LauncherSettings-Logik in SongsOfSyxPlugin; Generic interface: `plugin.getActiveMods()`, `plugin.syncLauncherSettings()`

### [ ] PROPER-NOUN: Allowlist in Plugin auslagern ⏱️ 30min 🟢

30+ hardcoded englische Common-Nouns als Allowlist in translation-runtime.js:425-431.

- **Fix:** `plugin.getProperNounAllowlist()` einführen

---

## 📊 Fortschritts-Tracker

| Phase | Aufgaben | Erledigt | Aufwand | Status |
|-------|----------|----------|---------|--------|
| P0 Quick Wins | 5 | 0 | ~1.5h | ⬜ Offen |
| P1 RimWorld | 4 | 0 | ~5h | ⬜ Offen |
| P2 Config | 3 | 3 | ~2h | ✅ Erledigt |
| P3 Core | 3 | 0 | ~4h | ⬜ Offen |
| P4 Architektur | 7 | 0 | ~7h | ⬜ Offen |
| **TOTAL** | **22** | **0** | **~19.5h** | |

---

## ⚠️ Abhängigkeiten-Graph

```
S-001 (shared-utils)
  └→ S-006 (config-keys braucht maskSecret)
  └→ R-001 (maskKey → maskSecret)

S-004 (config-discovery)
  └→ S-007 (translation-phases braucht saubere Config)

S-008 (translation-dnt)
  └→ S-007 (translation-phases, weniger Closure-Druck)

R-DB (game_id Schema)
  └→ R-VAL (validateFileSyntax)
  └→ R-SHIELD (shieldPlaceholders)

S-001 bis S-003: UNABHÄNGIG — sofort parallel startbar
```

---

## 🔍 Verifikations-Checkliste (nach JEDEM Schritt)

- [ ] Alle Smoke-Tests bestehen: `node scripts/check_syntax.js`
- [ ] `npm run test` besteht
- [ ] `node -e "require('./core/src/<datei>')"` — kein Syntax-Error
- [ ] Folder-INDEX.md der betroffenen Dateien aktualisiert
- [ ] Keine neuen `any`-Casts oder verwaiste Imports
- [ ] Code-Review durchgeführt

---

## 🏗️ Monolith-Status (Ziel: keine Datei >900 LOC)

| Datei | Aktuell | Nach P0-P3 | Ziel |
|-------|---------|------------|------|
| translation-runtime.js | 1.431 | ~950 | <900 |
| config-runtime.js | 1.151 | ~750 | <800 |
| client-factory.js | 750 | 750 | (keine Änderung) |
| gui-handlers.js | 793 | ~730 | <800 |
| text-core.js | 606 | ~400 | <500 |
| router.js | 556 | 556 | (keine Änderung) |
| translation-db.js | 513 | 513 | (keine Änderung) |

---

*Plan erstellt 2026-06-23 — Konsolidiert aus 15 Sub-Agent-Scans.*
*Quelldokumente (archiviert): MODULARISIERUNGS_PLAN_2026-06-23.md, DEAD_CODE_REPORT_2026-06-23.md, SCOPE_REPORT.md*
*CODE IST DIE EINZIGE WAHRHEIT.*
