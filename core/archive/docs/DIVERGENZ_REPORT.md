# 🔄 DIVERGENZ REPORT — LIVE vs FREEZE

> **Stand:** 2026-06-19 | **Version:** v0.20.0-pre-release
> **Zweck:** Zeigt die Divergenz zwischen LIVE- und FREEZE-Dokumentation. Identifiziert Lücken, Widersprüche und Drift.

## 1. Struktur-Übersicht

| Bereich | LIVE (3 Docs) | FREEZE (5 Docs) | Divergenz |
|---------|---------------|-----------------|-----------|
| Versionshistorie | CHANGELOG.md | — | ✅ Keine Divergenz |
| Architektur | MASTER_DOC §2, §4 | FREEZE_REMAINING (TREE.md) | ⚠️ TREE.md ist v0.19.05b, MASTER_DOC ist v0.20 |
| Bugs & Issues | MASTER_DOC §3 | FREEZE_AUDIT_CONSOLIDATED | ⚠️ MASTER_DOC hat 9 Bugs, AUDIT hat 28 |
| DB-Zustand | MASTER_DOC §5 + PREFLIGHT_LATEST | FREEZE_DB_HISTORY | ⚠️ MASTER_DOC zeigt Snap 18, HISTORY hat 18 Snaps |
| Quality | MASTER_DOC §3 (kurz) | FREEZE_QUALITY_OFFENSIVE | ✅ QO vollständig in FREEZE, Zusammenfassung in LIVE |
| Sessions | — | FREEZE_SESSION_PROTOCOL | ✅ Keine LIVE-Abdeckung nötig |
| Roadmap | MASTER_DOC §6 | FREEZE_REMAINING (Pläne) | ✅ Konsistent |

## 2. Identifizierte Divergenzen

### ⚠️ DIVERGENZ-1: Bug-Liste unvollständig in MASTER_DOC
- **LIVE (MASTER_DOC §3):** 9 Bugs aufgelistet
- **FREEZE (AUDIT_CONSOLIDATED):** 28 Findings (17 BUG-FS, 4 F.*, 5 BU.*, API-KEY, QO-PREFLIGHT)
- **Lücke:** BUG-FS-008 bis BUG-FS-017, BU-001 bis BU-005 fehlen in MASTER_DOC
- **Empfehlung:** MASTER_DOC §3 enthält nur die TOP-Prioritäten. Detail-Bugs in FREEZE_AUDIT. ✅ Akzeptabel.

### ⚠️ DIVERGENZ-2: TREE.md veraltet
- **FREEZE (TREE.md):** Zeigt v0.19.05b Struktur
- **LIVE (MASTER_DOC):** Beschreibt v0.20.0-pre-release
- **Lücke:** TREE.md referenziert teilweise veraltete Pfade
- **Empfehlung:** TREE.md als historisch markieren. MASTER_DOC §9 ist die aktuelle Struktur.

### ⚠️ DIVERGENZ-3: DB-Snapshot 18 vs PREFLIGHT_LATEST
- **MASTER_DOC §5:** Zeigt Snapshot 18 Daten (6.540 Entries)
- **PREFLIGHT_LATEST:** Zeigt den letzten PREFLIGHT-Lauf (kann neuer sein)
- **Lücke:** Wenn ein neuer Sync läuft, ist PREFLIGHT_LATEST aktueller als MASTER_DOC
- **Empfehlung:** PREFLIGHT_LATEST ist die Single-Source-of-Truth für DB-Zustand. MASTER_DOC wird bei Gelegenheit aktualisiert.

### ⚠️ DIVERGENZ-4: QO-Status nicht in MASTER_DOC reflektiert
- **FREEZE (QUALITY_OFFENSIVE):** 0 Blocker, Live-Run freigegeben
- **MASTER_DOC §3:** Zeigt noch alte Bug-Liste ohne QO-Kontext
- **Empfehlung:** MASTER_DOC §3 wurde beim Merge aktualisiert, aber QO-Details stehen nur in FREEZE.

## 3. Lücken (keine LIVE-Abdeckung)

| Thema | LIVE-Abdeckung | FREEZE-Abdeckung | Lücke |
|-------|---------------|-----------------|-------|
| Session-Details | ❌ Keine | ✅ FREEZE_SESSION_PROTOCOL | Erwartet — Sessions sind historisch |
| Root-Cause-Analysen | ❌ Keine | ✅ FREEZE_AUDIT_CONSOLIDATED | Erwartet — Details in FREEZE |
| DB-Snapshot-Historie | ❌ Nur aktuell | ✅ FREEZE_DB_HISTORY (18 Snaps) | Erwartet — Historie in FREEZE |
| Aktive Pläne | ⚠️ MASTER_DOC §6 (kurz) | ✅ FREEZE_REMAINING (detailliert) | Klein — Pläne in plans/ |

## 4. Konsistenz-Check

| Check | Status | Detail |
|-------|--------|--------|
| Version in MASTER_DOC = CHANGELOG | ✅ | v0.20.0-pre-release |
| Version in README = MASTER_DOC | ✅ | v0.20.0-pre-release |
| PREFLIGHT_LATEST existiert | ✅ | Aktuell |
| FREEZE_INDEX vollständig | ✅ | 5 Dokumente, alle referenziert |
| LIVE_INDEX vollständig | ✅ | 3 Dokumente, alle referenziert |
| Keine verwaisten Dokumente | ⚠️ | Original-Dateien noch vorhanden (nicht gelöscht) |

## 5. Empfehlungen

1. **Original-Dateien archivieren:** Die 50+ Original-Dateien in FREEZE/ können nach User-Entscheidung gelöscht werden, da die konsolidierten Dokumente alle Informationen enthalten.
2. **MASTER_DOC regelmäßig aktualisieren:** Bei jedem größeren Change die relevanten Sektionen updaten.
3. **PREFLIGHT_LATEST als DB-Single-Source:** Immer PREFLIGHT_LATEST für aktuellen DB-Zustand konsultieren, nicht MASTER_DOC §5.
4. **DIVERGENZ_REPORT periodisch prüfen:** Bei jedem Release prüfen ob LIVE und FREEZE noch konsistent sind.
