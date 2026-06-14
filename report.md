# Analyse-Bericht: Pipeline-Optimierung & Risiko-Management

## 1. Status Quo: Die Pipeline (v0.15.0a)
Die SyxBridge nutzt ein zweistufiges System zur Qualitätssicherung und Kostenoptimierung:

*   **Extraktion:** Strings werden aus `.txt`-Dateien gesammelt.
*   **Risiko-Berechnung (`AvgRisk`):** Ein statisches Punktesystem bewertet Texte nach Länge und technischen Markern (z. B. `__VAR0__`).
*   **Dispatching:** 
    *   **Low-Risk (< 1.5):** Argos (Lokal) oder Google Free.
    *   **High-Risk (>= 4.0):** Qualitäts-Modelle (Tier A).
*   **Validierung:** Nach der Übersetzung prüft der `validator.js` die Integrität der Platzhalter.

## 2. Optimierung: Dynamisches Risiko-Scoring ("1risk score")
Anstatt sich auf statische Schätzungen zu verlassen, wird die Integration von Google Translate als **aktiver Risiko-Sensor** empfohlen:

### Konzept: Der Google-Stresstest
1.  **Parallele Test-Übersetzung:** Umstellung von `callGoogleTranslateFree` auf parallele Anfragen (Concurrency) für maximale Geschwindigkeit.
2.  **Sofortige Validierung:** Das Ergebnis wird sofort gegen den `validator.js` geprüft.
3.  **Dynamisches Hochstufen:** Wenn Google Platzhalter beschädigt, wird der `riskScore` des Eintrags sofort auf das Maximum gesetzt. Dies zwingt den Dispatcher, für diesen Batch ein Tier-A-Modell zu wählen.

## 3. Strategie für Modell-Tiers (OpenRouter Integration)
Um Kosten zu sparen, ohne die Qualität zu opfern, sollten wir die "Teuren Modelle" (Tier A) neu definieren. OpenRouter bietet hervorragende kostenlose oder extrem günstige Alternativen, die herkömmliche Modelle in der Logik übertreffen:

### Aktuelle Tier A (Polisher) Implementierung:
In der Datei `src/config-runtime.js` sind derzeit folgende Modelle als Qualitäts-Standard ("Polisher") hinterlegt:
*   **Gemini:** `gemini-2.0-pro`
*   **Groq:** `llama-3.3-70b-versatile`

### Empfohlene OpenRouter Free Optionen für Tier A:
Um Kosten zu minimieren, können wir in der `dispatcher.js` gezielt auf kostenlose OpenRouter Modelle routen, wenn der `AvgRisk` hoch ist. OpenRouter bietet oft "Free"-Versionen von Top-Modellen an:
*   `google/gemini-2.0-flash-exp:free`
*   `meta-llama/llama-3.1-405b-instruct:free` (falls verfügbar)
*   `deepseek/deepseek-chat:free`

### Nächste Schritte:
1.  **Erweiterung der `ConfigRuntime`:** Definition einer expliziten `FREE_TIER_A` Liste für OpenRouter.
2.  **Dispatcher-Logik:** Wenn `AvgRisk >= 4`, priorisiere `openrouter/free` Modelle vor den kostenpflichtigen Gemini Pro Modellen.

## 4. Analyse P0: Mod-Deployment & Reset-Logik

### Aktueller Stand (Warum es nicht wie gewünscht läuft):
*   **Patch-Mode Dominanz:** Die Bridge ist aktuell so eingestellt, dass sie standardmäßig Patches erstellt und diese in einem `BridgeCore` Mod im `%APPDATA%`-Verzeichnis bündelt. Das führt dazu, dass Nutzer die Mods im Launcher doppelt sehen oder der "Core-Mod" manuell aktiviert werden muss.
*   **Native-Mode Isolation:** Der Native-Mode überschreibt zwar Dateien im Workshop-Ordner, aber die **Reset-Funktion** ist unvollständig. Sie löscht derzeit nur die Patches im AppData-Ordner, stellt aber den Originalzustand des Steam-Workshop-Ordners nicht aus den Backups wieder her.
*   **Backup-Handling:** Backups werden zwar unter `core/backups/` erstellt, sind aber "passiv" – sie werden beim Reset nicht automatisch zurückkopiert.

### Empfohlene Maßnahmen (P0):
1.  **Patch-Mode Deaktivierung:** Den Patch-Mode vorläufig in der `index.js` und `config-runtime.js` als Standard deaktivieren (oder ganz entfernen), um Fokus auf Native-Override zu legen.
2.  **Direkter Workshop-Override:** Sicherstellen, dass `NATIVE_MODE` immer den `MOD_ROOT` (Steam Workshop) als Ziel nutzt.
3.  **Aktiver Backup-Mechanismus:**
    *   **Vor dem Schreiben:** Jede Datei im Workshop-Ordner muss vor dem ersten Überschreiben in einen dedizierten Backup-Ordner geklont werden.
    *   **Integrierter Reset:** Die Reset-Funktion muss den Workshop-Ordner bereinigen (alle von der Bridge erzeugten `.txt` Dateien, die vom Original abweichen) und die Originale aus dem Backup-Verzeichnis 1:1 wiederherstellen.
4.  **Transparenz:** Der Nutzer muss im Dashboard sehen, ob ein Backup für eine Mod existiert und ob ein "Restore" möglich ist.

---
*Zusatz-Analyse vom: 14. Juni 2026*
