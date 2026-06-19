# 📋 Phase 2: validateFileMarkers — Vollintegrationsplan

> **Stand:** 2026-06-19 | **Abhängig von:** Phase 1A ✅, Phase 1B ✅, Phase 3F ✅
> **Ziel:** Lückenlose Integration der Marker-Level-Validierung in die gesamte Export-Pipeline
> **⚠️ W8-Resolution (2026-06-19):** Plan-Status aktualisiert — 4/6 Lücken implementiert (2a+2b+2c), 1 teilweise (Lücke 1), 1 offen (Lücke 5). Kein Widerspruch mehr zum CHANGELOG [0.20.0-wip].

---

## 📊 Aktueller Stand (Was bereits läuft)

| Komponente | Status | Details |
|------------|--------|---------|
| `validateFileMarkers()` in validator.js | ✅ | Marker-Typ-Dichte + Shield-Restore-Check |
| `exporter.writeTranslatedFile()` Call | ✅ | Wird nach `validateFileSyntax()` aufgerufen |
| Write-Block bei `MARKER_COUNT_MISMATCH` | ✅ | Schützt vor korrupten Dateien |
| Shield-Results aus `ensureTranslations()` | ✅ | Fluss: `_meta` → `__shieldResults` → Exporter |

---

## 🔴 Lücken (Was Phase 2 schliesst)

### Lücke 1: Shield-Results nur für Batch-Translation-Pfad
**Status:** 🟡 TEILWEISE — polish-Pfad hat shieldResults (translation-runtime.js:1001-1017), googleFreePreflight fehlt

**Aktuell:** Shield-Results werden nur im `translateBatch()` → `ensureTranslations()` Pfad gesammelt.

**Fehlt:**
- `googleFreePreflight()` (Stress-Test) → shield results nicht in `__shieldResults`
- `fixGrammarBatch()` (Polish-Phase) → shield results nicht in `__shieldResults`
- Native-Reuse-Pfad → keine shield results (logisch — kein LLM beteiligt, kein Loss-Risiko)
- Cache-Hits → keine shield results (logisch — wurden beim ersten Run validiert)

**Fix:**
```
  ┌─ translateBatch() ─────────────────────┐
  │  → finalizedResults[].shieldResult     │ ←✅ läuft
  │  → __shieldResults.set(source, stats)  │
  └────────────────────────────────────────┘
  
  ┌─ googleFreePreflight() ────────────────┐
  │  → shield results WERDEN NICHT         │ ←❌ fehlt
  │    in __shieldResults gespeichert      │
  └────────────────────────────────────────┘
  
  ┌─ fixGrammarBatch() ────────────────────┐
  │  → shield results WERDEN NICHT         │ ←❌ fehlt  
  │    in __shieldResults gespeichert      │
  └────────────────────────────────────────┘
```

**Effort:** ⏱️ 2h | **Risk:** 🟢
**Aktion:** `googleFreePreflight()` und `fixGrammarBatch()` müssen Shield-Results ebenfalls an die Translations-Map anhängen.

---

### Lücke 2: Gate-Counter Telemetrie für validateFileMarkers
**Status:** ✅ DONE — Phase 2a implementiert. `exporter.js:51`: `getGateCounter().record('exporter:validateFileMarkers', ...)`

**Fix:** `_gcRec()`-Calls in `exporter.js` für `validateFileMarkers`-Ergebnisse.

```javascript
// In exporter.js, nach markerResult:
try { getGateCounter().record('exporter:validateFileMarkers', 
  markerResult.valid ? 'keep' : 'discard', 
  { issues: markerResult.issues.length }
); } catch (_) {}
```

**Effort:** ⏱️ 0.5h | **Risk:** 🟢
**Aktion:** 3 Zeilen in `exporter.js` ergänzen.

---

### Lücke 3: SHIELD_RESTORE_FAIL blockiert den Write NICHT
**Status:** ✅ DONE — Phase 2b implementiert. `exporter.js:54`: `hasCriticalMarkerLoss` prüft `SHIELD_RESTORE_FAIL` UND `MARKER_COUNT_MISMATCH`

**Problem:** `__SHLD_0__` Tokens im translated file wären für den Game-Engine sichtbar.

```javascript
// Aktuell (in exporter.js):
if (hasCriticalMarkerLoss) {
  // BLOCK — nur bei MARKER_COUNT_MISMATCH
}
// SHIELD_RESTORE_FAIL: nur Warnung, kein Block ←❌
```

**Fix-Entwurf:**
```javascript
const hasCriticalMarkerLoss = markerResult.issues.some(i => 
  i.startsWith('MARKER_COUNT_MISMATCH') || 
  i.startsWith('SHIELD_RESTORE_FAIL')
);
```

**Effort:** ⏱️ 0.5h | **Risk:** 🟡 (könnte legitime Translations blockieren wenn ein Token versehentlich als Shield-Leak erkannt wird)
**Aktion:** `hasCriticalMarkerLoss` erweitern, damit `SHIELD_RESTORE_FAIL` auch blockt.

---

### Lücke 4: Keine Unit-Tests für validateFileMarkers
**Status:** ✅ DONE — Phase 2c implementiert. `core/tests/validator-smoke.js`: 16 Testfälle, 49 Checks (inkl. Edge Cases, Tags, Placeholder, Variables, Shield-Restore)

**Benötigte Tests:**

| # | Testfall | Erwartung |
|---|----------|-----------|
| T1 | Leere Source + Target | `valid: true`, keine Issues |
| T2 | Gleiche Marker in Source + Target | `valid: true` |
| T3 | Ein `{0}` Placeholder in Source, keins in Target | `valid: false`, `MARKER_COUNT_MISMATCH: placeholder` |
| T4 | Ein `<c:FF0000>` Tag in Source, zwei in Target | `valid: false`, `MARKER_COUNT_MISMATCH: tag` |
| T5 | Shield-Restore-Results mit `replacedCount < totalTokens` | `valid: false`, `SHIELD_RESTORE_FAIL` |
| T6 | Shield-Restore-Results mit vollständigem Restore | `valid: true` |
| T7 | `$VAR` und `%r%` in Source und Target erhalten | `valid: true` |
| T8 | `__VAR0__` in Source, fehlt in Target | `valid: false`, `MARKER_COUNT_MISMATCH: variable` |
| T9 | `[` und `]` Zeichen (keine Marker) | `valid: true` |

**Effort:** ⏱️ 3h | **Risk:** 🟢
**Aktion:** Neue Testdatei `core/tests/validator_marker_smoke.js` mit 9 Testfällen.

---

### Lücke 5: Keine Stats-Aggregation im Mod-Summary
**Aktuell:** `translateMod()` in `runtime-ops.js` returned `{ cacheHits, newTranslations, ... }` — kein Marker-Check-Ergebnis.

**Fix:** Marker-Check-Ergebnisse in den Mod-Statistiken sammeln:
```javascript
return {
  filesScanned: jobs.length,
  ...
  markerIssues: aggregateMarkerIssues(results)  // Anzahl Files mit Marker-Problemen
};
```

**Effort:** ⏱️ 1h | **Risk:** 🟢
**Aktion:** In `translateMod()` Marker-Ergebnisse aggregieren und an GUI/Log weitergeben.

---

### Lücke 6: `getQaScore()` prüft nur Legacy `[[` Pattern für SHIELD_TOKEN_LOST
**Status:** ✅ DONE — Phase 2a implementiert. `validator.js:228-236`: Prüft BOTH `__SHLD_\d+__` (neu) UND `[[\d+]]` (Legacy)

**Fix:** Beide Formate prüfen:
```javascript
const sourceTokens = (source.match(/\[\[\d+\]\]/g) || []).length;
const sourceShieldTokens = (source.match(/__SHLD_\d+__/g) || []).length;
const totalSourceTokens = sourceTokens + sourceShieldTokens;
```

**Effort:** ⏱️ 0.5h | **Risk:** 🟢
**Aktion:** Regex in `getQaScore()` erweitern.

---

## ⚡ Implementierungs-Reihenfolge

```
- [x] Lücke 2: Gate-Counter Telemetrie        ⏱️ 0.5h  ✅ DONE (Phase 2a)
- [x] Lücke 6: getQaScore() __SHLD_ Check     ⏱️ 0.5h  ✅ DONE (Phase 2a)

Phase 2b — Pipeline-Tiefe (mittleres Risiko, 3h)
──────────────────────────────────────────────────
- [x] Lücke 3: SHIELD_RESTORE_FAIL blockt      ⏱️ 0.5h  ✅ DONE (Phase 2b)
- [~] Lücke 1: Shield-Results für preflight    ⏱️ 2h    🟡 TEILWEISE (polish ✅, googleFreePreflight ❌)
    + polish-Pfad
- [ ] Lücke 5: Stats-Aggregation              ⏱️ 1h    🟢 OFFEN

Phase 2c — Qualitätssicherung (3h)
──────────────────────────────────────────────────
- [x] Lücke 4: Unit-Tests (16 Testfälle)      ⏱️ 3h    ✅ DONE (Phase 2c)

Phase 2d — Integrationstest (1h)
──────────────────────────────────────────────────
[ ] E2E: Dry-Run mit validateFileMarkers    ⏱️ 1h    🟡
    aktiv — prüft ob Write-Blocks korrekt
    auslösen
```

---

## 📈 Gesamt-Effort & Risiko

| Phase | Effort | Risk | Beschreibung |
|-------|--------|------|-------------|
| 2a — Quick-Wins | 1h | 🟢 | ✅ DONE (Lücke 2 + 6: Gate-Counter + getQaScore) |
| 2b — Pipeline-Tiefe | 3.5h | 🟡 | 🟡 TEILWEISE (Lücke 3 ✅, Lücke 1 partial, Lücke 5 ❌) |
| 2c — QA | 3h | 🟢 | ✅ DONE (Lücke 4: 16 Tests, 49 Checks) |
| 2d — E2E | 1h | 🟡 | Dry-Run Integrationstest |
| **Total** | **~2h verbleibend** | **🟢** | Lücke 1 (googleFreePreflight) + Lücke 5 (Stats) + 2d (E2E) |

---

## 🚧 Bekannte Risiken

1. **SHIELD_RESTORE_FAIL als Write-Block:** Wenn ein `__SHLD_` Token fälschlich als Shield-Leak erkannt wird (z.B. vom LLM korrekt restored aber der DNT-Restore davor schlug fehl), wird der gesamte File-Write blockiert. Der User sieht dann `[CRITICAL-MARKER]` ohne zu wissen warum.
   - **Mitigation:** Im Fehlerfall die ersten 3 betroffenen Source-Texte im Log ausgeben.

2. **Polish-Pfad Shield-Results:** `fixGrammarBatch()` → `executeStageRequest()` → Shield-Results müssten durch die gesamte Provider-Abstraktion gereicht werden. Das betrifft `client-factory.js` und `polish-arbiter.js`.
   - **Mitigation:** `executeStageRequest()` bekommt optionalen `shieldCallback` Parameter.

---

## ✅ Abschlusskriterien

- [x] Lücken 2, 3, 4, 6 geschlossen (Phase 2a+2b+2c)
- [~] Lücke 1 teilweise (polish-Pfad ✅, googleFreePreflight ❌)
- [ ] Lücke 5 offen (Stats-Aggregation im Mod-Summary, ~1h)
- [ ] `node --check` auf allen geänderten Dateien ✅
- [ ] Redteam Baseline läuft durch
- [ ] 9 Unit-Tests für `validateFileMarkers()` bestehen
- [ ] Dry-Run mit realem Mod erzeugt keine False-Positives
- [ ] Changelog-Eintrag erstellt

---

*Generiert von Buffy am 2026-06-19 — Plan für Phase 2 Integration*
