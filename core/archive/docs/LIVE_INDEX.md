# 📖 LIVE INDEX — SyxBridge Dokumentation

> **Stand:** 2026-06-19 | **Version:** v0.20.0-pre-release
> **Regel:** Maximal 3 LIVE-Dokumente. Alle historischen/fertigen Dokumente wandern nach FREEZE/.

## LIVE-Dokumente

| # | Dokument | Zweck | Update-Frequenz | Letztes Update |
|---|----------|-------|-----------------|----------------|
| 1 | `CHANGELOG.md` | Versionshistorie — Commits, Fixes, Features pro Version | Bei jedem Release | v0.20.0-pre-release |
| 2 | `MASTER_DOC.md` | Architektur-Master-Doku — Projektübersicht, Pipeline, Status, Bugs, Roadmap, Agent-Referenz | Bei jedem größeren Change | 19.06.2026 |
| 3 | `PREFLIGHT_LATEST.md` | Aktueller PREFLIGHT-Report — DB-Health, Reparaturen, Threshold-Status | Vor jedem Sync (automatisch) | 19.06.2026 |

## Abdeckung

| Thema | Abgedeckt in | Lücken |
|-------|-------------|--------|
| Versionshistorie | CHANGELOG.md | — |
| Architektur & Pipeline | MASTER_DOC §2, §4 | — |
| Offene Bugs | MASTER_DOC §3 | Detail-Reports in FREEZE_AUDIT_CONSOLIDATED |
| DB-Zustand | MASTER_DOC §5 + PREFLIGHT_LATEST | Historische Snapshots in FREEZE_DB_HISTORY |
| Roadmap | MASTER_DOC §6 | Detaillierte Pläne in plans/ |
| Agent-Referenz | MASTER_DOC §7 | Vollständige Referenz in AGENTS.md (Root) |
| Quality-Offensive | MASTER_DOC §3 (kurz) | Vollständige QO in FREEZE_QUALITY_OFFENSIVE |

## Merge-Quellen (in MASTER_DOC eingearbeitet)

| Quelldokument | Ziel-Sektion | Aktion |
|---------------|-------------|--------|
| `HANDSHAKE_2026-06-19.md` | §3, §5, §6 | Gemerged (Status, DB-Stand, Roadmap) |
| `LLM-AGENTS-EntryPoint.md` | §7 | Gemerged (Agent-Referenz) |
| `REDUNDANZ_AUDIT_V2_2026-06-19.md` | §8 | Gemerged (Redundanz-Befunde) |
| `COMMIT_MSG_2026-06-18.txt` | — | Obsolet, nicht übernommen |
| `preflight_history.log` | — | Rohdaten, in PREFLIGHT_LATEST zusammengefasst |
