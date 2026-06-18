# 📊 DB Trend Report — translations.db

> **Typ:** Persistentes, erweiterbares Dokument
> **Erstellt:** 2026-06-18 | **Letzte Aktualisierung:** 2026-06-19
> **Regel:** Nach jedem größeren Fix/Run aktualisieren. Neue Snapshots → neue Sektion unten anfügen.

---

## 📌 Baseline

**Ältester Snapshot:** `translations_2026-06-16.db` — 3.373 Translations, 857 flagged, 1.508 stale
Dies ist der Referenzstand für alle Regression-Analysen.

**⚠️ Hinweis:** Die Baseline war bereits fehlerhaft (857 flagged = 25.4%). Das war KEIN sauberer Startzustand. Die 17.06-Snapshots repräsentieren einen DB-Reset auf sauberen Stand.

---

## 📈 Zeitlicher Verlauf (chronologisch)

### Snapshot 1: 2026-06-16 — `translations_2026-06-16.db`

| Metrik | Wert |
|--------|------|
| Translations gesamt | 3.373 |
| Stage 0 (Draft) | 1.722 (51.1%) |
| Stage 1 (Polished) | 7 (0.2%) |
| Stage 2 (Verified) | 1.644 (48.7%) |
| Flagged | **857 (25.4%)** 🔴 |
| Stale (translation = source) | **1.508 (44.7%)** 🔴 |
| Glossary Terms | 700 |
| Revisions | 558 |

**Kontext:** Ältester Snapshot. Flags extrem hoch wegen aggressiver `translationLooksSafe()`.

**🔍 Anomalie #003: Flag-Massaker (857 flagged = 25.4%)**
- **Ursache:** `translationLooksSafe()` markierte UNBALANCED_QUOTES, TAG_MISMATCH, EXTREME_LENGTH als "unsafe"
- **Reproduzierbar:** Ja — Stand vor v0.19.8 Fix
- **Status:** ✅ Behoben (3-Tier System reduzierte Flags auf 45)

---

### Snapshot 2: 2026-06-17 20:16 — `translations_2026-06-17_201609.db`

| Metrik | Wert | Δ zum 1. Snapshot |
|--------|------|-------------------|
| Translations gesamt | **936** | **−2.437 (−72%)** |
| Stage 0 (Draft) | 934 (99.8%) | +212 |
| Stage 2 (Verified) | 2 (0.2%) | −1.642 |
| Flagged | 13 (1.4%) | −844 ✅ |
| Stale (translation = source) | 8 (0.9%) | −1.500 ✅ |
| Glossary Terms | 306 | −394 |
| Revisions | 936 | +378 |

**Kontext:** DB-Reset vor Session. Kleine DB mit frischen Einträgen. Stale-Rate minimal.

---

### Snapshot 3: 2026-06-17 (vor Repair) — `translations_2026-06-17_before_repair.db`

| Metrik | Wert | Δ zum 2. Snapshot |
|--------|------|-------------------|
| Translations gesamt | 936 | ±0 |
| Stage 0 (Draft) | 934 (99.8%) | ±0 |
| Stage 2 (Verified) | 2 (0.2%) | ±0 |
| Flagged | 11 (1.2%) | −2 |
| Stale (translation = source) | 8 (0.9%) | ±0 |
| Glossary Terms | 306 | ±0 |
| Revisions | 936 | ±0 |

**Kontext:** Keine Änderungen vor Repair. Nur leichte Flag-Reduktion.

---

### Snapshot 4: 2026-06-17 (prepare-0.20) — `translations_2026-06-17_prepare-0.20.db`

| Metrik | Wert | Δ zum 3. Snapshot |
|--------|------|-------------------|
| Translations gesamt | **2.119** | **+1.183 (+126%)** |
| Stage 0 (Draft) | 863 (40.7%) | −71 |
| Stage 1 (Polished) | 36 (1.7%) | +36 |
| Stage 2 (Verified) | **1.220 (57.6%)** | **+1.218** |
| Flagged | 16 (0.8%) | +5 |
| **Stale (translation = source)** | **1.007 (47.5%)** | **+999 🔴** |
| Glossary Terms | 353 | +47 |
| Revisions | **3.122** | **+2.186** |

**Kontext:** V0.20 Batch A+B+C. Riesiger Stale-Anstieg durch Argos-Fallback.

**🔍 Anomalie #001: Stale-Rate Explodiert (0.9% → 47.5%)**
- **Ursache:** Argos übersetzt keine Eigennamen → Fallback auf source_text
- **Betroffene Einträge:** Namen (Agnar, Alexander...) und Placeholder-Sätze
- **Reproduzierbar:** Ja — Argos-Limitation
- **Status:** ⚠️ Bekannt (systemisch)

---

### Snapshot 5: 2026-06-18 (vor Plugin-Architektur) — `translations_2026-06-18_before_plugin-architektur.db`

| Metrik | Wert | Δ zum 4. Snapshot |
|--------|------|-------------------|
| Translations gesamt | **3.594** | **+1.475 (+70%)** |
| Stage 0 (Draft) | 1.524 (42.4%) | +661 |
| Stage 1 (Polished) | 48 (1.3%) | +12 |
| Stage 2 (Verified) | 2.022 (56.3%) | +802 |
| Flagged | 54 (1.5%) | +38 |
| Stale (translation = source) | 1.044 (29.0%) | +37 |
| Glossary Terms | **791** | **+438** |
| Revisions | **11.306** | **+8.184** |

**Kontext:** Plugin-Architektur eingeführt. Glossar fast verdreifacht.

**🔍 Anomalie #002: Flag-Spike (16 → 54)**
- **Ursache:** Neue `assessTranslationWarnings()` Funktion
- **Status:** ✅ Behoben (v0.19.8 — 3-Tier Accept)

---

### Snapshot 6: 2026-06-18 (AKTUELL) — `translations.db`

| Metrik | Wert | Δ zum 5. Snapshot |
|--------|------|-------------------|
| Translations gesamt | 3.600 | +6 |
| Stage 0 (Draft) | 1.328 (36.9%) | −196 |
| Stage 1 (Polished) | 33 (0.9%) | −15 |
| Stage 2 (Verified) | **2.239 (62.2%)** | **+217** |
| **Flagged** | **45 (1.3%)** | **−9 ✅** |
| Stale (translation = source) | 1.049 (29.1%) | +5 |
| Glossary Terms | 792 | +1 |
| Revisions | 12.160 | +854 |

**Kontext:** Nach activePlugin-Fix. Flags drastisch reduziert (857→45 über Zeit).

### Snapshot 7: 2026-06-19 (nach Argos-Stale-Cleanup) — `translations.db`

| Metrik | Wert | Δ zum 6. Snapshot |
|--------|------|-------------------|
| Translations gesamt | **3.567** | **−33** |
| Stale (translation = source) | **1.016 (28.5%)** | **−33 ✅** |
| Flagged | 45 | ±0 |
| Glossary Terms | 792 | ±0 |
| Revisions | 11.762 | −398 |

**Kontext:** 33 argos `source_reused` stale Einträge gelöscht. 398 zugehörige Revisionen bereinigt.

**🔧 Cleanup: Argos Source-Reused Stale Entries**
- **Was:** 33 Einträge wo Argos den englischen Originaltext zurückgab statt zu übersetzen
- **Warum gelöscht:** Diese Einträge wurden vom Cache ausgeliefert obwohl `translation = source_text`. Beim nächsten Lauf werden sie neu übersetzt.
- **Herkunft der 33 Fehler (alle vom 17.06, Argos-Fallback-Lauf):**
  - 12 Einträge: Event-/Notification-Texte (Riot!, Raiders!, Rebellion!, Worker Strike!, etc.)
  - 8 Einträge: Diplomatie-Event-Texte mit {0}/{1}/{FACTION}-Platzhaltern
  - 5 Einträge: UI-Labels (Become Protector, Steal Resource, Assassinate Noble, etc.)
  - 4 Einträge: Stats-Descriptions (Stats: dexterity 1.2, social 1.1, etc.)
  - 4 Einträge: Sonstiges ({0} Raiders, {0} low, Brawls!, Busted!)
- **Root Cause:** Argos (lokales Argos-Modell) übersetzt keine englischen Sätze mit Platzhaltern → gab Originaltext zurück → `source_reused` Flag gesetzt

---

## 🔍 Anomalien-Register

| ID | Datum | Anomalie | Peak-Wert | Ursache | Status |
|----|-------|----------|-----------|---------|--------|
| #001 | 17.06 | Stale-Rate Explodiert | 47.5% (1.007) | Argos-Fallback für Namen/Placeholder | ⚠️ Bekannt (Argos-Limitation) |
| #002 | 18.06 | Flag-Spike | 54 (1.5%) | Neue Quality-Heuristics | ✅ Behoben (3-Tier) |
| #003 | 16.06 | Flag-Massaker | 857 (25.4%) | Aggressive translationLooksSafe() | ✅ Behoben (v0.19.8) |
| #004 | 18.06 | activePlugin-Crash | Run #24 failed | Init-Reihenfolge in index.js | ✅ Behoben (Modulebene) |
| #005 | 16-17.06 | Backup-ENOENT | 3 Runs fehlgeschlagen | Fehlende backups/-Verzeichnisse | ⚠️ Offen |
| #006 | 17.06 | SQLite Nested-TX | 2 Runs fehlgeschlagen | Transaction-in-Transaction Bug | ⚠️ Offen |
| #007 | 19.06 | HistoryValue-Noise in DB | 11 Einträge | SoS-Parser leaks structural chars | ✅ Behoben (shouldTranslate + extractStrings) |
| #008 | 19.06 | 33 Argos-Stale-Einträge | 33 Einträge (source_reused) | Argos gab Originaltext zurück | ✅ Bereinigt (DB-Cleanup) |

---

## 📊 Trend-Linien

```
Translations:    3.373 → 936 → 2.119 → 3.594 → 3.600 → 3.567
Verified:        1.644 →   2 → 1.220 → 2.022 → 2.239
Stale:           1.508 →   8 → 1.007 → 1.044 → 1.049 → 1.016
Flagged:           857 →  13 →    16 →    54 →    45
Glossary:          700 → 306 →   353 →   791 →   792
Revisions:         558 → 936 → 3.122 →11.306 →12.160
```

---

## 🔄 Wie dieses Dokument aktualisieren

1. **Nach jedem größeren Run:** Neue Sektion unten anfügen (Format wie oben)
2. **Nach jedem Fix:** Anomalie-Register aktualisieren (Status setzen)
3. **Bei DB-Archivierung:** Snapshot-Vergleichstabelle ergänzen
4. **Metriken die getrackt werden:**
   - translations Gesamt + Stage-Verteilung
   - flagged + stale + empty
   - glossary_terms Wachstum
   - revisions Wachstum (Proxy für Polish-Pipeline-Nutzung)
   - provider-Verteilung (wenn Spalte existiert)
   - risk_score-Verteilung (wenn Spalte existiert)
