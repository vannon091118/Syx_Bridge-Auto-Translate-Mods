# 📖 INDEX — core/Translation/adapters/ (1 Datei, 124 LOC)

> **Generiert:** 2026-06-19 | **Aktualisiert:** 2026-07-02 | **Version:** v0.25.0-alpha
> **Zweck:** Referenzbuch für die Adapter-Schicht (abstrakte Interface-Definition)
> **CL-Refs:** Kanonische Quelle ist `../INDEX.md`. Lokale CL-Refs sind Kurzform. Bei Konflikt gilt `../INDEX.md`.

---

## GameAdapter.js (124 LOC)
*Klasse: `GameAdapter` — Abstract Base Class für spiel-spezifische Adapter*

| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 11 | `class GameAdapter` | Abstract Base |
| 15 | `getMetadataFileName()` | throws 'Not implemented' |
| 22 | `parseMetadata(content)` | throws 'Not implemented' |
| 29 | `formatMetadata(infoObj)` | throws 'Not implemented' |
| 34 | `getCoreModFolderName()` | throws 'Not implemented' |
| 41 | `getCoreModMetadata(bridgeVersion)` | throws 'Not implemented' |
| 50 | `applyPatchModifications(infoObj, targetLanguage, patchNotice)` | throws 'Not implemented' |
| 58 | `getBackupDirectoryName(originalName)` | throws 'Not implemented' |
| 61 | `isBackupDirectory(dirName)` | throws 'Not implemented' |
| 64 | `isVersionDirectory(dirName)` | throws 'Not implemented' |
| 73 | `getOverrideHeader(versionDir)` | throws 'Not implemented' |
| 76 | `formatPatchNotice(targetLanguage)` | throws 'Not implemented' |
| 90 | `getParserFormat(filePath)` | throws 'Not implemented' |
| 100 | `classifyFile(relativePath)` | throws 'Not implemented' |
| 110 | `isTranslatableFile(relativePath, fileType)` | throws 'Not implemented' |
| 120 | `async scanMod(modDir)` | throws 'Not implemented' |

**Implementiert von:** `SongsOfSyxPlugin` (via `GamePlugin`), `RimWorldPlugin` (Stub)

---

*📖 Adapter-INDEX v0.25.0-alpha — 1 Datei, 124 LOC, 16 abstrakte Methoden*
