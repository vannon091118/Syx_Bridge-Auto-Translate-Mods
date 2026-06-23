# 🏛️ FINALE PFLICHTDOKUMENTENLISTE — Doku-Audit 2026-06-23

> **Aktive Pflicht-Dokumente nach Bereinigung:** 13
> **Aktive Referenz-Dokumente:** 10
> **Aktive Arbeits-Dokumente (Pläne):** 12
> **Freeze-Archiv:** 10 Dokumente
> **Entfernt/Ausgeschlossen:** 18 Dokumente

---

## PFLICHT-DOKUMENTE (13) — Dürfen NIEMALS archiviert oder gelöscht werden

### 1. `AGENTS.md` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | SSOT für alle Agent-Operationen. Definiert RULE 1-3, Task-Typen, Commit-Regeln, Session-Lifecycle, DOKU-FLAG/RUNTIME-FLAG-Trennung. |
| **Welche Funktion?** | Orchestrierungs-Regelwerk. Ohne dieses Dokument funktioniert kein Commit, keine Session, keine Doku-Arbeit. |
| **Warum nicht Freeze?** | Wird bei JEDEM Agenten-Task gelesen. Aktive Regel-Enforcement via verify_commit_msg.js. |
| **SSOT-Status?** | Identisch mit `core/archive/docs/AGENTS.md`. |

### 2. `CHANGELOG.md` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Regel 12: Wird NIEMALS archiviert oder gelöscht. Chronologische Wahrheit aller Code-Änderungen. |
| **Welche Funktion?** | Versionshistorie. Referenziert von Agenten, Code-Reviewern, und verify_commit_msg.js (File-Referenzen). |
| **Warum nicht Freeze?** | Per Definition ausgeschlossen. CHANGELOG ist die zweite Schutzschicht (Schicht 2: Log). |
| **SSOT-Status?** | Identisch mit `core/archive/docs/CHANGELOG.md`. |

### 3. `CHANGELOG_1.md` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Ergänzt CHANGELOG.md um die v0.19–v0.21 Historie. Ohne diese Datei wäre die Entwicklungsgeschichte lückenhaft. |
| **Welche Funktion?** | Archiv-Changelog. Cross-referenziert von CHANGELOG.md ("Historische Entwicklung: CHANGELOG_1.md"). |
| **Warum nicht Freeze?** | Wird von CHANGELOG.md direkt referenziert. Referenz-Integrität. |

### 4. `README.md` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Erster Kontakt für neue User. Installation, Features, Screenshots, API-Keys, Projektstruktur. |
| **Welche Funktion?** | User-facing Doku. Zweisprachig (DE/EN). Referenziert CHANGELOG, PLOT_LORE, MASTER_DOC. |
| **Warum nicht Freeze?** | Wird auf GitHub angezeigt. Ist das Gesicht des Projekts. |

### 5. `PLAN.md` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Zentrale Roadmap mit 22 Tasks (P0–P4). Konsolidiert aus 3 Sub-Dokumenten. |
| **Welche Funktion?** | Entwicklungs-Roadmap. Definiert Reihenfolge, Aufwand, Abhängigkeiten. |
| **Warum nicht Freeze?** | Aktive Arbeitsgrundlage. Wird bei jedem Entwicklungs-Schritt herangezogen. |

### 6. `TUTORIAL.txt` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Peer-Review-Tutorial. Notwendig für Review-Base-Build. |
| **Welche Funktion?** | Installationsanleitung + Pipeline-Beschreibung + Dev-Workflow für Reviewer. |
| **Warum nicht Freeze?** | Wird von build-review-base.js in das Release-Paket kopiert. |

### 7. `_Info.txt` (Root)

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Mod-Metadaten für Songs of Syx. Laufzeit-Dokument. |
| **Welche Funktion?** | Wird vom Spiel gelesen. Definiert VERSION, GAME_VERSION, NAME, DESC, AUTHOR. |
| **Warum nicht Freeze?** | Laufzeit-Abhängigkeit. Per Regel 3 nur bei User-Aufforderung anrühren. |

### 8. `core/archive/docs/AGENTS.md`

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | SSOT-Kopie. Muss identisch mit Root-AGENTS.md sein. |
| **Welche Funktion?** | Referenz für Agenten die im core/archive/docs/ Kontext arbeiten. |
| **Warum nicht Freeze?** | SSOT-Regel 10. |

### 9. `core/archive/docs/CHANGELOG.md`

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | SSOT-Kopie. Muss identisch mit Root-CHANGELOG.md sein. |
| **Welche Funktion?** | Referenz im Archive-Kontext. |
| **Warum nicht Freeze?** | SSOT-Regel 10. |

### 10. `core/archive/docs/MASTER_DOC.md`

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Architektur-Referenz. Destillat aller Architektur-Entscheidungen. Pipeline, Provider, DB-Stand, Roadmap. |
| **Welche Funktion?** | SSOT für Architektur-Fragen. Referenziert von Agenten bei Code-Änderungen. |
| **Warum nicht Freeze?** | Wird aktiv bei jedem Spezialfall (🟡) und Notfall (🔴) herangezogen. |

### 11. `core/archive/docs/PREFLIGHT_LATEST.md`

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | DB-Health-Status. Auto-generiert vor jedem Sync. |
| **Welche Funktion?** | Zeigt aktuelle DB-Probleme, Reparaturen, Diagnostik. |
| **Warum nicht Freeze?** | Wird automatisch überschrieben. Aktuellster Stand ist immer relevant. |

### 12. `core/archive/docs/KNOWN_BUGS_REPORT.md`

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Bug-Triage. 7 aktive Bugs + 27 archivierte. |
| **Welche Funktion?** | Lebendes Dokument. Wird bei jedem Triage-Lauf fortgeschrieben. Top-5-Priorisierung. |
| **Warum nicht Freeze?** | Aktive Bug-Verfolgung. Wird bei jedem Code-Fix konsultiert. |

### 13. `core/archive/docs/LIVE_INDEX.md`

| Aspekt | Details |
|--------|---------|
| **Warum Pflicht?** | Orientierungsdokument. Zeigt alle LIVE-, FREEZE- und PLAN-Dokumente. |
| **Welche Funktion?** | Navigation durch das Doku-System. Coverage-Matrix. |
| **Warum nicht Freeze?** | Wird bei jedem Doku-Audit aktualisiert. Ist die Landkarte. |

---

## REFERENZ-DOKUMENTE (10) — Per-Folder INDEX System + FREEZE-Verzeichnis

Diese Dokumente sind nicht Pflicht im operativen Sinne, aber als Nachschlagewerke unverzichtbar.

| # | Pfad | Warum behalten? |
|---|------|-----------------|
| 1 | `core/src/INDEX.md` | Per-Folder INDEX System. SSOT für Funktions-Lokalisierung. |
| 2 | `core/src/adapters/INDEX.md` | Referenzbuch GameAdapter. |
| 3 | `core/src/gui/INDEX.md` | Referenzbuch Dashboard. |
| 4 | `core/src/plugins/INDEX.md` | Referenzbuch Plugin-Schicht. |
| 5 | `core/src/providers/INDEX.md` | Referenzbuch Provider-Schicht. |
| 6 | `core/scripts/INDEX.md` | Referenzbuch Dev-Tools. |
| 7 | `core/tests/INDEX.md` | Referenzbuch Test-Suiten. |
| 8 | `core/TREE.md` | Projektstruktur-Übersicht. |
| 9 | `core/archive/docs/FREEZE/FREEZE_INDEX_2.md` | Das Buch (aktiv). 93 Glossary-Einträge. |
| 10 | `core/archive/docs/FREEZE/README.md` | Erklärung des FREEZE-Ordners. |

---

## AKTIVE ARBEITS-DOKUMENTE (12) — Pläne + Tracking

| # | Pfad | Status | Warum behalten? |
|---|------|--------|-----------------|
| 1 | `core/archive/docs/PLOT_LORE.md` | Aktiv | RULE 2 Layer. Wird von update_plot.js beschrieben. |
| 2 | `core/archive/docs/RUNTIME_SCORE_HISTORY.md` | Aktiv | Wird von runtime_score.js beschrieben. |
| 3 | `core/archive/docs/plans/PLAN_MASTER.md` | Aktiv | Dachdokument für alle Sub-Pläne. |
| 4 | `core/archive/docs/plans/PLAN_BUG_TRIAGE.md` | OFFEN (0/6) | Arbeitsplan Bug-Triage. |
| 5 | `core/archive/docs/plans/PLAN_BYPASS_REMOVAL.md` | OFFEN (0/6) | Arbeitsplan Bypass-Eliminierung. |
| 6 | `core/archive/docs/plans/PLAN_DEAD_FLAGS.md` | OFFEN (0/5) | Arbeitsplan tote Flags. |
| 7 | `core/archive/docs/plans/PLAN_FEATURE_GAPS.md` | OFFEN (0/5) | Arbeitsplan Feature-Lücken. |
| 8 | `core/archive/docs/plans/PLAN_GLOBAL_SCORE.md` | OFFEN (0/6) | Arbeitsplan Score-Tooling. |
| 9 | `core/archive/docs/plans/PLAN_LATENT_RISKS.md` | OFFEN (0/5) | Arbeitsplan latente Risiken. |
| 10 | `core/archive/docs/plans/PLAN_PRIORISIERUNG.md` | OFFEN (0/6) | Arbeitsplan Priorisierung. |
| 11 | `core/archive/docs/plans/PLAN_RUNTIME_PROBABILITY.md` | OFFEN (0/5) | Arbeitsplan Fremdsystem-Härtung. |
| 12 | `core/archive/docs/plans/PLAN_STABILISIERUNG.md` | TEILWEISE (2/9) | Arbeitsplan Stabilisierung. |

---

## ZUSAMMENFASSUNG

| Kategorie | Anzahl | Verbleibt im aktiven Bereich? |
|-----------|--------|-------------------------------|
| Pflicht | 13 | ✅ Ja — immer aktiv |
| Referenz | 10 | ✅ Ja — Nachschlagewerke |
| Aktiv (Pläne) | 12 | ✅ Ja — bis abgeschlossen |
| Historisch | 6 | ❄️ Freeze-Bereich |
| Freeze-Kandidat | 10 | ❄️ → Freeze (wenn bestätigt) |
| Entfernen | 18 | 🔥 Entfernt oder ausgeschlossen |
| Review | 4 | → Entfernen (Test-Assets) |

**Endzustand:** 35 aktive Dokumente (13 Pflicht + 10 Referenz + 12 Pläne). Der Rest ist sauber eingefroren oder mit sauberer Begründung abgebaut.

---

*Erstellt 2026-06-23 — Pflichtdokumentenliste des Doku-Audits.*
