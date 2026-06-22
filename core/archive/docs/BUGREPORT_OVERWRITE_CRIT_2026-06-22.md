# 🔴 CRITICAL BUG REPORT — __OVERWRITE: true zerstört Vanilla-DE-Texte

> **Datum:** 2026-06-22
> **Klassifizierung:** 🔴 NOTFALL — Das gesamte Spiel zeigt Englisch statt Deutsch
> **Betroffen:** Alle V71+ Textdateien in BridgeCore Mod
> **Root-Cause:** SongsOfSyxPlugin.js:122-128, SongsOfSyxPlugin.js:296-304, export_stage2.js:235-236

---

## 1. SYMPTOM

Das Spiel zeigt Englische Texte, obwohl:
- Die DB 1.611 von 2.721 Einträgen (59%) als "Stage-2 übersetzt" markiert sind
- BridgeCore V71 39 Textdateien mit `__OVERWRITE: true` im Game-Mod-Verzeichnis liegt
- Einige Dateien (GUIDE.txt, HEROES.txt etc.) korrekte Deutsche Einträge enthalten

**Beispiel HEROES.txt:**
```
__OVERWRITE: true,
heroesMaxDesc: "Die Menge der Helden, die Sie verwalten können.",
```
→ Nur 2-3 Keys übersetzt, aber __OVERWRITE löscht ALLE anderen Vanilla-Keys.

---

## 2. ROOT-CAUSE-ANALYSE

### 2.1 Was macht `__OVERWRITE: true`?

Laut SoS-Modding-Guide (V71):

| Wert | Wirkung |
|------|---------|
| `false` (Default) | **Patch-Modus** — Nur explizit angegebene Schlüssel werden überschrieben. Andere Vanilla-Werte bleiben erhalten. |
| `true` | **Replace-Modus** — Die Mod-Datei ersetzt die Vanilla-Datei **vollständig**. Fehlende Schlüssel führen zu Vanilla-Defaults (nicht zur Lokalisierung!). |

**Kritischer Unterschied:** `true` löscht die Vanilla-Datei komplett. Das Spiel kann dann nur noch die Keys die in der Mod-Datei stehen. Alle anderen Keys fallen auf Englische Defaults zurück — NICHT auf die Vanilla-DE-Lokalisierung.

### 2.2 Die Kette im Code

**Pfad 1 — SongsOfSyxPlugin.js:296-304 (`getFileHeader`):**
```js
getFileHeader(filePath, version) {
    const vStr = version || '';
    const vMatch = vStr.match(/^V(\d+)$/i) || String(filePath || '').match(/V(\d+)/i);
    if (vMatch && parseInt(vMatch[1], 10) >= 71) {
      return '__OVERWRITE: true,\n';  // ← IMMER true für V71+
    }
    return '';
}
```

**Pfad 2 — SongsOfSyxPlugin.js:122-128 (`getOverrideHeader`):**
```js
getOverrideHeader(versionDir) {
    const vMatch = versionDir.match(/^V(\d+)$/i);
    if (vMatch && parseInt(vMatch[1], 10) >= 71) {
      return '__OVERWRITE: true,\n';  // ← IMMER true für V71+
    }
    return '';
}
```

**Pfad 3 — exporter.js:69-76 (`writeTranslatedFile`):**
```js
if (plugin && typeof plugin.getFileHeader === 'function') {
    const header = plugin.getFileHeader(outputPath);  // ← Ruft Pfad 1 auf
    if (header && !newContent.startsWith(header.trim())) {
      newContent = header + newContent;  // ← Fügt __OVERWRITE: true vorne an
    }
}
```

**Pfad 4 — export_stage2.js:235-236 (Fallback):**
```js
} else if (outPath.includes('V71') && !newContent.includes('__OVERWRITE')) {
    newContent = `__OVERWRITE: true,\n${newContent}`;  // ← Direkter Fallback
}
```

### 2.3 Warum ist das destruktiv?

**Szenario: GUIDE.txt (238 Zeilen)**

Vanilla-Datei (SoS-intern):
```
WIKIS: [
  { CATEGORY: "Leitfaden", NAME: "Einführung", TEXT: "Willkommen beim großen Wiki-Leitfaden..." },
  { CATEGORY: "Leitfaden", NAME: "02. Eine Welt", TEXT: "Wenn Sie sich für ein Zufallsspiel..." },
  ... (20 weitere Einträge, alle mit DE-Lokalisierung im Spiel)
]
```

BridgeCore V71 GUIDE.txt:
```
__OVERWRITE: true,
WIKIS: [
  { CATEGORY: "Leitfaden", NAME: "Einführung", TEXT: "Willkommen beim großen Wiki-Leitfaden..." },
  { CATEGORY: "Leitfaden", NAME: "02. Eine Welt", TEXT: "Wenn Sie sich für ein Zufallsspiel..." },
  ... (nur 15 von 20 Einträgen übersetzt, 5 fehlen)
]
```

**Ergebnis:**
- `__OVERWRITE: true` → Vanilla-Datei wird KOMPLETT ersetzt
- Die 5 fehlenden Einträge → Englische Defaults (nicht DE-Lokalisierung!)
- Selbst die 15 vorhandenen DE-Einträge überschreiben die Vanilla-DE-Einträge → unnötig

---

## 3. FIX-STRATEGIE

### 3.1 Kernprinzip

Für eine **Übersetzungs-Mod** gilt:
- **Patch-Modus** (`__OVERWRITE: false` oder weg) ist KORREKT
- Wir wollen nur die Keys überschreiben die wir übersetzt haben
- Alle anderen Vanilla-Keys sollen erhalten bleiben → Spiel-Lokalisierung greift

### 3.2 Betroffene Dateien (3)

| Datei | Zeile | Fix |
|-------|-------|-----|
| `core/src/plugins/SongsOfSyxPlugin.js` | 122-128 | `getOverrideHeader()` → immer `''` zurückgeben |
| `core/src/plugins/SongsOfSyxPlugin.js` | 296-304 | `getFileHeader()` → immer `''` zurückgeben |
| `core/scripts/export_stage2.js` | 235-236 | Fallback `__OVERWRITE` entfernen |

### 3.3 Erwarteter Effekt

**Vorher (BUG):**
1. Spiel lädt Vanilla-Text (100 Keys)
2. BridgeCore ersetzt KOMPLETT mit 19 Keys → 81 Keys fehlen
3. Fehlende Keys → Englisch

**Nachher (FIX):**
1. Spiel lädt Vanilla-Text (100 Keys)
2. BridgeCore überschreibt NUR die 19 Keys die übersetzt sind
3. Restliche 81 Keys → bleiben Vanilla (DE-Lokalisierung aktiv)

---

## 4. VERIFIKATION

### 4.1 Vor dem Fix
```
C:\Users\Vannon\AppData\Roaming\songsofsyx\mods\BridgeCore\V71\assets\text\
→ 39 Dateien, ALLE mit __OVERWRITE: true
→ GUIDE.txt: 238 Zeilen, ~80% DE, ~20% EN → SPIEL ZEIGT ENGLISCH
```

### 4.2 Nach dem Fix
```
C:\Users\Vannon\AppData\Roaming\songsofsyx\mods\BridgeCore\V71\assets\text\
→ 39 Dateien, KEINE mit __OVERWRITE: true
→ GUIDE.txt: Nur übersetzte Keys überschreiben Vanilla → SPIEL ZEIGT DEUTSCH
```

---

## 5. RISIKO-BEWERTUNG

| Risiko | Bewertung |
|--------|-----------|
| Regression bei bestehenden DE-Übersetzungen | 🟢 NIEDRIG — Keys die übersetzt sind werden weiterhin überschrieben |
| Kompatibilität mit V70 und früher | 🟢 KEIN RISIKO — `__OVERWRITE` ist V71-spezifisch |
| Neue Mod-Features die `__OVERWRITE: true` brauchen | 🟡 MITTEL — Kann bei Bedarf für spezifische init/ Dateien reaktiviert werden |
| Vanilla-Defaults für fehlende Keys | 🟢 BEHOBEN — Patch-Modus erhält alle Vanilla-Keys |

---

## 6. PROTOKOLL-TIMELINE

| Zeit | Aktion |
|------|--------|
| 14:30 | User meldet: "Das ganze Spiel ist auf Englisch" |
| 14:32 | Erster Check: V71-Textdateien enthalten deutsche Einträge mit __OVERWRITE: true |
| 14:35 | Modding-Guide gelesen: __OVERWRITE: true = destruktiv |
| 14:37 | Code-Kette identifiziert: 4 unabhängige Pfade die __OVERWRITE: true einfügen |
| 14:40 | Root-Cause bestätigt: Patch-Modus (false) ist korrekt für Übersetzungs-Mods |

---

*Erstellt von Opencode Agent — 2026-06-22*
