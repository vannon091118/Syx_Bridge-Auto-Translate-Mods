# 📖 INDEX — core/scripts/ (18 Dateien, ~3.379 LOC)

> **Generiert:** 2026-06-21 | **Aktualisiert:** 2026-07-02 | **Version:** v0.25.0-alpha
> **Zweck:** Referenzbuch für Utility-Scripts (Audit, Repair, Release, Cleanup, Dev-Tools, Commit-Layer)
> **CL-Refs:** Kanonische Quelle ist `CHANGELOG.md` (Root). Lokale CL-Refs sind Kurzform.

---

## Übersicht

| Datei | LOC | Beschreibung |
|-------|-----|--------------|
| vendor-sync.js | 373 | Bidirektionaler Vendor-Sync (Phase 2) |
| check_consistency.js | 323 | Konsistenz-Checks (Naming, Env, Versionen) |
| build-review-base.js | 311 | Review-Base-Builder (Release-Snapshot) |
| check_argos.js | 296 | Argos-Installation prüfen/installieren |
| check_vendor_drift.js | 295 | Vendor-Drift — Live-Core vs Release-Bundle |
| log_sorter.js | 277 | Log-Sortierung |
| start_ollama.js | 213 | Ollama-Start + Modell-Management |
| update-badges.js | 204 | README-Badges auto-generieren (Test-Zahlen) |
| fresh-readme.js | 191 | README-Neugenerierung |
| gen-index.js | 166 | INDEX-Dateien auto-generieren |
| vendor-utils.js | 150 | Vendor-Utilities (findLatestRelease, walkRelease, computeSha256) |
| sync-version.js | 138 | Version-Synchronisation (7 Dateien) |
| release.js | 95 | Release-Build (ZIP) |
| register_phase2.js | 95 | Phase-2-Registrierung |
| package.js | 81 | NPM-Paketierung |
| migrate_pools.js | 70 | Pool-Migration |
| cleanup_zombies.js | 54 | Zombie-Prozesse bereinigen |
| check_syntax.js | 47 | Syntax-Check aller JS-Dateien |

---

### commit_lore/ (Unterverzeichnis)

Eigenständiges Narrative Commit Layer — 14 Dateien, deterministisch via XorShift128.
Siehe `commit_lore/` für vollständige Dokumentation.

---

### Wichtige Dateien (Detail)

#### check_argos.js (296 LOC)
| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 16 | `getPython()` | Python-Pfad finden (mit Cache) |
| 38 | `clearPythonCache()` | Python-Cache leeren |
| 43 | `isArgosInstalled()` | Argos-Installation prüfen |
| 61 | `clearArgosCache()` | Argos-Cache leeren |
| 65 | `async ensureArgos()` | Argos sicherstellen |
| 109 | `async getAvailableArgosLanguages()` | Verfügbare Sprachen |
| 144 | `async checkArgosLanguages(targetLangs)` | Sprachen prüfen |

#### check_vendor_drift.js (295 LOC)
| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 68 | `findLatestRelease()` | Letztes Release-Verzeichnis finden |
| 76 | `isReviewBase(releaseDir)` | Review-Base vs Runtime-Release erkennen |
| 84 | `releaseToSource(relPath, dir)` | Release-Pfad → Source-Pfad mappen |
| 137 | `walkRelease(dir, baseDir)` | Release-Verzeichnis rekursiv scannen |
| 152 | `checkVendorDrift(target?)` | Haupt-Check: DRIFT/MISSING/ORPHANED/STALE_MANIFEST |

#### vendor-sync.js (373 LOC)
| Zeile | Funktion | Beschreibung |
|-------|----------|--------------|
| 86 | `findLatestRelease()` | Letztes Release-Verzeichnis finden |
| 98 | `isExcludedByBasename(filePath)` | Exclude-Check: Basename |
| 106 | `isExcludedByDir(filePath)` | Exclude-Check: Verzeichnis-Struktur |
| 184 | `syncForward(src, dest, dryRun)` | Source → Release kopieren |
| 203 | `syncReverse(src, dest, dryRun)` | Release → Source (+ .bak-Backup) |
| 238 | `updateManifest(releasePath)` | .build-manifest.json nach Sync aktualisieren |
| 255 | `runVendorSync(release, dir, dry)` | Haupt-Sync — Analyse + Ausführung |

#### update-badges.js (204 LOC)
Generiert README-Badges automatisch aus `npm test`-Output. `--cached` Mode für CI.
**CHANGELOG-Ref:** DD-004 Fix — struktureller Fix gegen Stale-Badges.

---

### Verschobene Dateien (nicht mehr hier)

> Diese Dateien wurden während der Domain-Restrukturierung (v0.23.0) in eigene Ordner verschoben:

| Datei | Ziel | Grund |
|-------|------|-------|
| db_query.js | `core/DB/` | DB-Domäne |
| db_repair.js | `core/DB/` | DB-Domäne (thin re-export via admin-db.js) |
| db_snapshot.js | `core/DB/` | DB-Domäne |
| db_audit.js | `core/DB/` | DB-Domäne |
| cleanup_argos_stale.js | `core/DB/` | DB-Domäne |
| export_stage2.js | `core/Translation/` | Translation-Domäne |
| test_providers.js | `core/Translation/` | Provider-Test |
| reconstruct.js | `core/Translation/` | Translation-Domäne |
| redteam_baseline.js | `core/Translation/` | Translation-Domäne |
| reset_now.js | `core/GUI/` | GUI-Reset |
| verify_commit_msg.js | `core/commit-layer/` | Commit-Layer |
| verify_integrity.js | gelöscht | Obsolet |
| warm-model.js | gelöscht | Obsolet |
| workshop_export.js | `core/GUI/` | GUI-Export |
| runtime_score.js | `core/Translation/` | Translation-Score |

---

*📖 Scripts-INDEX v0.25.0-alpha — 18 Dateien, ~3.379 LOC (zzgl. commit_lore/)*
