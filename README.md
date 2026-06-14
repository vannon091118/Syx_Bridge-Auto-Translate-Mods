# Syx-Bridge - The Slaver's Translator (v0.14.0)

![Banner](Banner.png)

---

## 🛡️ Security & Integrity Update / Sicherheits-Update
**[EN] Why the Clean Slate?**  
This repository has been **re-initialized from scratch (git init)** to establish a clean baseline. During a routine audit, several critical NPM dependency chain vulnerabilities were flagged. To thoroughly eliminate these risks—and ensure no compromised packages remain in the project's history—we performed a complete GitHub relaunch. The code has been deep-cleaned and all dependencies have been updated to secure versions.

**[DE] Warum der GitHub-Relaunch?**  
Dieses Repository wurde **komplett neu aufgesetzt (git init)**. Bei einer Prüfung wurden kritische Schwachstellen in der NPM-Abhängigkeitskette (Dependency Chain) entdeckt. Um diese Sicherheitsrisiken restlos zu beseitigen und sicherzustellen, dass sich keine kompromittierten Pakete in der Versionshistorie befinden, haben wir einen sauberen Relaunch durchgeführt. Alle Abhängigkeiten wurden aktualisiert und das Projekt auf einen sicheren Stand gebracht.

**🔒 Strict Versioning Policy (Internal Standard)**  
To prevent future "dependency chain" vulnerabilities and automatic, unverified updates, this project enforces **Strict Versioning** in `package.json`. The use of carets (`^`) or tildes (`~`) is strictly prohibited. All dependencies must be pinned to exact versions (e.g., `"axios": "1.17.0"`). Any new dependency or version bump must be manually audited before being committed.

---

## 📢 Project Status: The Current Reality (v0.14.1)

### 📸 Dashboard Showcase (v0.14.2 GUI Overhaul & Features in Gamer-Ton 🎮)

Here is a visual walk-through of the UI, featuring the newly minted v0.14.2 setup. No boring corporate stuff here—just raw power, ready to translate your favorite mods!

---

#### 1. 🔍 Inline Database Inspector & Home - `Screenshot 2026-06-14 060657.png`
![Inline DB Inspector](Screenshot%202026-06-14%20060657.png)
> **DE:** **Der "Kein-Bock-auf-Code"-Modus.** Wenn die Engine idlet, schläft sie nicht, sondern serviert dir direkt den Datenbank-Browser. Suchbegriffe eintippen und die DB filtert in Echtzeit. Ideal, um fehlerhafte Übersetzungen aufzuspüren, bevor sie ins Spiel gerollt werden.
> **EN:** **The Microscope of Truth / Lazy Modder's Dream.** When the engine is idle, it displays the Database Browser directly in the center stack. Search, click, edit, save—no SQL degree required. Type search queries and watch the DB filter lines on the fly.

#### 2. ⚙️ Settings Dropdown Overlay - `Screenshot 2026-06-14 060726.png`
![Settings Dropdown](Screenshot%202026-06-14%20060726.png)
> **DE:** **Das versteckte Arsenal.** Ein Klick auf "API & EINSTELLUNGEN" und die Configs (Bridge-Mode, API Keys, Provider-Auswahl) klappen clean herunter. Das HUD bleibt sauber, bis du die Regler für maximale AI-Power aufdrehen willst.
> **EN:** **The Hidden Arsenal.** Click "API & EINSTELLUNGEN" and watch the configuration drawer drop down like a tactical supply package. API Keys, Bridge-modes, and models, all tucked away until you need them.

#### 3. 📝 Database Entry Detail Editor - `Screenshot 2026-06-14 060738.png`
![Entry Editor](Screenshot%202026-06-14%20060738.png)
> **DE:** **Der Text-Changer.** Klicke auf eine Zeile und bearbeite direkt den Inhalt. Bestätigen, speichern und die Übersetzung ist live geupdatet. Simpel, direkt, effektiv.
> **EN:** **The Text Manipulator.** Just click on any table row to modify the translation. Hit save, and it's instantly patched in the database. Boom. Done.

---

### 🚀 Recent Changelog (Since Git Init)
- **GUI Layout Overhaul (v0.14.2):** Moved configuration panels into a collapsible settings overlay, cleaned up the main layout, and integrated the Database Browser natively into the idle screen.
- **Improved Progress & Heartbeat:** Enhanced visibility of the progress indicator, added active thread counts, phase tracking, and resolved UI state restore issues on page reloads.
- **Mod Directory Structure in Patches:** Fixed path generation for "Patch Mode" so translated files preserve the correct mod subdirectory structure inside `BridgeCore`.
- **Strict Versioning Policy:** Enforced exact version pins across dependencies in `package.json` to shield against upstream supply chain exploits.
- **Refactoring & Helpers:** Added `rewrite.py` and `rewrite.js` to handle HTML modifications and cleaned up core process exits for workshop exports.

### 🚀 Key Features & V71 Optimization (EN)
- **V71 Native Support:** Optimized for the latest *Songs of Syx* V71 update. The engine now handles new text structures and mod formats natively.
- **60fps Web-GUI:** A fluid dashboard (localhost:3000) for real-time monitoring of translation progress, CPU/RAM usage, and AI "thinking" streams.
- **Argos-Turbo:** Local, free translations using Base64-packet-batching. Up to 10x faster than traditional local methods.
- **DB Auditor (Tier A):** High-level AI audits the SQLite database to repair damaged technical markers (like `__VAR0__`) automatically.
- **Variable Shielding:** Game variables `{NAME}` or `<tag>` are protected by tokens `[[0]]` during translation to prevent game crashes.

### 🚀 Highlights & V71 Optimierung (DE)
- **V71 Native Support:** Optimiert für das neueste *Songs of Syx* V71 Update. Die Engine versteht die neuen Textstrukturen und Mod-Formate nativ.
- **60fps Web-GUI:** Ein flüssiges Dashboard (localhost:3000) zur Echtzeit-Überwachung von Fortschritt, CPU/RAM-Last und dem KI-"Live-Stream".
- **Argos-Turbo:** Kostenlose, lokale Übersetzungen via Base64-Paket-Bündelung. Bis zu 10x schneller als herkömmliche lokale Methoden.
- **DB Auditor (Tier A):** Eine Elite-KI prüft die SQLite-Datenbank und repariert beschädigte Platzhalter (`__VAR0__`) automatisch.
- **Variable Shielding:** Spiel-Variablen `{NAME}` oder `<tag>` werden durch Token `[[0]]` geschützt, um Spielabstürze zu verhindern.

---

## 🖥️ GUI Instructions / GUI Anleitung

### English
1. **Launch:** Run `start.bat`. The bridge will initialize and automatically open your default browser.
2. **Dashboard:** Monitor the "Heartbeat" (CPU/RAM) and see exactly which file is currently being processed.
3. **Inspector:** Use the built-in Inspector to review translations in the SQLite database before they are deployed as a patch.
4. **Bridge-Mode:** By default, it creates a "Patch Mod" in your `%APPDATA%`, keeping your original files untouched.

### Deutsch
1. **Start:** `start.bat` ausführen. Die Bridge initialisiert sich und öffnet automatisch den Browser.
2. **Dashboard:** Überwache den "Heartbeat" (CPU/RAM) und sieh live, welche Datei gerade übersetzt wird.
3. **Inspector:** Nutze den integrierten Inspector, um Übersetzungen in der SQLite-Datenbank zu prüfen, bevor sie als Patch ausgespielt werden.
4. **Bridge-Mode:** Standardmäßig wird ein "Patch Mod" in deinem `%APPDATA%` erstellt – deine Original-Mods bleiben sauber.

---

## 📂 Repository Structure
- `core/`: The translation engine (Node.js, SQLite, AI Dispatcher).
- `V70/` & `V71/`: Version-specific mapping and reference data for Songs of Syx versions.
- `scripts/`: Maintenance tools for database auditing, syntax checks, and "Redteam" baseline testing.

---

## 🛠️ Setup (Quickstart)

1. **Install:** [Node.js](https://nodejs.org/) (v18+).
2. **Prepare:** Run `npm install` in the `core` folder.
3. **Config:** Rename `.env.example` to `.env` and add your **Gemini API Key**.
4. **Run:** Double-click `start.bat` in the root directory.

---

### 💬 Support & Feedback
Bugs or logs: **vannon858@gmail.com**  
Please always attach `stdout.log` and `stderr.log` from the `core` directory.

*Happy Slaver-Management! / Viel Spaß beim Sklaven-Managen!*
