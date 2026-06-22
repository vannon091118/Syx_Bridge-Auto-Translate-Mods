# SyxBridge — AI Translation Engine for Songs of Syx

<p align="center">
  <img src="core/archive/assets/Banner.png" alt="SyxBridge Banner" width="720">
</p>

<p align="center">
  <a href="#-what-is-syxbridge"><img src="https://img.shields.io/badge/lang-English-blue?style=flat-square" alt="English"></a>
  <a href="#-was-ist-syxbridge"><img src="https://img.shields.io/badge/lang-Deutsch-grey?style=flat-square" alt="Deutsch"></a>
  <img src="https://img.shields.io/badge/version-v0.22.0--untested-orange?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/status-Alpha-red?style=flat-square" alt="Status">
  <img src="https://img.shields.io/badge/tests-111%20PASS%200%20FAIL-brightgreen?style=flat-square" alt="Tests">
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square" alt="Node">
  <img src="https://img.shields.io/badge/platform-Windows-0078D6?style=flat-square&logo=windows" alt="Windows">
</p>

<p align="center">
  <strong>Built accidentally. Runs intentionally.</strong>
</p>

<p align="center">
  <em>"I just wanted to play my mods in German. Now I have an AI pipeline with a web dashboard, key rotation, a capability matrix, and a stress test system. Something went wrong somewhere."</em>
</p>

---

<details open>
<summary><h2>🇬🇧 English</h2></summary>

### 🎮 What is SyxBridge?

You have Songs of Syx. You have 50 mods. They're all in English. You could manually translate 3,000+ strings — or you double-click a `.bat` file and let an AI pipeline handle it.

**SyxBridge** scans your installed Workshop mods, runs the text through a multi-stage AI translation pipeline, and writes translations back to your game files. With a web dashboard, real-time monitoring, and quality control built-in.

> Solo project by **Vannon** · Built with mass amounts of caffeine, AI, and stubbornness.

---

### ⚡ Highlights

<table>
<tr>
<td width="50%">

**🤖 9 AI Providers**
Gemini · Groq · OpenRouter · NVIDIA NIM · FCM · Ollama · Player2 · Argos (offline) · Google Translate Free

Automatic provider rotation with capability matrix. Each provider knows what it can do — and what it can't.

</td>
<td width="50%">

**📊 Web Dashboard**
Real-time monitoring on `localhost:3000` with live terminal, provider health, DB browser, and statistics.

Because terminal-only in 2026 would be embarrassing.

</td>
</tr>
<tr>
<td>

**🔄 3-Stage Pipeline**
`Translate → Audit → Polish`
Every translation goes through up to 3 quality stages. Dynamic risk scoring decides what gets a second look.

</td>
<td>

**🔐 Key Rotation & Cooldown**
Multiple API keys per provider. Automatic rotation on rate limits. 30–60s cooldown.
Your keys will outlive my sleep schedule.

</td>
</tr>
<tr>
<td>

**🛡️ Placeholder Shielding**
`{NAME}`, `{AGE}`, `<tag>` — all protected. `__SHLD_N__` tokens survive the LLM. Glossary learning ensures "Hive Queen" stays "Hive Queen" on page 47 too.

</td>
<td>

**💾 SQLite Cache & Backup**
Translated once = cached forever. Automatic backup of all originals before overwriting. API costs? What API costs?

</td>
</tr>
</table>

---

### 📸 Dashboard — Live Screenshots

<table>
<tr>
<td align="center" width="50%">

**Idle Mode · DB Browser**
![Dashboard Idle](GUI.png)
*DB Browser, Mod-Backups, FCM Live Rankings, Runtime Score Panel.*

</td>
<td align="center" width="50%">

**Run Mode · Live Terminal**
![Dashboard Running](Screenshot%202026-06-22%20233836.png)
*Live prompts, LLM responses, progress bars — real-time monitoring.*

</td>
</tr>
</table>

### 🎮 In-Game Result — It Actually Works

<table>
<tr>
<td align="center" width="33%">

![Vargen DE](Screenshot%202026-06-22%20234147.png)
*Vargen — fully translated species screen*

</td>
<td align="center" width="33%">

![Garthimi mixed](Screenshot%202026-06-22%20234157.png)
*Garthimi — partial (mod not yet in DB cache)*

</td>
<td align="center" width="33%">

![Onari DE](Screenshot%202026-06-22%20234221.png)
*Onari — German UI + traits, smooth.*

</td>
</tr>
</table>

> These screenshots show v0.22.0 running on a live Songs of Syx installation. Species descriptions, traits, and UI elements are translated. Mixed results are expected for mods not yet cached — one more run fixes them.

---

### 🛠️ Quickstart — 4 Steps

```bash
# 1. Install Node.js (v18+)
#    → https://nodejs.org/

# 2. Clone the repository
git clone https://github.com/vannon091118/Syx_bridge-
cd Syx_bridge-

# 3. Add your API keys to .env
#    Without keys → Google Translate Free + Argos (completely free, lower quality)
#    Copy .env.example → .env, fill in at least one key

# 4. Launch
start.bat
```

> The `.bat` auto-installs dependencies, creates a `.env` template, and opens `localhost:3000`.  
> Add your keys in the dashboard under **"Manage API Keys"**, hit **Apply Changes**, done.

---

### 🔑 API Keys & Secrets

SyxBridge works **without any API keys** using Google Translate Free + Argos Translate (offline). For better quality, add one or more:

| Provider | Where to get | Free Tier |
|----------|-------------|-----------|
| **Groq** | [console.groq.com](https://console.groq.com) | ✅ Generous daily limit |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | ✅ Free models available |
| **Gemini** | [aistudio.google.com](https://aistudio.google.com) | ✅ Free tier |
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com) | ✅ 1000 credits/month |
| **FCM** | Local daemon — no key needed | ✅ Always free |

**Where do keys go?** In the `.env` file (copy from `.env.example`) or directly in the dashboard under ⚙️ → Manage API Keys. Keys are stored locally, **never transmitted** anywhere except to the provider's own API endpoint.

> ⚠️ `.env` is in `.gitignore`. Never commit it. If you fork this — check your `.gitignore` first.

---

### 🔧 Full Feature List

| Feature | Description |
|---|---|
| **9 Providers** | Gemini, Groq, OpenRouter, NVIDIA NIM, FCM, Ollama, Player2, Argos (offline), Google Translate Free |
| **Capability Matrix** | Each provider has defined capabilities (translate/audit/polish). No accidents. |
| **Key Rotation** | Multiple keys per provider, automatic rotation on rate limits, 30–60s cooldown |
| **Local Models Opt-in** | Ollama/Player2 locked by default (hardware protection). Explicit opt-in required. |
| **3-Stage Pipeline** | Translate → Audit → Polish. Up to 3 quality stages per translation. |
| **Dynamic Risk Scoring** | Texts are scored by risk. Ambiguous batches get stress-tested. |
| **Garbage Batch Detection** | Groq returning `[1, 2, 3, ...]`? Detected and provider excluded. |
| **JSON Retry** | On parse failure, one retry with stricter prompt. |
| **Placeholder Shielding** | `{NAME}`, `{AGE}`, `<tag>` + `__SHLD_N__` tokens protected through every LLM call. |
| **Glossary Learning** | Terminology memory with consistent application across all mods. |
| **SQLite Cache** | Translated once = stored forever. Massive API cost savings. |
| **Native & Patch Mode** | Native overwrites originals (with backup). Patch creates separate mod folder. Both user-controlled. |
| **Web Dashboard** | Real-time monitoring, DB browser, live terminal on `localhost:3000`. |
| **Steam Workshop Export** | Direct upload of your translation patch to Steam Workshop. |
| **Backup System** | Automatic backup of all originals before first overwrite. |
| **5-Layer Watermark Defense** | ZWSP/ZWNJ watermarks stripped at every entry point. |
| **Plugin Architecture** | Game adapter system. Songs of Syx is the reference implementation. New games slot in via registry. |
| **DB-Backed Model Ranking** | `rankModel()` uses real `avg_quality` metrics from DB, not string heuristics. |
| **Language Tag in Mod** | Mod name gets language suffix: `"Orini Race DEUTSCH"`. Info field gets translation credit. |
| **Dev Tools** | `db_query.js`, `db_snapshot.js`, `log_sorter.js`, `test_providers.js` — maintainability built in. |

---

### 📂 Project Structure

```
Syx_bridge-/
├── start.bat                      # One-click launcher
├── .env                           # Your keys (don't commit this)
├── .env.example                   # Template — copy to .env
├── AGENTS.md                      # Agent protocol & commit rules
│
├── core/
│   ├── index.js                   # Entry point (CLI + GUI mode)
│   ├── src/
│   │   ├── runtime-ops.js         # Orchestration: scan → translate → write
│   │   ├── translation-runtime.js # Batch translation, cache, polish
│   │   ├── sos-runtime.js         # Songs of Syx game adapter (plugin-backed)
│   │   ├── router.js              # Provider routing + capability matrix + isFreeModel
│   │   ├── text-core.js           # Shielding, prompt building, JSON parsing
│   │   ├── translation-db.js      # SQLite cache + watermark defense
│   │   ├── preflight.js           # DB health check before every run
│   │   ├── plugin-registry.js     # Game plugin factory & registry
│   │   ├── config-runtime.js      # EFFECTIVE_* models, rankModel(), isFreeModel
│   │   ├── dispatcher.js          # Provider dispatch + EFFECTIVE_* resolution
│   │   ├── plugins/               # Plugin implementations
│   │   │   ├── SongsOfSyxPlugin.js  # Language-Tag, Translation-Credit, V71 support
│   │   │   └── GamePlugin.js      # Abstract base
│   │   └── gui/                   # Web dashboard (Express + SSE)
│   │       ├── server.js
│   │       └── public/
│   │           ├── index.html     # Dashboard UI
│   │           └── app.js         # Dashboard logic
│   ├── scripts/
│   │   ├── commit_lore/           # Commit narrative tools
│   │   │   ├── get_sidejoke.js    # Random commit opener from pool
│   │   │   ├── build_pool.js      # Rebuild pool from git history
│   │   │   ├── update_plot.js     # Append dialogue to PLOT_LORE.md
│   │   │   └── verify_commit_msg.js  # RULE 3 commit gate
│   │   ├── db_query.js            # SQLite CLI query runner
│   │   ├── db_snapshot.js         # DB snapshot + trend report
│   │   ├── log_sorter.js          # Multi-run log filter/sorter
│   │   └── test_providers.js      # Provider key health check
│   ├── tests/
│   │   ├── plugin-boundary-contract.js  # 76 contract checks: Plugin ↔ Adapter interface
│   │   └── e2e_bug1_native_mode.js      # 35 E2E checks: Native Mode gate
│   └── archive/docs/
│       ├── CHANGELOG.md           # Persistent change log (never archived)
│       ├── PLOT_LORE.md           # External narrative layer — agent dialogues
│       ├── MASTER_DOC.md          # Architecture reference
│       └── KNOWN_BUGS_REPORT.md   # Open issues
```

---

### 📋 Changelog — v0.20 to v0.22

| Version | Date | Highlights |
|---|---|---|
| **v0.22.0-untested** | 2026-06-22 | Language-Tag + Translation Credit · P0 __OVERWRITE fix (39 V71 files) · P0 Base-Fallback on full provider outage · P1 Groq Garbage-Detection · P1 SHIELD-Token preservation (233 leaks fixed) · P2 Path validation modsOverride · isFreeModel() provider-aware · rankModel() DB-backed · 5 thin-wrappers removed · Auto-mode freeze fixed · DB timeout 15s |
| **v0.21.0-untested** | 2026-06-21 | Runtime Score Dashboard (90.1%) · ESLint 0-error · G1-Test fix · Live test passed (16 strings, 28.2s, 0 stale) |
| **v0.21-exp** | 2026-06-20—21 | Native Mode fix (V6/V7 filter removed, German path, BridgeCore preserved) · PREFLIGHT hardening · Plugin architecture complete · 5-Layer Watermark Defense · 2,702 DB entries |
| **v0.20.0** | 2026-06-20 | Global version bump · BU-035–039 · Plugin architecture Phase 1 (8/8 hardcodes decoupled) · better-sqlite3 migration · Dev tools (db_query, db_snapshot, export_stage2, test_providers) |

→ **Full changelog (v0.19.0 onwards):** [`CHANGELOG.md`](CHANGELOG.md) + [`CHANGELOG_1.md`](CHANGELOG_1.md)  
→ **Plot & Agent Dialogues:** [`PLOT_LORE.md`](core/archive/docs/PLOT_LORE.md)

---

### 📊 Runtime Score — 90.1% (Weighted Probability)

The **Runtime Score** measures the probability that SyxBridge runs on an arbitrary foreign system without manual intervention. Calculated as a weighted average over 8 user personas:

$$P_{global} = \frac{\Sigma(P_i \times w_i)}{\Sigma w_i} = 90.1\%$$

| Persona | P | Weight | Contribution |
|---------|---|--------|--------------|
| **Casual User** (API keys, standard HW) | 97.5% | 35% | 34.1% |
| **Mid-Range with Keys** (good GPU + API keys) | 97.0% | 15% | 14.6% |
| **Mid-Range no Keys** (good GPU, Google Free only) | 85.0% | 25% | 21.3% |
| **Weak HW** (Steam Deck, 4GB RAM) | 74.0% | 10% | 7.4% |
| **Power Workstation + Ollama** (local model) | 94.0% | 8% | 7.5% |
| **Headless Linux Server** (CLI-only) | 87.5% | 2% | 1.8% |
| **Power-API-User** (expensive keys, exotic config) | 77.0% | 3% | 2.3% |
| **Offline / Air-gapped** (Google Free + Argos) | 60.0% | 2% | 1.2% |

> **Formula:** Weighted average — each persona P × w = contribution, sum = global score.  
> **Computed by:** `core/scripts/runtime_score.js --write-history`  
> **Live in:** Web Dashboard → Runtime Score Panel (bottom right, click `+` to expand)

---

### ⚠️ Status: Alpha — Honest Assessment

| | |
|---|---|
| **Version** | v0.22.0-untested (active development) |
| **Maturity** | Alpha · Solo project · In daily use by the author |
| **DB** | ~3,288 translated entries, 0 watermarks (as of 2026-06-22) |
| **Score** | 90.1% Runtime Score — weighted over 8 personas |
| **Tests** | 111 PASS · 0 FAIL (`npm test`: plugin-boundary-contract + e2e native mode) |
| **Patch Mode** | User opt-in via `.env` `PATCH_MODE_ENABLED=true`. Default: off. Functional. |
| **"Untested"** | Every release is tagged -untested until confirmed working on a non-dev machine. |

<details>
<summary><b>Known Issues</b></summary>

| ID | Issue | Severity |
|----|-------|----------|
| BU-004 | Backup race condition on parallel file writes (no file locking) | 🟡 P2 |
| BU-019 | `consecutiveGrammarFailures` module-scoped mutable state (theoretical) | 🟡 P2 |
| BU-025 | Vendor-sync drift: bidirectional sync not yet implemented | 🟡 P2 |
| BU-026 | No CI test framework (manual `check()` + `process.exit()` pattern) | 🟢 P3 |

</details>

---

### 📧 Contact & Bug Reports

**Email:** [vannon858@gmail.com](mailto:vannon858@gmail.com)

**When reporting bugs, please include:**
- `log.txt` + `debug_payloads.txt` (both in the `core/` directory)
- Your `.env` — **without keys**, mask them: `GROQ_KEY_1=sk-***masked***`

---

</details>

---

<details>
<summary><h2>🇩🇪 Deutsch</h2></summary>

> <strong>Aus Versehen gebaut. Läuft mit Absicht.</strong>

### 🎮 Was ist SyxBridge?

Du hast Songs of Syx. Du hast 50 Mods. Die sind alle auf Englisch. Du könntest 3.000+ Texte von Hand übersetzen — oder du startest **eine** `.bat`-Datei und lässt eine KI-Pipeline die Arbeit erledigen.

**SyxBridge** scannt deine installierten Workshop-Mods, jagt die Texte durch eine mehrstufige KI-Pipeline und schreibt die Übersetzungen direkt zurück. Mit Web-Dashboard, Echtzeit-Monitoring und Qualitätskontrolle — weil „gut genug" nicht reicht wenn du 50 Mods hast.

> Solo-Dev-Projekt von **Vannon** · Built with mass amounts of caffeine, AI, and stubbornness.

---

### ⚡ Highlights

<table>
<tr>
<td width="50%">

**🤖 9 AI-Provider**
Gemini · Groq · OpenRouter · NVIDIA NIM · FCM · Ollama · Player2 · Argos (offline) · Google Translate Free

Automatische Provider-Rotation mit Capability-Matrix. Jeder Provider weiß, was er kann — und was nicht.

</td>
<td width="50%">

**📊 Web-Dashboard**
Echtzeit-Monitoring auf `localhost:3000` mit Live-Terminal, Provider-Health, DB-Browser und Statistiken.

Kein Terminal-only in 2026.

</td>
</tr>
<tr>
<td>

**🔄 3-Stufen-Pipeline**
`Translate → Audit → Polish`
Jede Übersetzung durchläuft bis zu 3 Qualitätsstufen. Dynamisches Risk-Scoring entscheidet, wer nochmal drüber schaut.

</td>
<td>

**🔐 Key-Rotation & Cooldown**
Mehrere API-Keys pro Provider. Automatische Rotation bei Rate-Limits. 30–60s Cooldown.
Deine Keys überleben länger als mein Schlafrhythmus.

</td>
</tr>
<tr>
<td>

**🛡️ Placeholder Shielding**
`{NAME}`, `{AGE}`, `<tag>` + `__SHLD_N__`-Tokens — alles geschützt durch jeden LLM-Aufruf. Glossar-Learning sorgt dafür, dass „Schwarm-Königin" auch auf Seite 47 noch „Schwarm-Königin" heißt.

</td>
<td>

**💾 SQLite Cache & Backup**
Einmal übersetzt = gespeichert. Automatische Sicherung aller Originale vor dem ersten Überschreiben. API-Kosten? Welche API-Kosten?

</td>
</tr>
</table>

---

### 📸 Dashboard — Live-Screenshots

<table>
<tr>
<td align="center" width="50%">

**Idle-Modus · DB-Browser**
![Dashboard Idle](GUI.png)
*DB-Browser, Mod-Backups, FCM Live-Rankings, Runtime-Score-Panel.*

</td>
<td align="center" width="50%">

**Run-Modus · Live-Terminal**
![Dashboard Running](Screenshot%202026-06-22%20233836.png)
*Live-Prompts, LLM-Antworten, Fortschrittsbalken — kein Blindflug.*

</td>
</tr>
</table>

### 🎮 Im Spiel — Es funktioniert tatsächlich

<table>
<tr>
<td align="center" width="33%">

![Vargen DE](Screenshot%202026-06-22%20234147.png)
*Vargen — komplett übersetzte Spezies-Auswahl*

</td>
<td align="center" width="33%">

![Garthimi gemischt](Screenshot%202026-06-22%20234157.png)
*Garthimi — Teilübersetzung (Mod noch nicht gecacht)*

</td>
<td align="center" width="33%">

![Onari DE](Screenshot%202026-06-22%20234221.png)
*Onari — Deutsche UI + Traits, sauber.*

</td>
</tr>
</table>

> Die Screenshots zeigen v0.22.0 auf einer Live-Installation. Speziesbeschreibungen, Traits und UI-Elemente sind übersetzt. Gemischte Ergebnisse bei noch nicht gecachten Mods sind normal — ein weiterer Run reicht.

---

### 🛠️ Quickstart — 4 Schritte

```bash
# 1. Node.js installieren (v18+)
#    → https://nodejs.org/

# 2. Repository klonen
git clone https://github.com/vannon091118/Syx_bridge-
cd Syx_bridge-

# 3. API-Keys in .env eintragen
#    Ohne Keys → Google Translate Free + Argos (kostenlos, niedrigere Qualität)
#    .env.example → .env kopieren, mindestens einen Key eintragen

# 4. Starten
start.bat
```

> Die `.bat` installiert automatisch alle Dependencies, erstellt eine `.env`-Vorlage und öffnet `localhost:3000`.  
> Keys im Dashboard unter ⚙️ → **„Manage API Keys"** eintragen, **Apply Changes** drücken, fertig.

---

### 🔑 API Keys & Secrets

SyxBridge funktioniert **ohne jeden API-Key** mit Google Translate Free + Argos Translate (offline). Für bessere Qualität einen oder mehrere hinzufügen:

| Provider | Woher | Kostenlos |
|----------|-------|-----------|
| **Groq** | [console.groq.com](https://console.groq.com) | ✅ Großzügiges Tageslimit |
| **OpenRouter** | [openrouter.ai/keys](https://openrouter.ai/keys) | ✅ Kostenlose Modelle verfügbar |
| **Gemini** | [aistudio.google.com](https://aistudio.google.com) | ✅ Free-Tier |
| **NVIDIA NIM** | [build.nvidia.com](https://build.nvidia.com) | ✅ 1000 Credits/Monat |
| **FCM** | Lokaler Daemon — kein Key nötig | ✅ Immer kostenlos |

**Wo kommen Keys hin?** In die `.env`-Datei (Vorlage: `.env.example`) oder direkt im Dashboard unter ⚙️ → Manage API Keys. Keys bleiben lokal, werden **nirgends übertragen** außer an den jeweiligen Provider-Endpunkt.

> ⚠️ `.env` ist in `.gitignore`. Niemals committen. Bei Forks: `.gitignore` zuerst prüfen.

---

### 🔧 Alle Features

| Feature | Beschreibung |
|---|---|
| **9 Provider** | Gemini, Groq, OpenRouter, NVIDIA NIM, FCM, Ollama, Player2, Argos (offline), Google Translate Free |
| **Capability Matrix** | Jeder Provider hat definierte Fähigkeiten (translate/audit/polish). Kein Unfall. |
| **Key-Rotation** | Mehrere Keys pro Provider, automatische Rotation bei Rate-Limits, 30–60s Cooldown |
| **Lokale Modelle Opt-in** | Ollama/Player2 standardmäßig gesperrt (Hardware-Schutz). Erst nach explizitem Opt-in. |
| **3-Stufen-Pipeline** | Translate → Audit → Polish. Bis zu 3 Qualitätsstufen pro Übersetzung. |
| **Dynamic Risk Scoring** | Texte werden nach Risiko bewertet. Ambiguous-Batches kriegen Stress-Test. |
| **Garbage-Batch-Detection** | Groq gibt `[1,2,3,...]` zurück? Erkannt und Provider ausgeschlossen. |
| **JSON-Retry** | Bei Parse-Failure einmaliger Retry mit strikterem Prompt. |
| **Placeholder Shielding** | `{NAME}`, `{AGE}`, `<tag>` + `__SHLD_N__` geschützt durch Token-Replacement. |
| **Glossar-Learning** | Terminologie-Memory mit konsistenter Anwendung über alle Mods. |
| **SQLite Cache** | Einmal übersetzt = gespeichert. Spart API-Kosten massiv. |
| **Native & Patch Mode** | Native überschreibt Originale (mit Backup). Patch erstellt separaten Mod-Ordner. Beides steuerbar. |
| **Web-Dashboard** | Echtzeit-Monitoring, DB-Browser, Live-Terminal auf `localhost:3000`. |
| **Steam Workshop Export** | Direkt-Upload deines Übersetzungspatches in den Workshop. |
| **Backup-System** | Automatische Sicherung aller Originale vor dem ersten Überschreiben. |
| **5-Layer Watermark Defense** | ZWSP/ZWNJ an 5 Eintrittspunkten gestrippt. |
| **Plugin-Architektur** | Game-Adapter-System. Songs of Syx ist die Referenzimplementierung. Neue Spiele per Registry. |
| **DB-gestütztes Modell-Ranking** | `rankModel()` nutzt echte `avg_quality`-Metriken statt Name-Heuristik. |
| **Sprach-Tag im Mod** | Mod-Name bekommt Sprach-Suffix: `"Orini Race DEUTSCH"`. Info-Feld: Translation Credit. |

---

### 📂 Projektstruktur

```
Syx_bridge-/
├── start.bat                      # Ein-Klick-Starter
├── .env                           # Deine Keys (nicht committen)
├── .env.example                   # Vorlage — nach .env kopieren
├── AGENTS.md                      # Agenten-Protokoll & Commit-Regeln
│
├── core/
│   ├── index.js                   # Einstiegspunkt (CLI + GUI-Mode)
│   ├── src/
│   │   ├── runtime-ops.js         # Orchestrierung: Scan → Übersetzen → Schreiben
│   │   ├── translation-runtime.js # Batch-Übersetzung, Cache, Polish
│   │   ├── sos-runtime.js         # Songs of Syx Game-Adapter (Plugin-backed)
│   │   ├── router.js              # Provider-Routing + Capability-Matrix + isFreeModel
│   │   ├── text-core.js           # Shielding, Prompt-Bau, JSON-Parsing
│   │   ├── translation-db.js      # SQLite Cache + Watermark-Defense
│   │   ├── preflight.js           # DB-Health-Check vor jedem Run
│   │   ├── plugin-registry.js     # Game-Plugin-Factory & Registry
│   │   ├── config-runtime.js      # EFFECTIVE_*-Modelle, rankModel(), isFreeModel
│   │   ├── dispatcher.js          # Provider-Dispatch + EFFECTIVE_*-Auflösung
│   │   ├── plugins/               # Plugin-Implementierungen
│   │   │   ├── SongsOfSyxPlugin.js  # Sprach-Tag, Translation-Credit, V71
│   │   │   └── GamePlugin.js      # Abstrakte Basis
│   │   └── gui/                   # Web-Dashboard (Express + SSE)
│   │       ├── server.js
│   │       └── public/
│   │           ├── index.html     # Dashboard-UI
│   │           └── app.js         # Dashboard-Logik
│   ├── scripts/
│   │   ├── commit_lore/           # Commit-Erzählungs-Tools
│   │   │   ├── get_sidejoke.js    # Zufälliger Commit-Einstieg aus Pool
│   │   │   ├── build_pool.js      # Pool aus Git-History neu aufbauen
│   │   │   ├── update_plot.js     # Dialog an PLOT_LORE.md anhängen
│   │   │   └── verify_commit_msg.js  # RULE 3 Commit-Gate
│   │   ├── db_query.js            # SQLite CLI Query-Runner
│   │   ├── db_snapshot.js         # DB-Snapshot + Trend-Report
│   │   ├── log_sorter.js          # Multi-Run Log-Filter/Sorter
│   │   └── test_providers.js      # Provider Key Health-Check
│   ├── tests/
│   │   ├── plugin-boundary-contract.js  # 76 Contract-Checks: Plugin ↔ Adapter Interface
│   │   └── e2e_bug1_native_mode.js      # 35 E2E-Checks: Native-Mode-Gate
│   └── archive/docs/
│       ├── CHANGELOG.md           # Persistentes Änderungslog (niemals archiviert)
│       ├── PLOT_LORE.md           # Externer Narrativ-Layer — Agenten-Dialoge
│       ├── MASTER_DOC.md          # Architektur-Referenz
│       └── KNOWN_BUGS_REPORT.md   # Offene Issues
```

---

### 📋 Changelog — v0.20 bis v0.22

| Version | Datum | Highlights |
|---|---|---|
| **v0.22.0-untested** | 2026-06-22 | Sprach-Tag + Translation-Credit · P0 __OVERWRITE-Fix (39 V71-Dateien) · P0 Base-Fallback bei Provider-Totalausfall · P1 Groq Garbage-Detection · P1 SHIELD-Token-Preservation (233 Leaks behoben) · P2 Path-Validierung modsOverride · isFreeModel() Provider-bewusst · rankModel() DB-gestützt · 5 Thin-Wrapper entfernt · Auto-Modus Freeze behoben · DB-Timeout 15s |
| **v0.21.0-untested** | 2026-06-21 | Runtime Score Dashboard (90,1%) · ESLint 0-Error · G1-Test-Reparatur · Livetest bestanden (16 Strings, 28,2s, 0 stale) |
| **v0.21-exp** | 2026-06-20—21 | Native Mode Fix (V6/V7-Filter entfernt, German-Pfad, BridgeCore preserved) · PREFLIGHT-Härtung · Plugin-Architektur komplett · 5-Layer Watermark Defense · 2.702 DB-Einträge |
| **v0.20.0** | 2026-06-20 | Global Version Bump · BU-035–039 · Plugin-Architektur Phase 1 (8/8 Hardcodes entkoppelt) · better-sqlite3-Migration · Dev-Tools |

→ **Vollständiges Changelog:** [`CHANGELOG.md`](CHANGELOG.md) + [`CHANGELOG_1.md`](CHANGELOG_1.md)  
→ **Plot & Agenten-Dialoge:** [`PLOT_LORE.md`](core/archive/docs/PLOT_LORE.md)

---

### 📊 Runtime Score — 90,1% (Gewichtete Wahrscheinlichkeit)

Der **Runtime Score** misst die Wahrscheinlichkeit, dass SyxBridge auf einem beliebigen Fremdsystem ohne Eingriff läuft. Berechnet als gewichteter Durchschnitt über 8 Nutzer-Personas:

$$P_{global} = \frac{\Sigma(P_i \times w_i)}{\Sigma w_i} = 90{,}1\%$$

| Persona | P | Gewicht | Beitrag |
|---------|---|---------|---------|
| **Casual User** | 97,5% | 35% | 34,1% |
| **Mid-Range mit Keys** | 97,0% | 15% | 14,6% |
| **Mid-Range ohne Keys** | 85,0% | 25% | 21,3% |
| **Schwache HW** | 74,0% | 10% | 7,4% |
| **Power + Ollama** | 94,0% | 8% | 7,5% |
| **Headless Server** | 87,5% | 2% | 1,8% |
| **Power-API-User** | 77,0% | 3% | 2,3% |
| **Offline / Air-gapped** | 60,0% | 2% | 1,2% |

> **Berechnung:** `core/scripts/runtime_score.js` (`--write-history`).  
> **Anzeige:** Web-Dashboard → Runtime Score Panel (unten rechts, `+` zum Aufklappen).

---

### ⚠️ Status: Alpha — Ehrliche Ansage

| | |
|---|---|
| **Version** | v0.22.0-untested (aktiver Entwicklungs-Branch) |
| **Reifegrad** | Alpha · Solo-Projekt · im Daily-Use des Autors |
| **DB** | ~3.288 übersetzte Einträge, 0 Watermarks (Stand 2026-06-22) |
| **Score** | 90,1% Runtime Score (gewichtete Wahrscheinlichkeit über 8 Personas) |
| **Tests** | 111 PASS · 0 FAIL (npm test) |
| **Patch Mode** | User Opt-in via `.env` `PATCH_MODE_ENABLED=true`. Standard: aus. Voll funktional. |
| **„Untested"** | Jedes Release wird mit -untested getaggt bis die Funktion auf einem Nicht-Dev-System bestätigt wurde. |

<details>
<summary><b>Bekannte Issues</b></summary>

| ID | Fehler | Severity |
|----|--------|----------|
| BU-004 | Backup Race-Condition bei parallelen File-Writes (kein File-Locking) | 🟡 P2 |
| BU-019 | `consecutiveGrammarFailures` modul-scoped mutable State (theoretisch) | 🟡 P2 |
| BU-025 | Vendor-Sync Drift: bidirektionaler Sync noch nicht implementiert | 🟡 P2 |
| BU-026 | Kein CI-Test-Framework (manuelles `check()` + `process.exit()`) | 🟢 P3 |

</details>

---

### 📧 Kontakt & Bug-Reports

**Email:** [vannon858@gmail.com](mailto:vannon858@gmail.com)

**Bei Bug-Reports bitte mitsenden:**
- `log.txt` + `debug_payloads.txt` (beide im `core/`-Verzeichnis)
- `.env` (ohne Keys — ich will die nicht. Ernsthaft. `GROQ_KEY_1=sk-***masked***`)

---

</details>

---

<p align="center">
  <em>No Scrum Masters were harmed during the development of this project.</em><br>
  <em>Kein Scrum-Master wurde bei der Entwicklung dieses Projekts verletzt.</em>
</p>

<p align="center">
  <sub>MIT License · © 2026 Vannon · Happy Slaver-Management! 🎮</sub>
</p>
