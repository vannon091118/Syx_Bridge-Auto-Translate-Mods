# 🐛 KNOWN BUGS REPORT — SyxBridge v0.25.0-alpha

> **Typ:** Persistenter Bug-Triage-Report (fortschreiben, nicht überschreiben)
> **Datum:** 2026-06-19 (erstellt) · 2026-07-02 (Sprint-Durchlauf BT-1) | **Methodik:** PHASE 0-4
> **Faktenbasis:** Code-Analyse via 4 code-searcher, Sichtprüfung runtime-ops.js/translation-runtime.js/translation-db.js/translation-phases.js
> **Grundregel:** Sprint-Durchlauf — Status-Update, Quick-Win-Fix (BU-022), Re-Klassifikation.
> **Archivierung:** 29 behobene Bugs → FREEZE_INDEX_2.md §16 (KB-001–KB-008, KB-S17–KB-S18).

---

## ══════════════════════════════════════════
## 1. AKTIVE BUGS (2 — nach PREFLIGHT-Fixes 2026-07-02)
## ══════════════════════════════════════════

### 🟡 BU-019 — consecutiveGrammarFailures als instance-scoped Mutable (STATE-001)
- **Symptom:** Theoretische State-Korruption bei asynchronen Interleaves.
- **Trigger:** Zwei `ensureTranslations()`-Aufrufe die asynchron interleaven.
- **Betroffene Dateien:** `translation-runtime.js:64`.
- **Ursache:** Ursprünglich modul-scoped `let consecutiveGrammarFailures = 0`. Fix: `{current: 0}` Ref-Objekt in `createTranslationRuntime()`.
- **Fix part 1 (done):** Primitive → Ref-Objekt — verhindert Closure-Fallstricke. `translation-runtime.js:64`.
- **Fix part 2 (offen):** Per-`ensureTranslations()` Scoping statt per-Runtime-Instance. `consecutiveGrammarFailuresRef.current = 0` bei `ensureTranslations()`-Eintritt (Z.560) schützt vor Cross-Call-Interleaving, aber zwei parallele Calls teilen sich das gleiche Ref-Objekt.
- **Reproduzierbarkeit:** Theoretisch (Node ist Single-Threaded, aber `await`-Gaps erlauben Interleaving). Risiko niedrig.
- **Status:** 🟡 TEILWEISE BEHOBEN — Ref-Objekt-Fix done, per-Call-Scoping fehlt (P3, da Risiko minimal).

---

## ══════════════════════════════════════════
## 2. ARCHIVIERTE BUGS (29)
## ══════════════════════════════════════════

> **29 Bugs als ✅ BEHOBEN → archiviert in FREEZE_INDEX_2.md §16.**
> Siehe dort für vollständige Kausalitätsketten, CHANGELOG-Referenzen und Verifikation.
>
> Cluster A (5/5): BU-006, BU-007, BU-008, BU-010, BU-034
> Cluster B (3/4+1): BU-011, BU-016, BU-031, Argos CostClass
> Cluster C (4/5): BU-004, BU-018, BU-022, BU-028
> Cluster D (1/3): BU-020
> Cluster E (4/4): BU-031, BU-032, BU-033, BU-034
> Cluster F (3/3): BU-013, BU-014, BU-015
> Cluster G (3/3): BU-008, BU-011, BU-012
> Einzelne: BU-001, BU-002, BU-003, BU-005, BU-009, BU-017, BU-021, BU-023, BU-027, BU-029, BU-035, BU-036, BU-037, BU-038, BU-039, BU-041

---

## ══════════════════════════════════════════
## 3. ROOT-CAUSE-CLUSTER (Sprint 2026-07-02)
## ══════════════════════════════════════════

### Cluster C: CODE-QUALITÄT & MAINTAINABILITY (1 aktiv)
| Bug | Status | Prio |
|-----|--------|------|
| BU-019 | STATE-001 mutable | 🟡 TEILWEISE (P3) |

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

**Erledigt im Sprint:** BU-004 ✅ File-Mutex · BU-022 ✅ _dbGet-Rename · BU-026 ✅ Jest 30.4.2 · BU-030 ✅ Scripts modularisiert

**Erledigt im Sprint:** BU-004 ✅ File-Mutex · BU-022 ✅ _dbGet-Rename · BU-026 ✅ Jest 30.4.2 · BU-030 ✅ Scripts modularisiert

---

## ══════════════════════════════════════════
## 5. METHODIK
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
*Sprint 2026-07-02: 4 von 6 behoben (BU-004 ✅, BU-022 ✅, BU-026 ✅ Jest, BU-030 ✅ Scripts). 2 verbleibend (BU-019 TEILWEISE P3, BU-025 OFFEN P2).*
*29+ behobene Bugs archiviert in FREEZE_INDEX_2.md §16 (2026-06-21 + 2026-07-02).*
*Nächster Triage-Lauf: vor v0.26 Release.*
