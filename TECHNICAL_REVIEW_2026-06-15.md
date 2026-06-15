# 🔬 SYX BRIDGE — TECHNICAL REVIEW REPORT

**Datum:** 15.06.2026 | **Version:** v0.16.0 | **DB-Status:** 607 Übersetzungen (alle German) | **Ollama:** gemma4:31b-cloud

> **Doku-Vermerk:** Dieser Report dokumentiert den vollständigen technischen Stand der SyxBridge nach dem 0.16.0-Release. Er dient als Referenz für die nächste Entwicklungssession und listet alle identifizierten Bugs, Architekturprobleme, Quick Wins und UX-Verbesserungen priorisiert auf.

---

## ══════════════════════════════════════════
## KRITISCHE FUNKTIONSPRÜFUNG
## ══════════════════════════════════════════

### [PASS] Fortschrittsbalken

| Aspekt | Ergebnis |
|--------|----------|
| Prozentberechnung | Korrekt — `(filesScanned / totalFiles) * 100` |
| UI Refresh | requestAnimationFrame (~60fps im Run, ~4fps im Idle) |
| Reload-Sicherheit | SSE sendet initial `lastStats` beim Connect |
| X / Y + Prozent | Bereits implementiert: `{displayPercent}% ({current} / {totalFiles})` |
| Smoothing | 0.12 Interpolation verhindert Springen |

**Keine Issues.** Das Progress-System ist solide.

---

### [PARTIAL] GUI-Terminal Synchronisation

| Aspekt | Ergebnis |
|--------|----------|
| "Warte auf Daten..." | Nur initialer HTML-Platzhalter, wird mit `broadcastPayload()` überschrieben |
| Worker-Logs | `setupLogWatcher()` pollt `log.txt` alle 1s, buffered Partial-Lines |
| GUI ↔ Backend | `broadcastStats()` alle 500ms sendet kompletten `planner.stats` |

**Bewertung:** Synchronisation funktioniert. "Warte auf Daten..." ist nur Default-Text im HTML — kein Bug. UX könnte verbessert werden (stattdessen "Bereit" oder letzten Run-Zeitstempel).

---

## ══════════════════════════════════════════
## DEEP POLISH VALIDIERUNG
## ══════════════════════════════════════════

| Schritt | Status |
|---------|--------|
| Argos deaktivieren | N/A — Polish nutzt `POLISHER_PROVIDER` |
| Modellanbieter erkennen | PASS — `resolveProviderModel('polish')` |
| APIs testen | PASS — `checkCloudKey()` / `checkLocalProvider()` |
| Verfügbare Modelle laden | PASS — `fetchGeminiModels()`, etc. |
| Free-Tier Modelle erkennen | PASS — `isFreeModel()` |
| Modelle nach Qualität bewerten | PARTIAL — `rankModel()` existiert, aber keine echte Qualitätsbewertung |
| Source-Code analysieren | **FAIL** — nicht implementiert |
| Verbesserte Version erzeugen | **FAIL** — kein A/B-Vergleich |
| Alternativversion erzeugen | **FAIL** — kein dual-output Workflow |
| Mehrere LLMs zur Bewertung | PARTIAL — Route-Plan hat mehrere Provider, aber nicht parallel |
| Vergleich erstellen | **FAIL** — nicht implementiert |
| Beide Versionen speichern | **FAIL** — `ON CONFLICT DO UPDATE` überschreibt alte Versionen |
| Active Flag setzen | **FAIL** — kein `active_flag` in DB-Schema |
| Referenzversion speichern | **FAIL** — kein Revisionssystem |

**Bewertung:** Der aktuelle "Deep Polish" ist ein lineares Progressive-Refinement (Translate → Flag → Polish), kein A/B-Vergleich mit Multi-LLM-Bewertung.

**STATUS: PARTIAL | PRIORITÄT: P3 | AUFWAND: XL | RISIKO: MEDIUM**

---

## ══════════════════════════════════════════
## OPENROUTER FEHLERANALYSE
## ══════════════════════════════════════════

### JSON-Parsing-Pipeline (text-core.js)

```
RAW → stripJsonFence() → extractJsonPayload() → JSON.parse()
                                                    ↓ fehlschlag
                                              split(/\r?\n/) fallback
```

### Gemini vs OpenRouter: JSON-Enforcement

- **Gemini:** `responseMimeType: 'application/json'` + `responseSchema` (STRONG)
- **OpenRouter/Groq:** System Prompt "Output only JSON" (WEAK)

### Verbesserungs-Status

| Maßnahme | Status |
|----------|--------|
| JSON Arrays erzwingen | PARTIAL — nur Gemini enforced via Schema |
| Antwortvalidierung | Ja — `parseBatchResponse()` + `restoreAndValidateTranslation()` |
| Retry bei Formatfehlern | **NEIN** — kein Retry mit alternativem Prompt-Format |
| Fallback erst nach mehreren Versuchen | **NEIN** — sofortiger `split("\n")` Fallback |

**STATUS: PARTIAL | PRIORITÄT: P1 (Datenqualität) | AUFWAND: M | RISIKO: HIGH**

---

## ══════════════════════════════════════════
## OLLAMA ANALYSE
## ══════════════════════════════════════════

### "llama3 not found" — Fundstellen

| Datei | Zeile | Kontext |
|-------|-------|---------|
| `config-runtime.js:11` | `OLLAMA_FALLBACK_MODELS = ['llama3', 'llama2', 'mistral', 'gemma']` | Fallback-Liste |
| `scripts/reconstruct.js:132` | `AUDITOR_MODEL: 'llama3'` | Hartkodiert |

### Aktuelles Ollama-Modell: `gemma4:31b-cloud`

### Auto-Discovery funktioniert
`findBestModel('llama3', ['llama3','llama2','mistral','gemma'])` → fuzzy match `gemma4:31b-cloud` ✓

### Config-Konsistenz
- **Dispatcher (translate):** `PRIMARY_PROVIDER` / `PRIMARY_MODEL`
- **Dispatcher (audit):** `AUDITOR_PROVIDER || PRIMARY_PROVIDER` / `AUDITOR_MODEL || PRIMARY_MODEL`
- **Dispatcher (polish):** `POLISHER_PROVIDER || PRIMARY_PROVIDER` / `POLISHER_MODEL || PRIMARY_MODEL`

→ Default: Alle nutzen dieselbe Config ✅

**STATUS: PARTIAL | PRIORITÄT: P3 | AUFWAND: S | RISIKO: LOW**

---

## ══════════════════════════════════════════
## PROVIDER CAPABILITY SYSTEM
## ══════════════════════════════════════════

### **KEIN Capability-System vorhanden**

Es gibt keine `supportsTranslate`/`supportsAudit`/`supportsPolish` Felder. Provider werden rein nach Verfügbarkeit selektiert.

### Betroffene Route-Plans

| Stage | Provider im Plan | Kann das? |
|-------|-----------------|-----------|
| translate | google_free | ✅ |
| **audit** | google_free (via freeFallbacks) | ❌ Google Free kann nicht auditieren |
| **polish** | google_free (via freeFallbacks) | ❌ Google Free kann nicht polishen |

`freeFallbacks` im Router (Zeile 159-163) inkludiert `google_free` im audit- und polish-Route-Plan.

### Vorgeschlagene Capability-Matrix

```
google_free:  { translate: true,  audit: false, polish: false, compare: false, review: false }
argos:        { translate: true,  audit: false, polish: false, compare: false, review: false }
ollama:       { translate: true,  audit: true,  polish: true,  compare: true,  review: true  }
openrouter:   { translate: true,  audit: true,  polish: true,  compare: true,  review: true  }
groq:         { translate: true,  audit: true,  polish: true,  compare: true,  review: true  }
gemini:       { translate: true,  audit: true,  polish: true,  compare: true,  review: true  }
player2:      { translate: true,  audit: true,  polish: true,  compare: true,  review: true  }
```

**STATUS: FAIL | PRIORITÄT: P1 (Fehlerquelle) | AUFWAND: M | RISIKO: HIGH**

---

## ══════════════════════════════════════════
## RISK ROUTING
## ══════════════════════════════════════════

### Aktuelle Kategorien (`resolveTranslateRoute()`)

| Kategorie | Schwelle | Route | Stress-Test |
|-----------|----------|-------|-------------|
| UI-Strings | >80% UI-Strings | google_free / argos | Nein |
| Low-Risk | avgRisk < 1.5 | argos / google_free | Nein |
| Ambiguous | 1.5 ≤ avgRisk < 4.0 | Primary + Stress-Test | Ja |
| High-Risk | avgRisk ≥ 4.0 oder Long Text | Polish-Provider | Nein |
| Default | — | Primary Provider | Nein |

### Risk-Score-Berechnung (`scoreTranslationRisk()`)

| Faktor | Max Points |
|--------|-----------|
| Textlänge (20/45/100/180 chars) | 4 |
| Token/Placeholder-Count | 3 |
| Satzanzahl | 2 |
| Quotes/Smart-Quotes | 1 |
| Proper-Noun-Muster | 1 |
| String-Typ (NAME/DESC/LONG/GENERIC) | 3 |
| **Max** | **14** |

### Nicht implementierte Risiko-Kategorien
- Grammar Risk, Placeholder Risk (detailliert), Lore Risk, Consistency Risk, Style Risk

### Dynamic Risk (`scoreDynamicRisk()`)
**Definiert aber nirgends aufgerufen!** Würde DB-History mit statischen Scores blenden.

**STATUS: PARTIAL | PRIORITÄT: P2 | AUFWAND: L | RISIKO: MEDIUM**

---

## ══════════════════════════════════════════
## PLACEHOLDER SCHUTZ
## ══════════════════════════════════════════

### Erkennung (`shieldPlaceholders()`)
```
/<[^>]+>|__VAR\d+__|\{[^}]+\}|\$[A-Za-z0-9_]+|%[^%\s]+%/g
```

| Typ | Beispiel | Erkannt |
|-----|----------|---------|
| `{NAME}`, `{AGE}`, `{HE}`, `{HISC}` | `\{[^}]+\}` | ✅ |
| `{RELIGION}`, `{WORKPLACE}` | `\{[^}]+\}` | ✅ |
| `<c:FF0000>...</c>` | `<[^>]+>` | ✅ |
| `__VAR0__` | `__VAR\d+__` | ✅ |
| `$VAR`, `%VAR%` | `\$[A-Za-z0-9_]+`, `%[^%\s]+%` | ✅ |

### Wiederherstellung & Fallback
```
protectPlaceholders() → restorePlaceholders() → restoreAndValidateTranslation()
                                                   ↓
                                              valid? → Ja: Übersetzung
                                                   → Nein: Fallback auf Original
```

**STATUS: PASS** — Platzhalter-Schutz ist robust und vollständig. Red-Team-Tests vorhanden.

---

## ══════════════════════════════════════════
## REVISION SYSTEM
## ══════════════════════════════════════════

### Aktueller DB-Status
- `translations` Tabelle hat `PRIMARY KEY (source_text, target_lang)`
- `ON CONFLICT DO UPDATE` überschreibt alte Übersetzungen
- **Keine Revisions-Historie** — nur die letzte Version pro Text wird gespeichert

### Benötigt
- `translation_revisions` Tabelle mit `revision_id`, `is_active`, `is_reference`
- GUI: Revision Dropdown, Vergleichsansicht, Aktivieren/Wiederherstellen

**STATUS: FAIL | PRIORITÄT: P2 | AUFWAND: L | RISIKO: MEDIUM**

---

## ══════════════════════════════════════════
## DB SYSTEM (Read-Only während Runtime)
## ══════════════════════════════════════════

- **WAL Mode aktiv** → concurrent reads während writes ✅
- **Checkpoint:** WAL erfolgreich truncated (0 bytes)
- **DB Browser** nutzt dieselbe Connection → funktioniert in WAL mode
- **Empfehlung:** Zweite `OPEN_READONLY` Connection für `/api/db/search`

**STATUS: PASS | PRIORITÄT: P4 | AUFWAND: S | RISIKO: LOW**

---

## ══════════════════════════════════════════
## TERMINAL UX
## ══════════════════════════════════════════

### Vorhanden (GUI)
- Pipeline Visualizer (SCAN→LLM→QA→SAVE) ✅
- Progress Bar mit % + X/Y ✅
- Provider Stats ✅
- LLM Request/Response Viewer ✅
- Neon Progress Border ✅

### Fehlend (CLI)
- ASCII-Indikatoren (`[SCAN] ████████░░`)
- ETA, Durchsatz, Batch-Fortschritt, aktiver Provider/Modell

**STATUS: PARTIAL | PRIORITÄT: P3 | AUFWAND: M | RISIKO: LOW**

---

## ══════════════════════════════════════════
## VISUELLE ÜBERARBEITUNG
## ══════════════════════════════════════════

- **Colors:** Running=Amber (≠ Cyan), Warning/Info fehlen
- **Glassmorphism:** `backdrop-filter: blur(5px)` im Header — Checkliste sagt: Gradient Border + Shadow Layer statt Blur
- **Neo-Stripes:** Nicht implementiert

**STATUS: PARTIAL | PRIORITÄT: P4 | AUFWAND: M | RISIKO: LOW**

---

## ══════════════════════════════════════════
## ZUSAMMENFASSUNG
## ══════════════════════════════════════════

| # | Prüfpunkt | STATUS | PRIO | AUFWAND | RISIKO |
|---|-----------|--------|------|---------|--------|
| 1 | Fortschrittsbalken | PASS | — | — | — |
| 2 | GUI-Terminal Sync | PARTIAL | P3 | S | LOW |
| 3 | Deep Polish Validierung | PARTIAL | P3 | XL | MEDIUM |
| 4 | OpenRouter Fehleranalyse | PARTIAL | P1 | M | HIGH |
| 5 | Ollama Analyse | PARTIAL | P3 | S | LOW |
| 6 | Provider Capability | **FAIL** | P1 | M | HIGH |
| 7 | Risk Routing | PARTIAL | P2 | L | MEDIUM |
| 8 | Placeholder Schutz | PASS | — | — | — |
| 9 | Revision System | **FAIL** | P2 | L | MEDIUM |
| 10 | DB Read-Only | PASS | P4 | S | LOW |
| 11 | Terminal UX | PARTIAL | P3 | M | LOW |
| 12 | Visuelle Überarbeitung | PARTIAL | P4 | M | LOW |

---

## ══════════════════════════════════════════
## TOP 10 BUGS
## ══════════════════════════════════════════

| # | Bug | Schwere |
|---|-----|---------|
| 1 | Provider Capability fehlt — Google Free/Argos in audit/polish Route-Plans | 🔴 Critical |
| 2 | OpenRouter antwortet mit Markdown/Safety-Prefix — kein Retry mit alternativem Format | 🔴 Critical |
| 3 | Zombie Run #1 — sync-Run hängt in Status `running` | 🟠 High |
| 4 | Dynamic Risk Scoring ungenutzt — `scoreDynamicRisk()` definiert aber nie aufgerufen | 🟠 High |
| 5 | `reconstruct.js` verwendet hartkodiertes `AUDITOR_MODEL: 'llama3'` | 🟡 Medium |
| 6 | DB Browser schreibt während Runtime — `/api/db/update` kann `SQLITE_BUSY` verursachen | 🟡 Medium |
| 7 | `OLLAMA_FALLBACK_MODELS` listet `llama3` und `llama2` — aktuell nicht installiert | 🟡 Medium |
| 8 | Native Fallback speichert `all_routes_failed` für 219 Einträge — viele sind korrekte Proper Nouns | 🟡 Medium |
| 9 | Patch Mode dauerhaft deaktiviert — Code zwingt `NATIVE_MODE=true` bei jedem GUI-Load | 🟢 Low |
| 10 | GUI Footer zeigt v0.15.0a — sollte v0.16.0 sein | 🟢 Low |

---

## ══════════════════════════════════════════
## TOP 10 QUICK WINS
## ══════════════════════════════════════════

| # | Quick Win | Aufwand |
|---|-----------|---------|
| 1 | Provider Capability Matrix in `router.js` | 2h |
| 2 | OpenRouter Prompt-Retry bei Parse-Failure | 3h |
| 3 | Dynamic Risk in `enrichWithContext()` integrieren | 1h |
| 4 | `reconstruct.js`: `AUDITOR_MODEL` auf `auto` | 5min |
| 5 | DB Browser Read-Only Connection | 30min |
| 6 | `OLLAMA_FALLBACK_MODELS` aktualisieren | 5min |
| 7 | Zombie Run #1 clearen | 1min |
| 8 | GUI Footer Version fixen (v0.15.0a → v0.16.0) | 1min |
| 9 | WAL Checkpoint nach Runs automatisieren | 30min |
| 10 | `proper_noun` Fallback-Flag verbessern | 1h |

---

## ══════════════════════════════════════════
## TOP 10 UX VERBESSERUNGEN
## ══════════════════════════════════════════

| # | Verbesserung |
|---|-------------|
| 1 | CLI ASCII-Indikatoren (`[SCAN] ████████░░ 8/12 Mods`) |
| 2 | ETA-Anzeige basierend auf Durchsatz der letzten 30s |
| 3 | Terminal "Warte auf Daten..." durch letzten Run-Zeitstempel ersetzen |
| 4 | Glassmorphism ersetzen: Gradient Border + Shadow Layer |
| 5 | Neo-Stripes für aktive Panels |
| 6 | Warning/Info-Farben definieren (`--warning`, `--info`) |
| 7 | Revision Dropdown in GUI |
| 8 | Provider Capability Badges ("Kann: Übersetzen ✓, Auditieren ✗") |
| 9 | Batch-Fortschritt live ("Batch 3/12 (openrouter/free)") |
| 10 | Dark-Mode-Konsistenz (`bg-native` vs `bg-patch` kaum unterscheidbar) |

---

## ══════════════════════════════════════════
## TOP 10 ARCHITEKTURPROBLEME
## ══════════════════════════════════════════

| # | Problem | Impact |
|---|---------|--------|
| 1 | Kein Provider Capability System | Datenqualität |
| 2 | Keine Translations-Historie (ON CONFLICT DO UPDATE) | Datenverlust |
| 3 | Dynamic Risk nicht integriert | Suboptimales Routing |
| 4 | JSON-Parsing ohne Schema-Enforcement (OpenRouter/Groq) | Datenqualität |
| 5 | Kein A/B-Vergleich im Polish | Qualität |
| 6 | Stress-Test 0-mal ausgeführt (Feature ungenutzt) | Ungenutzt |
| 7 | `index.js` ist 963 Zeilen (Entry-Point + Business-Logik + GUI) | Wartbarkeit |
| 8 | Keine Cross-Text Konsistenz | Qualität |
| 9 | Hardkodierte Fallback-Modelle in Code statt Config | Flexibilität |
| 10 | Kein Monitoring/Health-Tracking über Runs hinweg | Operations |

---

## ══════════════════════════════════════════
## EMPFOHLENE NÄCHSTE SCHRITTE
## ══════════════════════════════════════════

1. **Sofort (P1):** Provider Capability Matrix + OpenRouter JSON-Retry (~5h)
2. **Diese Woche (P1-P2):** Dynamic Risk integrieren + Zombie-Run clearen (~2h)
3. **Nächste Woche (P2):** Revision System planen + `reconstruct.js` fixen (~1 Tag)
