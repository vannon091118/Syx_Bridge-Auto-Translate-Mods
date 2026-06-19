# 🗑️ Redundanz-Audit v2 — Root-Chaos & Duplikat-Analyse

> **Generiert:** 2026-06-19 | **Vergleichsbasis:** REDUNDANCY_REPORT_2026-06-18.md (v1)
> **Methode:** Full-scan `find . -name` + Hash-Vergleich + Code-Referenz-Check
> **Regel:** Nichts löschen ohne expliziten Befehl. Nur dokumentieren + empfehlen.

---

## ══════════════════════════════════════════
## 1. TENDENZ SEIT v1 (2026-06-18)
## ══════════════════════════════════════════

| Cluster | v1 (18.06) | v2 (19.06) | Tendenz |
|---------|------------|------------|---------|
| Root stale-Dateien (.env, log.txt, runs.jsonl, debug_payloads.txt) | 4 vorhanden | **0 vorhanden** | ✅ BEREINIGT |
| `nul` Windows-Artefakt | 1 vorhanden | **1 vorhanden** | 🔴 NICHT BEHOBEN |
| Release-Ordner | 3 (v0.19.05b, v0.19.6, v0.19.7) | **3** (v0.19.7, v0.20.0-pre-release, v0.20.0-pre-review-base) | ⚠️ STABIL (andere) |
| Root-Duplikate (README, _Info, etc.) | ~8 Kategorien | **~10 Kategorien** | ↗️ MEHR |
| Archive-Bloat (dbold/) | 7+ Snapshots | **3 Snapshots** | ✅ REDUZIERT |
| Untracked Dateien | 1 (LLM-AGENTS-EntryPoint.md) | **0** | ✅ BEREINIGT |

**Fazit:** 5 von 8 v1-Findings behoben. `nul`-Artefakt persists. Release-Bloat strukturell gleich (nur andere Versionen).

---

## ══════════════════════════════════════════
## 2. DUPLIKAT-CLUSTER (VOLLSCAN)
## ══════════════════════════════════════════

### Cluster C1: `start.bat` — 5 Kopien

| # | Pfad | Zeilen | Status |
|---|------|--------|--------|
| 1 | `./start.bat` | 167 | ✅ **KANONISCH** — Live-Launcher |
| 2 | `release/SyxBridge_v0.19.7/start.bat` | — | 📦 Release-Snapshot |
| 3 | `release/SyxBridge_v0.19.7/core/scripts/start.bat` | — | 📦 Redirect-Relikt |
| 4 | `release/SyxBridge_v0.20.0-pre-release/start.bat` | — | 📦 Pre-Release-Snapshot |
| 5 | `release/SyxBridge_v0.20.0-pre-review-base/start.bat` | — | 📦 Review-Base-Snapshot |

**Bewertung:** #3 ist ein Redirect-Relikt (CHANGELOG: "War nur noch ein Redirect auf Root"). #2–5 sind Release-Snapshots — erwartbar, aber #3 ist redundant innerhalb von v0.19.7.

---

### Cluster C2: `README.md` — 6 Kopien

| # | Pfad | Zeilen | Status |
|---|------|--------|--------|
| 1 | `./README.md` | 465 | ✅ **KANONISCH** — Bilingual EN/DE |
| 2 | `core/archive/docs/FREEZE/README.md` | 173 | 📦 Altes Archiv |
| 3 | `release/SyxBridge_v0.19.7/README.md` | — | 📦 Release-Snapshot (alt) |
| 4 | `release/SyxBridge_v0.20.0-pre-release/README.md` | — | 📦 Pre-Release-Snapshot |
| 5 | `release/SyxBridge_v0.20.0-pre-review-base/README.md` | — | 📦 Review-Base-Snapshot |
| 6 | `release/.../core/archive/docs/FREEZE/README.md` | — | 📦 Vendored-Archiv-Kopie |

**Bewertung:** #6 ist besonders fragwürdig — FREEZE-Archiv wurde ins Release vendored.

---

### Cluster C3: `package.json` — 4 Kopien

| # | Pfad | Version | Status |
|---|------|---------|--------|
| 1 | `core/package.json` | `0.20.0-pre-release` | ✅ **KANONISCH** |
| 2 | `release/SyxBridge_v0.19.7/core/package.json` | 0.19.7 | 📦 Release-Snapshot |
| 3 | `release/SyxBridge_v0.20.0-pre-release/core/package.json` | 0.20.0-pre-release | 📦 Vendored |
| 4 | `release/SyxBridge_v0.20.0-pre-review-base/core/package.json` | 0.20.0-pre-release | 📦 Vendored |

**Bewertung:** Erwartbar — Release-Snapshots. Keine Version-Drift zwischen Live und Vendored (beide 0.20.0-pre-release außer v0.19.7).

---

### Cluster C4: `index.js` — 4 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `core/index.js` | ✅ **KANONISCH** — Live Entry Point |
| 2 | `release/SyxBridge_v0.19.7/core/index.js` | 📦 Release-Snapshot (alt) |
| 3 | `release/SyxBridge_v0.20.0-pre-release/core/index.js` | 📦 Vendored |
| 4 | `release/SyxBridge_v0.20.0-pre-review-base/core/index.js` | 📦 Vendored |

---

### Cluster C5: `_Info.txt` — 4+ Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `./_Info.txt` | ✅ **KANONISCH** |
| 2 | `release/SyxBridge_v0.19.7/_Info.txt` | 📦 Snapshot |
| 3 | `release/SyxBridge_v0.20.0-pre-release/_Info.txt` | 📦 Snapshot |
| 4 | `release/SyxBridge_v0.20.0-pre-review-base/_Info.txt` | 📦 Snapshot |
| + | `core/backups/` und `core/patches/` | 📦 Runtime-Kopien |

**Bewertung:** AGENTS.md Regel: "_Info.txt nur bei expliziter User-Aufforderung berühren" → Snapshots sind erwartbar.

---

### Cluster C6: `LICENSE` — 4 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `core/LICENSE` | ✅ **KANONISCH** |
| 2–4 | `release/*/core/LICENSE` | 📦 Vendored |

---

### Cluster C7: `TREE.md` — 3 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `core/TREE.md` | ✅ **KANONISCH** (v0.20.0-pre-release) |
| 2 | `core/archive/docs/FREEZE/TREE.md` | 📦 Archiv |
| 3 | `release/.../core/archive/docs/FREEZE/TREE.md` | 📦 Vendored-Archiv |

---

### Cluster C8: `AGENTS.md` — 2 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `./AGENTS.md` | ✅ **KANONISCH** |
| 2 | `release/.../AGENTS.md` | 📦 Vendored |

---

### Cluster C9: `TUTORIAL.txt` — 2 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `./TUTORIAL.txt` | ✅ **KANONISCH** |
| 2 | `release/.../TUTORIAL.txt` | 📦 Vendored |

---

### Cluster C10: `eslint.config.mjs` — 2 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `core/eslint.config.mjs` | ✅ **KANONISCH** |
| 2 | `release/.../core/eslint.config.mjs` | 📦 Vendored |

---

### Cluster C11: `check_workshop_damage.ps1` — 2 Kopien

| # | Pfad | Status |
|---|------|--------|
| 1 | `core/scripts/check_workshop_damage.ps1` | ✅ **KANONISCH** |
| 2 | `release/.../core/scripts/check_workshop_damage.ps1` | 📦 Vendored |

---

### Cluster C12: `.db` Dateien — 3 Stück

| # | Pfad | Größe | Status |
|---|------|-------|--------|
| 1 | `core/translations.db` | 21 MB | ✅ **AKTIV** — Live-DB |
| 2 | `core/archive/dbold/translations_2026-06-19_snapshot18_pre-liverun.db` | 21 MB | 📦 Snapshot 18 |
| 3 | `core/archive/dbold/translations_20260619_062134_preflight.db` | ? | 📦 PREFLIGHT-Snapshot |

---

### Cluster C13: `nul` — 1 Stück (WINDOWS-ARTEFAKT)

| # | Pfad | Größe | Status |
|---|------|-------|--------|
| 1 | `./nul` | 175 Bytes | 🔴 **ZU LÖSCHEN** — 2x dokumentiert, nie behoben |

**v1-Verweis:** REDUNDANCY_REPORT_2026-06-18 R3: "Fix: `del core\\nul`" — Das war `core/nul`. Jetzt existiert `./nul` im Root. Möglicherweise wurde `core/nul` gelöscht aber ein neues Root-`nul` erzeugt.

---

## ══════════════════════════════════════════
## 3. TOTE / ÜBERSCHÜSSIGE DATEIEN
## ══════════════════════════════════════════

| Datei | Grund | Empfehlung |
|-------|-------|------------|
| `./nul` | Windows-Redirect-Artefakt, 0 inhaltlicher Wert | LÖSCHEN |
| `release/SyxBridge_v0.19.7/core/scripts/start.bat` | Redirect-Relikt innerhalb des alten Releases | Ignorieren (Release-snapshot) |
| `release/.../core/archive/` innerhalb Vendored | FREEZE-Archiv ins Release kopiert — unnötig für Runtime | `release.js` prüfen: archive/ excluded? |

---

## ══════════════════════════════════════════
## 4. KONSOLIDIERUNGSPLAN
## ══════════════════════════════════════════

### Sofort (kein Code nötig)

| # | Aktion | Risiko | Effort |
|---|--------|--------|--------|
| S1 | `nul` löschen | 🟢 Keins | 1 Min |
| S2 | Alte Releases löschen (nur aktuellsten behalten) | 🟡 ZIP-Archiv prüfen | 2 Min |

### Mittelfristig (Code + Test)

| # | Aktion | Risiko | Effort |
|---|--------|--------|--------|
| M1 | `release.js` prüfen: archive/-Ordner in Vendored Releases ausschließen | 🟡 Test | 15 Min |
| M2 | `release.js --clean-old` Flag implementieren | 🟡 Test | 30 Min |

### Langfristig (Architektur)

| # | Aktion | Risiko | Effort |
|---|--------|--------|--------|
| L1 | Vendored Release-Ordner durch ZIP-Only ersetzen | 🟠 Breaking | 2-3h |
| L2 | V70/V71 nach `core/assets/game-versions/` verschieben | 🟠 release.js + tests | 1h |

---

## ══════════════════════════════════════════
## 5. STATISTIK
## ══════════════════════════════════════════

| Metrik | v1 (18.06) | v2 (19.06) | Δ |
|--------|------------|------------|---|
| Cluster gesamt | 9 | **13** | +4 (neue Versionen) |
| Kanonische Dateien | 8 | **11** | +3 (AGENTS, TUTORIAL, eslint) |
| Release-Ordner | 3 | **3** | ±0 (andere Versionen) |
| Stale Root-Artefakte | 4 | **1** (nul) | −3 ✅ |
| Archiv-Snapshots | 7+ | **3** | −4 ✅ |

---

*Generiert von SyxBridge Redundanz-Audit v2 — 2026-06-19*
