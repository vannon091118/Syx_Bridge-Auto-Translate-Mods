# 📈 DB Statistiken — Cross-Snapshot Analysis

> **Typ:** Statistische Durchschnittswerte über alle DB-Snapshots
> **Erstellt:** 2026-06-18 | **Letzte Aktualisierung:** 2026-06-19
> **Snapshots analysiert:** 7 (2026-06-16 bis 2026-06-19)
> **⚠️ Hinweis:** Snapshot 2+ (17.06) sind post-DB-Reset. Der Sprung von 3.373 → 936 macht den Durchschnitt weniger repräsentativ — Median ist zuverlässiger.

---

## 📊 Kernmetriken (Durchschnitt / Median / Min / Max)

### Translations Gesamt

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **2.660** |
| **Median** | 2.857 |
| Minimum | 936 (17.06) |
| Maximum | 3.567 (19.06 nach Cleanup) |
| Standardabweichung | 1.049 |

**Trend:** ↑ Stetig steigend. Sprung von 936 → 2.119 durch V0.20-Mehr-Mod-Unterstützung.

---

### Stage-Verteilung (Durchschnitt über 6 Snapshots)

| Stage | Ø Anteil | Ø Anzahl | Median |
|-------|----------|----------|--------|
| Stage 0 (Draft) | **39.3%** | 1.171 | 1.243 |
| Stage 1 (Polished) | **0.7%** | 15 | 5 |
| Stage 2 (Verified) | **37.5%** | 1.355 | 1.432 |

**Beobachtung:** Polish-Rate extrem niedrig (0.7%). Die meisten Einträge gehen direkt von Draft → Verified (ohne Polishing).

---

### Flagged-Einträge

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **159** |
| **Median** | **35** |
| Minimum | 11 (17.06 before_repair) |
| Maximum | **857 (16.06)** 🔴 |
| Standardabweichung | 344 |

**Beobachtung:** Der Median (35) ist repräsentativer als der Durchschnitt (159) wegen dem Ausreißer 857. Bei wechselndem Setup bleibt der Median stabil.

---

### Stale Translations (translation = source_text)

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **771** |
| **Durchschnitts-Rate** | **24.9%** |
| **Median** | **1.016** |
| **Median-Rate** | **28.5%** |
| Minimum | 8 (17.06) |
| Maximum | **1.508 (16.06)** 🔴 |
| Standardabweichung | 565 |

**Root Cause Chain:**
1. Argos übersetzt keine Eigennamen → Fallback auf source_text
2. Placeholder-korrupte Einträge ({NAME}, {AGE}) → Argos kaputtiert sie → Rejected
3. Provider-Fallback-Kette erschöpft sich → alle Routes fehlgeschlagen
4. Mods mit vielen Eigennamen (Vargen Race) → höherer Stale-Anteil

**Theoretisches Minimum:** ~20-25% (Eigennamen die kein Provider übersetzen kann)

---

### Glossary Terms

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **541** |
| **Median** | **527** |
| Minimum | 306 (17.06) |
| Maximum | 792 (18.06 aktuell) |
| Wachstumsrate | +158% über alle Snapshots |

**Trend:** ↑ Stetig steigend. Glossar wächst mit jedem Run → Kontext-Akkumulation.

---

### Translation Revisions

| Statistik | Wert |
|-----------|------|
| **Durchschnitt** | **4.863** |
| **Median** | **1.839** |
| Minimum | 558 (16.06) |
| Maximum | **11.762 (19.06 nach Cleanup)** |
| Wachstumsrate | +2.079% über alle Snapshots |

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

## 🔬 Provider-Dispatch-Verteilung (aus Logs)

| Provider | Anteil | Rolle |
|----------|--------|-------|
| Argos (Low-Risk) | ~60% | Schneller Fallback für Namen |
| OpenRouter Free | ~15% | UI-Strings, free tier |
| Google Free | ~10% | UI-Strings |
| Gemini (High-Risk) | ~8% | Versagt (kein API-Key) |
| NVIDIA | ~5% | Versagt (nicht initialisiert) |
| Ollama | ~2% | Offline-Fallback |

**⚠️ Kritisch:** Gemini und NVIDIA versagen in ~13% der Fälle wegen Config-Problemen.

---

## 🎯 KPIs für zukünftige Runs

| KPI | Ziel | Aktuell | Bewertung |
|-----|------|---------|-----------|
| Erfolgsrate | >90% | 74% | ⚠️ |
| Stale-Rate | <20% | 24.9% | 🔴 (theoretisches Min: ~20%) |
| Flagged-Rate | <2% | 1.3% (Median) | ✅ |
| Verified-Rate | >70% | 62.2% | ⚠️ |
| Glossary-Wachstum | >500 Terms | 792 | ✅ |
| Polish-Nutzung | >10% | 0.7% | 🔴 |

---

## 🔄 Wie dieses Dokument aktualisieren

1. **Nach jedem Snapshot-Vergleich:** Durchschnitt/Median neu berechnen
2. **Nach jedem Provider-Fix:** Provider-Verteilung aktualisieren
3. **Bei neuen Anomalien:** KPI-Tabelle aktualisieren
4. **Bei DB-Schema-Änderungen:** Neue Metriken hinzufügen
