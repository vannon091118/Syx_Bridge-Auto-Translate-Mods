# Requirements: Native Windows GUI für SyxBridge

## Einleitung

SyxBridge wird derzeit über eine Web-GUI (Node.js Backend + Browser-Frontend auf localhost:3000) bedient. Diese Requirements definieren die Migration zu einer **nativen Windows GUI** ohne Browser-Fenster. Das Backend (Node.js) bleibt unverändert; nur das Frontend wird durch eine native Windows-Anwendung ersetzt.

Die neue GUI soll:
- Alle Kernfunktionen der Web-GUI bewahren (Pipeline-Visualizer, DB-Browser, Settings, API-Key Management, FCM Rankings, Runtime Score, DB-Repair, Backups, Mode-Status)
- Ein kohärentes, visuelles Designkonzept mit hoher Wahrnehmungsqualität bieten (ohne professionelle Grafiker)
- Workflow-getrieben sein: Benutzer können von Mod-Sortierung über Übersetzung bis zum Upload und zum Wechsel zu anderen Spielen fließend arbeiten
- Native Windows-Ästhetik vermitteln (nicht webisch wirken)
- Zukünftige Features vorbereiten (Mod Launcher, Mod Downloader, Multi-Provider Uploader, Live-Daten-Integration)

---

## Glossar

- **Pipeline**: Vier-Phasen-Prozess: SCAN → LLM → QA → SAVE
- **Mod**: Ein Spielinhalt-Paket (z.B. Songs of Syx oder RimWorld Mod)
- **Provider**: KI-Service-Anbieter (z.B. OpenAI, Anthropic, Google)
- **Batch-Size**: Anzahl der gleichzeitig zu übersetzenden Strings pro Durchlauf
- **DB-Browser**: Benutzeroberfläche zum Durchsuchen, Bearbeiten und Verwalten von Übersetzungseinträgen
- **FCM Rankings**: Echtzeit-Modell-Leistungskennzahlen (Tier, Latenz, Stabilität)
- **Runtime Score**: Automatisch berechnete Qualitätsmetriken nach abgeschlossenem Sync
- **Revisionen**: Versionsverlauf von bearbeiteten DB-Einträgen
- **API-Key**: Authentifizierungstoken für Provider-Services
- **Mod-Backup**: Sicherung eines Mod-Zustands (Liste + Restore-Funktion)
- **Mode-Status**: Betriebsmodus (NATIVE oder PATCH)
- **SSE**: Server-Sent Events (Echtzeitdatenfluss vom Backend zur GUI)
- **Native Windows Feel**: Fenster, Bedienelemente und Interaktionen folgen Windows-Konventionen (nicht webisch)

---

## Anforderungen

### Anforderung 1: Pipeline-Visualisierung

**User Story:** Als Benutzer möchte ich den Fortschritt meiner Übersetzungs-Pipeline in Echtzeit visualisiert sehen, damit ich den Status meines aktuellen Tasks nachvollziehe.

#### Akzeptanzkriterien

1. WHEN der Benutzer ein Sync startet, THE **Pipeline-Visualizer** SHALL vier Phasen visuell darstellen: **SCAN** → **LLM** → **QA** → **SAVE**
2. WHILE eine Phase läuft, THE **Pipeline-Visualizer** SHALL die aktuelle Phase hervorheben (z.B. visueller Fortschrittsbalken, farbliche Kennzeichnung oder animierter Übergang)
3. WHEN eine Phase abgeschlossen ist, THE **Pipeline-Visualizer** SHALL eine sichtbare Bestätigung anzeigen (z.B. Haken, grüne Färbung)
4. IF eine Phase fehlschlägt, THEN THE **Pipeline-Visualizer** SHALL den Fehler klar kommunizieren (z.B. rote Färbung, Fehlermeldung)
5. WHERE der Benutzer mehrere Syncs parallel verwalten kann, THE **Pipeline-Visualizer** SHALL pro Sync einen separaten Visualisierungs-Track zeigen

#### Abhängigkeiten
- Backend SSE-Feeds für Echtzeit-Status-Updates (existiert bereits in server.js)

---

### Anforderung 2: DB-Browser mit Suche und Bearbeitung

**User Story:** Als Benutzer möchte ich Übersetzungseinträge durchsuchen, bearbeiten und Revisionen einsehen, damit ich einzelne Strings korrigieren und deren Entwicklung verfolgen kann.

#### Akzeptanzkriterien

1. THE **DB-Browser** SHALL eine Suchfunktion bereitstellen, mit der Benutzer nach String-Keys, Werten oder Metadaten filtern können
2. WHEN der Benutzer einen Eintrag auswählt, THE **DB-Browser** SHALL den aktuellen Text in einem mehrzeiligen Eingabefeld zur Bearbeitung öffnen
3. WHEN der Benutzer einen Eintrag speichert, THE **DB-Browser** SHALL die Änderung in der Datenbank persistieren und den Benutzer bestätigen (z.B. "Gespeichert")
4. WHEN der Benutzer die Revisionen eines Eintrags anfordert, THE **DB-Browser** SHALL eine Liste aller Versionen dieses Eintrags mit Zeitstempel anzeigen
5. IF der Benutzer eine alte Revision anwählt, THEN THE **DB-Browser** SHALL die Änderungen zwischen alter und neuer Version visuell hervorheben

#### Abhängigkeiten
- Backend Endpoints für `/api/db/*` (Suche, Edit, Revisions) — existieren bereits

---

### Anforderung 3: Live-Konfigurierbare Settings

**User Story:** Als Benutzer möchte ich Provider, Modell, Sprache und Batch-Size ohne Neustart anpassen, damit ich schnell auf Anforderungen reagieren kann.

#### Akzeptanzkriterien

1. THE **Settings-Dropdown** SHALL folgende Eingabefelder bereitstellen: **Provider**, **Modell**, **Sprache**, **Batch-Size**
2. WHEN der Benutzer einen Wert ändert, THE **Settings-Dropdown** SHALL die Änderung sofort an das Backend senden (ohne Neustart erforderlich)
3. WHEN der Benutzer eine Einstellung speichert, THE **Settings-Dropdown** SHALL die neue Konfiguration persistieren (z.B. in einer Config-Datei)
4. IF eine Einstellung ungültig ist (z.B. Batch-Size < 1), THEN THE **Settings-Dropdown** SHALL eine Validierungsmeldung zeigen und die Änderung ablehnen

#### Abhängigkeiten
- Backend Endpoint `/api/config` (Get/Post) — existiert bereits

---

### Anforderung 4: API-Key Management

**User Story:** Als Benutzer möchte ich API-Keys für verschiedene Provider verwalten und testen, damit ich mehrere Services nutzen kann.

#### Akzeptanzkriterien

1. THE **API-Key-Modal** SHALL pro Provider ein separates Eingabefeld für den API-Key bereitstellen
2. WHEN der Benutzer einen API-Key eingibt, THE **API-Key-Modal** SHALL ein **Test**-Button anzeigen
3. WHEN der Benutzer auf **Test** klickt, THE **API-Key-Modal** SHALL den Key validieren (z.B. einfacher Ping-Request) und das Ergebnis anzeigen (Erfolg/Fehler)
4. WHEN der Benutzer einen Key speichert, THE **API-Key-Modal** SHALL die Änderung persistieren (verschlüsselt oder sicher gespeichert)
5. IF ein API-Key ungültig oder abgelaufen ist, THEN THE **API-Key-Modal** SHALL den Benutzer mit einer Warnung benachrichtigen

#### Abhängigkeiten
- Backend Endpoint `/api/key-check` — existiert bereits

---

### Anforderung 5: FCM Live Rankings

**User Story:** Als Benutzer möchte ich Echtzeit-Leistungskennzahlen der verfügbaren Modelle sehen, damit ich das beste Modell für meinen Task auswählen kann.

#### Akzeptanzkriterien

1. THE **FCM-Rankings-Panel** SHALL eine Live-Liste aller verfügbaren Modelle mit folgenden Kennzahlen anzeigen: **Tier** (z.B. Pro, Standard), **Ping** (Latenz in ms), **Stabilität** (Verfügbarkeit %)
2. WHEN eine Kennzahl aktualisiert wird, THE **FCM-Rankings-Panel** SHALL die Änderung in Echtzeit reflektieren (SSE-Feed)
3. WHERE der Benutzer ein Modell anwählen möchte, THE **FCM-Rankings-Panel** SHALL einen **USE**-Button pro Modell anzeigen
4. WHEN der Benutzer auf **USE** klickt, THE **FCM-Rankings-Panel** SHALL das Modell als aktiv setzen und die Settings aktualisieren

#### Abhängigkeiten
- Backend SSE-Feed `/api/fcm-rankings` — existiert bereits

---

### Anforderung 6: Runtime Score

**User Story:** Als Benutzer möchte ich Qualitätsmetriken nach abgeschlossenem Sync sehen, damit ich die Übersetzungsqualität beurteilen kann.

#### Akzeptanzkriterien

1. WHEN ein Sync abgeschlossen ist, THE **Runtime-Score-Panel** SHALL automatisch mit Qualitätsmetriken aktualisiert werden
2. THE **Runtime-Score-Panel** SHALL folgende Metriken anzeigen (Beispiele): **Durchschnittliche Konfidenz**, **Durchsatz (Strings/min)**, **Fehlerquote (%)**
3. WHILE ein Sync läuft, THE **Runtime-Score-Panel** SHALL minimiert sein (kann vom Benutzer geöffnet werden, um Live-Metriken zu sehen)
4. WHERE die Panel standardmäßig minimiert ist, THE **Runtime-Score-Panel** SHALL bei Bedarf vom Benutzer maximierbar sein

#### Abhängigkeiten
- Backend Endpoint `/api/runtime-score` — existiert bereits

---

### Anforderung 7: DB-Repair und Integrität

**User Story:** Als Benutzer möchte ich fehlerhafte Datenbankeinträge erkennen und reparieren, damit meine Übersetzungsdatenbank konsistent bleibt.

#### Akzeptanzkriterien

1. THE **DB-Repair-Button** SHALL mit visuellen Stufen (z.B. Blink-Häufigkeit oder Farbton) die kritikalität des DB-Zustands kommunizieren: Stufe 0 (grün) = OK, Stufe 4 (rot) = kritisch
2. WHEN der Benutzer auf **DB-Repair** klickt, THE **System** SHALL einen Reparaturprozess starten und Echtzeit-Logs anzeigen
3. WHEN die Reparatur abgeschlossen ist, THE **System** SHALL das Ergebnis mit Anzahl reparierten Einträgen anzeigen
4. IF ein Fehler während der Reparatur auftritt, THEN THE **System** SHALL einen Fehler-Report generieren und den Benutzer benachrichtigen

#### Abhängigkeiten
- Backend Endpoint `/api/db-repair` — existiert bereits

---

### Anforderung 8: Mod-Backups und Restore

**User Story:** Als Benutzer möchte ich Backups meiner Mod-Übersetzungen erstellen und bei Bedarf wiederherstellen, damit ich vor fehlgeschlagenen Operationen geschützt bin.

#### Akzeptanzkriterien

1. THE **Backups-Panel** SHALL eine Liste aller verfügbaren Backups anzeigen mit: **Backup-Name**, **Zeitstempel**, **Größe**
2. WHERE ein Backup vorhanden ist, THE **Backups-Panel** SHALL einen **Restore**-Button bereitstellen
3. WHEN der Benutzer auf **Restore** klickt, THE **System** SHALL den Backup-Prozess starten und Echtzeit-Status anzeigen
4. WHEN der Restore abgeschlossen ist, THE **System** SHALL den Benutzer bestätigen und den DB-Zustand aktualisieren
5. IF ein Fehler beim Restore auftritt, THEN THE **System** SHALL den Fehler melden und die vorherige Konfiguration beibehalten

#### Abhängigkeiten
- Backend Endpoint `/api/backups/*` — existiert bereits

---

### Anforderung 9: Mode-Status (NATIVE vs PATCH)

**User Story:** Als Benutzer möchte ich sehen, in welchem Betriebsmodus sich SyxBridge befindet, damit ich verstehe, wie die Übersetzungen angewendet werden.

#### Akzeptanzkriterien

1. THE **Mode-Status-Anzeige** SHALL permanent sichtbar sein und den aktuellen Modus anzeigen: **NATIVE** oder **PATCH**
2. WHEN sich der Modus ändert, THE **Mode-Status-Anzeige** SHALL die Änderung sofort reflektieren
3. WHERE Kontextinformation relevant ist, THE **System** SHALL kurze Erklärungen bereitstellen (z.B. "NATIVE: Mod-Dateien direkt modifiziert" vs. "PATCH: Separate Patch-Dateien")

#### Abhängigkeiten
- Backend Endpoint `/api/preflight-status` — existiert bereits

---

### Anforderung 10: Echtzeit-Logs und Terminal-Output

**User Story:** Als Benutzer möchte ich Live-Logs und Terminal-Output sehen, damit ich den Betriebszustand verfolgen und Fehler debuggen kann.

#### Akzeptanzkriterien

1. THE **Terminal-Panel** SHALL einen Live-Log-Stream mit Echtzeit-Einträgen anzeigen
2. WHEN neue Log-Einträge hinzukommen, THE **Terminal-Panel** SHALL diese automatisch an das Ende anfügen
3. WHERE Logs sehr lang werden, THE **Terminal-Panel** SHALL Scrolling und möglicherweise eine Puffergröße (z.B. letzte 1000 Zeilen) unterstützen
4. WHERE Log-Einträge verschiedene Severity-Level haben (Info, Warnung, Fehler), THE **Terminal-Panel** SHALL sie farblich oder typografisch unterscheiden

#### Abhängigkeiten
- Backend SSE-Feed für Log-Streaming — existiert bereits in server.js

---

### Anforderung 11: Native Windows GUI – Fenster und Interaktion

**User Story:** Als Benutzer möchte ich mit einer echten Windows-Anwendung interagieren (kein Browser-Fenster), damit die Anwendung sich wie native Software anfühlt.

#### Akzeptanzkriterien

1. THE **GUI-Fenster** SHALL ein natives Windows-Fenster sein (nicht Electron/Tauri in dieser Phase — nur Planung für zukünftige Implementierung)
2. THE **GUI-Fenster** SHALL folgende Standard-Windows-Features unterstützen: Minimieren, Maximieren, Schließen, Resize
3. WHILE die Anwendung inaktiv ist (z.B. 30 Sekunden ohne Benutzer-Aktion), THE **Backend** SHALL in einen Idle-Modus übergehen (existierende Auto-Shutdown-Logik beibehalten)
4. WHEN die Anwendung geschlossen wird, THE **Backend** SHALL sauber beendet werden und Ressourcen freigeben

#### Abhängigkeiten
- Zukünftige Implementierung mit Electron oder ähnlichem Framework
- Backend Shutdown-Logik (existiert bereits)

---

### Anforderung 12: Workflow-getriebene UI-Navigation

**User Story:** Als Benutzer möchte ich einen natürlichen Workflow durchlaufen (Mod-Sortierung → Übersetzung → Spielen → Stöbern → Hochladen → neues Spiel), ohne zwischen verwirrenden Schnittstellen zu navigieren.

#### Akzeptanzkriterien

1. THE **Hauptnavigation** SHALL die typischen Phasen eines User-Workflows als primäre Tabs oder Panels organisieren
2. WHEN ein Benutzer eine Phase abschließt (z.B. Sync fertig), THE **System** SHALL automatisch zur nächsten logischen Phase navigieren oder sie hervorheben
3. WHERE Kontextualität erforderlich ist, THE **System** SHALL relevante Daten (z.B. gerade übersetzten Mod-Namen) zwischen Panels weitertragen
4. WHERE eine Aktion optional ist, THE **System** SHALL dem Benutzer die Möglichkeit geben, sie zu überspringen oder zur vorherigen Phase zurückzugehen

#### Abhängigkeiten
- Klare Definition der Workflow-Phasen (Sortierung, Scan, LLM, QA, Save, Upload, etc.)

---

### Anforderung 13: Visuelles Design – Systemstandards statt Custom Shell

**User Story:** Als Benutzer möchte ich eine visuell ansprechende GUI auf Basis von Windows-Systemstandards, damit die Anwendung natürlich wirkt und Performance für die Arbeit erhalten bleibt.

#### Akzeptanzkriterien

1. THE **GUI** SHALL ausschließlich native Windows-Steuerelemente verwenden (kein Custom-Shell-Design, kein neugezeichnete Buttons/Checkboxen)
2. THE **Design** SHALL das Windows-Farbschema des Systems respektieren (Dark Mode / Light Mode automatisch)
3. THE **Highlights** (z.B. aktive Phasen, laufende Prozesse) SHALL durch Gewichtung, Größe und Farbe unterschieden werden — NICHT durch animierte Effekte oder GPU-intensive Visualisierungen
4. WHERE Datenvisualisierung erforderlich ist, THE **System** SHALL einfache, aber aussagekräftige Formen nutzen (einfache Balken, Punkte, Zahlen statt Gradienten oder Animationen)
5. THE **GUI** SHALL keine Platzhalter-Elemente anzeigen (nur echte Daten oder "Keine Daten verfügbar")
6. THE **Performance-Budget** SHALL garantieren, dass UI-Rendering maximal 5% der CPU-Zeit während Übersetzungs-Prozessen beansprucht

#### Abhängigkeiten
- Native Windows API oder Electron/Tauri mit nativen Steuerelementen
- Benchmark für UI-Performance-Budget

---

### Anforderung 14: Prozess-Indikatoren für alle laufenden Operationen

**User Story:** Als Benutzer möchte ich für jeden laufenden Prozess einen visuellen Indikator sehen, damit ich den Status des Systems jederzeit überblicken kann.

#### Akzeptanzkriterien

1. EVERY laufende Operation (Scan, LLM, QA, Save, DB-Repair, Restore, Upload) SHALL einen visuellen Indikator in der UI erhalten
2. THE **Indikator** SHALL zeigen: Operation-Name, aktueller Fortschritt (% oder Schritt-Nummer), geschätzte verbleibende Zeit
3. THE **Indikator** SHALL nutzen nur einfache Elemente (Fortschrittsbalken, Zahlen, Status-Text) — KEINE Animationen oder Custom-Grafiken
4. WHEN eine Operation abgeschlossen ist, THE **Indikator** SHALL das Abschluss-Datum/Uhrzeit und das Ergebnis (Erfolg/Fehler) anzeigen
5. IF eine Operation fehlschlägt, THEN THE **Indikator** SHALL Fehlermeldung und (falls möglich) Abhilfemaßnahmen zeigen
6. WHERE mehrere Operationen parallel laufen, THE **System** SHALL pro Operation einen separaten Indikator anzeigen (keine Vermischung)

#### Abhängigkeiten
- Backend Endpoints liefern Operation-Status, Fortschritt, ETA (existieren bereits)
- Logging-System trackt alle Operation-Events (existiert bereits)

---

### Anforderung 15: Live-Datenströme an strategischen Stellen – nur echte, aussagekräftige Daten

**User Story:** Als Benutzer möchte ich live Daten sehen, die für meine aktuelle Aufgabe relevant sind, damit ich schnell Entscheidungen treffen kann — aber KEINE Platzhalter-Werte.

#### Akzeptanzkriterien

1. WHERE ein Sync läuft, THE **System** SHALL Live-Provider-Status (Ping, Verfügbarkeit) anzeigen — NUR wenn tatsächlich verfügbar, sonst "Nicht verfügbar"
2. WHERE die Pipeline läuft, THE **System** SHALL aktuelle Durchsatzmetriken anzeigen (Strings/min, verbleibende Zeit) — basierend auf echten Messungen, nicht geschätzt
3. WHILE ein User auf dem DB-Browser arbeitet, THE **System** SHALL aktuelle DB-Statistiken anzeigen (Gesamteinträge, übersetzt, noch zu tun) — gemessen zur Anzeigezeit
4. IF Live-Daten temporär nicht verfügbar sind, THEN THE **System** SHALL "Daten werden aktualisiert..." oder ähnliches anzeigen — KEINE Platzhalter-Zahlen
5. WHERE keine echten Daten vorhanden sind (z.B. noch kein Sync durchgeführt), THE **System** SHALL das klar kommunizieren: "Keine Daten" statt leere Felder

#### Abhängigkeiten
- Backend SSE-Feeds für verschiedene Datenquellen (existieren bereits)
- Daten-Validierung: nur echte Messungen anzeigen

---

### Anforderung 16: System-Health und Provider-Status – nur echte Status-Informationen

**User Story:** Als Benutzer möchte ich den Gesundheitszustand des Systems und der Provider überblicken, damit ich Probleme früh erkennen kann.

#### Akzeptanzkriterien

1. THE **System-Health-Panel** SHALL folgende Indikatoren anzeigen (nur wenn verfügbar): **Backend-Status** (Online/Offline), **Datenbank-Status** (Okay/Fehler/Warnung), **verfügbarer Speicher**
2. WHERE ein Indikator nicht verfügbar ist, THE **System** SHALL "-" oder "Nicht gemessen" anzeigen — KEINE Platzhalter-Werte (z.B. nicht "0" für Speicher)
3. WHEN der Benutzer ein Provider-Status-Badge anklickt, THE **System** SHALL detaillierte Informationen anzeigen: **letzte Anfrage** (Zeitstempel), **Erfolgsquote** (nur wenn >0 Anfragen), **Rate-Limits** (nur wenn vom Provider gemeldet)
4. IF ein kritisches Problem erkannt wird (z.B. Backend offline, Speicher <100MB), THEN THE **System** SHALL eine prominente Warnung anzeigen mit konkreten Abhilfemaßnahmen
5. WHERE Provider temporär nicht erreichbar sind, THE **System** SHALL "Nicht erreichbar" anzeigen statt Platzhalter-Metriken

#### Abhängigkeiten
- Backend Endpoint `/api/system-health` — existiert bereits
- Daten-Validierung: nur echte Metriken

---

## Zusammenfassung der Akzeptanzkriterien nach Testtyp

| Anforderung | Testtyp | Beispiel |
|---|---|---|
| 1. Pipeline-Visualisierung | Integration | Sync starten, Phase-Übergänge verifizieren |
| 2. DB-Browser | Integration | Suche, Edit, Revisionen in GUI testen |
| 3. Settings | Integration | Konfiguration ändern, Persistierung prüfen |
| 4. API-Key Management | Integration | Key eingeben, testen, speichern |
| 5. FCM Rankings | Integration | Live-Feed aktualisieren, Modell wechseln |
| 6. Runtime Score | Integration | Sync durchführen, Metriken prüfen |
| 7. DB-Repair | Integration | Fehler simulieren, Repair ausführen |
| 8. Mod-Backups | Integration | Backup erstellen, Restore durchführen |
| 9. Mode-Status | Integration | Betriebsmodus wechseln, Anzeige aktualisieren |
| 10. Echtzeit-Logs | Integration | Logs streamen, Puffer prüfen |
| 11. Native Fenster | Smoke | Fenster öffnen, Standard-Controls testen |
| 12. Workflow-Navigation | Integration | User Journey durchlaufen |
| 13. Visuelles Design | Acceptance | Design-Konsistenz verifizieren |
| 14. Live-Datenströme | Integration | SSE-Feeds aktiv, Fallback bei Ausfall |
| 15. System-Health | Integration | Health-Panel prüfen, Provider-Status anzeigen |
| 16. Zukünftige Features | Architektur | Modularität + Stabilitäts-Verträge |



### Anforderung 17: Vorbereitung für zukünftige Features (Mod Launcher, Downloader, Uploader)

**User Story:** Als Produktentwickler möchte ich die GUI so architekturieren, dass zukünftige Features (Mod Launcher, Downloader, Multi-Provider Uploader) elegant integriert werden können.

#### Akzeptanzkriterien

1. THE **GUI-Architektur** SHALL modular aufgebaut sein, mit separaten, austauschbaren Komponenten für Übersetzung, Spielstart, Downloads und Uploads
2. WHERE neue Features hinzugefügt werden, THE **GUI** SHALL diese als neue Tabs oder Workflow-Phasen integrieren, ohne existierende Funktionen zu stören
3. THE **State-Management** SHALL zentral organisiert sein, sodass Daten zwischen Komponenten konsistent bleiben
4. WHILE zukünftige Features entwickelt werden, THE **API-Kontrakt** zwischen Frontend und Backend SHALL stabil bleiben (Versionierung falls nötig)

#### Abhängigkeiten
- Klare Frontend-Architektur (z.B. Komponenten-basiert)
- Backend API versioniert oder erweiterbar

---

### Anforderung 18: Keine Platzhalter-UI-Elemente

**User Story:** Als Benutzer möchte ich nur relevante Informationen und Bedienelemente sehen, damit die Benutzeroberfläche klar und fokussiert bleibt.

#### Akzeptanzkriterien

1. THE **UI** SHALL keine leeren Placeholder-Elemente anzeigen (z.B. "Loading...", "---", "N/A" wo Daten vorhanden sein sollten)
2. WHEN Daten nicht verfügbar sind, THE **UI** SHALL eine klare Nachricht anzeigen: "Keine Daten verfügbar" oder "Warte auf Daten..." — NICHT "---" oder Leerzeichen
3. WHERE ein Feature noch nicht aktiviert ist, THE **UI** SHALL den Button/Panel grau oder versteckt darstellen mit Tooltip: "Verfügbar nach [Bedingung]"
4. EVERY UI-Element (Button, Panel, Feld) SHALL einen konkreten Zweck haben und nur sichtbar sein, wenn dieser Zweck erfüllbar ist
5. THE **Default-Ansicht** SHALL nur die TOP-3 aktivsten/relevantesten Informationen zeigen; weitere Details auf Anfrage

#### Abhängigkeiten
- Klare Daten-Validierung im Backend
- UI-State-Management prüft, was anzeigbar ist
