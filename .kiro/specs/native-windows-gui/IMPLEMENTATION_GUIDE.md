# Implementation Guide: Native Windows GUI für SyxBridge

**Version:** 1.0  
**Created:** 2026-06-25  
**Feature:** native-windows-gui  
**Status:** Ready for Implementation (Task Phase)

---

## Quick Start

### Phase Sequence
```
Phase 1: Foundation (Tasks 1-5)
  ↓
Phase 2: Core Components (Tasks 6-13)
  ↓
Phase 3: Real-Time & State (Tasks 14-18)
  ↓
Phase 4: Integration & Polish (Tasks 19-24)
```

### Current Status
- ✅ Requirements: 18 Anforderungen dokumentiert
- ✅ Design: Architektur finalisiert (Tauri + Vue 3 + Pinia)
- ✅ Tasks: 24 konkrete Tasks mit Dependencies
- ⏳ Implementation: Bereit zu starten (Task 1)

---

## Architecture Overview

### Tech Stack
- **Frontend:** Tauri (Rust) + Vue 3 + TypeScript + Pinia
- **Backend:** Node.js (unverändert) + REST API + SSE Streams
- **Database:** SQLite (unverändert)
- **Target:** Windows 10/11 (native executable)

### Key Principles
1. **Native Windows Feel** — Nur native Steuerelemente, keine Custom-Shell
2. **Real Data Only** — Strikte DataValidator, keine Platzhalter-Werte
3. **Performance Budget** — Max 5% CPU während Übersetzung
4. **Backend Authority** — Backend ist Single Source of Truth
5. **Graceful Degradation** — App bleibt teilweise nutzbar bei Offline

### Component Architecture
```
┌─────────────────────────────────────┐
│         Tauri Window                 │
├─────────────────────────────────────┤
│  Sidebar | Center Panel | Right Panel│
├─────────────────────────────────────┤
│ [6] Pipeline Visualizer             │
│ [7] DB Browser                      │
│ [8] Settings Panel                  │
│ [9] Process Indicator Manager       │
│ [10] System Health Monitor          │
│ [11] FCM Rankings                   │
│ [12] Terminal/Logs Viewer           │
│ [13] Runtime Score Panel            │
└─────────────────────────────────────┘
      ↓ (REST + SSE)
┌─────────────────────────────────────┐
│     Node.js Backend (localhost)      │
└─────────────────────────────────────┘
```

### State Management Flow
```
Backend (Authority)
  ↓ REST/SSE
Pinia Stores (6 modules)
  ↓ Reactivity
Vue 3 Components
  ↓ User Action
REST POST (back to Backend)
  ↓ Cycle repeats
```

---

## Implementation Phases

### Phase 1: Foundation & Setup (Tasks 1-5)
**Goal:** Projekt-Struktur, Build-System, State-Management-Grundlagen

| Task | Title | Duration | Dependency |
|------|-------|----------|-----------|
| 1 | Tauri Project Setup | 2-3h | None |
| 2 | Project Structure & Build | 2h | Task 1 |
| 3 | Pinia Store Setup | 3h | Task 2 |
| 4 | Data Validator | 3h | Task 3 |
| 5 | Backend Integration Layer | 4h | Task 3 |

**Checkpoint 1 (After Task 5):**
- ✓ `tauri dev` läuft ohne Fehler
- ✓ Alle 6 Pinia Stores initialisieren
- ✓ DataValidator testet korrekt
- ✓ API-Client kann REST und SSE Requests machen

---

### Phase 2: Core Components (Tasks 6-13)
**Goal:** Alle sichtbaren UI-Komponenten implementieren

| Task | Component | Duration | Dependency |
|------|-----------|----------|-----------|
| 6 | Pipeline Visualizer | 4h | Task 5 |
| 7 | DB Browser | 6h | Task 5 |
| 8 | Settings Panel | 3h | Task 5 |
| 9 | Process Indicator Manager | 4h | Task 5 |
| 10 | System Health Monitor | 3h | Task 5 |
| 11 | FCM Rankings | 3h | Task 5 |
| 12 | Terminal/Logs Viewer | 4h | Task 5 |
| 13 | Runtime Score Panel | 2h | Task 5 |

**Können parallel laufen** (alle hängen nur von Task 5 ab)

**Checkpoint 2 (After Task 13):**
- ✓ Alle 7 Komponenten rendern ohne Fehler
- ✓ Component responsive und native-styled
- ✓ Storybook Stories geschrieben
- ✓ Alle Tests grün

---

### Phase 3: Real-Time & State Management (Tasks 14-18)
**Goal:** SSE-Verbindung, Echtzeitdaten, Fehlerbehandlung

| Task | Title | Duration | Dependency |
|------|-------|----------|-----------|
| 14 | SSE Connection Manager | 4h | Task 5 |
| 15 | State Synchronisation | 4h | Tasks 6-13, 14 |
| 16 | Error Handling | 3h | Task 15 |
| 17 | Performance Monitoring | 3h | Tasks 6-13 |
| 18 | Offline Mode & Caching | 3h | Task 15 |

**Checkpoint 3 (After Task 18):**
- ✓ SSE-Reconnect funktioniert
- ✓ State bleibt konsistent
- ✓ Offline-Mode funktioniert
- ✓ CPU-Budget < 5% nachweisbar

---

### Phase 4: Integration & Polish (Tasks 19-24)
**Goal:** Layout, Styling, Testing, Packaging

| Task | Title | Duration | Dependency |
|------|-------|----------|-----------|
| 19 | Main Layout & Navigation | 3h | Tasks 6-13 |
| 20 | Workflow Context | 3h | Task 19 |
| 21 | API Key Management Modal | 2h | Task 5 |
| 22 | Backup & Restore UI | 2h | Task 5 |
| 23 | Windows Styling & Performance | 4h | Tasks 19-22 |
| 24 | Executable Packaging | 2h | Task 23 |

**Checkpoint 4 (After Task 24):**
- ✓ Alle Tasks abgeschlossen
- ✓ EXE erzeugt und getestet
- ✓ Windows native Styling implementiert

---

## Per-Task Workflow

Für **jeden Task** folgende Struktur:

### 1. Task lesen
```
.kiro/specs/native-windows-gui/tasks.md → Task N
```

### 2. Akzeptanzkriterien verstehen
```
AC 1, AC 2, AC 3, ... (müssen alle erfüllt sein)
```

### 3. Implementierung
```
Code schreiben → Testen → Code Review (>10 Zeilen)
```

### 4. Verifikation
```
npm run test → npm run build → Manual Test
```

### 5. Dokumentation
```
Code-Kommentare, TypeScript Types, README-Updates
```

### 6. Commit
```
git add . → Commit-Lore-konform → git push
```

---

## Key Technologies & Libraries

### Frontend Stack
- **Tauri 1.x** — Native Windows + Rust bridge
- **Vue 3** — Reactive UI framework
- **Pinia** — State management (Vuex successor)
- **TypeScript** — Type safety
- **Vite** — Build tooling
- **Vitest** — Unit testing
- **Playwright** — E2E testing

### Backend Integration
- **REST API** — 25+ endpoints (unverändert)
- **Server-Sent Events (SSE)** — Real-time streams
- **Axios** — HTTP client
- **EventSource** — SSE client

### Development Tools
- **ESLint** — Code quality
- **Prettier** — Code formatting
- **npm scripts** — Build automation
- **Tauri CLI** — Project management

---

## Performance Budgets & Constraints

### CPU Budget
- **Target:** < 5% CPU während Übersetzung
- **Messung:** Via Performance API + DevTools
- **Enforcement:** Task 17 (Performance Monitoring)

### Memory Budget
- **Target:** < 150MB RAM (ohne Backend)
- **Messung:** Tauri Memory Monitor
- **Check:** Nach jedem Phase

### Rendering Budget
- **Target:** < 16ms per frame (60fps)
- **Optimization:** Virtual scrolling, debouncing, lazy loading
- **Check:** Chrome DevTools (wenn in dev mode)

---

## Data Validation Rules

### No Placeholder Data
- ✗ "---", "N/A", "Loading...", "???"
- ✓ Real values or "Keine Daten verfügbar" / "—"
- ✓ DataValidator rejects invalid data before UI render
- ✓ Components show explicit "Daten werden aktualisiert..." when waiting

### Backend Authority
- Backend state always wins on conflict
- Local cache for offline mode
- Merge strategy: Backend values override local
- Log divergences for debugging

### Strict Validation
- All REST responses validated
- All SSE events validated
- Invalid data logged, not displayed
- Warning if >10% batch invalid

---

## Testing Strategy

### Unit Tests (Jest/Vitest)
- Pinia store mutations
- DataValidator logic
- API client wrapper
- Utility functions

### Component Tests (Vue Test Utils)
- Render with props
- User interactions
- Event emission
- State updates

### Integration Tests (Playwright)
- Full workflows (search → edit → save)
- SSE reconnection
- State synchronization
- Error handling

### Acceptance Tests
- Visual compliance (no custom controls)
- Data integrity (no placeholders)
- Performance benchmarks
- Accessibility (if required)

---

## Commit Strategy

### Per-Task Commits
Each task gets **ONE** commit with:
- Feature branch or main (per AGENTS.md)
- Descriptive message (Task N: Component/Feature)
- All files staged (related changes)
- Tests passing
- No uncommitted changes

### Message Format
```
[TASK] Task N: Component Name

- Implemented AC 1
- Implemented AC 2
- Tested locally
- No breaking changes

Fixes #feature-name
```

### Example
```
[TASK] Task 6: Pipeline Visualizer Component

- Implemented 4-phase display (SCAN|LLM|QA|SAVE)
- Status indicators: pending/running/completed/error
- Progress bar with ETA
- No animations, only state-based styling
- Validated against Requirements 1

Requirement: 1 (Pipeline-Visualisierung)
```

---

## Debugging & Development

### Local Development
```bash
# Terminal 1: Run Tauri dev mode
npm run dev

# Terminal 2: Dev server with hot reload
npm run tauri dev
```

### Browser DevTools (via Tauri)
- Right-click → Inspect
- Console, Network, Performance tabs available
- Vue DevTools plugin for Pinia debugging

### Performance Profiling
- Chrome DevTools Performance tab
- Record 60s during translation sync
- Check CPU, memory, frame rate
- Export profile for analysis

### SSE Debugging
- Network tab → Filter by "EventSource"
- Check incoming messages
- Monitor reconnect timing

---

## Checkpoint Criteria

### Checkpoint 1 (After Phase 1)
- [ ] Tauri project builds successfully
- [ ] All 6 Pinia stores initialize
- [ ] DataValidator validates correctly
- [ ] API client can make REST + SSE requests
- [ ] No console errors

### Checkpoint 2 (After Phase 2)
- [ ] All 7 components render
- [ ] No prop validation errors
- [ ] Components responsive (<1200px)
- [ ] Native Windows styling applied
- [ ] Storybook running

### Checkpoint 3 (After Phase 3)
- [ ] SSE reconnect works (exponential backoff)
- [ ] State stays consistent
- [ ] Offline mode functional
- [ ] CPU < 5% measured
- [ ] Error recovery tested

### Checkpoint 4 (After Phase 4)
- [ ] Layout complete
- [ ] All modals working
- [ ] Windows styling complete
- [ ] EXE builds < 50MB
- [ ] All 24 tasks completed

---

## Known Risks & Mitigations

### Risk 1: SSE Reconnection Too Slow
**Mitigation:** Early benchmark in Task 14, adjust backoff if needed

### Risk 2: CPU > 5% During Sync
**Mitigation:** Virtual scrolling (Task 7), debouncing (Task 23), profiling (Task 17)

### Risk 3: Memory Leaks in Log Viewer
**Mitigation:** Cache rotation (1000 lines max), explicit cleanup

### Risk 4: Invalid Data Corrupts UI
**Mitigation:** Strict DataValidator (Task 4), pre-render validation

### Risk 5: Backend Offline → UI Hangs
**Mitigation:** Timeout on requests (5s), graceful degradation, offline mode (Task 18)

---

## Next Steps

1. **Read requirements.md** — Understand all 18 requirements
2. **Read design.md** — Understand architecture
3. **Start Task 1** — Tauri Project Setup
4. **Follow checkpoint criteria** — After each phase

---

## Questions?

Refer to:
- **requirements.md** — "Warum?" (business requirements)
- **design.md** — "Wie?" (technical design)
- **tasks.md** — "Was?" (concrete tasks)
- **IMPLEMENTATION_GUIDE.md** — "Wo fange ich an?" (this file)

---

**Ready to start Task 1? → Proceed to .kiro/specs/native-windows-gui/tasks.md**
