# 🐛 KNOWN BUGS REPORT — SyxBridge v0.25.0-alpha

> **Typ:** Persistenter Bug-Triage-Report (fortschreiben, nicht überschreiben)
> **Datum:** 2026-06-19 (erstellt) · 2026-07-02 (Sprint-Durchlauf BT-1) | **Methodik:** PHASE 0-4
> **Faktenbasis:** Code-Analyse via 4 code-searcher, Sichtprüfung runtime-ops.js/translation-runtime.js/translation-db.js/translation-phases.js
> **Grundregel:** Sprint-Durchlauf — Status-Update, Quick-Win-Fix (BU-022), Re-Klassifikation.
> **Archivierung:** 27 behobene Bugs → FREEZE_INDEX_2.md §16 (KB-001–KB-008, 28 Einträge).

---

## ══════════════════════════════════════════
## 1. AKTIVE BUGS (5 — nach Sprint 2026-07-02)
## ══════════════════════════════════════════

### ✅ BU-004 — Backup-Race-Condition bei File-Locks (FIXED v0.20)
- **Symptom:** Gleichzeitige Zugriffe auf `patches/` und `backups/` konnten Dateien korrumpieren.
- **Trigger:** Zwei parallele `ensureTranslations()`-Aufrufe (selten, aber möglich).
- **Betroffene Dateien:** `runtime-ops.js`.
- **Ursache:** Kein File-Locking-Mechanismus.
- **Fix:** `acquireBackupLock()` mit O_EXCL/wx + PID-Tracking + Stale-Detection (>5min oder toter PID) + Double-Checked Locking + `releaseBackupLock()` in `finally`. 30s Timeout.
- **Status:** ✅ BEHOBEN (v0.20, verifiziert 2026-07-02) — Vollständiger File-Mutex in `runtime-ops.js:6-40`. Einzige Lücke: kein dedizierter E2E-Smoke-Test (aber das ist ein BU-026-Thema).

### 🟡 BU-019 — consecutiveGrammarFailures als instance-scoped Mutable (STATE-001)
- **Symptom:** Theoretische State-Korruption bei asynchronen Interleaves.
- **Trigger:** Zwei `ensureTranslations()`-Aufrufe die asynchron interleaven.
- **Betroffene Dateien:** `translation-runtime.js:64`.
- **Ursache:** Ursprünglich modul-scoped `let consecutiveGrammarFailures = 0`. Fix: `{current: 0}` Ref-Objekt in `createTranslationRuntime()`.
- **Fix part 1 (done):** Primitive → Ref-Objekt — verhindert Closure-Fallstricke. `translation-runtime.js:64`.
- **Fix part 2 (offen):** Per-`ensureTranslations()` Scoping statt per-Runtime-Instance. `consecutiveGrammarFailuresRef.current = 0` bei `ensureTranslations()`-Eintritt (Z.560) schützt vor Cross-Call-Interleaving, aber zwei parallele Calls teilen sich das gleiche Ref-Objekt.
- **Reproduzierbarkeit:** Theoretisch (Node ist Single-Threaded, aber `await`-Gaps erlauben Interleaving). Risiko niedrig.
- **Status:** 🟡 TEILWEISE BEHOBEN — Ref-Objekt-Fix done, per-Call-Scoping fehlt (P3, da Risiko minimal).

### ✅ BU-022 — _dbGet Alias-Verwirrung (IMPORT-001) — FIXED 2026-07-02
- **Symptom:** `_dbGet` ist Alias auf `dbGet`, aber beide werden im Code verwendet — suggeriert unterschiedliche Semantik.
- **Betroffene Dateien:** `index.js`, `translation-runtime.js`, `translation-db.js`, `translation-phases.js`, `translation-runtime-smoke.js`.
- **Fix:** `_dbGet` → `dbGet` in allen 5 Dateien (7 Call-Sites + 5 Destructurings). Commit via author_system.js.
- **Status:** ✅ BEHOBEN (2026-07-02) — Zero remaining `_dbGet` in Source-Code.

---

## ══════════════════════════════════════════
## 2. ARCHIVIERTE BUGS (27)
## ══════════════════════════════════════════

> **27 Bugs als ✅ BEHOBEN → archiviert in FREEZE_INDEX_2.md §16.**
> Siehe dort für vollständige Kausalitätsketten, CHANGELOG-Referenzen und Verifikation.
>
> Cluster A (5/5): BU-006, BU-007, BU-008, BU-010, BU-034
> Cluster B (3/4+1): BU-011, BU-016, BU-031, Argos CostClass
> Cluster C (2/5): BU-018, BU-028
> Cluster D (1/3): BU-020
> Cluster E (4/4): BU-031, BU-032, BU-033, BU-034
> Cluster F (3/3): BU-013, BU-014, BU-015
> Cluster G (3/3): BU-008, BU-011, BU-012
> Einzelne: BU-001, BU-002, BU-003, BU-005, BU-009, BU-017, BU-021, BU-023, BU-027, BU-029, BU-035, BU-036, BU-037, BU-038, BU-039, BU-041

---

## ══════════════════════════════════════════
## 3. ROOT-CAUSE-CLUSTER (Sprint 2026-07-02)
## ══════════════════════════════════════════

### Cluster C: CODE-QUALITÄT & MAINTAINABILITY (4 aktiv)
| Bug | Status | Prio |
|-----|--------|------|
| BU-004 | Backup-Race-Condition | ✅ BEHOBEN |
| BU-019 | STATE-001 mutable | 🟡 TEILWEISE (P3) |
| BU-022 | _dbGet Alias | ✅ BEHOBEN (2026-07-02) |
| BU-026 | Kein Test-Framework | 🟢 OFFEN (P3) |
| BU-030 | Nicht-modulare Scripts | 🟢 OFFEN (P3) |

### Cluster D: INFRASTRUKTUR (1 aktiv)
| Bug | Status | Prio |
|-----|--------|------|
| BU-025 | Vendor-Sync Drift | 🟡 OFFEN (P2) |

> Alle anderen Cluster (A, B, E, F, G) → 100% behoben. Details in FREEZE_INDEX_2 §16.

---

## ══════════════════════════════════════════
## 4. TOP-5 AKTIVE BUGS (Sprint 2026-07-02)
## ══════════════════════════════════════════

| # | Bug | Risk | Effort | Cluster | Begründung |
|---|-----|------|--------|---------|------------|
| 1 | **BU-025** | 🟡 P2 | 3h | D | Vendor-Sync Drift bidirektional (Release-Blocker) |
| 2 | **BU-019** | 🟢 P3 | 0.5h | C | Modul-scoped mutable — Ref-Fix done, per-Call-Scoping fehlt |
| 3 | **BU-030** | 🟢 P3 | 2h | C | Nicht-modulare Scripts (17 von 22) |
| 4 | **BU-026** | 🟢 P3 | 2h | C | Kein Test-Framework |
| 5 | **BU-025** | 🟡 P2 | 3h | D | (siehe #1 — nur ein P2-Bug übrig) |

**Erledigt im Sprint:** BU-004 (✅ File-Mutex) · BU-022 (✅ _dbGet→dbGet Rename)

---

## ══════════════════════════════════════════
## 5. DB-HEALTH SNAPSHOT (2026-06-21)
## ══════════════════════════════════════════

| Metrik | PREFLIGHT (2026-06-21) | Status |
|--------|-------------------------|--------|
| Total Einträge | **2.702** | 📊 |
| Issues | **0** | ✅ HEALTHY |
| nativeStale | **0** | ✅ |
| shieldLeaks | **0** | ✅ |
| lowScore | **0** | ✅ |
| neverStressTested | **2.702** | 🟡 Diagnose |

---

## ══════════════════════════════════════════
## 6. METHODIK
## ══════════════════════════════════════════

| Phase | Agent(en) | Fokus |
|-------|-----------|-------|
| 0 | basher (DB-Query) | Faktenbasis aus translations.db |
| 1 | code-searcher ×5 | Routing, Parser, Writer, DB-Layer, GUI |
| 2 | Buffy (manuell) | Root-Cause-Clustering |
| 3 | Buffy (manuell) | Run-Vergleich gegen FORENSIC_FULLSCAN |
| 4 | Buffy (manuell) | Priorisierung Risk×Häufigkeit×Wiederkehr |

---

*Persistenter KNOWN_BUGS_REPORT — fortschreiben bei jedem Triage-Lauf, nicht überschreiben.*
*Sprint 2026-07-02: 2 von 5 behoben (BU-004 ✅ File-Mutex, BU-022 ✅ _dbGet-Rename). 3 verbleibend (BU-019 TEILWEISE, BU-025 OFFEN, BU-026+BU-030 P3).*
*28 behobene Bugs archiviert in FREEZE_INDEX_2.md §16 (2026-06-21).*
*Nächster Triage-Lauf: nach nächstem Commit / vor v0.26 Release.*
