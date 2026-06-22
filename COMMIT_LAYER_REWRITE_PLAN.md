# 🔧 COMMIT-LAYER REWRITE PLAN
> **Erstellt:** 2026-06-22T15:33 | **Status:** ✅ ABGESCHLOSSEN (2026-06-22) — Alle 7 Schritte implementiert + 6/6 Verifikationschecks PASS + Broken-Entry-Repair
> **Zweck:** Wenn der Prozess abbricht — hier weitermachen. Jeder Schritt ist atomar.
> **Scope:** NUR core/scripts/commit_lore/ + core/scripts/verify_commit_msg.js
> **Berührungspunkt mit echtem Projekt:** ausschliesslich git commit (unveraenderlich)
> **Nicht anfassen:** core/src/, core/index.js, core/archive/docs/PLOT_LORE.md (nur beschreiben)

---

## Ziele

1. **Dynamische Pools** — kein statischer sidejoke_pool.json als Quelle
   Pool wird bei Bedarf aus Git-History + PLOT_LORE.md live extrahiert
   sidejoke_pool.json bleibt als Cache (kann jederzeit neu gebaut werden)

2. **Alle Chains mit PLOT_LORE.md verbunden** — Emergenz immer dokumentiert
   update_plot.js liest PLOT_LORE.md um Arc-Kontext und letzte Dialoge zu verstehen
   build_pool.js zieht zusaetzlich aus PLOT_LORE.md
   Arc-Zugehoerigkeit wird automatisch pro Node erkannt und gespeichert

3. **Standalone auf jedem System** — ohne aktuelles Projekt zu zerstoeren
   Kein Hardcode auf Projektpfade
   Initialisiert sich selbst wenn Dateien fehlen
   Wenn core/src/ fehlt laeuft Commit-Layer trotzdem

4. **Platzhalter-Bug fixen** — {FILE}, {COUNT} etc. duerfen NIE committed werden
   verify_commit_msg.js blockiert bei unresolvten Platzhaltern
   get_sidejoke.js warnt explizit

---

## Datei-Karte

```
core/scripts/commit_lore/
  verify_commit_msg.js    GEAENDERT - Placeholder-Block, Impulse-Enforce
  update_plot.js          GEAENDERT - Arg-Parser-Fix, Pfad-Bug, Arc-Erkennung
  get_sidejoke.js         GEAENDERT - live rebuild, leerer Pool = Exit 1, Placeholder-Warnung
  build_pool.js           GEAENDERT - PLOT_LORE als Quelle, Mindestroesze, Backup
  writing_rules.json      GEAENDERT - narrative_continuity.required: true

NICHT angefasst:
  core/src/*
  core/index.js
  core/archive/docs/PLOT_LORE.md (wird nur beschrieben)
  AGENTS.md
```

---

## AUFGABEN-LISTE (checkbar, atomar)

### SCHRITT 1 - verify_commit_msg.js: Placeholder-Detektion
[x] 1a Regex fuer unresolvte Platzhalter: /\{[A-Z_]+\}/
[x] 1b BLOCKED mit Liste der Platzhalter
[x] 1c commitCategory TRIVIAL auch bei smallDiff mehrere Dateien
[x] 1d LORE-ONLY Kategorie (alle in commit_lore/ oder archive/docs/)

### SCHRITT 2 - update_plot.js: Arg-Parser-Fix + Pfad-Bug
[x] 2a dialogue mit -- beginnt = Warnung + Usage
[x] 2b git status --porcelain Parsing fix (abgeschnittene Pfade)
[~] 2c Renamed-Files extra behandeln (nicht implementiert — porcelain v1 reicht)
[x] 2d process.chdir(repoRoot) am Anfang

### SCHRITT 3 - update_plot.js: PLOT_LORE Verbindung + Arc-Erkennung
[x] 3a Letzte 3 Eintraege aus PLOT_LORE.md lesen -> lore_context im Node
[x] 3b Arc-Erkennung via lore_arcs.json Keywords
[x] 3c arcs: [...] im plotchain-Node speichern

### SCHRITT 4 - update_plot.js: Cross-Reference Cap
[x] 4a Hashes cap bei 20 (FIFO)
[x] 4b Plot-Variablen unveraenderlich

### SCHRITT 5 - build_pool.js: PLOT_LORE als Quelle + Sicherheit
[x] 5a Buffy-Dialoge aus PLOT_LORE.md extrahieren
[x] 5b Pool-Backup vor Ueberschreiben
[x] 5c Mindestgroesse < 10 = Exit 1 + kein Ueberschreiben
[x] 5d process.chdir(repoRoot)

### SCHRITT 6 - get_sidejoke.js: Live-Rebuild + Warnungen
[x] 6a Leerer Pool = Exit 1
[x] 6b Placeholder-Warnung nach Ausgabe
[x] 6c Letzten PLOT_LORE Eintrag Titel ausgeben

### SCHRITT 7 - writing_rules.json: narrative_continuity aktivieren
[x] 7a narrative_continuity.required: true
[x] 7b LORE-ONLY min_words: 80

---

## WIEDERHERSTELLUNGS-ANLEITUNG

1. Diese Datei lesen - Checkbox-Status zeigt wo abgebrochen
2. Backups pruefen: core/scripts/commit_lore/sidejoke_pool.backup.json
3. Ab letztem offenen Schritt weitermachen

---

## ABSCHLUSS-KRITERIEN (✅ ALLE BESTANDEN 2026-06-22)

[x] node core/scripts/commit_lore/get_sidejoke.js - Sidejoke ohne {PLACEHOLDER} + PLOT_LORE Kontext
[x] node core/scripts/commit_lore/build_pool.js - Pool >= 10 Eintraege (40), Backup existiert
[x] node core/scripts/verify_commit_msg.js mit Placeholder - BLOCKED (UNRESOLVED PLACEHOLDERS)
[x] node core/scripts/commit_lore/update_plot.js ohne Dialog - BLOCKED (Kein Dialog-Text)
[x] node core/scripts/commit_lore/update_plot.js "Dialog" --model=x - korrekt geparst, model_id gesetzt
[x] plotchain.json letzter Node hat arcs: [great-cleanup] und lore_context: [3 Eintraege]
