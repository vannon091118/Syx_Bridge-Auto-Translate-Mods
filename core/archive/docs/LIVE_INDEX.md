# 📖 LIVE INDEX — SyxBridge Dokumentation

> **Stand:** 2026-07-02 | **Version:** v0.25.0-alpha | **MAX-EFFORT-Priorisierung**
> **Status:** 5 LIVE + 6 FREEZE + 3 AKTIVE Pläne + 7 Root + 8 INDEX + 1 GUI-Branch
> **Regel:** Nur Pflicht-Dokus bleiben. P9+P10 Pläne als Backlog.
> **Letzter Doku-Audit:** 2026-07-02 — GUI-Branch erstellt (gui-work), Kiro-Daten ausgeschlossen.

## LIVE-Dokumente (5)

| # | Dokument | Zweck | Typ |
|---|----------|-------|-----|
| 1 | `core/archive/docs/CHANGELOG.md` | Versionshistorie — Commits, Fixes, Features | Pflicht (persistent) |
| 2 | `MASTER_DOC.md` | SSOT: aktueller Stand, Architektur, Roadmap | Pflicht |
| 3 | `AGENTS.md` | SSOT: Agent-Regeln (Root-Sync) | Pflicht |
| 4 | `KNOWN_BUGS_REPORT.md` | Bug-Triage — 5 aktive + 29 behobene Bugs | Pflicht |
| 5 | `LIVE_INDEX.md` | ← DIESES DOKUMENT | Pflicht |

> **Hinweis:** PREFLIGHT_LATEST.md ist auto-generated, nicht im Git-Tracking.
> PLOT_LORE.md und RUNTIME_SCORE_HISTORY.md werden von Tools beschrieben (Sonderstatus).
> 19 redundante Dateien gelöscht (Global-Clean 2026-07-02).

## FREEZE-Dokumente (6)

> **32 Doku-Konsolidierungs-Durchläufe abgeschlossen. 235 Buch-Einträge (142 archiviert + 93 FREEZE_INDEX_2).**
> **138 Dokumente archiviert/gelöscht.** (122 vorher + 16 redundanteste gelöscht 2026-07-02)

| # | Dokument | Rolle |
|---|----------|------|
| 1 | `FREEZE/FREEZE_INDEX.md` | **Das Buch** (archiviert) — 142 Einträge (16.06.–20.06.2026) |
| 2 | `FREEZE/FREEZE_INDEX_2.md` | **Das Buch** (aktiv) — 101 Einträge (§1–§31) |
| 3 | `FREEZE/README.md` | Erklärung des FREEZE-Ordners |
| 4 | `FREEZE/PRODUCT_PROTECTION_DOCUMENTATION.md` | Produktschutz-Implementierung (4-Schichten-System) |
| 5 | `FREEZE/HANDSHAKE_2026-06-26.md` | Session-Handshake Doku-Divergenz-Audit |
| 6 | `FREEZE/PLAN_MASTER_2026-06-20.md` | Archivierter Master-Plan (durch PLAN.md ersetzt) |

## Plan-Dokumente (3 AKTIV + 10 Backlog/Archiv)

> **MAX-EFFORT (2026-07-02):** P9 Hardening + P10 Runtime → Backlog. Nur DB-Härtung + SOS-Polish + RimWorld aktiv.

| # | Dokument | Status | Quelle |
|---|----------|--------|--------|
| 1 | `plans/PLAN_RIMWORLD.md` | 🟡 AKTIV (0/19) | Phase 3 — v0.27–v0.30a |
| 2 | `plans/PLAN_STABILISIERUNG.md` | 🔵 BACKLOG (5/9 done) | v0.25 abgeschlossen |
| 3 | `plans/PLAN_FEATURE_GAPS.md` | 🔵 BACKLOG (FG-1 ✅) | Nach RimWorld relevant |
| 4 | `plans/PLAN_BUG_TRIAGE.md` | 🔵 BACKLOG (BT-1/2 ✅) | Sprint-Basis bleibt |
| 5 | `plans/PLAN_BYPASS_REMOVAL.md` | 🔵 BACKLOG | Nach DB-Härtung |
| 6 | `plans/PLAN_DEAD_FLAGS.md` | 🔵 BACKLOG | Nach DB-Härtung |
| 7 | `plans/PLAN_LATENT_RISKS.md` | 🔵 BACKLOG | Laufende Mitigation |
| 8 | `plans/PLAN_PLAN_AUDIT.md` | 🔵 BACKLOG | ~250 Funktionen auditiert |
| 9 | `plans/PLAN_PRIORISIERUNG.md` | 🔵 BACKLOG | Durch MAX-EFFORT ersetzt |
| 10 | `plans/PLAN_RUNTIME_PROBABILITY.md` | 🔵 BACKLOG | Nach RimWorld |
| 11 | `plans/PLAN_GLOBAL_SCORE.md` | ✅ DONE (6/6) | Archiv |
| 12 | `plans/PLAN_COMMIT_LAYER_RNG.md` | ✅ DONE | Archiv |
| 13 | `plans/PLAN_MASTER.md` | ✅ ARCHIVIERT | FREEZE/ |

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
| 3 | `core/Translation/providers/INDEX.md` | Provider-Schicht (11 Provider) |
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
| Roadmap & Planung | PLAN.md (Root) + 9 Einzelpläne | — |
| Agent-Regeln | AGENTS.md (Root + docs/) | — |
| Session-Lifecycle | AGENTS.md (§ SESSION + § WORKFLOW-AUTOMATION) | — |
| Archivierte Historie | FREEZE_INDEX.md + FREEZE_INDEX_2.md (243 Einträge) | — |
| Lore-System | PLOT_LORE.md + commit_lore/ | — |
| Runtime-Score | RUNTIME_SCORE_HISTORY.md + core/data/current_score.json | — |
| Master-Plan (konsolidiert) | Root: `PLAN.md` (22 Tasks, P0-P4) | — |

## Archivierungshistorie

- **137 Dokumente archiviert/gelöscht** — alle Inhalte im FREEZE_INDEX rekonstruierbar
- **Global-Clean (2026-07-02):** 19 redundante Dateien gelöscht (16 FREEZE/ + 2 OLD_DOCS + 1 FREEZE_INDEX.md)
- **Durchlauf 7 (2026-06-23):** Doku-Audit — 10 Dokumente gefreezed + 12 entfernt + 4 Ausgabedokumente erstellt
- **Durchlauf 6:** Root-Cleanup + PLAN.md-Konsolidierung — 3 Dokumente → Root PLAN.md + 8 Audit-Docs archiviert
- **Durchlauf 5:** MASTER_DOC §3/§6 — 5 Einträge → FREEZE_INDEX_2 §29–§30
- **Durchlauf 1–4:** 76 temporäre Dokumente → FREEZE_INDEX §1–§33

## Entfernt im Global-Clean (2026-07-02)

| Datei | Grund |
|-------|-------|
| FREEZE/DOCU_AUDIT_ABBAU_2026-06-23.md | Prozess-Doku — Task erledigt |
| FREEZE/DOCU_AUDIT_FREEZE_2026-06-23.md | Prozess-Doku — Task erledigt |
| FREEZE/DOCU_AUDIT_INDEX_2026-06-23.md | Prozess-Doku — Task erledigt |
| FREEZE/DOCU_AUDIT_PFLICHT_2026-06-23.md | Prozess-Doku — Task erledigt |
| FREEZE/HANDSHAKE_2026-06-19.md | Stub — Inhalt in FREEZE_INDEX §14 |
| FREEZE/FREEZE_MASTER_CHECKLIST_2026-06-19.md | Verifikation — 42/42 Claims geprüft |
| FREEZE/CODE_VS_DOCS_AUDIT_2026-06-19.md | Einmal-Audit — Inhalt in FREEZE_INDEX §13 |
| FREEZE/COMMIT_LAYER_REWRITE_PLAN.md | Abgeschlossener Plan — Inhalt in FREEZE_INDEX_2 §24 |
| FREEZE/PRIORISIERUNG_2026-06-19.md | Durch PLAN.md ersetzt |
| FREEZE/ROUTING_AUDIT_2026-06-19.md | Komplett veraltet — Inhalt in FREEZE_INDEX §25 |
| FREEZE/SQUIZZLE_REPORT.md | Einmal-Audit — Inhalt in FREEZE_INDEX §13 |
| FREEZE/TRIPLE_AUDIT_2026-06-19.md | 3-Rollen-Audit — Inhalt in FREEZE_INDEX §26 |
| FREEZE/PHASE2_MARKER_INTEGRATION_2026-06-19.md | Abgeschlossener Plan — Inhalt in FREEZE_INDEX §31 |
| FREEZE/TRANSLATION_RUNTIME_SPLIT_2026-06-18.md | Abgeschlossener Plan — Implementierung done |
| FREEZE/DB_STATISTICS.md | Konsolidiert in DB_TREND_REPORT |
| FREEZE/MASTER_FREEZE_v0.20.0_2026-06-19.md | Sollte nur TOC sein — redundant zu FREEZE_INDEX |
| FREEZE_INDEX.md | Archiviert durch FREEZE_INDEX_2.md abgelöst |
| OLD_DOCS/CHANGELOG_v0.19-v0.21.md | Veraltet — Root CHANGELOG_1.md ist SSOT |
| OLD_DOCS/README.md | Nur .gitkeep + Platzhalter-Text |

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
