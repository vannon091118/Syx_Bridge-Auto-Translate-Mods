# 🤝 HANDSHAKE — Doku-Nachzug + User-Impuls-Tracking

> **Datum:** 2026-06-22 | **Session:** Architektur-Korrektur-Kampagne v0.22 — Doku vollständig nachziehen
> **Vorheriger HANDSHAKE:** `HANDSHAKE_2026-06-22_item-0b.md`
> **Version:** v0.21.0-untested

---

## 📋 WAS WURDE GEMACHT

### 1. RULE 3 Erweiterung: User-Impuls-Tracking
- **`update_plot.js`**: Akzeptiert jetzt `--impulse="User-Input"` Parameter und schreibt `user_impulse`-Feld in plotchain-Node
- **`writing_rules.json`**: Neue Sektion `user_impulse_tracking` — dokumentiert dass jeder Commit den User-Input dokumentieren muss der ihn ausgelöst hat
- **`plotchain.json`**: Letzte 3 Nodes (`11:01:29`, `11:04:56`, `11:07:04`) um `user_impulse`-Felder ergänzt

### 2. PLOT_LORE.md — User-Impulse annotiert
- Alle 3 Dialog-Einträge (Item 4, Item 2 Phase 2, Item 3/9) haben jetzt `> **User-Impuls:**` und `> **Auswirkung:**` Annotationen

### 3. FREEZE_INDEX_2.md — 3 neue Sektionen
- **§21**: Item 4 — 5 Thin-Wrapper entfernt (Commit `5f5387c`)
- **§22**: Item 2 Phase 2 — deepPolishBatch Metriken (Commit `8d4bac5`)
- **§23**: Item 3/9 — rankModel() DB-gestützt (Commit `6083563`)

### 4. Doku-Stand aktualisiert
- FREEZE_INDEX_2: 80 → 83 Buch-Einträge
- Dieser HANDSHAKE für die Session-Übergabe

---

## 📊 STATUS

| Komponente | Stand |
|-----------|-------|
| Update_plot.js | ✅ --impulse Parameter |
| Writing_Rules.json | ✅ user_impulse_tracking |
| Plotchain.json | ✅ 3 Nodes mit user_impulse |
| PLOT_LORE.md | ✅ 3 Einträge annotiert |
| FREEZE_INDEX_2 | ✅ 3 neue Sektionen |
| PREFLIGHT | ⏭️ Nach Commit updaten |

---

## 🔑 KEY DECISIONS

1. **user_impulse als Pflichtfeld**: Jeder neue plotchain-Node SOLL ein `user_impulse`-Feld haben. Alte Nodes ohne Impulse sind `null` — kein Datenverlust.
2. **--impulse separat vom Dialog**: Der Impuls ist ein eigener Parameter, nicht Teil des Dialogs. Trennung von "was der User sagte" und "wie die Agenten reagierten".
3. **RULE 3 Addendum**: "Der User weiss was er macht. Das user_impulse-Feld dokumentiert WARUM ein Commit entstanden ist — nicht nur WAS geändert wurde."

---

## ⏭️ NEXT

- Phase 2 / Item 5+8: Dynamische Batch-Größen + proaktive Key-Rotation
- Phase 3 / Item 3: Free-Modell-Erkennung
- Phase 3 / Item 1: Dynamisches Routing
- Phase 4 / Item 6+9: auto=Bestenwahl + rankModel()
- Phase 5 / Item 10: GUI Auto-Routing-Dashboard

---

*HANDSHAKE erstellt 2026-06-22 — Architektur-Korrektur-Kampagne v0.22*
