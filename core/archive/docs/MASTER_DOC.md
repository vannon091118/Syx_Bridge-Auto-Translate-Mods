# SyxBridge – Master-Dokumentation (Destillat)

**Stand:** 02.07.2026 | **Version:** v0.25.0-alpha | **Autor:** Vannon & Sub-Agents
**Destilliert aus:** MASTER_DOC.md (Basis), FREEZE_INDEX_2.md, CHANGELOG.md, CHANGELOG_1.md
**Letzte Prüfung:** 2026-07-02 — GUI-Rebuild, i18n, ML-7 E2E, cli-progress Fix, grammar_context-Dateien.

---

## 1. Projektübersicht

**SyxBridge** ist eine KI-gestützte Übersetzungs-Engine für *Songs of Syx*-Mods. Automatisiert den gesamten Workflow: Text extrahieren → übersetzen → auditieren → polieren → ausliefern.

- **Sprache:** Node.js (v18+)
- **Dashboard:** Web-GUI auf `localhost:3000`
- **Status:** Rollout-Phase. v0.20.0 ist RELEASE-FÄHIG ("Built accidentally. Runs intentionally.") *(Quelle: HANDSHAKE)*
- **Plugin-Architektur:** v0.20 Phase 1 abgeschlossen (8/8 Hardcodes entkoppelt)
- **PREFLIGHT Analysis:** Automatischer DB-Health-Check vor jedem Sync (v0.20)
- **better-sqlite3:** sqlite3→better-sqlite3 migriert — synchron, Promise-Wrapper, try/catch mit Fehleranleitung für Fremdsysteme
- **translateHttpError:** HTTP-Statuscodes→Deutsch — menschenlesbare Fehler in Logs
- **Dev-Tools:** db_query.js, db_snapshot.js, export_stage2.js, test_providers.js
- **Dual-Path-Copy:** Native Mode kopiert übersetzte Dateien in BEIDE Verzeichnisse (Steam/AppData)
- **PATCH_MODE_ENABLED:** User-Opt-Out statt Hard-Coded Disabled (seit Commit `107f2a39`)
- **Stabilisierungs-Score:** 95% auf Fremdsystemen (nur Python/Argos + Ollama bleiben optional)
- **db_repair.js CLI:** Funktionstüchtig (sync-API nach better-sqlite3-Migration)

---

## 2. Architektur & Pipeline

```
Scan → Extract → Translate → Audit → Polish → Export
```

### Provider Matrix (9 im PROVIDER_REGISTRY — Stand 2026-07-02, verifiziert)

| Provider | Typ | Nutzung | CostClass |
|---|---|---|---|
| Groq | Cloud (Llama) | Primär-Provider | 4 |
| OpenRouter | Cloud (Multi) | Polish/Audit | 4 |
| OpenAI | Cloud (GPT) | Polish/Audit (neu v0.23) | 5 |
| Gemini | Cloud (Google) | Übersetzung | 5 |
| NVIDIA NIM | Cloud (NVIDIA) | Unlimitiert | 4 |
| Custom API | Cloud (Generic) | OpenAI-kompatibel (neu v0.23) | 3 |
| Ollama | Lokal (LLM) | Fallback/Offline | 1 |
| Argos Translate | Lokal (Offline) | UI-Strings | 10 |
| Google Free | Cloud | UI-Strings (abschaltbar) | 9 |

---

## 3. Status: Offene Punkte

> **Behobene Bugs:** Siehe CHANGELOG — [STUFE2-QUICKBUGFIXES] (BU-018/021/027/028/029/034), [0.20.0-wip] (BUG-FS-003), [0.19.05b] (BUG-FS-006), [BU-023] (F.B).
> **Erreichte Meilensteine:** Build-Linien, Sandbox-Cleanup, Core Engine, Plugin-Architektur, Quality-Offensive — alle in CHANGELOG [v0.20.0] dokumentiert.

### 🔴 Offene Bugs & Anomalien

| ID | Schwere | Beschreibung | Status |
|---|---|---|---|
| F.A | P2 | Vendor-Sync Drift (Live-Core vs Release) | 🟡 Drift-Detection existiert, bidirektionaler Sync fehlt — siehe CHANGELOG [VENDOR-DRIFT-FIX] |



---

## 4. Plugin-Architektur (v0.22 — 3 Ebenen)

### 4.1 Drei-Ebenen-Architektur

| Ebene | Datei | LOC | Methoden | Status |
|-------|-------|-----|----------|--------|
| 1 — Adapter | `adapters/GameAdapter.js` | ~150 | 16 | Abstraktes Base-Interface |
| 2 — Plugin | `plugins/GamePlugin.js` | ~165 | 12 | Format-Hooks mit Defaults |
| 3 — SoS | `plugins/SongsOfSyxPlugin.js` | ~377 | 35 | ✅ Voll integriert |
| 3 — RimWorld | `plugins/RimWorldPlugin.js` | ~221 | 28 (11 fertig) | 🟡 STUB — Format-Hooks fertig, Adapter fehlt |
| — | `plugin-registry.js` | ~30 | 1 Factory | ✅ `createPlugin(gameName)` |

**Ebene 1 — `GameAdapter`:** Plattform-Operationen (Launcher-Pfade, Mod-Scanning, Dateitypen).
**Ebene 2 — `GamePlugin extends GameAdapter`:** Format-Hooks (Serialisierung, Validierung, Prompts).
**Ebene 3 — Konkrete Plugins:** Spiel-spezifische Implementierung.

### 4.2 Plugin-Delegation (R-VAL + R-SHIELD)

Zwei kritische Methoden wurden von validator.js/text-core.js ins Plugin delegiert:
- **R-VAL (`validateFileSyntax`):** Format-spezifische Datei-Validierung. SoS zählt KEY:-Lines +
  Quote-Balance, RimWorld zählt XML-Tag-Balance.
- **R-SHIELD (`getPlaceholderRegex`):** Format-spezifische Regex für Platzhalter-Shielding.
  SoS: `<tags>` + `__VAR__` + `{N}`. RimWorld: `{N}` + `$VAR` + `%d` (KEINE XML-Tags —
  strukturelle Tags bleiben ungeshielded).

### 4.3 RimWorldPlugin — Status (v0.23)

- **11 Format-Hooks FERTIG:** Serialisierung (XML Entity-Escaping), Extraktion, Validierung
  (Tag-Balancing), Placeholder-Regex, Prompt-Context (Sci-fi/Survival), Path-Rules,
  File-Header (XML-Deklaration).
- **13 Adapter-Hooks STUB:** Werfen `"not yet implemented"`. Fehlend: Mod-Scanning,
  Launcher-Erkennung, _Info.txt-Äquivalent (About.xml).
- **v0.23 Scope:** ~16h geschätzt für vollständige RimWorld-Integration.

### 4.4 Neues Spiel hinzufügen

1. Neue Klasse `extends GamePlugin` — Format-Hooks implementieren
2. In `plugin-registry.js` registrieren
3. Adapter-Hooks implementieren (scanMod, getLauncherSettingsPath, ...)
4. Testen via `plugin-boundary-contract.js` (76+ dynamische Interface-Checks)

---

## 5. DB-Stand (2026-07-02 — Live)

> **Live-DB Stand 2026-07-02:** **4.065 Eintraege** — letzter PREFLIGHT: 17/21 PASS, 0 Shield-Leaks, 1.492 Flagged.
> **Provider:** 9 aktive Provider im PROVIDER_REGISTRY — siehe §2 Provider Matrix.
> **better-sqlite3 aktiv** — 12 Tabellen (user-Daten).
> Frühere DB-Resets: Snapshot 19 (1.508 → Reset), Doku-Clean (100 → Test), Fresh Reset (4.390 → 0).
> **Runtime Score:** 90.1% (gewichteter Durchschnitt über 8 Personas, Stand v0.22 — seit Reset nicht neu berechnet).
> **Tests (2026-07-02):** Syntax 104/104 ✅ | ESLint ✅ | Plugin-Boundary 86/86 ✅ | E2E Native Mode 35/35 ✅ | **ML-7 Multi-Lang 166/166 ✅**

---

## 6. Roadmap & Nächste Effort Scopes

> **Erledigte Items:** Siehe CHANGELOG + FREEZE_INDEX_2.md §15 (10 Items archiviert).
> Items: sqlite3→better-sqlite3, translateHttpError, 4 Dev-Scripts, Sinnhaftigkeitsanalyse, 2× Live-Runs, Watermark P0-1/P0-2/P0-3, polish_single no-change, db_repair CLI, Patch Mode Opt-Out.

| Prio | Aufgabe | Status/Aufwand |
|---|---|---|
| P1 | ~~DB-Sanitization: Watermarks aus alten Einträgen~~ | ✅ Erledigt (DB Fresh Reset 2026-06-24) |
| P2 | ~~DB-Cleanup `stale_retranslate`~~ | ✅ Erledigt (DB Fresh Reset 2026-06-24) |
| P2 | Bidirektionaler Vendor-Sync Phase 2 (F.A) | ~3-4h |
| P4 | S-012 Quick Wins + GUI-HARDCODE + SOS-RUNTIME | 🟡 OFFEN |
| P5 | RimWorld-Implementierung (PLAN_RIMWORLD, 19 Tasks) | 🟡 PLANUNG (~16h) |
| ML | Multi-Language Pipeline — `e2e_multi_language.js` in `npm run test` integrieren | 🟡 Schritt 1 DONE (ML-7 E2E 166/166) |


---

## 7. Agent-Referenz & Automation

*(Quelle: LLM-AGENTS-EntryPoint.md)*

**Verfügbare Agents:**
- `code-searcher` / `file-picker`: Ripgrep & Fuzzy-Suche
- `basher`: Terminal (Keine destruktiven Tasks ohne User-Erlaubnis!)
- `code-reviewer-mimo`: Zwingender PR-Reviewer für Changes >10 Zeilen
- `thinker-gpt`: Deep-Thinking mit Context, Architektur-Design
- `researcher-web` / `docs`: Externe Informationsrecherche

**Wichtige Workflows & Regeln:**
- **Regel 1 Overdrive:** "Ich werde Gemini nicht rein lassen." – Defensiver, langfristiger Code-Ansatz.
- **External Research Siege:** Bei unklaren Bugs 10-15 Sub-Agents massiv-parallel.
- **DB-Backup:** Vor und nach kritischen Fixes wird `translations.db` komprimiert archiviert.

---

## 8. Neue Dev-Tools (2026-06-20)

> **CHANGELOG:** [BETTER-SQLITE3-MIGRATION]

| Tool | Befehl | Zweck |
|------|--------|-------|
| db_query.js | `node scripts/db_query.js --report` | SQLite Metrik-Reports (full/live/providers) |
| db_snapshot.js | `node scripts/db_snapshot.js "label" --trend` | DB Snapshot + Trend-Report-Eintrag |
| export_stage2.js | `node scripts/export_stage2.js --dry-run` | Reiner Export (Stage-2→Dateien, null API) |
| test_providers.js | `node scripts/test_providers.js` | Provider Key Health-Check |

---

## 9. Dokumentationsstruktur (Final — Post Live→FREEZE Transfer 2026-07-02)

> **Stand:** 2026-07-02 — **7 LIVE + 12 FREEZE + 10 PLAN**
> **34 Doku-Konsolidierungs-Durchläufe + Global-Clean + Live→FREEZE abgeschlossen.**
> **246 Buch-Einträge** (142 FREEZE_INDEX archiviert + 104 FREEZE_INDEX_2 §1–§33).
> **131 Dokumente archiviert/gelöscht.** Alle Inhalte rekonstruierbar.
> **V70/V71:** Wiederhergestellt (README.md + .gitkeep, .gitignore: nur .txt in assets geblockt).
> **Archiv-Regeln:** `.ArchiveRules` im Projekt-Root.

```
core/archive/docs/
├── MASTER_DOC.md              # ← DIESER REPORT (SSOT: aktueller Stand)
├── CHANGELOG.md               # Versionshistorie (persistent — wird NIE gelöscht)
├── PREFLIGHT_LATEST.md        # Aktueller PREFLIGHT-Report (auto-gen)
├── KNOWN_BUGS_REPORT.md       # Bug-Triage (4 aktive + 29 behobene Bugs)
├── LIVE_INDEX.md              # Index aller Dokumente
├── PLOT_LORE.md               # RULE 2 Lore Layer (commit_lore — PFADEXIST)
├── AGENTS.md                  # Root-Sync-Kopie (SSOT = Root AGENTS.md)
├── preflight_history.log      # PREFLIGHT-Verlauf
├── FREEZE/                    # 12 Dateien
│   ├── FREEZE_INDEX.md        # Das Buch [ARCHIVIERT] — 142 Einträge
│   ├── FREEZE_INDEX_2.md      # Das Buch [AKTIV] — 104 Einträge (§1–§33)
│   ├── README.md              # Erklärung des FREEZE-Ordners
│   ├── PRODUCT_PROTECTION_DOCUMENTATION.md  # Produktschutz (4-Schichten)
│   ├── HANDSHAKE_2026-06-26.md # Session-Handshake Doku-Divergenz-Audit
│   ├── PLAN_MASTER_2026-06-20.md  # Archivierter Master-Plan
│   ├── PLAN_COMMIT_LAYER_RNG.md   # ✅ DONE — Commit-Layer RNG
│   ├── PLAN_GLOBAL_SCORE.md       # ✅ DONE — Global Score
│   ├── GUI_REWORK.md              # ✅ ERLEDIGT — GUI Polish & Debug
│   ├── SYSTEM_ARCHITECTURE.md     # Architektur-Referenz (archiviert)
│   ├── SOS_FORMAT_SPEC.md         # SoS Format-Spec (normativ, archiviert)
│   └── RUNTIME_SCORE_HISTORY.md   # Runtime-Score Tracking (archiviert)
├── plans/                     # 10 Dateien
│   ├── PLAN_RIMWORLD.md           # 🟡 AKTIV (0/19) — Phase 3
│   ├── PLAN_BUG_TRIAGE.md         # 🔵 BACKLOG (BT-1/2 ✅)
│   ├── PLAN_BYPASS_REMOVAL.md     # 🔵 BACKLOG
│   ├── PLAN_DEAD_FLAGS.md         # 🔵 BACKLOG
│   ├── PLAN_FEATURE_GAPS.md       # 🔵 BACKLOG (FG-1 ✅)
│   ├── PLAN_LATENT_RISKS.md       # 🔵 BACKLOG
│   ├── PLAN_PLAN_AUDIT.md         # 🔵 BACKLOG
│   ├── PLAN_PRIORISIERUNG.md      # 🔵 BACKLOG
│   ├── PLAN_RUNTIME_PROBABILITY.md # 🔵 BACKLOG
│   └── PLAN_STABILISIERUNG.md     # 🔵 BACKLOG (5/9 done)
└── OLD_DOCS/                  # 1 Datei (FREEZE_INDEX_v0.19-v0.20.md)
```

### Archivierungshistorie (131 Dokumente)

| Durchlauf | Quelle | Archiviert | Ziel |
|-----------|--------|-----------|------|
| 1 | MASTER_DOC.md | 11 Einträge | FREEZE_INDEX_2 §14–§15 |
| 2 | KNOWN_BUGS_REPORT | 27 Bugs | FREEZE_INDEX_2 §16 |
| 3 | 5 Analysis-Docs | 6 Einträge | FREEZE_INDEX_2 §17 |
| 4 | 8 HANDSHAKEs | 8 Einträge | FREEZE_INDEX_2 §18 |
| 5 | MASTER_DOC §3/§6 + 15 Orphan-Files | 5 Einträge + 15 gelöscht | FREEZE_INDEX_2 §29–§30 |
| Früher | 62+14 Doku-Clean | 142 Einträge | FREEZE_INDEX §1–§33 |
| **Global-Clean** | **16 FREEZE + 2 OLD_DOCS + 1 FREEZE_INDEX** | **19 Dateien gelöscht** | **Inhalt in Buch-Einträgen** |

> **Rekonstruierbarkeit:** Aus FREEZE_INDEX + FREEZE_INDEX_2 (246 Einträge) kann der gesamte
> Entwicklungsprozess (16.06. – 02.07.2026) lückenlos nachvollzogen werden.
