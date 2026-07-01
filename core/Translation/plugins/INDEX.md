# 📖 INDEX — core/Translation/plugins/ (3 Dateien, ~911 LOC)

> **Generiert:** 2026-06-23 | **Aktualisiert:** 2026-07-02 | **Version:** v0.25.0-alpha
> **Zweck:** Referenzbuch für die Plugin-Schicht (GameAdapter → GamePlugin → SongsOfSyxPlugin / RimWorldPlugin)
> **CL-Refs:** Kanonische Quelle ist `../INDEX.md`. Lokale CL-Refs sind Kurzform. Bei Konflikt gilt `../INDEX.md`.

---

## GamePlugin.js (219 LOC)
*Klasse: `GamePlugin extends GameAdapter` — Basis-Plugin mit Default-Implementierungen*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 18 | `class GamePlugin extends GameAdapter` | Basis-Klasse |
| 34 | `serializeTranslation(translated, entry)` | Default: quoted + backslash-escaped |
| 49 | `extractTextValue(rawValue)` | Default: unescape |
| 68 | `validateTranslation(source, target)` | Default: immer ok |
| 80 | `validateFileSyntax(sourceContent, targetContent)` | **[R-VAL]** Default: `{ valid: true }` — Plugin delegiert Format-Check |
| 96 | `getPlaceholderRegex()` | **[R-SHIELD]** Default: SoS-Regex — Plugin liefert format-spezifische Regex |
| 108 | `getPromptContext()` | Default: Unknown Game |
| 124 | `getLoreTerms()` | Default: `[]` |
| 134 | `getGameTerms()` | Default: `[]` |
| 149 | `getPathRules()` | Default: `{}` |
| 165 | `getFileHeader(filePath, version)` | Default: `''` |
| 175 | `getTranslationCredit()` | Default: `'Translation by Vannon with SyxBridge'` |
| 185 | `getProperNounDenylist()` | Default: `[]` — Plugin-spezifische Denylist |
| 195 | `getProperNounAllowlist()` | Default: `[]` — Plugin-spezifische Allowlist |

---

## SongsOfSyxPlugin.js (471 LOC, 35 Methoden)
*Klasse: `SongsOfSyxPlugin extends GamePlugin` — Vollständige SoS-Implementierung*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 15 | `class SongsOfSyxPlugin extends GamePlugin` | SoS-Plugin |
| 19 | `getMetadataFileName()` | → `'_Info.txt'` |
| 23 | `parseMetadata(content)` | KEY:"value" Parsing |
| 39 | `formatMetadata(infoObj)` | _Info.txt generieren |
| 59 | `getCoreModFolderName()` | → `'BridgeCore'` |
| 63 | `getCoreModMetadata(sosMajorVersion)` | BridgeCore-Metadata |
| 80 | `applyPatchModifications(infoObj, targetLanguage)` | Patch-Name+DESC+Language-Tag |
| 91 | `getBackupDirectoryName(originalName)` | → `.backup_NAME_ORIGINAL` |
| 95 | `isBackupDirectory(dirName)` | `.backup_` Check |
| 99 | `isVersionDirectory(dirName)` | `/^V\d+$/i` Check |
| 103 | `getOverrideHeader(versionDir)` | V71 → `''` (kein __OVERWRITE!) |
| 111 | `formatPatchNotice(targetLanguage)` | Patch-Notice Text |
| 115 | `getParserFormat(filePath)` | → `'sos'`/`'json'`/`'raw'` |
| 123 | `classifyFile(relativePath)` | INFO_FILE/TEXT_FILE/ASSET/... |
| 152 | `isTranslatableFile(relativePath, fileType)` | Translatable-Set |
| 160 | `async scanMod(modDir)` | _Info.txt-basierte Mod-Detection |
| 187 | `serializeTranslation(translated, entry)` | SoS: `"escaped_value"` |
| 194 | `extractTextValue(rawValue)` | SoS: unescape |
| 200 | `validateFileSyntax(sourceContent, targetContent)` | **[R-VAL]** SoS: KEY:-Count + Quote-Balance + Line-Count |
| 233 | `getPlaceholderRegex()` | **[R-SHIELD]** SoS: `<tag>`, `__VAR_N__`, `{N}`, `$VAR`, `%s` |
| 240 | `validateTranslation(source, target)` | SoS: Quote-Balancing |
| 250 | `getPromptContext()` | Medieval, gritty Tone + Rules |
| 266 | `getLoreTerms()` | 12 Begriffe (kingdom, empire, ...) |
| 278 | `getGameTerms()` | 9 Begriffe (battle, room, ...) |
| 289 | `getPathRules()` | bio/specific→proper_noun, room/→ui_string, ... |
| 300 | `getTranslationCredit()` | `'Translation by Vannon with SyxBridge'` |
| 310 | `getProperNounDenylist()` | 200+ englische Common-Nouns |
| 340 | `getProperNounAllowlist()` | Game-spezifische Eigennamen |

**Boundary-Tests:**
- `core/tests/plugin-boundary-smoke.js` — 100/100 PASS
- `core/tests/plugin-boundary-contract.js` — 86/86 PASS

---

## RimWorldPlugin.js (221 LOC, 28 Methoden)
*Klasse: `RimWorldPlugin extends GamePlugin` — RimWorld-Stub (Format-Hooks implementiert, Adapter-Methoden werfen)*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 15 | `class RimWorldPlugin extends GamePlugin` | RimWorld-Stub |
| 25 | `serializeTranslation(translated, entry)` | XML: Entity-Escaping + Tag-Wrapping |
| 40 | `extractTextValue(rawValue)` | XML: Entity-Unescaping |
| 55 | `validateFileSyntax(sourceContent, targetContent)` | **[R-VAL]** XML: Tag-Count + Closing-Tag + Line-Count |
| 84 | `getPlaceholderRegex()` | **[R-SHIELD]** XML: `{N}`, `$VAR`, `%d/s/f` (keine Tag-Shielding) |
| 93 | `validateTranslation(source, target)` | XML: Tag-Balancing |
| 105 | `getPromptContext()` | Sci-fi, survival Tone |
| 120 | `getPathRules()` | Defs/, Languages/, Patches/ |
| 130 | `getFileHeader(filePath, version)` | XML: `<?xml version="1.0"?>` |
| 137 | `getParserFormat(filePath)` | → `'xml'`/`'raw'` |
| 145 | `classifyFile(relativePath)` | XML_FILE |
| 150 | `isTranslatableFile(relativePath, fileType)` | XML_FILE → true |
| 155-185 | Adapter stubs | Werfen `not yet implemented` |

**Status:** STUB — Format-Hooks (11/11) implementiert, Adapter-Hooks (13/13) werfen "not yet implemented".
**Detailplan:** `core/archive/docs/plans/PLAN_RIMWORLD.md` — 0/19 Tasks, ~16h Aufwand.

---

*📖 Plugin-INDEX v0.25.0-alpha — 3 Dateien, ~911 LOC, 35+ Methoden über 3 Ebenen*
