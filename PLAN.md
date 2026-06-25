# 📋 SyxBridge — Master-Plan (v0.23.0)

> **Stand:** 2026-06-25 | **Konsolidiert aus:** MODULARISIERUNGS_PLAN, DEAD_CODE_REPORT, SCOPE_REPORT, 11 Sub-Plänen, RimWorld-Recherche
> **Letzte Prüfung:** 2026-06-25 — Pläne-Audit: 11 Pläne geprüft (3 DONE, 8 OFFEN)
> **Smoke-Test-Suite:** `node scripts/check_syntax.js` + `npm run test`
> **NPM SECURITY:** ✅ 0 vulnerabilities | **ESLint:** ✅ 0 Errors

---

## 🔑 Legende

| Markierung | Bedeutung |
|------------|-----------|
| `[ ]` | Offen |
| `[~]` | In Arbeit |
| `[x]` | Erledigt |
| ⏱️ | Aufwand |
| 🔗 | Blockiert von |
| 🔴🟡🟢 | Risiko |

---

## ✅ DONE-INDEX (Abgeschlossen — Referenz)

> Diese Tasks sind erledigt. Keine weiteren Maßnahmen nötig. Nur zur Nachvollziehbarkeit gelistet.

| ID | Beschreibung | Erledigt |
|----|--------------|---------|
| S-001 | `safeRecord()` Deduplizierung (7× inline → Helper in gate-counter.js) | 2026-06-23 |
| S-002 | `vendor-utils.js` extrahieren (findLatestRelease, walkRelease, computeSha256) | 2026-06-23 |
| S-003 | Gate-Counter `safeRecord()` Wrapper | 2026-06-23 |
| S-004 | `config-discovery.js` extrahieren (9 Fetch-Funktionen, −34% config-runtime.js) | 2026-06-23 |
| S-005 | `config-persist.js` extrahieren (.env-Persistenz) | 2026-06-23 |
| S-006 | `config-keys.js` extrahieren (maskSecret, rotateApiKey, markKeyStatus) | 2026-06-23 |
| S-007 | `translation-phases.js` extrahieren (5 Phasen, −53% translation-runtime.js) | 2026-06-23 |
| S-008 | `translation-dnt.js` extrahieren (DNT-Shielding) | 2026-06-23 |
| S-009 | `text-prompts.js` extrahieren (buildBatchPrompt, buildProofreadPrompt) | 2026-06-23 |
| R-001 | `maskKey` → `maskSecret` importieren (test_providers.js) | 2026-06-23 |
| R-006 | `countMatches` Konsolidierung (validator.js) | 2026-06-23 |
| R-DB  | DB-Schema `game_id` — obsolet durch Plugin-Architektur | 2026-06-23 |
| R-VAL | `validateFileSyntax()` Plugin-Delegation | 2026-06-23 |
| R-SHIELD | `shieldPlaceholders()` Regex dynamisieren | 2026-06-23 |
| R-EXPORT | `__OVERWRITE`-Fallback entfernen | 2026-06-22 |
| C-001 | `export_stage2.js` → shared `validateAndPrepareContent()` | 2026-06-23 |
| C-002 | `DEFAULT_GAME` in plugin-registry.js zentralisiert | 2026-06-23 |
| M-REFACTOR | M-1 bis M-4: withTransaction, parseJsonBody, _testOpenAiChat, Export-Block | 2026-06-25 |
| SEC-AUDIT | npm audit 5→0 vulns, ESLint 4→0 Errors | 2026-06-25 |
| REPO-CLEAN | Dev-Daten, CHANGELOG_1.md, test_mods/, logs/, screenshots/ gelöscht | 2026-06-25 |
| COMMIT-LAYER | author_system.js, pre-push Hook, character relationships, SSoT CHANGELOG | 2026-06-25 |

---

## P4 — OFFEN: Architektur-Verbesserungen (~5h)

### [ ] S-010: DB-Access vereinheitlichen ⏱️ 1h 🟡

5 verschiedene DB-Access-Layer → einheitlicher DI-basierter Zugang.

- **Betroffen:** planner.js, diagnostics.js
- **Tests:** Alle Smoke-Tests

### [ ] S-011: `gui-backup.js` extrahieren ⏱️ 20min 🟢

Backup-Logik (restoreBackup, collectAllFiles) aus gui-handlers.js.

- **Ziel:** `core/GUI/gui-backup.js` (~60 LOC)

### [ ] S-012: Redundanz Quick Wins ⏱️ 20min 🟢

- [ ] `parseBatchResponseWithMaps` inline auflösen (translation-runtime.js:145)
- [ ] `escapeTextValue`/`unescapeTextValue` Import-Kette bereinigen

### [ ] GUI-HARDCODE: Songs-of-Syx-Referenzen dynamisieren ⏱️ 1h 🟢

GUI hardcoded 'Songs of Syx' in Patch-Mode-Buttons → via `plugin.getPromptContext().gameName`.

### [ ] SOS-RUNTIME: SoS-spezifische Logik in Plugin verschieben ⏱️ 2h 🟡

`parseSoSConfig()` + `syncLauncherSettings()` → SongsOfSyxPlugin.

### [ ] PROPER-NOUN: Allowlist in Plugin auslagern ⏱️ 30min 🟢

30+ hardcoded englische Common-Nouns → `plugin.getProperNounAllowlist()`.

---

## P5 — RIMWORLD-IMPLEMENTIERUNG (~16h)

> **Detailplan:** [`core/archive/docs/plans/PLAN_RIMWORLD.md`](core/archive/docs/plans/PLAN_RIMWORLD.md)
> **Status:** 🟡 PLANUNG — 0/19 Tasks erledigt

### Phase 1: Adapter-Hooks (13 Methoden) ⏱️ ~8h

`scanMod`, `parseMetadata`, `formatMetadata`, `getCoreModFolderName`, `getCoreModMetadata`,
`applyPatchModifications`, `getBackupDirectoryName`, `isBackupDirectory`, `isVersionDirectory`,
`getOverrideHeader`, `formatPatchNotice`, `getLauncherSettingsPath`.

### Phase 2: Scanner/Parser ⏱️ ~4h

XML-Parser für Def-Dateien, Mods/-Struktur-Scanner, XML-Exporter.

### Phase 3: Integration & Tests ⏱️ ~4h

plugin-boundary-contract erweitern (76→89 Checks), RimWorld E2E-Test.

---

## 📊 Fortschritts-Tracker

| Phase | Aufgaben | Erledigt | Status |
|-------|----------|----------|--------|
| P0 Quick Wins | 5 | 5 | ✅ |
| P1 RimWorld-Blocker | 4 | 4 | ✅ |
| P2 Config | 3 | 3 | ✅ |
| P3 Core | 3 | 3 | ✅ |
| P4 Architektur | 6 | 0 | 🟡 0/6 offen |
| P5 RimWorld-Impl | 19 | 0 | 🟡 PLANUNG |
| **TOTAL** | **40** | **19+DONE-INDEX** | **Kern ✅** |

---

## 🔍 Verifikations-Checkliste

- [ ] `node scripts/check_syntax.js` — Syntax OK
- [ ] `npm run test` — alle Tests grün
- [ ] Folder-INDEX betroffener Domänen aktualisiert
- [ ] CHANGELOG-Eintrag mit Composite vorhanden
- [ ] Code-Review durchgeführt (>10 Zeilen)

---

*Konsolidiert 2026-06-25 — Done-Tasks in DONE-INDEX ausgelagert, P0-P3 bereinigt.*
