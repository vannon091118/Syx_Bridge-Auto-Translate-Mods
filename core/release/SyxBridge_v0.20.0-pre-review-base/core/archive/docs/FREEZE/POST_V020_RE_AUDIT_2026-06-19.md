# Post-v0.20.0 Re-Audit — F.A-F.D Findings

**Datum:** 2026-06-19 | **Bezug:** Merge `eae4c81` — "v0.20.0-pre-release"
**Verfasst nach:** Quickfix-Sprint + Phase 1A/1B/2 + Plugin-Architektur-Merge
**Authoritative Single Source of Truth:** `core/docs/CHANGELOG.md` (post-merge Stand)

> ⚠️ **DEPRECATION:** Die alte Audit-Liste **F1-F4** (pre-merge, 2026-06-15 → 2026-06-17) ist **superseded** durch diese Re-Audit-Notiz (F.A-F.D post-merge). Cross-Reference: `KNOWN_BUGS_REPORT_2026-06-19.md` enthält weiterhin die historischen F1-F5 → BUG-FS-NNN Mappings als eingefrorene Reproduzierbarkeits-Anker; die operative Sicht ist jetzt F.A-F.D.

---

## Re-Audit-Befunde (Stand: post-merge eae4c81)

### 🟡 F.A — Live-Core `core/src/`-Drift vom Release-Snapshot (PR #5)

**Datei(en):** `core/release/SyxBridge_v0.19.6/core/src/gui/public/app.js`, `core/release/SyxBridge_v0.19.6/core/src/adapters/SongsOfSyxAdapter.js`

**Problem:** PR #5 (`d796b05` — "Merge PR #5 feat/parser-adapter-integration") mergete alle Code-Änderungen **ausschließlich** in den Vendored-Release-Snapshot unter `core/release/SyxBridge_v0.19.6/...`, NICHT in den Live-Core-Pfad `core/src/`. Wer die Bridge direkt aus `node core/index.js` startet, bekommt die parser-adapter-integration-Änderungen **nicht** — sie sind nur in der Distribution wirksam.

**Schwere:** 🟡 P2 — Vendor-Drift, kein direkter User-Impact aber Build-/Sync-Mismatch zwischen `core/src/` (Live) und `core/release/SyxBridge_v{ver}/` (Vendored).

**Fix-Vorschlag:**
1. `scripts/release.js` so erweitern, dass Live-`core/src/` → Vendored-`core/release/SyxBridge_v{ver}/` synchronisiert wird (nicht One-Way-Snapshot).
2. Oder: CI-Drift-Detection in `check_consistency.js` — FAIL wenn Live ≠ Vendored für die aktuelle Version.
3. Alternative: Code-Duplikation in `core/src/` + Audit-Notiz in beiden Pfaden.

**Root-Cause-Analyse:**
- Phase-1-Plugin-Architektur (cdbddad) lebte schon vor PR #5 auf `core/src/`.
- PR #5 schrieb aber nur in das Vendored-Verzeichnis — vermutlich weil der PR-Ersteller von einer Pre-Release-Snapshot-Pipeline ausging.
- `eae4c81` Merge-Resolution konnte das nicht mehr auflösen: `core/src/` war Main-Source-of-Truth-Kandidat, aber `core/release/SyxBridge_v0.19.6/` war schon überschrieben.

### 🟡 F.B — Plugin-Boundary GamePlugin ↔ SongsOfSyxPlugin ohne Boundary-Tests

**Datei(en):** `core/src/plugins/GamePlugin.js` (Interface) + `core/src/plugins/SongsOfSyxPlugin.js` (Implementierung)

**Problem:** Die Plugin-Architektur trennt Base-Class von Implementierung, es gibt aber **keinen Boundary-Test** der prüft: "`SongsOfSyxPlugin` implementiert jede Methode von `GamePlugin` mit korrekter Signatur". Wenn ein künftiges Plugin-Crack oder Refactor eine Methode entfernt, wird das zur **Laufzeit** erkannt (`throw new Error('Not implemented')`) statt zur Compile-Zeit oder Test-Zeit.

**Schwere:** 🟡 P2 — DX/Architektur-Risiko: fehlende Verifikation der Plugin-Verträge.

**Fix-Vorschlag:**
1. `core/tests/plugin-boundary-smoke.js` (NEU) hinzufügen:
   - Iterate alle Methoden der Base-Class via `Object.getOwnPropertyNames(GamePlugin.prototype)`.
   - Reflektieren ob `SongsOfSyxPlugin.prototype.method === NOT_IMPLEMENTED` (Placeholder-Wert oder Marker).
   - FAIL mit Liste der un-implementierten Methoden.
2. In CI-Pipeline binden (`check_syntax.js`-analog).
3. Zusätzlich: Hardcoded Defaults für `getLoreTerms() = []`, `getGameTerms() = []`, `getPathRules() = {}` dokumentieren (kein Crash, nur leerer Output).

**Root-Cause-Analyse:**
- `BUG-FS-012` (KNOWN_BUGS_REPORT) hatte das schon 2026-06-19 notiert: "Alle abstrakten Methoden werfen `throw new Error('Not implemented')`. Plugin-Entwickler bekommen erst zur Laufzeit Fehler." — wurde in der Quickfix-Sprint-Phase nicht behoben.

### 🟠 F.C — CodeRabbit-Auto-Fix aus PR #5 nicht manuell re-verifiziert

**Datei:** Commit `1e1e846` — `fix: apply CodeRabbit auto-fixes`

**Problem:** PR #5 (`d796b05`) hatte Quality-Issues die ein nachfolgender Auto-Fix-Commit (`1e1e846`) per CodeRabbit behoben hat. Die Auto-Fixes sind korrekt angewendet, aber **kein manueller Re-Verify** wurde durchgeführt um zu prüfen:
- Adressieren die Fixes die richtigen Symptome?
- Haben die Fixes neue Edge-Cases eingeführt?
- Sind die Fixes konsistent mit dem Projekt-Stil?

**Schwere:** 🟠 P1 — Code ohne Review = Regression-Risiko bei Edge-Cases. Auto-Tunes per AI sind oft kosmetisch OK, aber semantisch nicht immer optimal.

**Fix-Vorschlag:**
1. `git diff d796b05..1e1e846 --stat` → konkrete Files + LOC.
2. `git diff d796b05..1e1e846` inhaltlich reviewen mit Code-Reviewer-Spawn.
3. Smoke-Tests laufen lassen (`translation-runtime-smoke.js`, `parser_smoke.js`, `validator-smoke.js`, `gate-counter-smoke.js`, `env-protection-smoke.js`).
4. Falls Probleme: `git revert 1e1e846` + manueller Fix.

**Root-Cause-Analyse:**
- CodeRabbit's Auto-Fix-Modus optimiert auf Style/Konvention. Architektonische oder semantische Issues brauchen manuelle Review.
- Die CI hat keinen "post-auto-fix-verify"-Hook.

### 🟢 F.D — Audit-`.jsonl`-Daten committed (gehört die in `.gitignore`?)

**Datei(en):** `core/audit/phase1/chunk_*.jsonl` (14 Chunk-Dateien, mehrere MB)

**Problem:** Audit-Phase-1 Roh-Scans der Code-Searcher sind ins Git committed. Die Daten sind **Zeitpunkts-Snapshots**, nicht Quellcode. Ein Repository-Klon zieht diese Daten unnötig mit — Repo-Size-Bloat und Clone-Latency.

**Schwere:** 🟢 P3 — Repository-Bloat, kein funktionaler Impact.

**Fix-Vorschlag:**
1. `.gitignore` ergänzen: `core/audit/**/*.jsonl`
2. Bestehende Dateien aus Git entfernen: `git rm --cached core/audit/**/*.jsonl`
3. `archive/audit/` für persistente Archivierung erwägen (falls historisch wertvoll für Reproduzierbarkeit).

**Root-Cause-Analyse:**
- 2026-06-19 Audit (`KNOWN_BUGS_REPORT`) hat die `audit/phase1/`-Daten als Beweis-Snapshots committed für Reproduzierbarkeit.
- Nach Abschluss der Audit-Phase verlieren die Roh-Daten ihre acute significance. Nur die Findings in `*.md` brauchen Persistenz.

---

## Cross-Reference zur historischen Audit-Liste (F1-F5 → BUG-FS-NNN)

| Alt (pre-merge 2026-06-15..17) | Status post-v0.20.0-pre-release | Detail |
|---|---|---|
| F1 — Argos Python SyntaxError | 🟡 Open | Nicht in v0.20.0-pre-release kritisch (Argos wird auf CostClass 10 zurückgestuft, NVIDIA First-Choice) |
| F2 — `_dbGet is not a function` | ✅ BEHOBEN | `c45b34f` Quickfix-Sprint + `eab8958` Merge-Blocker-Fix. `index.js:763` korrekte `_dbGet: dbGet`-Injection |
| F3 — Exporter-Syntax discard | ✅ TEILBEHOBEN | v0.20.0-pre-release hat `validateFileMarkers()` (cdbddad) + Critical-Syntax-Gate in `exporter.js` (blocking writes on KEY_COUNT_MISMATCH) |
| F4 — 99.7% Stage 0 | 🟡 REDUZIERT (auf ~33%) | `needsRefresh`-Erweiterung auf `polish_single` + `native_fallback` (c45b34f + eab8958) |
| F5 — 28.5% Stale | 🟡 OPEN (34.6% aktuell) | Nicht in v0.20.0-pre-release adressiert; Live-Trend in `DB_TREND_REPORT.md` |

**Tabelle-Lesart:** Die alten F1-F5 IDs sind **eingefroren** für Reproduzierbarkeit. Die operative Sicht ist F.A-F.D (oben).

---

## Zusammenfassung

| Schwere | Anzahl | Aktion |
|---------|--------|--------|
| 🟠 P1 | 1 | Manuell reviewen (F.C CodeRabbit-Auto-Fix) |
| 🟡 P2 | 2 | Implementieren (F.A Vendor-Sync-Pipeline, F.B Plugin-Boundary-Tests) |
| 🟢 P3 | 1 | Cleanup (F.D `.gitignore`) |

### Top-Quick-Wins (Reihenfolge nach Aufwand × Impact)

| # | Quick-Win | Aufwand | Impact |
|---|-----------|---------|--------|
| 1 | **F.D** `.gitignore` + `git rm --cached` | ~5 Min | Repo-Size-Reset, Clone-Speed |
| 2 | **F.B** `plugin-boundary-smoke.js` schreiben | ~30 Min | Runtime-Crash-Prävention |
| 3 | **F.C** CodeRabbit-Auto-Fix inhaltlich reviewen | ~1-2h | Regression-Schutz |
| 4 | **F.A** Live-Core ↔ Vendored Build-Pipeline-Sync | ~3-4h | Distribution-Konsistenz |

### EFFORT TO NEXT SCOPE

- **Phase 2d:** Stats-Aggregation `shieldResults` im Mod-Summary (~1h)
- **Plugin-Vollintegration:** Boundary-Tests in CI-Pipeline einbinden (~2h)
- **Distribution-Sync:** `scripts/release.js` von One-Way-Snapshot auf Bidirektional umstellen (~4h)
- **DB-Recovery:** Auto-Recovery-Block in Smoke-Portfolio (~2h)
- **CodeRabbit CI-Gate:** Manual-Review-Pflicht für Auto-Fix-Commits (~1h)

---

*Generiert am 19.06.2026 von Buffy nach Merge `eae4c81` (v0.20.0-pre-release). Superseded die F1-F4-Liste aus `KNOWN_BUGS_REPORT_2026-06-19.md`.*
