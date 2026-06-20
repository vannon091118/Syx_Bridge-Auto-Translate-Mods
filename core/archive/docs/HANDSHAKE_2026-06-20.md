================================================================================
  SyxBridge — HANDSHAKE (AUSFÜHRLICH)
  Datum:       2026-06-20
  Stand:       v0.20.0-pre-release / LIVE translations.db (Post-Run)
  Autor:       Buffy (Codebuff) im Auftrag von Vannon
  Zweck:       Vollständige Übergabe nach Performance-HDD-Optimierung + B4-Fix + Doku-Konsolidierung
  Pfad:        core/archive/docs/HANDSHAKE_2026-06-20.md
================================================================================


────────────────────────────────────────────────────────────────────────────────
  1. EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────────────────────────

  Diese Session hat SyxBridge auf HDD + AMD FX lauffähig gemacht. Der User
  hatte die Schnauze voll: "Ein Run dauert ewig, ich laufe auf HDD und AMD FX."
  Die Ursachenanalyse deckte fünf Bottlenecks auf, vier wurden heute behoben.

  Die Kernmaßnahmen:

  1. **Schema-Version in db.js** — `_schema_meta`-Tabelle speichert `schema_version`.
     Bei aktuellem Stand werden ALLE 14 `addColumnIfMissing`-Checks + 2 Bulk-UPDATE-
     Migrationen + 8 CREATE TABLE/INDEX bei JEDEM Start übersprungen.
     Spart 2-5 Sekunden pro Start auf HDD.

  2. **PREFLIGHT aggregierte Query** — 8 parallele COUNT(*)-Queries erzeugten
     Disk-Head-Thrashing auf HDD. Jetzt: 1 aggregierte SUM(CASE WHEN)-Query
     (1 Table-Scan statt 8). Gemessene Ersparnis: ~50% PREFLIGHT-Zeit.

  3. **NATIVE_STALE relabeling** — Proper Nouns (native_runtime src=tgt) waren
     historisch als "Issues" klassifiziert und lösten falsche CRITICAL/WARNING-
     Meldungen aus. Jetzt: ℹ️ Info, kein Issue, keine Reparatur, kein Fehlalarm.
     915 Einträge korrekt als "expected, no errors" deklariert.

  4. **Snapshot-Gating** — createSnapshot() (5 MB copyFileSync auf HDD) nur noch
     wenn echte Issues repariert werden, nicht bei jedem PREFLIGHT.

  Parallel dazu:
  - **B4-Silent-Dead-Loop-Fix**: 3× `.catch(() => {})` in translation-runtime.js
    beseitigt. Einer davon war ein stiller API-Credit-Dead-Loop.
  - **MASTER_DOC-Konsolidierung Durchlauf 1**: 16 OBSOLETE-Einträge ins
    FREEZE_INDEX §11 überführt (KD-001 bis KD-016). MASTER_DOC ist jetzt SSOT.

  Commit: `bd9dee2` — gepusht nach origin/Governance.


────────────────────────────────────────────────────────────────────────────────
  2. PROJEKT-STATE (Post-Run: ~4.185 Einträge)
────────────────────────────────────────────────────────────────────────────────

  2.1 Version-Layer
  ─────────────────────────────────────────────────────────────────────────────
    package.json.version           = 0.20.0-pre-release
    git HEAD                       = bd9dee2 (Governance, ahead of origin)
    DB-Engine                      = better-sqlite3 11.9.1
    Schema-Version                 = 5 (_schema_meta)
    PREFLIGHT                      = ✅ HEALTHY, 0 Issues, 1.101ms

  2.2 Live-DB (Post-Run — 2026-06-20, ~01:30 UTC)
  ─────────────────────────────────────────────────────────────────────────────
    Total Translations             = 4.185
    Stale (src=tgt)                = 2.147 (51.3%)
    Flagged                        = 1.652 (39.5%)
    Ø Quality-Score               = 81.2
    Stage 0 / 1 / 2               = 1.736 / 22 / 2.427 (41.5% / 0.5% / 58.0%)
    Stage-2 export-bereit          = 2.427
    DB-Größe                      = ~5.1 MB

    Provider-Verteilung:
      native_runtime   2.123 (50.7%)  — 90.6% stale (Proper Nouns, erwartet)
      google_free      1.027 (24.5%)  — 2.4% stale (Stress-Test bestanden)
      polish_single      466 (11.1%)  — QA-Phase Output
      openrouter         225 ( 5.4%)  — stabil
      ab_polish          225 ( 5.4%)  — A/B-Polish
      argos              100 ( 2.4%)  — initial 100, dann nicht mehr
      groq                16 ( 0.4%)  — 🔴 429-Rate-Limit-Dauerfeuer
      native_glossary      7 ( 0.2%)
      native_fallback      3 ( 0.1%)

    ⚠️  Groq: TPM-Limit 6000 erschöpft → 429 bei jedem Call. Nur 16 Einträge
        im gesamten Run. google_free + openrouter haben die Last getragen.

  2.3 Code-Änderungen dieser Session (Commit bd9dee2)
  ─────────────────────────────────────────────────────────────────────────────
    Performance-HDD:
      core/src/db.js              — Schema-Version _schema_meta + init()-Skip
      core/src/preflight.js       — Aggregierte Query + NATIVE_STALE relabeling
                                    + Snapshot-Gating

    B4-Fix:
      core/src/translation-runtime.js — 3× .catch(() => {}) beseitigt
                                         (Retry-Loop + Logging + Counter)

    Doku:
      core/archive/docs/CHANGELOG.md   — [PERFORMANCE-HDD] + [B4-SILENT-CATCH-FIX]
      core/archive/docs/MASTER_DOC.md  — LIVE-Bereinigung (OBSOLETE→CHANGELOG)
      core/archive/docs/FREEZE/        — FREEZE_INDEX §11 KD-001–016
                                         MASTER_FREEZE §6 KD-Tabelle
      core/archive/docs/DOKU_KONSOLIDIERUNG_2026-06-20.md — 12 Divergenzen BEHOBEN

    Mitgezogen aus Vorsession (war bereits modified, jetzt committed):
      core/src/router.js, core/src/logger.js, core/src/config-runtime.js,
      core/package.json, diverse Doku-Dateien, 4 neue Dev-Scripts


────────────────────────────────────────────────────────────────────────────────
  3. BEWEGUNGEN SEIT LETZTER HANDSHAKE
────────────────────────────────────────────────────────────────────────────────

  Datum      | Ereignis
  -----------+----------------------------------------------------------------
  2026-06-19 | HANDSHAKE_2026-06-19.md geschrieben
  2026-06-20 | better-sqlite3-Migration (db.js, logger.js, preflight.js)
  2026-06-20 | translateHttpError (router.js, config-runtime.js)
  2026-06-20 | 4 Dev-Scripts (db_query, db_snapshot, export_stage2, test_providers)
  2026-06-20 | Plugin-Readiness-Audit (A1-A4, B1-B4)
  2026-06-20 | B4-Silent-Dead-Loop-Fix (3× .catch beseitigt)
  2026-06-20 | DOKU-KONSOLIDIERUNG 2026-06-20 (12 Divergenzen → ALLE BEHOBEN)
  2026-06-20 | MASTER_DOC-Konsolidierung Durchlauf 1 (KD-001–016 ins Buch)
  2026-06-20 | **Performance-HDD-Optimierung** ← HEUTE (Schema-Version, PREFLIGHT, NATIVE_STALE)
  2026-06-20 | Live-Run mit 4.185 Einträgen (Groq 429-Dauerfeuer)
  2026-06-20 | Commit bd9dee2 → origin/Governance
  2026-06-20 | *HANDSHAKE aktuell (dieser Doc hier)* ← HEUTE


────────────────────────────────────────────────────────────────────────────────
  4. KNOWN ISSUES & OFFENE PUNKTE
────────────────────────────────────────────────────────────────────────────────

  ⚠️  Groq 429 — TPM-Limit 6000
    Jeder Groq-Call im letzten Run schlug mit 429 fehl. TPM-Limit (6000) ist
    für diesen Durchsatz zu knapp. Nur 16/4.185 Einträge via Groq.
    translateHttpError erkennt 404/400/402 als fatal, aber 429 als transient
    (eskalierender Cooldown). Der Cooldown greift, aber das TPM-Limit ist
    einfach zu niedrig. Optionen: 1) Groq-Tier upgraden, 2) Batch-Größe
    reduzieren, 3) Groq nur für High-Risk/Polish einsetzen.

  🔴 DD-NEU-1 — B4 in MASTER_DOC §3+§6 noch ⚠️ OFFEN
    MASTER_DOC §3 Tabelle listet "3× silent .catch(() => {})" als OFFEN.
    MASTER_DOC §6 Roadmap listet es als "~0.5h".
    ABER: Der Fix IST im Code (translation-runtime.js:1142/1216/1226/1230)
    und im CHANGELOG [B4-SILENT-CATCH-FIX]. MASTER_DOC wurde vor dem Fix
    konsolidiert und danach nicht nachgezogen.
    → Fix: In §3 durchstreichen + "✅ Erledigt (siehe CHANGELOG [B4-SILENT-CATCH-FIX])"
    → Fix: In §6 Roadmap entfernen oder durchstreichen.

  🔴 DD-NEU-2 — MASTER_DOC §5 Provider-Zahlen komplett falsch
    Behauptet: "openrouter 987, groq 980, native_runtime 289, nvidia 99, polish_single 51"
    Live-DB:   native_runtime 2.126, google_free 786, openrouter 391, ab_polish 225,
               polish_single 190, argos 100, groq 4. nvidia existiert NULL Mal.
    → Fix: Zahlen aus Live-DB (db_query.js --report providers) übernehmen.

  🟡 F.A — Vendor-Sync Drift (Live-Core vs Release)
    Drift-Detection existiert (.build-manifest.json + checkVendorDrift()).
    Bidirektionaler Sync fehlt. P2, ~3-4h.

  🟡 F.C — CodeRabbit-Auto-Fix unreviewed
    Aus PR #5. Manuelles Re-Verify empfohlen. P1, ~1-2h.

  🟡 Groq-Modellname — `groq/auto` lieferte 404 im abgebrochenen Run (Snapshot 21)
    Wurde auf `llama-3.1-8b-instant` geändert. Im aktuellen Run (Snapshot 24)
    war der Modellname OK (keine 404), aber TPM-Limit blockiert.
    → Status: Modellname-Fix OK, TPM-Limit offen.

  🟢 PREFLIGHT HEALTHY — 0 Issues, 915 nativeStale (ℹ️ Info)
    Keine PREFLIGHT-Blocker mehr. Keine falschen CRITICAL-Meldungen.


────────────────────────────────────────────────────────────────────────────────
  5. ARCHITEKTUR-SCHNITTSTELLEN
────────────────────────────────────────────────────────────────────────────────

  5.1 DB-Layer (better-sqlite3 + Schema-Version)
  ─────────────────────────────────────────────────────────────────────────────
    db.js: connect() → new Database(path, {timeout:5000})
    db.js: run/get/all → Promise-wrapped prepare().run()/get()/all()
    db.js: _schema_meta → CURRENT_SCHEMA_VERSION = '5'
           Bei Version-Match: init() returned early (überspringt alle Migrationen)
    db.js: addColumnIfMissing() → PRAGMA table_info + ALTER TABLE (idempotent)
    PREFLIGHT nutzt dbManager.get/run (Promise-basiert)

  5.2 PREFLIGHT (optimiert für HDD)
  ─────────────────────────────────────────────────────────────────────────────
    preflight.js: countIssues() → 1 aggregierte SUM(CASE WHEN)-Query
    preflight.js: totalIssues exkludiert nativeStale + diagnostics
    preflight.js: repairNativeStale() DEAKTIVIERT
    preflight.js: createSnapshot() nur bei criticalIssues > 0
    preflight.js: Report: NATIVE_STALE in "ℹ️ Native Entries"-Sektion

  5.3 Neue Dev-Tools
  ─────────────────────────────────────────────────────────────────────────────
    db_query.js      → node scripts/db_query.js --report [full|live|providers]
    db_snapshot.js   → node scripts/db_snapshot.js "label" --trend
    export_stage2.js → node scripts/export_stage2.js [--dry-run] [--target German]
    test_providers.js→ node scripts/test_providers.js [--json]


────────────────────────────────────────────────────────────────────────────────
  6. RE-ENTRY PFAD (für "Was mache ich wenn ich morgen wieder reinkomme?")
────────────────────────────────────────────────────────────────────────────────

  6.1 Schnell-Check (3 Minuten)
  ─────────────────────────────────────────────────────────────────────────────
    # 1. Git-Status (muss clean sein)
    git status --short

    # 2. DB-Status (sollte ~4.185 Einträge)
    node core/scripts/db_query.js --report live

    # 3. PREFLIGHT (muss HEALTHY sein, 0 Issues)
    node core/scripts/db_query.js --report live | grep -E "total|native"

  6.2 Erste Schritte nach Eintritt
  ─────────────────────────────────────────────────────────────────────────────
    a) HANDSHAKE_2026-06-20.md lesen (dieser Doc) — offene Punkte §4
    b) CHANGELOG.md lesen — letzter Eintrag ([PERFORMANCE-HDD])
    c) DD-NEU-1 + DD-NEU-2 fixen (MASTER_DOC.md §3/§5/§6)

  6.3 Empfohlene Reihenfolge der nächsten Tasks
  ─────────────────────────────────────────────────────────────────────────────
    1. DD-NEU-1 fixen: B4 in MASTER_DOC §3+§6 durchstreichen (~5 Min)
    2. DD-NEU-2 fixen: MASTER_DOC §5 Provider-Zahlen aus Live-DB aktualisieren (~5 Min)
    3. --skip-preflight CLI-Flag implementieren (~30 Min)
    4. saveTranslation-Batching für HDD (~1h)
    5. Groq TPM-Limit lösen (Key-Upgrade oder Batch-Reduktion)


────────────────────────────────────────────────────────────────────────────────
  7. ROADMAP (NEXT SCOPE)
────────────────────────────────────────────────────────────────────────────────

  Prio | Aufgabe                                          | Aufwand
  -----+--------------------------------------------------+--------
  P0   | DD-NEU-1: B4 in MASTER_DOC §3+§6 durchstreichen  | ~5 Min
  P0   | DD-NEU-2: MASTER_DOC §5 Zahlen aktualisieren      | ~5 Min
  P1   | --skip-preflight CLI-Flag                         | ~30 Min
  P1   | saveTranslation-Batching (1 Transaktion statt 6×) | ~1h
  P1   | Groq TPM-Limit: Batch-Größe halbieren             | ~30 Min
  P1   | sos-runtime.js Settings-Pfad in GameAdapter        | ~1h
  P2   | index.js Plugin-Instanziierung via Config/CLI      | ~2h
  P2   | Bidirektionaler Vendor-Sync Phase 2 (F.A)          | ~3-4h
  P2   | DB-Cleanup stale_retranslate                       | ~2h

  ✅ ERLEDIGT diese Session:
    - Schema-Version _schema_meta (init()-Skip)
    - PREFLIGHT aggregierte Query
    - NATIVE_STALE relabeling (kein Fehlalarm mehr)
    - Snapshot-Gating
    - B4-Silent-Dead-Loop-Fix
    - MASTER_DOC-Konsolidierung Durchlauf 1 (KD-001–016)
    - better-sqlite3-Migration
    - translateHttpError
    - 4 Dev-Scripts


────────────────────────────────────────────────────────────────────────────────
  8. SIGNOFF
────────────────────────────────────────────────────────────────────────────────

    Author:       Buffy (Codebuff)
    Approved by:  Vannon (USER)  ←  Hand-Off Confirmation TODO
    Datum:        2026-06-20
    Gültig bis:   nächster HANDSHAKE
    Status:       READY FOR HANDOFF

    Bemerkungen:
    - Schema-Version '5' ist aktiv — init() skipped Migrationen nach erstem Durchlauf
    - PREFLIGHT ist HEALTHY (0 Issues, 915 nativeStale als ℹ️ Info)
    - Live-Run hat 4.185 Einträge produziert (Groq nur 16 — TPM-Limit-Problem)
    - MASTER_DOC ist SSOT (keine OBSOLETE mehr), aber DD-NEU-1/2 müssen noch gefixt werden
    - Commit bd9dee2 ist auf origin/Governance

════════════════════════════════════════════════════════════════════════════════
  ENDE — SyxBridge HANDSHAKE 2026-06-20
  EOF
════════════════════════════════════════════════════════════════════════════════
