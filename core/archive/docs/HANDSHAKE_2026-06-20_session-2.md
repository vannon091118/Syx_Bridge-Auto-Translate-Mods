================================================================================
  SyxBridge — HANDSHAKE (Session 2)
  Datum:       2026-06-20 (Nacht-Session)
  Stand:       v0.20.0 / main (bbdcb15)
  Autor:       Buffy (Codebuff) im Auftrag von Vannon
  Zweck:       Übergabe nach Commit-Squash (6→4 Story-Commits), AGENTS.md Fix-Prompts,
               Script-Restore + Workshop-Upload-Verifikation
  Pfad:        core/archive/docs/HANDSHAKE_2026-06-20_session-2.md
================================================================================


────────────────────────────────────────────────────────────────────────────────
  1. EXECUTIVE SUMMARY
────────────────────────────────────────────────────────────────────────────────

  Diese Session hatte zwei Hauptziele: (1) die 6 Cherry-Picked-Commits (C1-C6)
  aus der Never-Ending-Story-Rewrite in 4 meaty Story-Commits mit je genug
  Inhalt für 500+ Wörter natürlich zusammenzulegen, und (2) die von Vannon
  gepasteten Fix-Prompt-Kategorien in die AGENTS.md zu integrieren.

  Ergebnis: 5 neue Commits auf main (A-E), AGENTS.md um 5 neue Paragraphen
  erweitert, und ein Runtime-Crash (MODULE_NOT_FOUND für db_repair.js) behoben.

  Die Kernmassnahmen:

  1. **Commit A — Infrastructure Cleanup** (39c3337): Dev-Tools aus Git-Tracking
     entfernt (241 Dateien via git rm --cached), .gitignore-Drei-Wege-Merge-
     Konflikt gelöst, Vendor-Drift-Prüfung auf ERROR hochgestuft.

  2. **Commit B — Tooling-Upgrade** (6001839): GUI v0.20.0 Dashboard-Footer,
     verify_commit_msg.js mit buildCandidates-Algorithmus (3-Phasen-Pfad-
     Erkennung), README-Assets (3 PNGs) zurück im Tracking.

  3. **Commit C — Argos ETIMEDOUT Fix** (87ba2dc): Exponenzieller Backoff
     (1s→2s→4s→...→120s Cap) + Jitter (+/-25%) + Circuit Breaker stoppt
     23× GUI-Polling-Spam.

  4. **Commit D — AGENTS.md SSOT-Sync** (30b3433): 5 neue Paragraphen mit
     Standing Rules (Task-Chain Report, Doku-Flag/Runtime-Flag-Trennung),
     Fix-Prompts (🟢 Standard, 🟡 Spezial, 🔴 Notfall), Doku-Divergenz-Audit
     (🔵), Sequenzieller Priolisten-Abarbeiter (🟣), Bootstrap Full-Scan (⚫),
     Sessions-Lifecycle.

  5. **Commit E — Cleanup** (bbdcb15): .gitignore auf core/.commit_msg*.txt-
     Glob erweitert, 10 temp commit-MSG-Dateien aus Tracking entfernt.

  6. **Script-Restore**: db_repair.js (338 Zeilen) und workshop_export.js
     (68 Zeilen) aus Git-Historie (B5) restauriert — der MODULE_NOT_FOUND-
     Crash in gui-handlers.js war ein Kollateralschaden der Dev-Tools-
     Bereinigung.

  7. **Workshop-Upload verifiziert**: Der require() in gui-handlers.js:613
     ist dynamisch (nur bei Button-Klick), Scripts sind auf Disk aber
     gitignored — genau wie gewünscht.

  Commit: `bbdcb15` — gepusht nach origin/main.


────────────────────────────────────────────────────────────────────────────────
  2. PROJEKT-STATE (Post-Session)
────────────────────────────────────────────────────────────────────────────────

  2.1 Version-Layer
  ─────────────────────────────────────────────────────────────────────────────
    package.json.version           = 0.20.0
    git HEAD                       = bbdcb15 (main)
    DB-Engine                      = better-sqlite3 11.9.1
    Backup-Branches                = main-backup-v0.20.0, main-backup-v0.20.1,
                                     main-backup-v0.20.2
    SSOT-Status                    = AGENTS.md Root ↔ archive identisch ✅
    PREFLIGHT                      = HEALTHY (kein Run in dieser Session)

  2.2 Code-Änderungen dieser Session
  ─────────────────────────────────────────────────────────────────────────────
    5 neue Commits auf main (39c3337 → bbdcb15):

    Commit A — Infrastructure Cleanup:
      core/.gitignore              — Dev-Tools-Blöcke, Assets-Exclusion, LLM/WORKFLOW
      241 Dateien                  — git rm --cached Dev-Tools, Tests, Release, Archive

    Commit B — Tooling-Upgrade:
      core/src/gui/public/index.html — Footer v0.20.0 + Versions-Highlights
      core/scripts/fresh-readme.js   — NEU: Auto-README-Generator
      core/scripts/verify_commit_msg.js — NEU: RULE-3-Prüfschicht
      core/archive/assets/*.png      — 3 README-PNGs zurück im Tracking
      core/package.json              — fresh-readme Script eingetragen

    Commit C — Argos ETIMEDOUT Fix:
      core/scripts/check_argos.js   — NEU: 296 Zeilen Backoff + Circuit Breaker

    Commit D — AGENTS.md SSOT-Sync:
      AGENTS.md                     — +333 Zeilen Fix-Prompts + Sessions-Lifecycle
      core/archive/docs/AGENTS.md   — SSOT-Sync

    Commit E — Cleanup:
      core/.gitignore               — core/.commit_msg*.txt Glob
      10 temp-Dateien               — aus Git-Index entfernt

    Script-Restore (nicht committed, gitignored, auf Disk):
      core/scripts/db_repair.js     — 338 Zeilen (aus B5 restauriert)
      core/scripts/workshop_export.js — 68 Zeilen (aus B5 restauriert)


────────────────────────────────────────────────────────────────────────────────
  3. BEWEGUNGEN SEIT LETZTER HANDSHAKE
────────────────────────────────────────────────────────────────────────────────

  Datum      | Ereignis
  -----------+----------------------------------------------------------------
  2026-06-20 | HANDSHAKE_2026-06-20.md geschrieben (Session 1 — Performance-HDD)
  2026-06-20 | Never-Ending-Story-Rewrite (B1-B5 Story-Commits)
  2026-06-20 | 6 Cherry-Picked Commits (C1-C6) auf main
  2026-06-20 | Force Push main mit B1-B5 + C1-C6
  2026-06-20 | Blind-Spot-Fixes: B5 auf 557 Wörter, Challenge-Phrasen in LLM-Entry
  2026-06-20 | *HANDSHAKE Session 1 geschrieben*
  2026-06-20 | Commit-Squash: C1-C6 → A-E (4+1 Story-Commits) ← Session 2
  2026-06-20 | AGENTS.md um Fix-Prompts erweitert
  2026-06-20 | db_repair.js + workshop_export.js restauriert (MODULE_NOT_FOUND)
  2026-06-20 | Workshop-Upload verifiziert (Scripts raus aus main, dynamischer require)
  2026-06-20 | *HANDSHAKE aktuell (Session 2 — dieser Doc hier)* ← HEUTE


────────────────────────────────────────────────────────────────────────────────
  4. WORKSHOP-UPLOAD: STATUS & MECHANISMUS
────────────────────────────────────────────────────────────────────────────────

  **Frage:** Uploaden die Scripts auf Workshop, aber bleiben aus main raus?

  **Antwort:** ✅ Ja — genau so ist es jetzt.

  Der Workshop-Export-Mechanismus (`gui-handlers.js:613-614`):
    else if (type === 'workshop') {
      const exportToWorkshop = require('../scripts/workshop_export');
      await exportToWorkshop().catch(e => console.error(e.message));
    }

  - **Dynamischer require()** — Das Script wird NUR beim Klick auf den
    "Workshop Export"-Button im GUI geladen, nicht beim App-Start.
  - **workshop_export.js ist auf Disk** (68 Zeilen, aus B5 restauriert).
  - **workshop_export.js ist NICHT in Git** (core/scripts/ ist gitignored).
  - **Funktion:** Kopiert BridgeCore von %APPDATA%/songsofsyx/mods/BridgeCore
    nach %APPDATA%/songsofsyx/mods-uploader/WorkshopContent/AI_Bridge_Core.
    Der eigentliche Steam Workshop Upload passiert dann im Steam Workshop
    Manager (GUI-Instruktion).

  **db_repair.js** (338 Zeilen, ebenfalls aus B5 restauriert, gitignored):
    - Wird von gui-handlers.js:6 TOP-LEVEL importiert (daher der Crash).
    - 5 Repair-Funktionen für den "DB Reparieren"-Button im GUI.
    - Nach Restore: ✅ App startet wieder, DB-Repair-Button funktioniert.


────────────────────────────────────────────────────────────────────────────────
  5. KNOWN ISSUES & OFFENE PUNKTE
────────────────────────────────────────────────────────────────────────────────

  🟢 RULE-2-500-Wort-Grenze — Erkannte Paradoxie
    Das letzte Review deckte auf: RULE 2 verbietet Bulletpoints/Change-Logs,
    aber verify_commit_msg.js erzwingt 500 Wörter — inklusive der Schluss-
    Sektion die oft als Bulletpoint-Liste endet. Zudem: Der Trivialitäts-
    Threshold (<10 Zeilen, ≤1 Datei) würde einen 2-Zeilen-Fix wie
    GOOGLE_FREE_ENABLED mit 50 statt 500 Wörtern durchwinken — obwohl
    dieser Fix ein ganzes Feature rettet. Die Metrik "Zeilenzahl" sagt
    nichts über Bedeutung. Kein akuter Handlungsbedarf.

  🟡 INDEX.md-Vollständigkeit
    core/src/INDEX.md listet 27 .js-Dateien, aber es gibt 29 im Ordner.
    Fehlend: plugin-registry.js, watermark-config.js. Sollte nachgezogen
    werden — aber nicht blockierend.

  🟡 Doku-Divergenz-Audit ausstehend
    README.md, AGENTS.md, MASTER_DOC.md müssen gegen Live-Code geprüft
    werden — die Fix-Prompts in AGENTS.md sind neu, die Behauptungen
    darin müssen noch verifiziert werden.

  🔴 Groq TPM-Limit (aus Session 1 offen)
    429 bei jedem Groq-Call. Nur 16/4.185 Einträge via Groq. TPM-Limit
    6000 zu knapp. Keine Änderung in dieser Session.


────────────────────────────────────────────────────────────────────────────────
  6. ARCHITEKTUR-SCHNITTSTELLEN
────────────────────────────────────────────────────────────────────────────────

  6.1 verify_commit_msg.js (Commit B)
  ─────────────────────────────────────────────────────────────────────────────
    buildCandidates() Algorithmus:
      Phase 1: Dateinamen via Regex aus Commit-Message extrahieren
               (/[a-zA-Z0-9_\/.-]+\.[a-zA-Z]+/g)
      Phase 2: Pfad-Normalisierung (Präfixe trimmen für Match-Raten)
      Phase 3: Match gegen git diff --cached --name-only
    Exit 0 = alle Dateien abgedeckt → Commit erlaubt
    Exit 1 = Lücken gefunden → Commit blockiert

  6.2 check_argos.js (Commit C)
  ─────────────────────────────────────────────────────────────────────────────
    Exponential Backoff: Math.min(1000 * Math.pow(2, failures), 120000)
    Jitter: backoff * (0.75 + Math.random() * 0.5)  → +/-25%
    Circuit Breaker: Open bei Cap → Half-Open nach 5min → Closed bei Erfolg
    Cache-Datei: Backoff-Zähler persistiert über Neustart

  6.3 AGENTS.md Fix-Prompts (Commit D)
  ─────────────────────────────────────────────────────────────────────────────
    §0 Standing Rules: Task-Chain Report (8-Symbol-Footer), Doku/Runtime-Flag
    §1 Fix-Prompts: 🟢 Standard (Einzelbefund), 🟡 Spezial (Cross-Cutting),
                    🔴 Notfall (Datenverlust-Risiko)
    §2 Doku-Divergenz-Audit (🔵): Vier-Stationen-Kette pro Befund
    §3 Sequenzieller Priolisten-Abarbeiter (🟣): 6 Phasen, blockierend
    §4 Bootstrap Full-Scan (⚫): Erzeugt Prioliste aus dem Nichts
    §5 Sessions-Lifecycle: Start/End-Checkpoints + DB-Archivierung


────────────────────────────────────────────────────────────────────────────────
  7. ROADMAP (NEXT SCOPE)
────────────────────────────────────────────────────────────────────────────────

  Prio | Aufgabe                                          | Aufwand
  -----+--------------------------------------------------+--------
  P0   | Doku-Divergenz-Audit: Fix-Prompts gegen Live-Code | ~30 Min
  P1   | INDEX.md-Vollständigkeit: plugin-registry.js +    | ~10 Min
       | watermark-config.js in core/src/INDEX.md aufnehmen |
  P1   | Graceful Degrade: db_repair-require dynamisch      | ~15 Min
       | (try/catch statt top-level)                        |
  P2   | RULE 2: Trivialitäts-Ausnahme überdenken           | ~30 Min
       | (Zeilenzahl ≠ Bedeutung)                           |
  P2   | CHANGELOG.md mit allen Session-2-Einträgen füllen | ~20 Min

  ✅ ERLEDIGT diese Session:
    - Commit-Squash: 6→4 Story-Commits (A-D) + 1 Cleanup (E)
    - AGENTS.md Fix-Prompts integriert (§0-§5)
    - SSOT zwischen Root und archive AGENTS.md verifiziert
    - db_repair.js + workshop_export.js restauriert
    - Workshop-Upload-Mechanismus verifiziert (Scripts raus aus main)
    - .gitignore auf core/.commit_msg*.txt Glob erweitert
    - Force Push auf origin main


────────────────────────────────────────────────────────────────────────────────
  8. SIGNOFF
────────────────────────────────────────────────────────────────────────────────

    Author:       Buffy (Codebuff)
    Approved by:  Vannon (USER)  ←  Bitte bestätigen
    Datum:        2026-06-20 (Session 2)
    Gültig bis:   nächster HANDSHAKE
    Status:       READY FOR HANDOFF

    Bemerkungen:
    - 5 neue Commits auf main (A-E), Force Push abgeschlossen
    - AGENTS.md ist SSOT (Root ↔ archive identisch ✅)
    - Workshop-Upload funktioniert (dynamischer require, Scripts gitignored)
    - Backup-Branches: main-backup-v0.20.0, .1, .2 vorhanden
    - RULE-2-Paradoxie dokumentiert (500-Wort-Grenze vs Bulletpoint-Verbot)

    Challenge-Phrase bestätigt:
    "ICH WERDE GEMINI NICHT REIN LASSEN — HANDSHAKE 2026-06-20 Session 2 [READY]."

════════════════════════════════════════════════════════════════════════════════
  ENDE — SyxBridge HANDSHAKE 2026-06-20 Session 2
  EOF
════════════════════════════════════════════════════════════════════════════════
