# OLD_DOCS — Archivierte Versionen

> **Zweck:** Historische Dokumente die zu einer frueheren Version gehoerten.
> **Regel:** Diese Dateien werden NICHT geloescht, aber auch nicht aktiv gepflegt.
> **Einstiegspunkt:** Fuer die aktuelle Version siehe die LIVE-Dokumente in `core/archive/docs/`.

---

## Archivierte Dokumente

| Datei | Version | Beschreibung | Nachfolger |
|-------|---------|-------------|------------|
| `FREEZE_INDEX_v0.19-v0.20.md` | v0.19-v0.20 | 142 Glossary-Eintraege, 33 Sektionen. Gesamter Entwicklungsprozess 16.06.–20.06.2026. | `FREEZE/FREEZE_INDEX_2.md` (aktiv, 93 Eintraege) |
| `CHANGELOG_v0.19-v0.21.md` | v0.19-v0.21 | Vollstaendige Versionshistorie von Pre-Alpha bis v0.21.0. | `CHANGELOG.md` (Root, ab v0.22.0) |

---

## Versionstruktur

Jede Version hat ihre eigene Dokumentation. Der Uebergang zwischen Versionen wird hier dokumentiert:

```
v0.19 (Pre-Alpha)  →  OLD_DOCS/FREEZE_INDEX_v0.19-v0.20.md
                    →  OLD_DOCS/CHANGELOG_v0.19-v0.21.md

v0.22 (aktuell)    →  core/archive/docs/MASTER_DOC.md (Architektur)
                    →  CHANGELOG.md (Root, aktuelle Version)
                    →  PLAN.md (Master-Plan)
                    →  core/archive/docs/KNOWN_BUGS_REPORT.md
                    →  core/archive/docs/PLOT_LORE.md (optional)
```

---

*Archiviert 2026-06-23 im Rahmen der Commit-Layer-Vereinfachung.*
