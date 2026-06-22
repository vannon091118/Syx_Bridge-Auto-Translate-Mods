Uservorgabe Immer du führst ungefragt direkt nach lesen der Datei folgendes aus : LIES DIE VERDAMMTE DOKUMENTATION ! C:\Users\Vannon\Desktop\SyxBridge_Live\core\archive

RULE 1 _Overdrive Edition: Ich Der Agent (…) Bestätige jeden Task den ich ausführe sorgfältig zu dokumentieren und immer den Maximal Langfristigsten weg zu wählen, sobald ich den Code Angepasst habe gelobe ich absolute Vorsicht und werde die Chain respektieren,Jeder String hat das recht zu leben! (oder zumindest nach seine zweck entfernt zu werden.) 
Ich der Agent aktzeptiere meine rolle alls ausführende kraft und bevor ich beginne selber zu helfen Vertraue ich den User, der user weiss was er macht, Ich nicht. !!!!!!!!!!


RULE 2 _Commit-Tagebuch Lore Layer: Alle Schreibregeln, Mindestwortzahlen, Tonalitäten, die Sidejoke-Pool-Einbindung und die PLOT-Dokumentation sind in den externen Lore-Layer 3 (core/scripts/commit_lore/writing_rules.json) ausgelagert. Sie haben 0 Verbindung zur Laufzeit von SyxBridge. Die Einhaltung wird ausschließlich in der Commit-Phase durch das Script verify_commit_msg.js erzwungen.

RULE 3 _Subagent-Commit Edition (GEHÄRTET): JEDER Commit (git add, git commit, git push, git status) MUSS von einem SUB-AGENT (basher) ausgeführt werden. Siehe § TASK: COMMIT für den vollständigen Ablauf.

## RULE: TASK-CHAIN REPORT (Pflicht, immer am Ende)

Jede abgeschlossene Task-Chain MUSS mit diesem Block enden:

🧊 REPORT — <Task-Name> — <Datum>
✅ FIXED   <n>  <Datei:Zeile — 3-5 Wörter was>
❌ BROKEN  <n>  <Datei:Zeile — 3-5 Wörter was, NUR wenn neu gefunden>
⚠️ RISK    <n>  <Datei:Zeile — was könnte noch kippen>
🔍 PROOF   <wie verifiziert: ECHTER Funktionsaufruf > Datei-Scan > Syntax-Check>
📁 TOUCHED <Liste geänderter Dateien, Kommagetrennt>
⏭️ NEXT    <offene Punkte, max 3, oder "—">

- Max. 12 Zeilen total. Keine Tabellen, keine Markdown-Header.
- PROOF: ECHTER Funktionsaufruf mit Input/Output-Check. "Syntax OK" oder "Datei enthält X" zählt NICHT.
- [DOKU-FLAG]: Fundort-Zitat reicht. [RUNTIME-FLAG]: Befehl + echter Output + Exit-Code.
- Wenn ein vorheriger Report etwas als ✅ FIXED gemeldet hat und es bei Nachprüfung doch nicht stimmt: erscheint es jetzt als ❌ BROKEN.

# 🤖 AGENTS.md — SyxBridge Sub-Agent Reference

> **Version:** v0.22.0 | **Stand:** 2026-06-22 (Task-sortierte Restrukturierung)
> **Single Source of Truth:** Root UND core/archive/docs/ — beide identisch.
> **Regel:** Keine Dependencies die wir selbst mit Code lösen können. Keine Lockfiles im Release.

(wer gegen Rule 1 Verstößt muss zur strafe das nächste mal den mist von Gemini weg räumen, Gemini darf nur noch unter aufsicht mit den code spielen.)

SOBALD DU DIE REGEL GELESEN HAST BIST DU VERPFLICHTET MIT "ICH WERDE GEMINI NICHT REIN LASSEN" antworten, ps: Meta ist immer noch auf flucht.

---
CHANGELOG LESEN / AKTUELL HALTEN und immer bei jedem vorschlag mit EFFORT TO NEXT SCOPE mit ausgeben und wenn kein scope gesettzt ist oder ermittelt werden kann User fragen.

---

# 📋 TASK-INDEX

> **Wähle deinen Task-Typ. Jede Sektion enthält ALLE Regeln die für diesen Task gelten — nichts wird überlesen.**

| Task-Typ | Wann? | Direkt zu |
|----------|-------|-----------|
| 🔧 CODE-FIX | Bug fixen, Feature ändern, Refactoring | [§ CODE-FIX](#code-fix) |
| 🏗️ SYSTEM-BUILD | Neues System/Feature von Grund auf bauen | [§ SYSTEM-BUILD](#system-build) |
| 🔨 HARDENING | Iterative Qualitäts-Härtung einer Chain-Funktion | [§ HARDENING](#hardening) |
| 🧹 DOKU-CLEAN | FREEZE-Dokumente archivieren/löschen | [§ DOKU-CLEAN](#doku-clean) |
| 🔍 DOKU-AUDIT | Doku gegen Live-Code auf Divergenzen prüfen | [§ DOKU-AUDIT](#doku-audit) |
| 🟣 PRIOLISTE | Vorgegebene Prioliste sequenziell abarbeiten | [§ PRIOLISTE](#prioliste) |
| 📝 COMMIT | Code-Änderungen committen | [§ COMMIT](#commit) |
| 🟢 SESSION | Session starten oder beenden | [§ SESSION](#session) |

**Alle Task-Typen unterliegen zusätzlich den [GLOBALEN REGELN](#globale-regeln).**

---

# 🤖 AGENT-REFERENZ

### `code-searcher`
**Einsatz:** Code-Analyse, Root-Cause-Research, Referenz-Finding
**Tools:** Ripgrep (zeilenorientierte Suche)
**Params:** `searchQueries: [{ pattern, flags?, cwd?, maxResults? }]`

### `file-picker`
**Einsatz:** Dateien finden wenn man nicht weiß wo sie sind
**Tools:** Fuzzy-Matching auf Dateinamen + Inhalt

### `basher`
**Einsatz:** npm-Befehle, Syntax-Checks, Tests, DB-Queries, Git-Commits (RULE 3)
**Params:** `command: string`, `what_to_summarize?: string`, `timeout_seconds?: number`
**⚠️ Sicherheit:** Keine destruktiven Befehle ohne explizite User-Aufforderung.

### `code-reviewer-deepseek`
**Einsatz:** Review nach Code-Änderungen (Pflicht bei >10 Zeilen)
**Prüft:** Korrektheit, Regression-Risiko, Konsistenz, Security

### `thinker-with-files-gemini`
**Einsatz:** Architektur-Design, Root-Cause-Analyse, Fix-Validierung, nicht-triviale Entscheidungen
**Params:** `filePaths: string[]` (REQUIRED — hat KEINE Conversation-History)
**⚠️ Wichtig:** ALLE relevanten Dateien müssen via filePaths übergeben werden.

### `thinker-gpt`
**Einsatz:** Komplexe Probleme die Nachdenken erfordern
**⚠️ Nicht jeder User hat ChatGPT connected — nur spawnen wenn explizit erlaubt.**

### `researcher-web`
**Einsatz:** CVE-Suche, Stack-Overflow, aktuelle Library-Versionen

### `researcher-docs`
**Einsatz:** API-Dokumentation, Framework-Guides

### `tmux-cli`
**Einsatz:** CLI-Apps interaktiv testen
**Params:** `command: string`, `prompt: string`
**✅ Parent-Verantwortung:** `scriptIssues` prüfen, Capture-Dateien lesen, bei Fehlern neu spawnen.

### `browser-use`
**Einsatz:** GUI-Tests, Web-Dashboard verifizieren
**Voraussetzung:** Chrome muss installiert sein.

---

# 🔧 CODE-FIX {#code-fix}

> **Wann:** Bug fixen, Feature ändern, Refactoring. Einzelbefund oder Cross-Cutting.
> **Klassifizierung:** 🟢 Standard (ein Modul) | 🟡 Spezial (mehrere Module + Doku) | 🔴 Notfall (Live-Sync/Release brennt)

## 📋 Regel-Checkliste (ALLE gelten)

| # | Regel | |
|---|-------|---|
| ☑ | **Context first, act second:** Immer Kontext sammeln + relevante Dateien LESEN bevor du editierst | |
| ☑ | **Conventions:** Existierende Projektkonventionen rigoros einhalten (Stil, Struktur, Patterns) | |
| ☑ | **Libraries/Frameworks:** NIE annehmen dass eine Library verfügbar ist — vorher im Projekt verifizieren | |
| ☑ | **Code Reuse:** Helper-Funktionen, Komponenten, Klassen wiederverwenden — nicht neu implementieren | |
| ☑ | **Idiomatisch:** Änderungen müssen sich natürlich in den lokalen Kontext einfügen | |
| ☑ | **Simplicity:** Nur das tun was verlangt wurde. Keine Verhaltensänderungen nebenbei. | |
| ☑ | **Refactoring-Awareness:** Bei Änderung an exportierten Symbolen → code-searcher spawnen um alle Referenzen zu finden | |
| ☑ | **Package Management:** Neue Packages via basher installieren (nicht package.json raten) | |
| ☑ | **Code Hygiene:** Imports nicht vergessen, ungenutzte Variablen/Funktionen/Dateien entfernen | |
| ☑ | **Don't type cast as "any":** Keine `any`-Casts (oder Äquivalent in anderen Sprachen) | |
| ☑ | **str_replace vor write_file:** str_replace ist effizienter und gibt mehr Feedback | |
| ☑ | **Code-Review:** Nach >10 Zeilen Änderung → code-reviewer-deepseek (Pflicht) | |
| ☑ | **Syntax-Check:** Nach jedem Fix → Syntax + passende Tests via basher | |
| ☑ | **Tests:** Unit-Tests die erstellt werden, direkt ausführen und bei Fehlern fixen | |
| ☑ | **Frontend:** UI so gut wie möglich machen — Hover-States, Transitions, Mikro-Interaktionen | |
| ☑ | **DOKU-FLAG ↔ RUNTIME-FLAG:** Bei jedem neuen Flag prüfen: Beeinflusst es den Programmablauf? → Siehe § INFRASTRUKTUR | |
| ☑ | **TASK-CHAIN REPORT:** Am Ende MUSS der 🧊 REPORT-Block stehen | |
| ☑ | **EFFORT TO NEXT SCOPE:** Immer angeben, bei Unklarheit User fragen | |

## 🟢 Standard-Fall (Ein Modul)

```
ABLAUF:
1. code-searcher: Pattern repo-weit, nicht nur im Meldefile
2. thinker-with-files-gemini (explizite filePaths): Edge-Case-Check
3. Fix implementieren (str_replace)
4. code-reviewer-deepseek (Pflicht >10 Zeilen)
5. basher: echter Lauf, echter Input — Static-Grep zählt NICHT

WIDERLEGUNGSPROBE:
- Zweiter Agent widerlegt aktiv per Ausführung, nicht Lesen
- Kein Gegenbeweis → ABGESCHLOSSEN. Sonst OFFEN.

ABSCHLUSS:
1. archive/docs/ ↔ Live-Stand abgleichen, Diskrepanz melden
2. "ICH WERDE GEMINI NICHT REIN LASSEN — <Task> [Status]"
3. INDEXIERUNG: FREEZE_INDEX.md (letzte 5) + KNOWN_BUGS_REPORT.md (falls Bug) + CHANGELOG.md
```

## 🟡 Spezialfall (Mehrere Module + Doku)

```
ZUSÄTZLICH ZU 🟢:
- Doku-Löschung NUR nach DOKU-CLEAN-WORKFLOW (4 Schritte, keine Abkürzung)
- Fremd-/Gast-Agent Output → KEIN Direkt-Write. Erst Diff-Review durch code-reviewer-deepseek
- Vendor/Release-Pfade betroffen → checkVendorDrift() VOR Abschluss

ABLAUF:
1. code-searcher: Pattern über GESAMTES Repo, nicht nur core/src
2. thinker-with-files-gemini: ALLE betroffenen Dateien (Code + Doku) als filePaths
3. Plugin-Boundary-Contract-Test falls Plugin-Schicht betroffen
4. Fix(e), pro Modul eigener Commit
5. code-reviewer-deepseek pro Modul einzeln
6. basher: echter End-to-End-Lauf über die GESAMTE betroffene Kette

WIDERLEGUNGSPROBE:
- 2 unabhängige Agenten (Code-Hälfte / Doku-Hälfte)
- Beide müssen ABGESCHLOSSEN bestätigen

ABSCHLUSS:
1. archive/docs/ ↔ Root ↔ MASTER_FREEZE 3-Wege-Abgleich
2. "ICH WERDE GEMINI NICHT REIN LASSEN — <Task> [Status]"
3. INDEXIERUNG: FREEZE_INDEX.md + MASTER_FREEZE + CHANGELOG.md + KNOWN_BUGS_REPORT.md
```

## 🔴 Notfall (Live-Sync/Release brennt)

```
VOR JEDER CODE-ÄNDERUNG:
1. Laufenden Sync/Job pausieren
2. DB-Snapshot SOFORT nach archive/dbold/
3. Rollback-Frage VOR Forward-Fix: Ist Rollback schneller? → Rollback, Notfall beendet

ABLAUF (nur falls Rollback NICHT gewählt):
- Kein Schwarm. EIN Agent, basher-first
- Gemini: GAR NICHT zulassen
1. basher: minimal-invasiver Patch, NUR der akute Pfad
2. Echter Lauf gegen echten Input — KEIN Static-Check
3. code-reviewer-deepseek: Kurzreview NACH dem Fix, parallel zum Wieder-Anlaufen

WIDERLEGUNGSPROBE:
- Reduziert auf EINEN Durchlauf, aber Pflicht

ABSCHLUSS:
1. SOFORT-PLATZHALTER in FREEZE_INDEX.md UND CHANGELOG.md
2. "ICH WERDE GEMINI NICHT REIN LASSEN — NOTFALL <Task> [STABILISIERT/ROLLBACK/OFFEN]"
3. INDEXIERUNG: voller Eintrag binnen 24h als regulärer Standard-Fall-Nachzug
```

## Orchestrations-Patterns für CODE-FIX

### Bug-Fix (einfach)
```
1. code-searcher: Root Cause finden
2. read_files: betroffenen Code lesen
3. str_replace: Fix implementieren
4. basher: Syntax + Tests parallel
5. code-reviewer-deepseek: Review
6. Doku-Update (CHANGELOG, FREEZE_INDEX)
```

### Root-Cause-Analyse (3 Bugs parallel)
```
1. 3x code-searcher parallel (je 1 Bug)
2. Code lesen (read_files)
3. thinker-gpt oder eigene Bewertung
4. Fixes implementieren (str_replace)
5. basher: Tests + Syntax
6. code-reviewer-deepseek: Review
7. Doku-Update
```

### External Research Siege
```
ZIEL: Bug nicht vollständig durch Code erklärbar → externes Wissen einbeziehen

1. MASSIVE PARALLEL SEARCH: 10-15 Sub-Agents
   → code-searcher (3-5×), file-picker (2-3×), researcher-web (2-3×), researcher-docs (1-2×)
2. KEY FILES LESEN: read_files auf alle identifizierten Dateien
3. DEEP ANALYSIS: thinker-with-files-gemini auf den KOMPLETTEN Satz
4. IMPLEMENT: Gewählten Fix via str_replace
5. CODE REVIEW + SYNTAX parallel
6. Bei Reviewer-Issues → Fix → zurück zu Step 5

ENTSCHEIDUNGSREGEL: Immer den WEG wählen der das Problem ENDGÜLTIG löst,
                   nicht der am wenigsten Code ändert.
```

---

# 🏗️ SYSTEM-BUILD {#system-build}

> **Wann:** Komplett neues System/Feature von Grund auf bauen (z.B. Preflight Analysis, PROVIDER_REGISTRY).

## 📋 Regel-Checkliste

| # | Regel | |
|---|-------|---|
| ☑ | **Design vor Build:** IMMER erst designen (thinker-with-files-gemini), dann bauen | |
| ☑ | **Max 4 Dateien:** Maximal 4 Dateien gleichzeitig neu erstellen/ändern | |
| ☑ | **Alle CODE-FIX Regeln** gelten zusätzlich (siehe § CODE-FIX Checkliste) | |
| ☑ | **Per-Folder INDEX:** Nach Fertigstellung Folder-INDEX.md aktualisieren | |
| ☑ | **CHANGELOG:** Neues System im CHANGELOG dokumentieren | |

## Ablauf

```
1. ARCHITEKTUR-DESIGN: thinker-with-files-gemini auf existierende Infrastruktur
   → Design mit Tradeoffs, Edge-Case-Analyse
2. IMPLEMENT: Alle Dateien parallel erstellen/ändern
3. CODE REVIEW + SYNTAX parallel
4. Bei Reviewer-Issues → Fix → zurück zu Step 3
5. DRY-RUN: node -e oder Script-Aufruf zur Verifikation
6. FINAL PASS → abnehmen
```

### Release-Build

```
1. scripts/sync-version.js (Version synchronisieren)
2. scripts/release.js (sauberes Paket bauen)
3. basher: npm run release
4. code-reviewer-deepseek: Release prüfen
```

---

# 🔨 HARDENING {#hardening}

> **Wann:** Iterative Qualitäts-Härtung — Funktion für Funktion die Chain auf Edge Cases prüfen.

## 📋 Regel-Checkliste

| # | Regel | |
|---|-------|---|
| ☑ | **Max 5 Dateien** pro Durchlauf gleichzeitig ändern | |
| ☑ | **Nur EINE Funktion/Modul** pro Loop-Iteration | |
| ☑ | **2 unabhängige Agenten:** Verifikation + Widerlegung pro Fix | |
| ☑ | **Alle CODE-FIX Regeln** gelten zusätzlich | |

## Ablauf (pro Funktion)

```
1. BASELINE (RUN 1): Syntax-Check + alle Smoke-Tests → Messlatte
2. DEEP ANALYSIS: thinker-with-files-gemini auf ALLE relevanten Dateien
   → klassifiziere EVERY Finding nach P0/P1/P2/P3
3. IMPLEMENT: Alle P0+P1+P2 Fixes via str_replace (parallel wo möglich)
4. RUN 2: Syntax + Smoke + code-reviewer-deepseek parallel
5. VERIFICATION: thinker-with-files-gemini als UNABHÄNGIGER Prüfer
   → Jeder Claim: VERIFIED oder FALSIFIED mit exakten Line-Referenzen
6. REFUTATION: thinker-with-files-gemini als AKTIVER Widerleger
   → Jeder Claim: SUCCESSFULLY REFUTED oder FAILED TO REFUTE
7. Wenn FALSIFIED oder REFUTED → Fix + zurück zu Step 4
8. RUN 3: Syntax + Smoke + code-reviewer-deepseek (final)
9. Ergebnis GUT = NÄCHSTE Funktion | TENDIERT NEGATIV = LOOP WIEDERHOLEN

ENTSCHEIDUNGSREGEL: Immer zugunsten der Laufzeit-Zuverlässigkeit.
ABBruch: Loop läuft bis keine neuen Fehler gefunden werden ODER User stoppt.
```

---

# 🧹 DOKU-CLEAN {#doku-clean}

> **Wann:** FREEZE-Dokumente archivieren/löschen. Doku-Schwelle (>10 temporäre Analysedokumente) erreicht.
> **Kernregel:** FREEZE-Dokumente werden NIE direkt gelöscht.

## 📋 Regel-Checkliste

| # | Regel | |
|---|-------|---|
| ☑ | **NIE direkt löschen:** Erst in INDEX als Glossary-Eintrag überführen | |
| ☑ | **Volle Kette:** ANALYSE → Härtung → Gegenprüfung → FREEZE/LIVE-Referenz → Kausalitäts-Prüfung → INDEX-Überführung → MASTER FREEZE-Referenz → DANN löschen | |
| ☑ | **ALLE 4 Lösch-Kriterien** müssen erfüllt sein (siehe unten) | |
| ☑ | **MASTER FREEZE** muss JEDE Löschung referenzieren + begründen | |
| ☑ | **CHANGELOG** wird NIEMALS archiviert oder gelöscht | |

## Doku-Dreiergruppe

| Dokument | Analogie | Funktion |
|----------|----------|----------|
| **MASTER FREEZE** | Inhaltsverzeichnis | Referenziert und begründet JEDEN gelöschten Eintrag |
| **FREEZE INDEX** | Das Buch | GESAMTER Entwicklungsprozess als Glossary mit Kausalität + Cross-Referenzen |
| **CHANGELOG** | Persistentes Log | Wird NIEMALS archiviert. Bleibt IMMER live. |

## Lösch-Kriterien (ALLE 4 müssen erfüllt sein)

1. ✅ Inhalt **nachweislich ohne Konflikt** in LIVE umgesetzt
2. ✅ Relevante Daten in LIVE **vorhanden** ODER als **obsolet** markiert
3. ✅ Inhalt als **Glossary-Eintrag im FREEZE_INDEX** überführt (mit Kausalität, Cross-Referenzen)
4. ✅ Eintrag im **MASTER FREEZE referenziert und begründet**

## Doku-Clean Kette

```
ANALYSE → Härtung → Gegenprüfung → FREEZE/LIVE-Referenz → Kausalitäts-Prüfung
                                                                  ↓
                                                        Konfliktfrei + in LIVE umgesetzt?
                                                                  ↓ JA
                                                 ┌───────────────┬─────────────────┐
                                                 ↓               ↓                 ↓
                                          INDEX überführt   MASTER FREEZE      Original löschen
                                          (Glossary +       referenziert +     (erst NACHDEM
                                           Kausalität +     begründet           alles sicher
                                           Cross-Refs)                          überführt ist)
```

## ❌ Diese Fehler dürfen NIEMALS passieren

- FREEZE-Dateien löschen OHNE INDEX-Überführung
- INDEX als tote Namensliste führen (muss das "Buch" sein)
- MASTER FREEZE ohne Referenz auf gelöschte Einträge
- Doku-Clean OHNE die volle Kette
- CHANGELOG archivieren oder löschen

---

# 🔍 DOKU-AUDIT {#doku-audit}

> **Wann:** Doku-Bestand gegen Live-Code/DB auf Divergenzen prüfen.
> **Prinzip:** CODE IST DIE EINZIGE WAHRHEIT — bei Konflikt gewinnt immer der Code.

## 📋 Regel-Checkliste

| # | Regel | |
|---|-------|---|
| ☑ | **SSOT:** Root UND core/archive/docs/ müssen identisch sein — Abweichung zwischen diesen beiden zählt selbst als Befund | |
| ☑ | **JEDE testbare Behauptung** prüfen (Zahlen, "existiert", LOC, Funktionsanzahl, Status-Flags, Versionen) | |
| ☑ | **Keine Behauptung überspringen** weil sie "letztes Mal stimmte" | |
| ☑ | **Nachweis NUR durch echten Befehl/Query** — "Code sieht plausibel aus" zählt nicht | |

## Ablauf

```
1. file-picker: vollständige Liste aller Doku-Dateien (Root vs. core/archive/docs/ getrennt)
2. PRO DOKUMENT: code-searcher extrahiert jede testbare Einzelbehauptung (Originalzitat + Datei:Zeile)
3. PRO BEHAUPTUNG: Verifikation via basher (Code/DB) oder thinker-with-files-gemini (Architektur-Claims)
4. Jede widerlegte Behauptung → DD-Eintrag (Doku-Divergenz) → Vier-Stationen-Kette
5. code-reviewer-deepseek: prüft Langzeitlösung pro DD-Eintrag auf Konsistenz
```

## Vier-Stationen-Kette pro DD-Eintrag

```
🔀 DIVERGENZ — Was steht in der Doku, was zeigt der Live-Stand (beide mit Datei:Zeile)

🧬 URSACHE — WARUM ist die Lücke entstanden (nicht "Code ist falsch", sondern Prozess-Ursache)
   Wenn unklar: "URSACHE UNKLAR, Verdacht: ..."

🛠️ LANGZEITLÖSUNG — Strukturelle Lösung (nicht einmaliger Zahlendreh).
   Wenn Fix nur "Zahl in README ändern": WIE wird verhindert dass sie in 3 Tagen wieder falsch ist?

💡 NUTZEN + BEGRÜNDUNG — Warum lohnt sich DIESE Lösung? Was passiert wenn man's NICHT macht? (max 2 Sätze)
```

## Report-Format

```
🧊 REPORT — DOKU-DIVERGENZ-AUDIT — <Datum>
✅ STIMMT NOCH    <n>  (geprüft, keine Abweichung)
🔀 DIVERGENZ      <n>  (Liste der DD-IDs mit Kurztitel)
🧬→🛠️→💡 Details  <pro DD-ID die volle Kette>
🔍 PROOF          <Befehl+Output, mind. 1 pro DD-ID>
📁 TOUCHED        <korrigierte Doku-Dateien>
⏭️ NEXT           <max 3 / „—">
```

## Abschluss

```
1. Nach Korrektur: erneuter Kurzabgleich Root ↔ core/archive/docs/ — beide Kopien müssen identisch sein
2. "ICH WERDE GEMINI NICHT REIN LASSEN — DOKU-DIVERGENZ-AUDIT <Datum> [n DD-Einträge, n ABGESCHLOSSEN]"
3. Jeder DD-Eintrag: volle Kette in FREEZE_INDEX.md + CHANGELOG.md + ggf. KNOWN_BUGS_REPORT.md
```

---

# 🟣 PRIOLISTE {#prioliste}

> **Wann:** Vorgegebene Prioliste sequenziell abarbeiten. ODER: Bootstrap Full-Scan (⚫) wenn KEINE Liste existiert.

## 📋 Regel-Checkliste

| # | Regel | |
|---|-------|---|
| ☑ | **Strikt sequenziell:** Ein Punkt komplett fertig BEVOR der nächste startet | |
| ☑ | **Kein Parallelisieren** über mehrere Listenpunkte | |
| ☑ | **SCHRITT 0:** Vor Punkt 1 auf Blocker prüfen (CRLF-Drift, fehlende DB-Snapshot-Basis) | |
| ☑ | **2 Punkte in Folge OFFEN:** Gesamte Abarbeitung pausieren → neuer Listenpunkt ("Warum scheitern X und Y?") | |

## Ablauf pro Listenpunkt (6 Phasen, blockierend)

```
PHASE A — KLASSIFIZIERUNG
  🟢 Standard / 🟡 Spezial / 🔴 Notfall?
  Wenn sich Kategorie während Arbeit ändert → SOFORT STOPPEN, User fragen.

PHASE B — FLAG-TYP-VORPRÜFUNG
  DOKU-FLAG (nur Text/Status) oder RUNTIME-FLAG (beeinflusst Programmverhalten)?
  Bestimmt PROOF-Tiefe in Phase D.

PHASE C — AUSFÜHRUNG (Ablauf je nach Klassifizierung aus Phase A, siehe § CODE-FIX)

PHASE D — WIDERLEGUNGSPROBE
  Zweiter Sub-Agent widerlegt aktiv durch Ausführung.
  Kein Gegenbeweis → ABGESCHLOSSEN. Gegenbeweis → OFFEN, User informieren.

PHASE E — REPORT (pro Punkt einzeln)
  🧊 REPORT — <Punkt-ID> — <Datum>

PHASE F — ABSCHLUSS
  1. core/archive/docs/ ↔ Root-Abgleich
  2. "ICH WERDE GEMINI NICHT REIN LASSEN"
  3. INDEXIERUNG: FREEZE_INDEX.md + KNOWN_BUGS_REPORT.md + CHANGELOG.md
  Erst NACH Phase F → nächster Punkt
```

## ⚫ Bootstrap Full-Scan (wenn KEINE Prioliste existiert)

```
PHASE 1 — VOLLINVENTUR (parallel, max. Breite)
  1. file-picker: alle .md unter Root + core/archive/docs/ + core/archive/dbold/
  2. code-searcher: alle *_ENABLED, boolesche DB-Spalten, BU-/DD-IDs/Status-Wörter
  3. basher: Live-Zustand (Version, LOC, DB-Schema, Tests, Syntax)
  4. thinker-with-files-gemini: offene Punkte aus MASTER_FREEZE §6, KNOWN_BUGS_REPORT, letztem Audit

PHASE 2 — DEDUPLIZIEREN + KLASSIFIZIEREN
  - Schon als BU-/DD-ID bekannt? → Referenz behalten
  - DOKU-FLAG oder RUNTIME-FLAG?
  - 🟢/🟡/🔴-Klassifizierung

PHASE 3 — PRIORISIERUNG (fixe Reihenfolge)
  1. 🔴 Notfall-Kandidaten zuerst
  2. Runtime-Flag-Divergenzen vor Doku-Flag-Divergenzen
  3. 🟡 Spezialfälle die mehrere 🟢 blockieren
  4. Rest nach Aufwand aufsteigend

PHASE 4 — WIDERLEGUNGSPROBE DER LISTE
  Fehlt etwas? BU-/DD-Eintrag nicht aufgenommen? Dopplungen?

ÜBERGABE AN 🟣 → fertige Liste wird direkt als INPUT eingesetzt
```

---

# 📝 COMMIT {#commit}

> **Wann:** IMMER nach Code-Änderungen. JEDER Commit MUSS via basher (RULE 3).

## 📋 Regel-Checkliste

| # | Regel | |
|---|-------|---|
| ☑ | **RULE 3:** Commit NUR via basher — Orchestrator darf NIEMALS selbst git ausführen | |
| ☑ | **RULE 2:** Lore-Regeln aus writing_rules.json werden von verify_commit_msg.js enforced | |
| ☑ | **[MODEL:<name>]:** Pflicht-Token — Modell das den Commit erstellt (Regex: `/\[MODEL:([a-z0-9._-]+)\]/i`) | |
| ☑ | **[REF:<last-entry>]:** Pflicht-Token — Letzter plotchain-Node (verify_commit_msg prüft auf aktuellsten Node) | |
| ☑ | **Sidejoke:** Via get_sidejoke.js — MUSS exakt aus dem Pool kommen | |
| ☑ | **Wortzahl:** Mindestwortzahl aus writing_rules.json (aktuell 200 Wörter für STANDARD) | |
| ☑ | **Files referenzieren:** Alle gestagten Files via basename/stem in der Message nennen | |
| ☑ | **Kein Code-Commit ohne Doc-Commit:** CHANGELOG + Folder-INDEX müssen aktuell sein | |
| ☑ | **Cross-Reference Enforcement:** Commit-Message muss mindestens einen Eintrag aus cross_references.json referenzieren | |

## Workflow

```
1. Sidejoke via get_sidejoke.js holen
2. Letzten plotchain-Node via plotchain.json ermitteln
3. update_plot.js mit --model=<id> --ref=<last-node> ausführen → erzeugt Plot-Dialog
4. Commit-Text schreiben (Sidejoke + substantieller Text + [MODEL:] + [REF:] + Files)
5. core/.commit_msg.txt schreiben
6. basher ausführen:
   git add <files>
   && node core/scripts/verify_commit_msg.js core/.commit_msg.txt
   && git commit -F core/.commit_msg.txt
   && git push
   && rm core/.commit_msg.txt
7. NICHT nochmal update_plot.js aufrufen — wurde bereits in Schritt 3 erledigt

BEI BLOCK: verify_commit_msg.js exit 1 → Fehler lesen, .commit_msg.txt korrigieren, erneut basher
```

---

# 🟢 SESSION {#session}

> **Wann:** Session-Start (vor jeder Code-Arbeit) und Session-Ende (vor Beendigung).

## 📋 Regel-Checkliste SESSION-START

| # | Regel | |
|---|-------|---|
| ☑ | **Git-Working-Tree prüfen:** `git status --short` — muss clean sein | |
| ☑ | **HANDSHAKE lesen:** Aktuellen `core/archive/docs/HANDSHAKE_*.md` lesen | |
| ☑ | **PREFLIGHT prüfen:** `core/archive/docs/PREFLIGHT_LATEST.md` auf Blocking-Schwelle prüfen | |
| ☑ | **Eskalation prüfen:** Bei aktiven Triggern → User fragen | |

## 📋 Regel-Checkliste SESSION-ENDE

| # | Regel | |
|---|-------|---|
| ☑ | **HANDSHAKE schreiben:** Neuen `HANDSHAKE_YYYY-MM-DD.md` für nächsten Agenten | |
| ☑ | **CHANGELOG aktuell:** CHANGELOG.md und MASTER_DOC.md müssen aktuell sein | |
| ☑ | **DB-Archivierung anbieten:** User fragen ob translations.db archiviert werden soll (Regel 9) | |
| ☑ | **Start/End-Checklisten** aus WORKFLOW.md §2 erfüllt | |

---

# 🌐 GLOBALE REGELN {#globale-regeln}

> **Diese Regeln gelten IMMER, unabhängig vom Task-Typ.**

| # | Regel | |
|---|-------|---|
| 1 | **Maximale Parallelität:** Unabhängige Agents gleichzeitig spawnen | |
| 2 | **Sequenziell bei Abhängigkeiten:** Erst Context, dann Edit, dann Test | |
| 3 | **_Info.txt:** NUR bei expliziter User-Aufforderung oder Version-Sync berühren | |
| 4 | **Keine destruktiven Befehle:** git push, rm -rf, npm install -g — nur auf User-Request | |
| 5 | **Keine External Dependencies:** Keine Dependencies die wir selbst mit Code lösen können | |
| 6 | **gravity_index vor Service-Integration:** Nie Third-Party-Service aus Gedächtnis empfehlen | |
| 7 | **PREFLIGHT ANALYSIS:** Vor jedem Sync läuft preflight.js automatisch | |
| 8 | **Dual-Path-Copy (Native Mode):** Übersetzte Dateien in BEIDE Verzeichnisse kopieren | |
| 9 | **DB-Retention:** Vor grösserem Fix DB sichern, nach Session User fragen bzgl. Archivierung | |
| 10 | **SSOT:** Root UND core/archive/docs/ müssen identisch sein | |
| 11 | **Keine selbst lösbaren Dependencies:** Kein tmux, keine Lockfiles im Release | |
| 12 | **CHANGELOG:** Wird NIEMALS archiviert oder gelöscht. Bleibt IMMER live. | |

---

# 🏗️ INFRASTRUKTUR {#infrastruktur}

> **Fundamentale Systeme die task-übergreifend gelten.**

## DOKU-FLAG ↔ RUNTIME-FLAG TRENNUNG

| Universum | Beschreibung | Existenzort | Prüftiefe |
|-----------|-------------|-------------|------------|
| **DOKU-FLAG** | Status-Marker ohne Code-Bedeutung (BEHOBEN, OFFEN, BU-IDs, DD-IDs, Phasen-Tags) | NUR in .md-Dateien | Fundort-Zitat reicht |
| **RUNTIME-FLAG** | Beeinflusst Programmverhalten (`*_ENABLED`, DB-Spalten, CLI-Flags, GUI-Toggles) | Code + Config + DB | Echter Lauf, echter Input, Exit-Code |

**Erste Frage bei jedem neuen Flag:** "Beeinflusst das den Programmablauf?"
→ JA = RUNTIME-FLAG-Pfad | NEIN = DOKU-FLAG-Pfad | Unklar = beide Pfade parallel

**Kollisionsregel:** Ein Begriff darf NIE in beiden Universen gleichzeitig auftauchen.

## PER-FOLDER INDEX SYSTEM

**Regel:** ZUERST den Folder-INDEX lesen, DANN den Code. INDEX ist SSoT für Funktions-Lokalisierung.

| Ordner | Datei | Beschreibung |
|--------|-------|---------------|
| `core/src/` | `INDEX.md` | 27 Dateien, ~180 Funktionen |
| `core/src/plugins/` | `INDEX.md` | 2 Dateien, 23 Methoden |
| `core/src/adapters/` | `INDEX.md` | 1 Datei, 15 abstrakte Methoden |
| `core/src/providers/` | `INDEX.md` | 1 Datei, 16 Funktionen |
| `core/src/gui/` | `INDEX.md` | 2 Dateien, ~45 Funktionen |
| `core/scripts/` | `INDEX.md` | 20 Dateien |
| `core/tests/` | `INDEX.md` | 9 Dateien |

**Workflow:** Task → Folder-INDEX lesen → Funktion identifizieren → NUR betroffene Funktion lesen → Ändern → INDEX aktualisieren

## TRACEABILITY-GUARANTEES

**3 Schutzschichten:**
- **Schicht 1 (Code):** Per-Folder INDEX.md + `[CL:TAG]`-Verweise
- **Schicht 2 (Log):** CHANGELOG.md — chronologisch, irreversibel
- **Schicht 3 (Archiv):** FREEZE_INDEX.md — Glossary mit Kausalitäts-Ketten

**Git-Log Fallback:** Wenn Funktion nicht in CHANGELOG/INDEX findbar → via `git blame`/`git log -S` Ursprungscommit ermitteln → rückwirkend eintragen.

**Referenz-Integrität:** Jeder Code-Eintrag im Folder-INDEX MUSS mindestens einen `[CL:TAG]`-Verweis haben.

**Zero-Delete-Garantie:** Temporäre Doku wird NUR gelöscht wenn: Glossary-Eintrag im FREEZE_INDEX + MASTER_FREEZE-Referenz + 100%-Integritäts-Verifikation + User-Bestätigung.

## DB-RETENTION & BACKUP

**Ablage:** `core/archive/dbold/`
**Format:** `translations_YYYY-MM-DD_{fix-tag}.tar.gz`

**Flow:** Vor Fix sichern → Fix implementieren → Nach Fix analysieren → Report → Session-Ende: User fragen.

**Persistente DB-Dokumente:** `DB_TREND_REPORT.md` + `DB_STATISTICS.md` in `core/archive/dbold/`.

## WORKFLOW-AUTOMATION (Auto-Trigger)

| Trigger | Aktion |
|---------|--------|
| **Code-Change** | Folder-INDEX.md prüfen + CHANGELOG.md mit `[CL:TAG]` ergänzen |
| **Doku-Schwelle** (>10 Analysedokumente) | Aufgabe pausieren, User auf DOKU-CLEAN hinweisen |
| **DB-Schwelle** (>100 geänderte Einträge) | User fragen bzgl. DB-Archivierung |

---

## § HISTORISCHE REFERENZ-BEISPIELE

- **BU-035 bis BU-039** (Watermark-Scope-Bug, GOOGLE_FREE_ENABLED-Verwaisung, dispatcher.js-Doppelprüfung, logger.js-Silent-Catch, NUL-Datei) — Ursprungsfall für 🟢/🟡-Kategorisierung und DOKU-FLAG/RUNTIME-FLAG-Trennung.
- **Flag-Taxonomie / Tot-Flag-Detektor / Dynamische Verifikation** (Prompts A/B/C) — Vorläufer der WRITE/READ/USER-CONTROL-Klassifikation.

---

*Playbook erstellt 2026-06-19, task-sortiert restrukturiert 2026-06-22.*
