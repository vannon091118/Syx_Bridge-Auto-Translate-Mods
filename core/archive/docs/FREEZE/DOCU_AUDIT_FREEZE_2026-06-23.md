# ❄️ FREEZE-LISTE — Doku-Audit 2026-06-23

> **Kandidaten:** 10 Dokumente
> **Regel:** Keine Löschung ohne Freeze-Absicherung. Jedes Dokument wird ins FREEZE-Verzeichnis verschoben und im FREEZE_INDEX_2 dokumentiert.

---

## FREEZE-MANIFEST

| # | Originalpfad | Freeze-Pfad | Grund | Datum | Version | Abhängigkeit | Später relevant? |
|---|-------------|-------------|-------|-------|---------|--------------|-----------------|
| F1 | `core/archive/docs/CODE_VS_DOCS_AUDIT_2026-06-19.md` | `core/archive/docs/FREEZE/CODE_VS_DOCS_AUDIT_2026-06-19.md` | Einmal-Audit. 15 Drift-Einträge behoben. Ergebnisse in MASTER_DOC und FREEZE_INDEX überführt. | 2026-06-23 | v0.22.0 | MASTER_DOC, FREEZE_INDEX_2 | Nein |
| F2 | `core/archive/docs/COMMIT_LAYER_REWRITE_PLAN.md` | `core/archive/docs/FREEZE/COMMIT_LAYER_REWRITE_PLAN.md` | ✅ ABGESCHLOSSEN. Alle 7 Schritte + 6/6 Verifikation bestanden. | 2026-06-23 | v0.22.0 | commit_lore/ | Nein |
| F3 | `core/archive/docs/PRIORISIERUNG_2026-06-19.md` | `core/archive/docs/FREEZE/PRIORISIERUNG_2026-06-19.md` | Durch PLAN_MASTER.md + PLAN.md ersetzt. Alte v0.20.0 Matrix. | 2026-06-23 | v0.22.0 | PLAN_MASTER.md | Nein |
| F4 | `core/archive/docs/PRODUCT_PROTECTION_DOCUMENTATION.md` | `core/archive/docs/FREEZE/PRODUCT_PROTECTION_DOCUMENTATION.md` | Implementiert. 4-Schichten-System steht im Code. | 2026-06-23 | v0.22.0 | exporter.js, text-core.js | Als Referenz |
| F5 | `core/archive/docs/ROUTING_AUDIT_2026-06-19.md` | `core/archive/docs/FREEZE/ROUTING_AUDIT_2026-06-19.md` | Komplett veraltet. Code hat sich seit v0.20.0 massiv geändert. Durch TRIPLE_AUDIT ersetzt. | 2026-06-23 | v0.22.0 | dispatcher.js | Nein |
| F6 | `core/archive/docs/SQUIZZLE_REPORT.md` | `core/archive/docs/FREEZE/SQUIZZLE_REPORT.md` | Einmal-Audit. 7/7 v0.22 Minimum-Items abgeschlossen. Ergebnisse in PLAN.md überführt. | 2026-06-23 | v0.22.0 | PLAN.md | Nein |
| F7 | `core/archive/docs/TRIPLE_AUDIT_2026-06-19.md` | `core/archive/docs/FREEZE/TRIPLE_AUDIT_2026-06-19.md` | 3-Rollen-Audit. 10 Widersprüche behoben. Durch LIVE_INDEX referenziert. | 2026-06-23 | v0.22.0 | LIVE_INDEX | Nein |
| F8 | `core/archive/docs/plans/PHASE2_MARKER_INTEGRATION_2026-06-19.md` | `core/archive/docs/FREEZE/PHASE2_MARKER_INTEGRATION_2026-06-19.md` | ✅ ABGESCHLOSSEN. Reste in PLAN_MASTER migriert. | 2026-06-23 | v0.22.0 | PLAN_MASTER.md | Nein |
| F9 | `core/archive/docs/HANDSHAKE_2026-06-19.md` | `core/archive/docs/FREEZE/HANDSHAKE_2026-06-19.md` | Historischer Session-Handshake. Durch spätere Sessions abgelöst. | 2026-06-23 | v0.22.0 | — | Nein |
| F10 | `core/archive/dbold/DB_STATISTICS.md` | `core/archive/docs/FREEZE/DB_STATISTICS.md` | Konsolidiert. Daten in DB_TREND_REPORT.md vorhanden. | 2026-06-23 | v0.22.0 | DB_TREND_REPORT | Als Referenz |

---

## VERFAHREN

1. **Verschieben:** `mv <Original> <Freeze-Pfad>`
2. **FREEZE_INDEX_2.md aktualisieren:** Neuen Glossary-Eintrag mit Kausalität + Cross-Referenzen
3. **LIVE_INDEX.md aktualisieren:** Dokument aus LIVE-Liste entfernen
4. **MASTER_DOC.md prüfen:** Referenzen auf gefrorene Dokumente aktualisieren

---

## KORREKTHEITS-PRÜFUNG

| Prüfung | Ergebnis |
|---------|----------|
| Alle 4 Lösch-Kriterien erfüllt? | ✅ (1. Inhalt in LIVE umgesetzt, 2. Daten vorhanden, 3. INDEX-Überführung vorgesehen, 4. MASTER_FREEZE-Referenz) |
| CHANGELOG betroffen? | ❌ Nein — CHANGELOG bleibt IMMER live |
| AGENTS.md betroffen? | ❌ Nein — bleibt Pflicht |
| README.md betroffen? | ❌ Nein — bleibt Pflicht |

---

*Erstellt 2026-06-23 — Freeze-Phase des Doku-Audits.*
