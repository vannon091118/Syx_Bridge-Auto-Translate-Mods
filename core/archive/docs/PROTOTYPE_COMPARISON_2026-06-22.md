# 🔬 Prototyp vs. Live-V Code — Logik-Vergleich

> **Datum:** 2026-06-22
> **Prototyp:** `C:\Users\Vannon\Desktop\Proggrming\Neuer Ordner\`
> **Live:** `C:\Users\Vannon\Desktop\SyxBridge_Live\core\`
> **Zweck:** Systematischer Vergleich der Architektur-Unterschiede

---

## 1. STRUKTUR-VERGLEICH

| Eigenschaft | Prototyp | Live |
|-------------|----------|------|
| **Dateien (src/)** | 18 Dateien | 27 Dateien (+9) |
| **Dateien (scripts/)** | 4 Dateien | 25 Dateien (+21) |
| **Dateien (tests/)** | 0 | 9 Dateien (+9) |
| **LOC (geschätzt)** | ~3.500 | ~11.800 (+8.300) |
| **Plugin-System** | ❌ Nein | ✅ Ja (GameAdapter → GamePlugin → SongsOfSyxPlugin) |
| **CLI-Library** | `inquirer` | `prompts` |
| **GUI** | ❌ Nur CLI | ✅ Web-Dashboard (server.js + app.js + index.html) |
| **Gate-Counter/Metrics** | ❌ | ✅ (gate-counter.js) |
| **Preflight** | ❌ | ✅ (preflight.js) |
| **Watermark-System** | ❌ | ✅ (watermark-config.js, ZWSP/ZWNJ) |
| **Context-Packets** | ✅ Basis | ✅ Erweitert |
| **Export-Script (offline)** | ❌ | ✅ (export_stage2.js) |
| **Release-Script** | ❌ | ✅ (release.js, sync-version.js) |
| **Commit-Lore-System** | ❌ | ✅ (plotchain, sidejokes, writing_rules) |

---

## 2. ARCHITEKTUR-UNTERSCHIEDE

### 2.1 Plugin-System (Live-only)

**Prototyp:** Kein Plugin. Alles hardcoded in index.js/exporter.js.

**Live:** Vollständige Plugin-Architektur:
```
GameAdapter (abstrakt)
  └─ GamePlugin (abstrakt)
       └─ SongsOfSyxPlugin (spezifisch)
```

**Methoden im Live-Plugin:**
- `getInfoHeader(sosMajorVersion)` — Mod-Metadaten
- `getOverrideHeader(versionDir)` — `__OVERWRITE: true` (DER BUG)
- `getFileHeader(filePath, version)` — Datei-Header
- `classifyFile(relativePath)` — Datei-Klassifizierung
- `getParserFormat(filePath)` — Format-Erkennung
- `isVersionDirectory(dirName)` — V71-Detection
- `getBackupDirectoryName(originalName)` — Backup-Pfade
- `isBackupDirectory(dirName)` — Backup-Erkennung
- `getTranslationMetadataPattern()` — Regex für LLM-Output
- `applyTranslations()` — Übersetzungs-Logik

### 2.2 Exporter (KRITISCHER UNTERSCHIED)

**Prototyp exporter.js (90 Zeilen):**
```js
async function writeTranslatedFile(fullPath, content, replacements, translations, outputPath) {
    let newContent = content;
    for (const r of replacements) {
        const translated = translations.get(r.value) || r.value;
        newContent = newContent.replaceAll(r.full, `${r.key}: "${escapeTextValue(translated)}"`);
    }
    await ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, newContent, 'utf-8');
}
```
- ✅ Kein `__OVERWRITE`
- ✅ Keine Syntax-Validierung
- ✅ Kein Marker-Check
- ✅ Kein Gate-Counter

**Live exporter.js (136 Zeilen):**
```js
async function writeTranslatedFile(fullPath, content, replacements, translations, outputPath, plugin) {
    let newContent = applyTranslations(content, replacements, translations, plugin);
    // Syntax-Validierung
    const syntaxResult = validateFileSyntax(content, newContent);
    // Marker-Validierung
    const markerResult = validateFileMarkers(content, newContent, shieldResults);
    // __OVERWRITE Header
    if (plugin && typeof plugin.getFileHeader === 'function') {
        const header = plugin.getFileHeader(outputPath);  // ← DER BUG
        if (header && !newContent.startsWith(header.trim())) {
            newContent = header + newContent;
        }
    }
    await fs.writeFile(outputPath, newContent, 'utf-8');
}
```
- ❌ `__OVERWRITE: true` wird hinzugefügt
- ✅ Syntax-Validierung
- ✅ Marker-Validierung
- ✅ Gate-Counter Integration

### 2.3 Runtime-Ops

**Prototyp runtime-ops.js (173 Zeilen):**
- Kein Backup-System
- Keine Version-Detection
- Einfache `writeTranslatedFile` Delegation

**Live runtime-ops.js (300+ Zeilen):**
- Backup-Creation mit File-Locking
- Version-Detection (V65-V71)
- `writeTranslatedFile` mit Plugin-Header
- Backup-Restore-Logik
- Mod-Info-Parsing

### 2.4 Translation-Runtime

**Prototyp translation-runtime.js (605 Zeilen):**
- Glossary-Integration (Lernsystem)
- Dispatcher mit Route-Optimierung
- Batch-Prompt-Building
- Grammar-Check Integration
- `ensureTranslations()` als Hauptfunktion

**Live translation-runtime.js (700+ Zeilen):**
- Erweiterte Glossary-Integration
- Provider-Rotation mit Metrics
- Kontext-Packets für bessere Übersetzungen
- AB-POLISH Pipeline
- QA-Audit Stufe

---

## 3. PIPELINE-VERGLEICH

### Prototyp Pipeline
```
1. Scanner → Mod-Dateien finden
2. Extractor → Strings extrahieren
3. Translator → LLM-Übersetzung
4. Exporter → Dateien schreiben (KEIN __OVERWRITE)
5. Bundler → BridgeCore zusammenbauen
```

### Live Pipeline
```
1. Scanner → Mod-Dateien finden (erweitert: classifyFile)
2. Extractor → Strings extrahieren (erweitert: context-packets)
3. Translator → LLM-Übersetzung (erweitert: AB-POLISH, QA-Audit)
4. Exporter → Dateien schreiben (__OVERWRITE: true ← DER BUG)
5. Bundler → BridgeCore zusammenbauen
6. Validator → Syntax + Marker Check
7. Gate-Counter → Metriken
```

---

## 4. KRITISCHE FEHLER IM LIVE

### 4.1 `__OVERWRITE: true` (Hauptfehler)
- **Prototyp:** Kein `__OVERWRITE` → Vanilla-Keys bleiben erhalten
- **Live:** `__OVERWRITE: true` für ALLE V71-Dateien → Vanilla wird ersetzt

### 4.2 Komplexitäts-Falle
Der Live-Code hat mehr Features (Plugin, Validator, Metrics), aber:
- Die Komplexität hat den `__OVERWRITE`-Bug versteckt
- Der Fallback in export_stage2.js dupliziert die fehlerhafte Logik
- Die Validierung läuft VOR dem Header → erkennt den Bug nicht

---

## 5. WAS DER PROTOTYP BESSER MACHT

| Aspekt | Prototyp | Live |
|--------|----------|------|
| `__OVERWRITE` | ✅ Keins (korrekt) | ❌ Immer true (falsch) |
| Einfachheit | ✅ 90 LOC exporter | ❌ 136 LOC + Validation |
| Transparenz | ✅ Direkte Replacements | ❌ Versteckt hinter Plugin-Layer |
| Backup | ❌ Keins | ✅ Mit Locking |
| Syntax-Check | ❌ Keiner | ✅ Aber verhindert Bug nicht |

---

## 6. EMPFEHLUNG

### Kurzfristig (Sofort):
1. `__OVERWRITE: true` aus Live-Code entfernen (3 Dateien)
2. V71-Dateien im Spiel ohne `__OVERWRITE` neu schreiben
3. Prototyp-Logik für `writeTranslatedFile` als Referenz nutzen

### Mittelfristig:
1. Plugin `getOverrideHeader()` nach Bedarf aktivieren (nur für init/ Dateien)
2. `classifyFile()` nutzen um zwischen text/ und init/ zu unterscheiden
3. Validierung erweitern um `__OVERWRITE`-Korrektheit zu prüfen

### Langfristig:
1. Exporter-Logik vereinfachen (Prototyp als Referenz)
2. Plugin-System beibehalten aber mit klaren Grenzen
3. Automatisierte Tests für `__OVERWRITE`-Verhalten

---

*Erstellt von Opencode Agent — 2026-06-22*
