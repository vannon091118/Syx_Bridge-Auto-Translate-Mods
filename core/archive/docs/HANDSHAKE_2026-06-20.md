================================================================================
  SyxBridge — HANDSHAKE (PARTIAL — OBSOLETE archiviert)
  Datum:       2026-06-20
  Stand:       v0.20.0-pre-release / LIVE translations.db (Post-Run)
  Autor:       Buffy (Codebuff) im Auftrag von Vannon
  Zweck:       Vollständige Übergabe nach Performance-HDD-Optimierung + B4-Fix + Doku-Konsolidierung
  Pfad:        core/archive/docs/HANDSHAKE_2026-06-20.md
================================================================================

  ⚠️ PARTIAL — OBSOLETE Sektionen archiviert am 2026-06-20:
     §1 Executive Summary, §2.1 Version-Layer, §2.2 Live-DB Snapshot 24,
     §2.3 Code-Änderungen, §3 Bewegungen, §4 DD-NEU-1/DD-NEU-2/Groq-Modellname/
     PREFLIGHT-Status, §6.3 Empfohlene Reihenfolge, §7 P0/Erledigt-Liste,
     §8 Signoff — alle überführt nach FREEZE_INDEX.md §15 (HH-013 bis HH-023).
     Dieses Dokument enthält NUR noch aktuell gültige (ACTIVE) Aussagen.


────────────────────────────────────────────────────────────────────────────────
  4. KNOWN ISSUES & OFFENE PUNKTE (NUR AKTIVE)
────────────────────────────────────────────────────────────────────────────────

  ⚠️  Groq 429 — TPM-Limit 6000
    Jeder Groq-Call im letzten Run schlug mit 429 fehl. TPM-Limit (6000) ist
    für diesen Durchsatz zu knapp. Nur 16/4.185 Einträge via Groq.
    translateHttpError erkennt 404/400/402 als fatal, aber 429 als transient
    (eskalierender Cooldown). Der Cooldown greift, aber das TPM-Limit ist
    einfach zu niedrig. Optionen: 1) Groq-Tier upgraden, 2) Batch-Größe
    reduzieren, 3) Groq nur für High-Risk/Polish einsetzen.

  🟡 F.A — Vendor-Sync Drift (Live-Core vs Release)
    Drift-Detection existiert (.build-manifest.json + checkVendorDrift()).
    Bidirektionaler Sync fehlt. P2, ~3-4h. Siehe MASTER_DOC §3.

  🟡 F.C — CodeRabbit-Auto-Fix unreviewed
    Aus PR #5. Manuelles Re-Verify empfohlen. P1, ~1-2h. Siehe MASTER_DOC §3.


────────────────────────────────────────────────────────────────────────────────
  5. ARCHITEKTUR-SCHNITTSTELLEN
────────────────────────────────────────────────────────────────────────────────

  5.1 DB-Layer (better-sqlite3 + Schema-Version)
  ─────────────────────────────────────────────────────────────────────────────
    db.js: connect() → new Database(path, {timeout:5000})
    db.js: run/get/all → Promise-wrapped prepare().run()/get()/all()
    db.js: _schema_meta → CURRENT_SCHEMA_VERSION (aktuell via Code)
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

    # 2. DB-Status
    node core/scripts/db_query.js --report live

    # 3. PREFLIGHT (muss HEALTHY sein, 0 Issues)
    node core/scripts/db_query.js --report live | grep -E "total|native"

  6.2 Erste Schritte nach Eintritt
  ─────────────────────────────────────────────────────────────────────────────
    a) HANDSHAKE_2026-06-20.md lesen (dieser Doc) — offene Punkte §4
    b) CHANGELOG.md lesen — letzte Einträge
    c) MASTER_DOC.md §6 prüfen — aktuelle Roadmap


────────────────────────────────────────────────────────────────────────────────
  7. ROADMAP (NUR AKTIVE P1/P2)
────────────────────────────────────────────────────────────────────────────────

  Prio | Aufgabe                                          | Aufwand
  -----+--------------------------------------------------+--------
  P1   | --skip-preflight CLI-Flag                         | ~30 Min
  P1   | saveTranslation-Batching (1 Transaktion statt 6×) | ~1h
  P1   | Groq TPM-Limit: Batch-Größe halbieren             | ~30 Min
  P1   | sos-runtime.js Settings-Pfad in GameAdapter        | ~1h
  P2   | index.js Plugin-Instanziierung via Config/CLI      | ~2h
  P2   | Bidirektionaler Vendor-Sync Phase 2 (F.A)          | ~3-4h
  P2   | DB-Cleanup stale_retranslate                       | ~2h

  Aktuelle Prioritäten siehe MASTER_DOC.md §6.


════════════════════════════════════════════════════════════════════════════════
  ENDE — SyxBridge HANDSHAKE 2026-06-20 (PARTIAL — OBSOLETE archiviert)
  EOF
════════════════════════════════════════════════════════════════════════════════
