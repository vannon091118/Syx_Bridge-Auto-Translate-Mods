# SCOPE REPORT — Songs of Syx Translation Pipeline + RimWorld Readiness

> **Generated:** 2026-06-22 | **Agents:** 15 QA Sub-Agents + Web Research
> **Scope:** Songs of Syx Uebersetzung (Vollstaendigkeit, Korrektheit, Plugin-Routing)
> **Goal:** RimWorld-Plugin sauber beginnen koennen
> **Regel:** Code reduzieren / Uebersicht durch Struktur / Layer getrennt / Schnittstellen dokumentiert

---

## ARCHITEKTUR-LAYERS

| Layer | Dateien | Rolle | Game-agnostic? |
|-------|---------|-------|----------------|
| **L1 Plugin** | SongsOfSyxPlugin.js, GamePlugin.js, GameAdapter.js | Game-specific Format, Metadata, Validation | NEIN (bewusst) |
| **L2 Engine** | scanner.js, parser.js, extractor.js, text-core.js, router.js, dispatcher.js | Format-independent Orchestration | JA (95%) |
| **L3 Runtime** | translation-runtime.js, translation-db.js, translation-quality.js, config-runtime.js, db.js | Persistence, Scoring, Providers | JA (90%) |
| **L4 Export** | exporter.js, validator.js, runtime-ops.js | Write-back, Syntax-Check, Native-Mode | TEILWEISE |
| **L5 GUI** | gui/server.js, gui/public/app.js, gui-handlers.js, sos-runtime.js | Dashboard, Launcher-Settings | NEIN |

---

## P0 — KRITISCH (Blockiert RimWorld-Integration)

### R-001: DB-Schema ohne game_id
- **Datei:** core/src/db.js:147
- **Problem:** PRIMARY KEY (source_text, target_lang) — kein game_id. Gleicher String in SoS und RimWorld wuerde Cache-Corruption verursachen.
- **Fix:** ALTER TABLE translations ADD COLUMN game_id TEXT NOT NULL DEFAULT 'songs_of_syx'; PRIMARY KEY erweitern.
- **Impact:** 1 Migration, ~15 SELECT/UPDATE-Queries in translation-db.js + gui-handlers.js anpassen.
- **Aufwand:** ~2h

### R-002: validateFileSyntax() ist SoS-spezifisch
- **Datei:** core/src/validator.js:90-94
- **Problem:** Zaehlt KEY:-Patterns (SoS-Format). XML hat keine KEY:-Zeilen → KEY_COUNT_MISMATCH bei jedem RimWorld-File.
- **Fix:** validateFileSyntax() in Plugin auslagern (plugin.validateFileSyntax()) oder Format-Parameter einfuehren.
- **Aufwand:** ~1.5h

### R-003: shieldPlaceholders() Regex hardcodiert in extractor.js
- **Datei:** core/src/extractor.js:149
- **Problem:** Regex `/<[^>]+>|__VAR\d+__|\{[^}]+\}|\$[A-Za-z0-9_]+|[^%\s]+%/g` ist in der Engine hardcodiert. RimWorld nutzt andere Tag-Formate.
- **Fix:** Regex via plugin.getPlaceholderRegex() delegieren. Fallback auf aktuelle Regex.
- **Aufwand:** ~1h

### R-004: exporter.js __OVERWRITE-Fallback hardcodiert
- **Datei:** core/src/exporter.js:74
- **Problem:** `if (outputPath.includes('V71'))` — SoS-Versionslogik in der Engine. RimWorld hat kein V71.
- **Fix:** Plugin.getFileHeader() wird bereits genutzt, aber der Fallback (Zeile 74) umgeht ihn. Fallback entfernen.
- **Aufwand:** ~0.5h

---

## P1 — HOCH (Korrektheit Songs of Syx)

### S-001: GUI hardcodiert Songs of Syx Referenzen
- **Datei:** core/src/gui/public/app.js:277-355
- **Problem:** 6 Hardcoded 'Songs of Syx'-Strings in der GUI. Patch-Mode-Buttons erklaeren SoS-spezifisches OVERRIDE-Loading.
- **Fix:** Texte via plugin.getPromptContext().gameName dynamisieren.
- **Aufwand:** ~1h

### S-002: sos-runtime.js ist SoS-only aber wird global importiert
- **Datei:** core/src/sos-runtime.js
- **Problem:** parseSoSConfig() und syncLauncherSettings() sind SoS-spezifisch. index.js importiert sie direkt.
- **Fix:** LauncherSettings-Logik in SongsOfSyxPlugin verschieben. Generic interface: plugin.getActiveMods(), plugin.syncLauncherSettings().
- **Aufwand:** ~2h

### S-003: dispatcher.js nutzt classifyPath() fuer UI-String-Optimierung
- **Datei:** core/src/dispatcher.js:83
- **Problem:** `classifyPath(item.relativePath) === 'ui_string'` — SoS-Pfadregeln in der Engine.
- **Fix:** Bereits ueber plugin.getPathRules() delegiert, aber dispatcher.js importiert classifyPath direkt aus text-core.js statt ueber den Plugin.
- **Aufwand:** ~0.5h

### S-004: properNounAllowlist hardcodiert in translation-runtime.js
- **Datei:** core/src/translation-runtime.js:425-431
- **Problem:** 30+ hardcoded englische Common-Nouns als Allowlist. Game-spezifisch.
- **Fix:** In plugin.getProperNounAllowlist() auslagern.
- **Aufwand:** ~0.5h

### S-005: index.js DEFAULT_GAME_MOD_ROOT hardcodiert auf songsofsyx
- **Datei:** core/index.js:107-112
- **Problem:** `%APPDATA%/songsofsyx/mods` als Default. RimWorld hat anderen Pfad.
- **Fix:** Plugin.getDefaultModPath() einfuehren. Config liest dann aus Plugin.
- **Aufwand:** ~0.5h

---

## P2 — MITTEL (Code-Reduktion + Uebersicht)

### C-001: export_stage2.js dupliziert exporter.js Logik
- **Datei:** core/scripts/export_stage2.js:207-236
- **Problem:** validateFileSyntax + __OVERWRITE-Header + BridgeCore-Logik sind in export_stage2.js UND exporter.js dupliziert.
- **Fix:** export_stage2.js soll exporter.writeTranslatedFile() nutzen statt eigene Validierung.
- **Aufwand:** ~1.5h

### C-002: 6x 'songs_of_syx' Default in 4 Dateien
- **Datei:** core/index.js:93,113 | core/src/config-runtime.js:1024 | core/src/sos-runtime.js:10 | core/scripts/export_stage2.js:48
- **Problem:** `process.env.GAME || 'songs_of_syx'` steht 6x als Fallback.
- **Fix:** Zentralen DEFAULT_GAME in plugin-registry.js definieren. Alle Imports nutzen den.
- **Aufwand:** ~0.5h

### C-003: normalizeWhitespace in 3 Modulen importiert
- **Datei:** translation-runtime.js, translation-quality.js, client-factory.js
- **Problem:** Gleiche Funktion, 3 Importe. ABER: das ist Node.js require-Cache — kein echtes Duplikat.
- **Status:** Akzeptabel. Kein Fix noetig, nur Dokumentation.

### C-004: escapeTextValue/unescapeTextValue in extractor.js + text-core.js
- **Datei:** core/src/extractor.js:13-27 | core/src/text-core.js:5-6
- **Problem:** text-core.js re-exportiert aus extractor.js. Kein Duplikat, aber verwirrende Import-Kette.
- **Fix:** text-core.js soll extractor.js direkt nutzen statt Re-Export.
- **Aufwand:** ~0.25h

### C-005: Watermark-Strip an 5 Stellen
- **Datei:** extractor.js:15, text-core.js:523, translation-db.js:204,210, translation-runtime.js:1114
- **Problem:** `.replace(/[\u200B\u200C]/g, '')` steht 5x. Defense-in-Depth ist beabsichtigt, aber dokumentieren.
- **Fix:** WATERMARK_CONFIG.stripMarkers(text) Helper einfuehren. Alle 5 Stellen nutzen ihn.
- **Aufwand:** ~0.5h

---

## P3 — NIEDRIG (Nice-to-have)

### N-001: parser.js JSON-Parser ist regex-basiert
- **Datei:** core/src/parser.js:94-120
- **Problem:** JSON-Parser nutzt Regex statt JSON.parse fuer Position-Offsets. Funktioniert, aber fragil.
- **Fix:** Fuer RimWorld irrelevant (XML-Parser waehre neu). Bestehenden beibehalten.

### N-002: isProperNoun() Unicode-Regex prueft nur Capitalization
- **Datei:** core/src/text-core.js:78-97
- **Problem:** `/^[\p{Lu}\p{Lt}]/u.test(value)` — gut, aber PROPER_NOUN_DENY_COMMON_ENGLISH ist SoS-optimiert.
- **Fix:** In Plugin auslagern (plugin.getProperNounDenylist()).
- **Aufwand:** ~0.5h

### N-003: Plugin-Contract-Test prueft nur SongsOfSyxPlugin
- **Datei:** core/tests/plugin-boundary-contract.js:286
- **Problem:** verifyPluginContract() ist generisch, aber wird nur mit SongsOfSyxPlugin aufgerufen.
- **Fix:** Bei RimWorld-Plugin: denselben Test mit RimWorldPlugin ausfuehren.
- **Aufwand:** ~0.25h

---

## SONGS OF SYX VOLLSTAENDIGKEITS-CHECK

| Komponente | Status | Bemerkung |
|------------|--------|-----------|
| Plugin (SongsOfSyxPlugin) | ✅ VOLLSTAENDIG | 15 GameAdapter + 9 GamePlugin Methoden implementiert |
| GameAdapter Interface | ✅ VOLLSTAENDIG | 15 abstrakte Methoden definiert |
| GamePlugin Interface | ✅ VOLLSTAENDIG | 9 konkrete Methoden mit Defaults |
| Plugin-Registry | ✅ FUNKTIONAL | createPlugin('songs_of_syx') funktioniert |
| Plugin-Boundary-Contract | ✅ 76 ASSERTIONS | Dynamischer Test, keine Hardcoded-Listen |
| Parser (sos Format) | ✅ VOLLSTAENDIG | registerFormat('sos') + extractor.js |
| Scanner | ✅ DELEGATED | scanMod/collectFiles/classifyFile via Adapter |
| Router | ✅ GAME-AGNOSTIC | 9 Provider, dynamisches Routing, DB-Metriken |
| Dispatcher | ⚠️ 95% AGNOSTIC | classifyPath() Import aus text-core.js (SoS-Pfade) |
| Translation-Runtime | ✅ FUNKTIONAL | 5 Phasen: Cache→Native→Translate→QA→DeepPolish |
| Translation-DB | ⚠️ KEIN game_id 
