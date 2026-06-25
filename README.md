# SyxBridge

<p align="center">
  <img src="screenshots/gui-running.png" alt="SyxBridge Dashboard — Live Run" width="720">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/version-v0.23.0-5B4CF5?style=for-the-badge&logo=git" alt="Version">
  <img src="https://img.shields.io/badge/tests-111%20PASS-2ECC71?style=for-the-badge&logo=checkmarx" alt="Tests">
  <img src="https://img.shields.io/badge/score-90.1%25-F39C12?style=for-the-badge" alt="Score">
  <img src="https://img.shields.io/badge/cache-3%2C288%20strings-8E44AD?style=for-the-badge" alt="Cache">
  <img src="https://img.shields.io/badge/watermarks-0-27AE60?style=for-the-badge" alt="Watermarks">
  <img src="https://img.shields.io/badge/license-MIT-555?style=for-the-badge" alt="License">
</p>

---

> *"Ich wollte nur meine Mods auf Deutsch spielen. Jetzt hab ich eine KI-Pipeline mit Web-Dashboard, Key-Rotation, Capability-Matrix und Stresstest-System. Irgendwas ist schiefgelaufen."*

Mod-Übersetzungs-Pipeline für Strategiespiele. Batch-übersetzt ganze Mod-Ordner via LLM, schützt Game-Terme, cached dauerhaft in SQLite und schreibt direkt in deine Mod-Dateien. Läuft lokal, kostet nach dem ersten Durchlauf fast nix.

---

## Wofür ist das hier?

**Du hast Mods. Die sind auf Englisch. Das nervt.**

Drei reale Fälle:

| Situation | Was SyxBridge macht |
|:---|:---|
| 50 Mods, alle EN, Familie will mitspielen | `start.bat` → Kaffee holen → Mods auf DE |
| Du hast einen Mod veröffentlicht, Leute wollen ihn übersetzt | Patch-Mode: generiert separaten Übersetzungsmod, Original bleibt unangetastet |
| Google Translate zerstört deinen Lore | Glossar-System, Placeholder-Schutz, LLM-Audit-Pass — Begriffe bleiben konsistent |

---

## Was es tatsächlich tut

```
📁 Scan     → Findet alle übersetzbaren Strings im Mod-Ordner
🛡️ Shield   → Ersetzt Platzhalter ({NAME}, {VAR}) mit internen Markern
🤖 Translate→ LLM übersetzt. Schlechtes Ergebnis? Zweites Modell prüft nach.
✨ Polish   → Lore-Anpassung, Glossar, Stil
💾 Cache    → SQLite. Nächster Run: nur neue Strings kosten API-Budget.
📝 Write    → Direkt in Mod-Dateien (Native) oder als separater Patch-Mod
```

Keine Black Box. Der Dashboard zeigt dir live was passiert — welcher String gerade übersetzt wird, welcher Provider antwortet, was das Ergebnis ist.

---

## Smart Routing — 8 Provider

Das System hat eine Capability-Matrix. Du gibst Strings rein, es wählt den besten verfügbaren Provider. Automatische Key-Rotation gegen Rate-Limits. Keys liegen lokal in deiner `.env`.

| Tier | Provider | Anforderung |
|:---|:---|:---|
| 🟢 Free | Google Translate (Built-in), FCM Daemon | Nix |
| 🟡 Offline | Argos Translate | Nix (lokale Modelle) |
| 🔵 API | Groq, OpenRouter, Gemini, NVIDIA NIM | API-Key |
| ⚡ Lokal | Ollama | Laufendes Ollama + GPU |

---

## Das Dashboard

| Idle — DB Browser | Run — Live Terminal |
|:---:|:---:|
| ![Idle](screenshots/gui-idle.png) | ![Running](screenshots/gui-running.png) |
| 3.288 gecachte Strings durchsuchen, editieren, Revisionshistorie | Live-Prompts, Provider-Status, Progress — kein Rätselraten |

---

## In-Game — echte Ergebnisse

| Vollständig übersetzt | Traits + UI | Teilweise (noch nicht im Cache) |
|:---:|:---:|:---:|
| ![Vargen DE](screenshots/vargen-de.jpg) | ![Onari DE](screenshots/onari-de.jpg) | ![Garthimi mixed](screenshots/garthimi-mixed.jpg) |

Das dritte Bild ist normal beim ersten Run. Zweiter Lauf: Cache trifft, alles konsistent.

---

## Quickstart

```bash
# Node.js v18+ installieren (nodejs.org)

git clone https://github.com/vannon091118/Syx_Bridge-Auto-Translate-Mods.git
cd Syx_Bridge-Auto-Translate-Mods

# Optional: .env.example → .env, API-Key rein (läuft auch ohne, Free-Tier)

start.bat
# → Dependencies installieren, Server starten, Browser öffnen
```

`localhost:3000` öffnet sich. Mod-Pfad eintragen, Sprache wählen, **Apply Changes**, **Start**. Fertig.

---

## Native vs. Patch

- **Native** *(Standard)*: Überschreibt direkt in deinen installierten Mod-Dateien. Backup wird vorher automatisch angelegt.
- **Patch** *(`.env` opt-in)*: Generiert einen separaten Übersetzungsmod-Ordner. Original-Dateien werden nicht angefasst. Gedacht für Modder die eine Übersetzung in den Workshop hochladen wollen.

---

## Ehrlicher Status

> [!CAUTION]
> Alpha. Ich spiele täglich damit, aber es ist noch keine stabile Release-Version. Setzt du es ein, teste vorher auf einem Backup.

| Metrik | Wert |
|:---|:---|
| Übersetzte Strings im Cache | 3.288 |
| Watermarks | 0 |
| Runtime Score | 90.1% |
| Tests | 111 PASS · 0 FAIL |
| Plattform | Windows (Linux experimentell) |

> [!NOTE]
> Releases bekommen `-untested` im Tag bis jemand außer mir das auf einer anderen Maschine bestätigt hat. Kein Marketingsprech. Das ist einfach der Stand.

---

## Roadmap

- [x] **Phase 1** — Songs of Syx: Vollständige Pipeline, Plugin-Architektur, Web-Dashboard, 8 Provider
- [ ] **Phase 2** — RimWorld: Adapter-Hooks, Def-Parser, XML-Exporter, Mod-Folder-Scanner
- [ ] **Phase 3** — Mod-Loader: DAG Load-Order, Conflict-Detection, SteamCMD Integration
- [ ] **Phase 4** — Community: Kenshi, Stardew Valley, geteilte Glossar-Caches

---

## Bugs melden

Email: [vannon858@gmail.com](mailto:vannon858@gmail.com)

> [!WARNING]
> Beim Bug-Report immer `core/log.txt` anhängen. API-Keys in der `.env` vorher unkenntlich machen.

---

<p align="center">
<sub>MIT License · © 2026 Vannon · Kein Scrum Master wurde verletzt.</sub>
</p>
