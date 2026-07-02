# 🔭 VISION — SyxBridge v0.25.0-alpha+

> **Stand:** 2026-06-25 | **Autor:** Buffy (Orchestrator) + Sub-Agents
> **Basis:** KNOWN_BUGS_REPORT.md, PLAN.md, 12 Sub-Pläne, Code-Review, Falsifikations-Check
> **Prinzip:** Jeder Fix wird nach WIRKUNG × AUFWAND bewertet, nicht nach Dringlichkeit allein.

---

## 📊 Aktueller Stand

| Metrik | Wert |
|--------|------|
| Provider | 8 (Player2 entfernt, Ollama Cloud hinzu) |
| Plugin-Schicht | 3 Ebenen (Adapter → GamePlugin → SoS/RimWorld) |
| Tests | 84 Contract + 35 E2E = 119 Checks, alle PASS |
| Syntax | 87 Dateien, 0 Fehler |
| DB | SQLite WAL, 0 kritische Issues |
| LOC-Max | 793 (gui-handlers.js), Ziel <900 ✅ |
| Bugs aktiv | 5 (2× P2, 3× P3) |
| Bugs archiviert | 27 behoben |

---

## 🎯 STRATEGISCHE ZIELE (nach Impact sortiert)

### ZIEL 1: RimWorld-Integration (~16h)
**Impact:** Zweites Spiel = doppelter Userkreis
**Risiko:** 🔴 Hoch (13 Adapter-Hooks, XML-Parser, neue Mod-Struktur)
**Status:** 0/19 Tasks, PLAN_RIMWORLD.md existiert

| Phase | Tasks | Aufwand | Priorität |
|-------|-------|---------|-----------|
| Adapter-Hooks | 13 | ~8h | P0 |
| Scanner/Parser | 3 | ~4h | P1 |
| Integration/Tests | 3 | ~4h | P2 |

**Effort-Bewertung:** Hoch, aber gut strukturiert. Die Plugin-Architektur macht es erweiterbar. Einfachste Hooks zuerst (RW-4, RW-9, RW-10 = ~30min), komplexeste zuletzt (RW-6 applyPatchModifications = ~2h).

---

### ZIEL 2: Bug-Fixes (5 aktiv, ~10h)
**Impact:** System-Stabilität, Daten-Integrität
**Risiko:** 🟡 Mittel

| Bug | Prio | Aufwand | Wirkung | Fix-Ansatz |
|-----|------|---------|---------|------------|
| BU-004 Race-Condition | 🟡 P2 | 2h | Daten-Integrität | File-Locking via `proper-lockfile` oder Advisory-Lock |
| BU-025 Vendor-Drift | 🟡 P2 | 3h | Release-Qualität | Bidirektionaler Sync in vendor-sync.js |
| BU-019 Mutable State | 🟡 P2 | 1h | Korrektheit | `consecutiveGrammarFailures` als Ref-Objekt (bereits teilweise in translation-phases.js) |
| BU-030 Nicht-modulare Scripts | 🟢 P3 | 2h | Wartbarkeit | `module.exports` für 17 Scripts |
| BU-026 Kein Test-Framework | 🟢 P3 | 2h | Qualität | Vitest oder Node.js Test Runner einführen |

**Effort-Bewertung:**
- BU-019 (1h, hohe Wirkung) — SOFORT machbar, bereits Ref-Pattern in translation-phases.js
- BU-004 (2h, kritisch) — `proper-lockfile` npm Paket, ~20 LOC Änderung
- BU-025 (3h, mittel) — Checksum-basierter Bidirektional-Sync
- BU-030+026 (4h, low-prio) — Kann inkrementell über Sprints laufen

---

### ZIEL 3: Ollama Cloud Toggle perfektionieren (~2h)
**Impact:** Remote-Ollama für Teams/Server
**Risiko:** 🟢 Niedrig

| Task | Aufwand | Status |
|------|---------|--------|
| resolveOllamaUrl() in index.js | 15min | ✅ DONE |
| GUI Toggle (HTML + app.js) | 30min | ✅ DONE |
| Validation: leere URL bei aktiviertem Cloud | 15min | 🟡 OFFEN |
| Toggle-Slider Styling (grün statt rot) | 10min | 🟡 OFFEN |
| persistConfig: resolved URL in .env schreiben | 15min | 🟡 OFFEN |
| End-to-End Test: Local→Cloud→Local Switch | 30min | 🟡 OFFEN |

**Effort-Bewertung:** Niedrig, schnell umsetzbar. Die Kern-Logik steht.

---

### ZIEL 4: Doku-Bereinigung (~3h)
**Impact:** Wartbarkeit, Onboarding
**Risiko:** 🟢 Niedrig

| Task | Aufwand | Status |
|------|---------|--------|
| AGENTS.md Sync (Root ↔ Archive) | 15min | ✅ DONE |
| PLAN.md Fortschritt updaten | 15min | 🟡 OFFEN |
| 3 ungetrackte Pläne archivieren/prüfen | 30min | 🟡 OFFEN |
| Folder-INDEX.md Dateien aktualisieren | 1h | 🟡 OFFEN |
| CHANGELOG.md Eintrag für Phase 1+2 | 15min | 🟡 OFFEN |
| PLAN_BUG_TRIAGE.md Status updaten | 15min | 🟡 OFFEN |

---

### ZIEL 5: GUI-Hardcode entfernen (~1h)
**Impact:** Multi-Game-Readiness
**Risiko:** 🟢 Niedrig

6 Songs-of-Syx-Referenzen in `gui/public/app.js` dynamisieren via `plugin.getPromptContext().gameName`. Einfach, aber wichtig für RimWorld.

---

## 📈 LANGFRISTIGE OPTIMIERUNGEN (VISION 2026 Q3-Q4)

### OPT-1: Async-DB-Worker (8h, 🔴)
Better-sqlite3 in Worker-Thread statt Sync-Block. Relevanz: Steam Deck, schwache HW.
**Falsifikation:** Würde den P_global für Use-Case 4 (Schwache HW) von 70-78% auf ≥85% heben.

### OPT-2: Argos-Warm-Server (4h, 🟡)
Argos-Translate als persistenter Python-Prozess statt Cold-Start pro Translate.
**Falsifikation:** Würde Use-Case 3+8 (no-keys, offline) von 55-65% auf ≥75% heben.

### OPT-3: 429-Cascade-Detection (1h, 🟢)
Proaktive Erkennung von Rate-Limit-Kaskaden in router.js.
**Falsifikation:** Würde NVIDIA-Provider-Ausfallzeit um ~60% reduzieren.

### OPT-4: Runtime-Log-Level (1h, 🟢)
Dynamisches LOG_LEVEL via Config statt Hardcoded.
**Falsifikation:** Debugging-Zeit für Produktionssinken um ~30%.

### OPT-5: GateCounter-Trends (2h, 🟢)
Automatische Eskalation bei steigender Shield-Leak-Rate.
**Falsifikation:** Früherkennung von Qualitätseinbrüchen vor User-Beschwerden.

---

## ⏱️ GESAMT-EFFORT-ÜBERSICHT

| Kategorie | Aufwand | Impact | Risiko | Empfehlung |
|-----------|---------|--------|--------|------------|
| Ollama Cloud Toggle (Rest) | ~2h | 🟡 | 🟢 | SOFORT |
| Bug-Fixes (P2) | ~6h | 🔴 | 🟡 | Nächster Sprint |
| Bug-Fixes (P3) | ~4h | 🟢 | 🟢 | Inkrementell |
| RimWorld Phase 1 | ~8h | 🔴 | 🔴 | Nach Bug-Fixes |
| RimWorld Phase 2+3 | ~8h | 🔴 | 🟡 | Nach Phase 1 |
| Doku-Bereinigung | ~3h | 🟡 | 🟢 | Parallel |
| GUI-Hardcode | ~1h | 🟡 | 🟢 | Parallel |
| Optimierungen (OPT-1-5) | ~16h | 🟡 | 🟡 | Q3/Q4 |
| **TOTAL** | **~48h** | | | |

---

## 🔍 FALSIFIZIERUNGS-KRITERIEN

Jede Optimierung muss diese Fragen beantworten:

1. **Messbar:** Kann ich den Effekt in Zahlen zeigen? (z.B. Response-Zeit, Error-Rate)
2. **Reproduzierbar:** Tritt der Effekt bei 3 aufeinanderfolgenden Runs auf?
3. **Isoliert:** Ist der Effekt auf MEINE Änderung zurückzuführen (nicht Konfounding)?
4. **Reversibel:** Kann ich die Änderung rückgängig machen und den alten Zustand reproduzieren?
5. **Negativ getestet:** Gibt es einen Fall wo die Änderung SCHLECHTER ist?

---

## 📋 COMMIT-PLAN (Phase 1+2)

**Änderungen (14 Dateien):**
- `core/src/router.js` — Player2 aus PROVIDER_REGISTRY entfernt (9→8 Provider)
- `core/src/config-keys.js` — PLAYER2_DEFAULT_URL → OLLAMA_CLOUD_URL
- `core/src/config-runtime.js` — fetchPlayer2Models entfernt, checkLocalProvider vereinfacht
- `core/src/config-persist.js` — Player2 Env-Vars → OLLAMA_CLOUD_*
- `core/index.js` — resolveOllamaUrl() hinzugefügt, Player2-Config ersetzt
- `core/src/providers/client-factory.js` — Player2 PROVIDER_CHAT_CONFIG entfernt
- `core/src/polish-arbiter.js` — Player2 aus Family-Arrays entfernt
- `core/src/gui/public/app.js` — Player2-Referenzen entfernt, Cloud-Toggle Read/Write
- `core/src/gui/public/index.html` — Player2-Option entfernt, Cloud-Toggle UI
- `tests/fulltest_run.js` — Player2-Config ersetzt
- `core/tests/translation-runtime-smoke.js` — Player2-Config ersetzt
- `core/tests/item0a_auto_freeze_test.js` — Player2-Config ersetzt
- `core/scripts/reconstruct.js` — Player2-Referenzen entfernt
- `core/scripts/test_providers.js` — Player2-Kommentar bereinigt

---

*VISION.md erstellt 2026-06-25 — Basierend auf Bug-Triage, Code-Review, Plan-Analyse.*
*Nächster Schritt: Ollama Cloud Rest-Fixes + Bug BU-019 (1h, höchster Effort/Bang).*
