# 📈 DB Statistiken — Cross-Snapshot Analysis

> **Typ:** Statistische Durchschnittswerte über alle DB-Snapshots
> **Erstellt:** 2026-06-18 | **Letzte Aktualisierung:** 2026-06-19 (Snapshot 19: Post-FREEZE-Audit + Tier-1-Fix, 6.658 Entries, Ø Score 80.7)
> **Snapshots analysiert:** 15 unique (Duplikate bereinigt, Snapshot 13+14+16 als identisch behandelt)
> **⚠️ Hinweis Snapshot 17:** Der `kein Run seit Snap 15`-Claim aus Snapshot 16 wurde durch die Live-Query widerlegt (+163 Einträge zwischen Doc-Update 16 und Live-Archive 17). Drifften Anomalie #013 in DB_TREND_REPORT.md.
> **⚠️ Korrektur 2026-06-19 (Anomalie #014 FALSIFIED):** `quality_score`-Spalte EXISTIERT in der Live-DB (`INTEGER NOT NULL DEFAULT 0`). Migration in `db.js:92` hat funktioniert. Live-Query: 6.658 Einträge, Ø 80.7, 55.5% Score 90+. Die PRAGMA-Query in Snapshot 17 war gegen eine leere/gefrorene DB-Connection gelaufen. `glossary_terms`-Tabelle existiert ebenfalls.
> **⚠️ Hinweis:** Snapshot 2+ (17.06) sind post-DB-Reset. Der Sprung von 3.373 → 936 macht den Durchschnitt weniger repräsentativ — Median ist zuverlässiger.

---

## 📊 Einzelwerte aller Snapshots (chronologisch)

### Translations Gesamt

| # | Timestamp | Quelle | Total | Stale | Stale% | Flagged | S0 | S2 | Glossary |
|---|-----------|--------|------:|------:|-------:|--------:|---:|---:|---------:|
| 1 | 2026-06-16 | translations_2026-06-16.db | **3.373** | 1.508 | 44.7% | 862 | 1.722 | 1.644 | 700 |
| 2 | 2026-06-17 20:16 | translations_2026-06-17_201609.db | **936** | 8 | 0.9% | 13 | 934 | 2 | 306 |
| 3 | 2026-06-17 | translations_2026-06-17_before_repair.db | **936** | 8 | 0.9% | 11 | 934 | 2 | 306 |
| 4 | 2026-06-17 | translations_2026-06-17_prepare-0.20.db | **2.119** | 1.007 | 47.5% | 16 | 863 | 1.220 | 353 |
| 5 | 2026-06-18 | translations_2026-06-18_before_plugin-architektur.db | **3.594** | 1.044 | 29.1% | 54 | 1.524 | 2.022 | 791 |
| 6 | 2026-06-18 17:52 | translations_2026-06-18_175216.db | **3.577** | 1.016 | 28.4% | 11 | 1.295 | 2.249 | 794 |
| 7 | 2026-06-18 19:28 | translations_2026-06-18_192806.db | **4.059** | 555 | 13.7% | 1.016 | 1.297 | 2.629 | 961 |
| 8 | 2026-06-18 19:34 | translations_2026-06-18_193414.db | **4.059** | 555 | 13.7% | 1.319 | 1.826 | 2.101 | 961 |
| 9 | 2026-06-18 20:22 | translations_2026-06-18_202258.db | **4.059** | 541 | 13.3% | 1.044 | 1.556 | 2.463 | 974 |
| 10 | 2026-06-18 22:46 | translations_2026-06-18_224600.db | **4.277** | 621 | 14.5% | 1.068 | 1.510 | 2.725 | 1.024 |
| 11 | 2026-06-18 23:04 🔥 | translations_2026-06-18_230454.db | **5.447** | 1.672 | 30.7% | 988 | 1.305 | 4.066 | 1.040 |
| 12 | 2026-06-18 23:14 | translations_2026-06-18_231437.db | **5.447** | 1.672 | 30.7% | 988 | 1.305 | 4.066 | 1.040 |
| 13 | 2026-06-19 | LIVE translations.db (Pre-Quickfix) | **6.131** | 2.122 | 34.6% | 1.729 | 2.038 | 3.972 | 1.151 |
| 14 | 2026-06-19 | LIVE translations.db (Post-Quickfix) | **6.131** | 2.122 | 34.6% | 1.729 | 2.038 | 3.972 | 1.151 |
| 15 | 2026-06-19 | LIVE translations.db (Snapshot-17 Doc-Update: identisch mit 14, ±0) | **6.131** | 2.122 | 34.6% | 1.729 | 2.038 | 3.972 | 1.151 |
| **17** | 2026-06-19 | LIVE translations.db (Pre-v0.20.0-pre-release Baseline) | 6.294 | 2.239 | 35.6% 🔴 | 1.725 | 2.069 | 4.153 | N/A* |
| **18** | 2026-06-19 | **Snapshot 18 (Pre-Live-Run)** | **6.540** | **2.240** | **34.3%** | **2.444** | **1.774** | **4.691** | **1.384** |
| **19** | 2026-06-19 | **Snapshot 19 (Post-FREEZE + Tier-1-Fix)** | **6.658** | **2.344** | **35.2%** | **2.152** | **981** | **5.592** | **1.395** |

> **Duplikate entfernt (6):** 175334, 194210, 231423, post-routing, post-routing-v2, pre-nvidia, 212202_preflight — alle identisch mit jeweiligem Original.
> **Snapshot 14 (=15=16):** Pre- und Post-Quickfix-Sprint sind *laut Doc* identisch (kein Run zwischen den Snapshots, nur Code-Änderungen). **Diese Annahme wurde durch den Live-Re-Query beim Snapshot-17-Archivieren widerlegt** — siehe 🔍 Anomalie #013 im DB_TREND_REPORT.md (+163 Einträge).
> **Snapshot 17:** Erste Baseline vor v0.20.0-pre-release Live-Run. Archiviert nach `core/archive/dbold/translations_2026-06-19_session_v0.20-pre.tar.gz` (4.087.347 Bytes). Glossary-Spalte N/A* = bei Snap 17 nicht abgefragt; `glossary_terms`-Tabelle existiert (Korrektur siehe Anomalie #014 FALSIFIED).

---

## 📊 Kernmetriken (Durchschnitt / Median / Min / Max)

### Translations Gesamt

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **3.809** (neu: mit Snap 17, +49 Ø vs Doc 3.760) |
| **Median** | **4.059** (unverändert — 17. Snap über Median) |
| Minimum | 936 (17.06) |
| Maximum | **6.658 (19.06 LIVE Snapshot 19)** |
| Standardabweichung | 1.516 (vorher 1.453) |
| Spannweite | **5.358** (vorher 5.195) |

**Trend:** ↑ Stetig steigend. Sprünge: 936→2.119 (V0.20), 4.277→5.447 (Routing-Spike), 5.447→6.131 (Run #51), **6.131→6.294 (Snap 16 → 17 Doc-/Live-Drift, Anomalie #013)**.

---

### Stage-Verteilung (Durchschnitt über 13 Snapshots)

| Stage | Ø Anteil | Ø Anzahl | Median |
|-------|----------|----------|--------|
| Stage 0 (Draft) | **34.1%** | 1.282 | 1.305 |
| Stage 1 (Polished) | **1.3%** | 37 | 33 |
| Stage 2 (Verified) | **48.7%** | 2.224 | 2.249 |

**Beobachtung:** Polish-Rate extrem niedrig (1.3%). Die meisten Einträge gehen direkt von Draft → Verified (ohne Polishing).

---

### Flagged-Einträge

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **739** (vorher 749) |
| **Median** | **512** (unverändert) |
| Minimum | 11 (18.06 17:52) |
| Maximum | **2.444 (19.06 LIVE Snap 18)** — aktuell 2.152 (Snap 19, −292 ✅) |
| Standardabweichung | 510 (vorher 517) |

**Beobachtung:** Median (512) repräsentativer als Durchschnitt (749). PREFLIGHT-Artefakte ab Snapshot 7 (19:28) treiben den Wert hoch.

---

### Stale Translations (translation = source_text)

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **1.057** (vorher 1.040) |
| **Durchschnitts-Rate** | **23.4%** (vorher 23.2%) |
| **Median** | **1.016** (unverändert) |
| **Median-Rate** | **28.4%** (unverändert) |
| Minimum | 8 (17.06, nach Reset) |
| Maximum | **2.344 (19.06 LIVE Snapshot 19)** |
| Maximum-Rate | 47.5% (17.06 prepare-0.20) |
| Standardabweichung | 614 (vorher 603) |

**Root Cause Chain:**
1. Argos übersetzt keine Eigennamen → Fallback auf source_text
2. Placeholder-korrupte Einträge ({NAME}, {AGE}) → Argos kaputtiert sie → Rejected
3. Provider-Fallback-Kette erschöpft sich → alle Routes fehlgeschlagen
4. native_runtime speichert src=tgt als "Übersetzung"
5. Mods mit vielen Eigennamen (Vargen Race) → höherer Stale-Anteil

**Theoretisches Minimum:** ~20-25% (Eigennamen die kein Provider übersetzen kann)

**Spike-Ereignis:** Snapshot 11 (23:04): 621→1.672 (+1.051 in 18 Min) durch Routing-Hardening → native_runtime-Übernahme.

---

### Glossary Terms

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **814** (vorher 831; -Durch Wortkorr.) |
| **Median** | **794** (unverändert) |
| Minimum | 306 (17.06) |
| Maximum | 1.395 (19.06 LIVE Snap 19) — `glossary_terms` existiert (Namensverwechslung in Snap 17 korrigiert) |
| Wachstumsrate | +164% über alle Snapshots (n/a f. Snap 17) |

**Trend:** ↑ Stetig steigend. Glossar wächst mit jedem Run → Kontext-Akkumulation.

---

### Deep Polish Pending

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **96** (über 5 messbare Snapshots) |
| **Median** | **0** |
| Minimum | 0 (mehrere Snapshots) |
| Maximum | **529** (18.06 19:34) |
| Aktuell | **N/A** ⚠️ — `polish_level` in der Live-Query ist für alle 6.294 Einträge = 0 (Logik wurde zu `audit_stage` migriert, nicht zu `polish_level`). Doc-Wert 393 (Snap 16) ist nicht reproduzierbar über `polish_level`. |

**Beobachtung:** Deep Polish Queue oszilliert — wächst bei PREFLIGHT-Runs, schrumpft bei Polish-Runs. Aktuell 393 Pending = 🔴.

---

### Score 30-69 (Mangelhaft)

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **148** (über 5 messbare Snapshots) |
| Minimum | 0 (bis Snapshot 10) |
| Maximum | **1.217** (19.06 LIVE Snap 19, Score 30-69) — Korrektur: quality_score existiert, 18.3% der Einträge in diesem Bucket |

**Beobachtung:** Score 30-69 war bis 20:22 praktisch inexistent (0-24). Dann Explosion auf 730 in der LIVE-DB. Korreliert mit polish_single Explosion (2.7%→12.8%).

---

## 📊 Provider-Entwicklung (aus Snapshots mit Provider-Daten)

| Provider | Snap 1 (16.06) | Snap 4 (17.06) | Snap 11 (23:04) | LIVE-16 (19.06) | Snap 18 (19.06) | **Snap 19 (19.06)** |
|----------|----------------|----------------|-----------------|---------------------|---------------------|----------------------|
| native_runtime | 1.477 (43.8%) | 996 (47.0%) | **2.521 (46.3%)** | 2.272 (37.1%) | 2.727 (41.7%) | 2.729 (41.0%) |
| ab_polish | 76 (2.3%) | 224 (10.6%) | 1.394 (25.6%) | 1.370 (22.3%) | 1.370 (20.9%) | 1.370 (20.6%) |
| polish_single | 0 (0%) | 0 (0%) | 149 (2.7%) | **785 (12.8%)** | **1.355 (20.7%)** | **1.528 (22.9%)** 🔥 |
| google_free | 864 (25.6%) | 635 (30.0%) | 582 (10.7%) | 815 (13.3%) | 619 (9.5%) | 574 (8.6%) ✅ |
| argos | 194 (5.8%) | 31 (1.5%) | 560 (10.3%) | 649 (10.6%) | 382 (5.8%) | 366 (5.5%) ✅ |
| openrouter | 687 (20.4%) | 209 (9.9%) | 216 (4.0%) | 213 (3.5%) | 61 (0.9%) | 60 (0.9%) |
| groq | 75 (2.2%) | 24 (1.1%) | 24 (0.4%) | 24 (0.4%) | 24 (0.4%) | 24 (0.4%) |

---

## 📊 Mod-Erfolgsrate (aus Runs)

| Metrik | Wert |
|--------|------|
| Gesamt-Läufe analysiert | 27 |
| Erfolgreiche Läufe | ~20 (74%) |
| Fehlgeschlagene Läufe | ~7 (26%) |
| **Erfolgsrate** | **74%** |
| Häufigste Fehlerursache | Backup-ENOENT (3×), activePlugin (1×), SQLite (2×) |

---

## 🎯 KPIs für zukünftige Runs

| KPI | Ziel | Aktuell (LIVE-Snap 19) | Bewertung |
|-----|------|------------------------|-----------|
| Erfolgsrate | >90% | 74% (unverändert) | ⚠️ |
| Stale-Rate | <20% | **35.2%** (vs 34.3% Snap 18, +0.9 pp) | 🔴 (theoretisches Min: ~20%) |
| Flagged-Rate | <2% | **32.3%** (vs 37.4% Snap 18, −5.1 pp) | ⚠️ (sinkend ✅) |
| Verified-Rate (S2-Anteil) | >70% | **84.0%** (vs 71.7% Snap 18) | ✅ (massiv verbessert!) |
| Glossary-Wachstum | >500 Terms | **1.395** (glossary_terms existiert) | ✅ |
| Polish-Nutzung (S1-Anteil) | >10% | **1.3%** (85/6.658) | 🔴 |
| Deep Polish Pending | <50 | N/A (audit_stage-basiert) | ⚠️ |
| Score 30-69 | <5% | **18.3%** (1.217/6.658; Ø Score 80.7) | 🔴 |
| NVIDIA-Anteil | >20% | **0%** (kein nvidia in Snap 19) | 🔴 |
| native_runtime Stale-Rate | <40% | ~68% (2.729 total, Stale-Anteil hoch) | 🔴 |

---

## 📈 Zeitliche Entwicklung: Kernmetriken

```
Snapshot:        1      2      4      5      6      7      9     10     11     13(LIVE)  16(Quickfix) 17(Pre-V0.20) 18(Pre-Live) 19(Post-Freeze)
Datum:         16.06  17.06  17.06  18.06  18.06  18.06  18.06  18.06  18.06  19.06     19.06         19.06         19.06         19.06

Total:         3.373    936  2.119  3.594  3.577  4.059  4.059  4.277  5.447  6.131     6.131         6.294         6.540         6.658
Stale%:         44.7%  0.9%  47.5%  29.1%  28.4%  13.7%  13.3%  14.5%  30.7%  34.6%     34.6%         35.6%         34.3%         35.2%
Flagged:          862     13     16     54     11  1.016  1.044  1.068    988  1.729     1.729         1.725         2.444         2.152
Stage 0%:       51.1% 99.8%  40.7%  42.4%  36.2%  31.9%  38.3%  35.3%  24.0%  33.2%     33.2%         32.9%         27.1%         14.7%
Stage 2%:       48.7%  0.2%  57.6%  56.3%  62.2%  64.8%  60.7%  63.7%  74.6%  64.8%     64.8%         66.0%         71.7%         84.0%
Glossary:         700    306    353    791    794    961    974  1.024  1.040  1.151     1.151         N/A           1.384         1.395
```

### Stale-Rate Drift

| Zeitraum | Start → Ende | Δ | Richtung |
|----------|-------------|---|----------|
| 16.06 → 17.06 (Reset) | 44.7% → 0.9% | −43.8% | ↘️ Reset |
| 17.06 → 17.06 (V0.20) | 0.9% → 47.5% | +46.6% | ↗️ Argos-Spike |
| 17.06 → 18.06 17:52 | 47.5% → 28.4% | −19.1% | ↘️ Verbesserung |
| 18.06 17:52 → 19:28 | 28.4% → 13.7% | −14.7% | ↘️ Massive Verbesserung |
| 18.06 19:28 → 23:04 | 13.7% → 30.7% | +17.0% | ↗️ Routing-Spike |
| 18.06 23:04 → 19.06 (Snap 16) | 30.7% → 34.6% | +3.9% | ↗️ Leichte Verschlechterung |
| 19.06 Snap 16 → Snap 17 (Doc-/Live-Drift) | 34.6% → 35.6% | +1.0% | ↗️ Drift (Anomalie #013) |
| **19.06 Snap 17 → Snap 18** | **35.6% → 34.3%** | **-1.3%** | **↘️ Verbesserung** |
| **19.06 Snap 18 → Snap 19** | **34.3% → 35.2%** | **+0.9%** | **↗️ Leichter Anstieg** |

---

## 🔄 Wie dieses Dokument aktualisieren

1. **Nach jedem Snapshot-Vergleich:** Durchschnitt/Median neu berechnen
2. **Nach jedem Provider-Fix:** Provider-Verteilung aktualisieren
3. **Bei neuen Anomalien:** KPI-Tabelle aktualisieren
4. **Bei DB-Schema-Änderungen:** Neue Metriken hinzufügen
5. **Regel:** Erst die .db-Datei queryen, THEN das Dokument aktualisieren. Keine Zahlen aus Erinnerung.
6. **Snapshot 17 Spezialfall:** Vor v0.20.0-pre-release Live-Run als Referenz archiviert. SHA256 mit `sha256sum core/archive/dbold/translations_2026-06-19_session_v0.20-pre.tar.gz` in DB_TREND_REPORT.md Snapshot-17-Sektion ergänzen.
