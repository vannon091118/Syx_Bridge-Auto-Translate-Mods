# 📖 LIVE INDEX — SyxBridge Dokumentation

> **Stand:** 2026-07-02 | **Version:** v0.25.0-alpha | **MAX-EFFORT-Priorisierung**
> **Status:** 7 LIVE + 12 FREEZE + 10 PLAN + 7 Root + 8 INDEX
> **Regel:** Nur Pflicht-Dokus bleiben. Veraltete Referenz-Docs → FREEZE.
> **Letzter Doku-Audit:** 2026-07-02 — Live→FREEZE Transfer, Architektur-Verifikation.

## LIVE-Dokumente (7)

| # | Dokument | Zweck | Typ |
|---|----------|-------|-----|
| 1 | `CHANGELOG.md` | Versionshistorie — Commits, Fixes, Features | Pflicht (persistent) |
| 2 | `MASTER_DOC.md` | SSOT: aktueller Stand, Architektur, Roadmap | Pflicht |
| 3 | `KNOWN_BUGS_REPORT.md` | Bug-Triage — 4 aktive + 29 behobene Bugs | Pflicht |
| 4 | `LIVE_INDEX.md` | ← DIESES DOKUMENT | Pflicht |
| 5 | `PLOT_LORE.md` | Commit-Lore Narrativ-Layer (PFADEXIST — Scripts referenzieren hardcoded) | Pflicht |
| 6 | `preflight_history.log` | PREFLIGHT-Verlauf (auto-gen) | Auto-gen |
| 7 | `PREFLIGHT_LATEST.md` | Aktueller PREFLIGHT-Report (auto-gen) | Auto-gen |

> **Hinweis:** AGENTS.md ist Root-Pflicht-Dokument (SSOT). core/archive/docs/AGENTS.md ist
> eine Root-Sync-Kopie — bei Widerspruch gewinnt Root (AGENTS.md TEIL 11 Regel 4).
> SYSTEM_ARCHITECTURE.md, SOS_FORMAT_SPEC.md, RUNTIME_SCORE_HISTORY.md → FREEZE (2026-07-02).
> frozen_*.js (5 Dateien) → gelöscht (redundante historische Snapshots).
> GUI_REWORK.md + 2 DONE-Pläne → FREEZE (Task erledigt).

## FREEZE-Dokumente (12)

> **33 Doku-Konsolidierungs-Durchläufe + Live→FREEZE Transfer abgeschlossen.**
> **246 Buch-Einträge** (142 FREEZE_INDEX + 104 FREEZE_INDEX_2 §1–§32).
> **146 Dokumente archiviert/gelöscht.** (124 vorher + 8 novo 2026-07-02)

| # | Dokument | Rolle |
|---|----------|------|
| 1 | `FREEZE_INDEX.md` | **Das Buch** (archiviert) — 142 Einträge (16.06.–20.06.2026) |
| 2 | `FREEZE_INDEX_2.md` | **Das Buch** (aktiv) — 104 Einträge (§1–§32) |
| 3 | `README.md` | Erklärung des FREEZE-Ordners |
| 4 | `PRODUCT_PROTECTION_DOCUMENTATION.md` | Produktschutz-Implementierung (4-Schichten-System) |
| 5 | `HANDSHAKE_2026-06-26.md` | Session-Handshake Doku-Divergenz-Audit |
| 6 | `PLAN_MASTER_2026-06-20.md` | Archivierter Master-Plan (durch PLAN.md ersetzt) |
| 7 | `GUI_REWORK.md` | ✅ ERLEDIGT — GUI Polish & Debug (2026-07-02 archiviert) |
| 8 | `PLAN_COMMIT_LAYER_RNG.md` | ✅ DONE — Commit-Layer RNG (2026-07-02 archiviert) |
| 9 | `PLAN_GLOBAL_SCORE.md` | ✅ DONE — Global Score (2026-07-02 archiviert) |
| 10 | `SYSTEM_ARCHITECTURE.md` | Architektur-Referenz (2026-07-02 archiviert) |
| 11 | `SOS_FORMAT_SPEC.md` | SoS Format-Spec normativ (2026-07-02 archiviert) |
| 12 | `RUNTIME_SCORE_HISTORY.md` | Runtime-Score Tracking (2026-07-02 archiviert) |

## Plan-Dokumente (1 AKTIV + 9 Backlog)

> **MAX-EFFORT (2026-07-02):** Nur RimWorld aktiv. REST als Backlog in plans/.
> DONE-Pläne → FREEZE (PLAN_COMMIT_LAYER_RNG, PLAN_GLOBAL_SCORE).

| # | Dokument | Status |
|---|----------|--------|
| 1 | `plans/PLAN_RIMWORLD.md` | 🟡 AKTIV (0/19) |
| 2 | `plans/PLAN_STABILISIERUNG.md` | 🔵 BACKLOG (5/9 done) |
| 3 | `plans/PLAN_FEATURE_GAPS.md` | 🔵 BACKLOG (FG-1 ✅) |
| 4 | `plans/PLAN_BUG_TRIAGE.md` | 🔵 BACKLOG (BT-1/2 ✅) |
| 5 | `plans/PLAN_BYPASS_REMOVAL.md` | 🔵 BACKLOG |
| 6 | `plans/PLAN_DEAD_FLAGS.md` | 🔵 BACKLOG |
| 7 | `plans/PLAN_LATENT_RISKS.md` | 🔵 BACKLOG |
| 8 | `plans/PLAN_PLAN_AUDIT.md` | 🔵 BACKLOG |
| 9 | `plans/PLAN_PRIORISIERUNG.md` | 🔵 BACKLOG |
| 10 | `plans/PLAN_RUNTIME_PROBABILITY.md` | 🔵 BACKLOG |

## Root-Dokumente (7)

| # | Dokument | Zweck | Typ |
|---|----------|-------|-----|
| 1 | `AGENTS.md` | Agenten-Regelwerk (SSOT) | Pflicht |
| 2 | `core/archive/docs/CHANGELOG.md` | Aktuelle Versionshistorie ab v0.22.0 | Pflicht (persistent) |
| 3 | `README.md` | Projektreadme (User-facing) | Pflicht |
| 4 | `CHANGELOG.md` | Root-CHANGELOG (SSOT-Kopie — ab 2026-07-02) | Pflicht |
| 5 | `PLAN.md` | Master-Plan v0.25.0-alpha (P4 offen, P5 RimWorld geplant) | Pflicht |
| 6 | `TUTORIAL.txt` | Peer-Review-Tutorial (EN) | Pflicht |
| 7 | `_Info.txt` | Mod-Metadaten (Laufzeit) | Pflicht |

## INDEX-Dokumente (8)

| # | Dokument | Zweck |
|---|----------|-------|
| 1 | `core/GUI/INDEX.md` | GUI-Schicht (server.js, public/) |
| 2 | `core/Translation/INDEX.md` | Translation-Schicht (Pipeline, Provider, Config) |
| 3 | `core/Translation/providers/INDEX.md` | Provider-Schicht (9 Provider im REGISTRY) |
| 4 | `core/DB/INDEX.md` | DB-Schicht (db.js, DAOs) |
| 5 | `core/scripts/INDEX.md` | Scripts (check_syntax, release, sync-version etc.) |
| 6 | `core/tests/INDEX.md` | Tests — plugin-boundary, e2e_bug1, **e2e_multi_language (ML-7, NEU)** |
| 7 | `core/TREE.md` | Projektstruktur-Übersicht v0.25.0-alpha |
| 8 | `core/commit-layer/INDEX.md` | Commit-Layer (author_system, character_sheets, writing_rules) |

## Projekt-Assets

| # | Verzeichnis | Zweck |
|---|-----------|-------|
| 1 | `V70/` | Mod-Version 70 Assets (README.md + .gitkeep) |
| 2 | `V71/` | Mod-Version 71 Assets (README.md + .gitkeep) |

## Grammar-Context-Dateien (14 NEU — 2026-07-02)

> Sprachspezifische Grammatik-Hints für LLM-Prompts. Abdeckung: alle 14 unterstützten Sprachen.

| # | Datei | Sprache |
|---|-------|--------|
| 1–14 | `core/grammar_context_*.txt` | German, English, French, Spanish, Polish, Russian, Chinese, Japanese, Korean, Ukrainian, Turkish, Dutch, Swedish, Italian, Portuguese |

## DB-Archiv (nach Bereinigung)

| # | Dokument | Zweck |
|---|----------|-------|
| 1 | `core/archive/dbold/DB_TREND_REPORT.md` | Kumulierter DB-Trend aller Snapshots |

> **8 DB-Snapshots entfernt** — Daten in DB_TREND_REPORT.md konsolidiert.

## Abdeckung

| Thema | Abgedeckt in | Lücken |
|-------|-------------|--------|
| Versionshistorie | CHANGELOG.md + CHANGELOG_1.md | — |
| Architektur & Pipeline | MASTER_DOC §2, §4 | — |
| Offene Bugs (4) | KNOWN_BUGS_REPORT.md + MASTER_DOC §3 | — |
| DB-Zustand | MASTER_DOC §5 + PREFLIGHT_LATEST.md + DB_TREND_REPORT | — |
| Roadmap & Planung | PLAN.md (Root) + 10 Einzelpläne | — |
| Agent-Regeln | AGENTS.md (Root, SSOT) | — |
| Session-Lifecycle | AGENTS.md (§ SESSION + § WORKFLOW-AUTOMATION) | — |
| Archivierte Historie | FREEZE_INDEX.md + FREEZE_INDEX_2.md (246 Einträge) | — |
| Lore-System | PLOT_LORE.md + commit_lore/ | — |
| Runtime-Score | FREEZE/RUNTIME_SCORE_HISTORY.md + core/data/current_score.json | — |
| Master-Plan (konsolidiert) | Root: `PLAN.md` (22 Tasks, P0-P4) | — |

## Archivierungshistorie

- **146 Dokumente archiviert/gelöscht** — alle Inhalte im FREEZE_INDEX rekonstruierbar
- **Live→FREEZE (2026-07-02):** 8 Dateien (SYSTEM_ARCHITECTURE, SOS_FORMAT_SPEC, RUNTIME_SCORE_HISTORY, GUI_REWORK, 2 DONE-Pläne, 5 frozen_*.js gelöscht)
- **Global-Clean (2026-07-02):** 19 redundante Dateien gelöscht (16 FREEZE/ + 2 OLD_DOCS + 1 FREEZE_INDEX.md)
- **Durchlauf 7 (2026-06-23):** Doku-Audit — 10 Dokumente gefreezed + 12 entfernt + 4 Ausgabedokumente erstellt
- **Durchlauf 6:** Root-Cleanup + PLAN.md-Konsolidierung — 3 Dokumente → Root PLAN.md + 8 Audit-Docs archiviert
- **Durchlauf 5:** MASTER_DOC §3/§6 — 5 Einträge → FREEZE_INDEX_2 §29–§30
- **Durchlauf 1–4:** 76 temporäre Dokumente → FREEZE_INDEX §1–§33

## Entfernt im Live→FREEZE Transfer (2026-07-02)

| Datei | Grund |
|-------|-------|
| SYSTEM_ARCHITECTURE.md | Architektur-Referenz — veraltet, nicht aktiv |
| SOS_FORMAT_SPEC.md | Format-Spec — normativ aber statisch |
| RUNTIME_SCORE_HISTORY.md | Nur 1 Eintrag (2026-06-21), veraltet |
| GUI_REWORK.md | ✅ ERLEDIGT — alle Bugs gefixt |
| frozen_*.js (5 Dateien) | Historische Code-Snapshots — redundant |
| PLAN_COMMIT_LAYER_RNG.md | ✅ DONE — nach FREEZE verschoben |
| PLAN_GLOBAL_SCORE.md | ✅ DONE — nach FREEZE verschoben |

> **Nicht verschoben:** PLOT_LORE.md (Scripts referenzieren hardcoded `core/archive/docs/PLOT_LORE.md`).

## Entfernt im Durchlauf 7 (2026-06-23)

| Datei | Grund |
|-------|-------|
| DB_BACKUP_ANALYSIS_2026-06-19.md | In DB_TREND_REPORT konsolidiert |
| DB_INTEGRITY_AUDIT_2026-06-19.md | In PREFLIGHT überführt |
| DB_POSTRUN_ANALYSIS_2026-06-19.md | In KNOWN_BUGS/CHANGELOG dokumentiert |
| DB_SNAPSHOT_18_2026-06-19.md | In DB_TREND_REPORT §18 |
| DB_SNAPSHOT_2026-06-18.md | In DB_TREND_REPORT §16 |
| DB_SNAPSHOT_2026-06-18_post-chain-hardening.md | In DB_TREND_REPORT §14 |
| DB_SNAPSHOT_2026-06-18_post-routing-v2.md | In DB_TREND_REPORT §15 |
| DB_SNAPSHOT_2026-06-18_post-routing.md | In DB_TREND_REPORT §13 |
| COMMIT_MSG_2026-06-18.txt | Im Git-Log vorhanden |
| FREEZE_INDEX_v0.20.0_archived.md | Redundant zu MASTER_FREEZE |
| log_1.txt, log_2.txt | Laufzeit-Logs, keine Doku-Funktion |

---

*LIVE INDEX aktualisiert 2026-07-02 — Global-Clean: 19 redundante MD-Dateien gelöscht, Referenzen aktualisiert.*
