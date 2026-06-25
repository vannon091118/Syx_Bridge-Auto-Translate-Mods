# 📖 INDEX — core/src/plugins/ (3 Dateien)

> **Generiert:** 2026-06-23 | **Version:** v0.22.0
> **Zweck:** Referenzbuch für die Plugin-Schicht (GameAdapter → GamePlugin → SongsOfSyxPlugin / RimWorldPlugin)
> **CL-Refs:** Kanonische Quelle ist `../INDEX.md`. Lokale CL-Refs sind Kurzform. Bei Konflikt gilt `../INDEX.md`.

---

## GamePlugin.js
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

**CHANGELOG-Ref (3× GamePlugin):**
- [CL:0.19.9] Erstellt — Interface (getPromptContext, getGameTerms, getLoreTerms, getPathRules, serializeTranslation, validateTranslation)
- [CL:0.20.0-alpha.1] H2 PATH_RULES, H4 Lore-Terms, H8 Branding Interfaces hinzugefügt
- [CL:R-VAL-R-SHIELD] validateFileSyntax() + getPlaceholderRegex() für Plugin-Delegation

---

## SongsOfSyxPlugin.js
*Klasse: `SongsOfSyxPlugin extends GamePlugin` — Vollständige SoS-Implementierung*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 15 | `class SongsOfSyxPlugin extends GamePlugin` | SoS-Plugin |
| 19 | `getMetadataFileName()` | → `'_Info.txt'` |
| 23 | `parseMetadata(content)` | KEY:"value" Parsing |
| 39 | `formatMetadata(infoObj)` | _Info.txt generieren |
| 59 | `getCoreModFolderName()` | → `'BridgeCore'` |
| 63 | `getCoreModMetadata(sosMajorVersion)` | BridgeCore-Metadata |
| 80 | `applyPatchModifications(infoObj, targetLanguage)` | Patch-Name+DESC |
| 91 | `getBackupDirectoryName(originalName)` | → `.backup_NAME_ORIGINAL` |
| 95 | `isBackupDirectory(dirName)` | `.backup_` Check |
| 99 | `isVersionDirectory(dirName)` | `/^V\d+$/i` Check |
| 103 | `getOverrideHeader(versionDir)` | V71+ `__OVERWRITE` |
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

**Boundary-Tests:**
- `core/tests/plugin-boundary-smoke.js` — 100/100 PASS (23 Methoden, 9 Test-Sektionen)
- `core/tests/plugin-boundary-contract.js` — 73/73 PASS (Dynamische Interface-Erkennung, BU-023)

---

## RimWorldPlugin.js
*Klasse: `RimWorldPlugin extends GamePlugin` — RimWorld-Stub (format-spezifische Hooks implementiert, Adapter-Methoden werfen)*

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

**Status:** STUB — Format-Hooks implementiert, Adapter-Methoden (LauncherSettings, scanMod, etc.) werfen bis RimWorld-Integration vollständig.

---

*📖 Plugin-INDEX v0.22.0 — 3 Dateien, 35+ Methoden über 3 Ebenen*
