# Technical Design: Native Windows GUI für SyxBridge

**Version:** 3.0  
**Status:** In Development  
**Created:** 2026-06-25  
**Last Updated:** 2026-06-25  
**Spec Type:** Feature  
**Workflow:** Requirements-First (18 Requirements)

---

## Overview

### What We're Building

A native Windows GUI application for SyxBridge to replace the current web-based interface.

**Key Features:**
- Real-time pipeline visualization (SCAN → LLM → QA → SAVE)
- Database browser with search, edit, and revision history
- Live configuration (provider, model, language, batch size)
- System health monitoring (backend, database, resources)
- FCM live rankings (model performance metrics)
- Process indicators for ALL running operations
- Backup creation and restoration
- Mode status indicator (NATIVE vs PATCH)
- Workflow-driven navigation
- Native Windows controls only (no custom shells or animations)

**Design Principles:**
1. **Native Windows Feel**: System standard controls, respect Windows theme
2. **Real Data Only**: No placeholders; show "—" if unavailable
3. **Performance Budget**: Max 5% CPU during translation
4. **Single Source of Truth**: Backend is authoritative
5. **Graceful Degradation**: Offline mode with cached data
6. **Modular**: New features (Launcher, Downloader) easily added
7. **Process Transparency**: Every operation visible with progress

---

## Architecture

### 1.1 High-Level System Diagram

```
┌─────────────────────────────────────────────────────┐
│            Windows Desktop Environment               │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌───────────────────────────────────────────────┐  │
│  │  Native Windows GUI (Tauri + Vue 3 + TS)      │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Main Window (Multi-Panel Layout)        │  │  │
│  │  │  ├─ Sidebar (Navigation + Processes)    │  │  │
│  │  │  ├─ Center (Pipeline + DB + Terminal)   │  │  │
│  │  │  └─ Right (Stats + Health + Backups)    │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  │                                                 │  │
│  │  Tauri Runtime (Rust Bridge + Window Mgmt)    │  │
│  └───────────────────────────────────────────────┘  │
│                      ↕ (HTTP + SSE)                  │
└─────────────────────────────────────────────────────┘
                      ↕
┌─────────────────────────────────────────────────────┐
│    Node.js Backend (localhost:3000, unchanged)      │
│  ├─ REST API (Config, DB, Status)                  │
│  ├─ SSE Streams (Logs, Pipeline, Health, FCM)      │
│  ├─ Process Manager (SCAN, LLM, QA, SAVE)          │
│  └─ Database (SQLite)                              │
└─────────────────────────────────────────────────────┘
```

### 1.2 Technology Stack Rationale

**Frontend Framework: Tauri + Vue 3 + TypeScript**

| Aspect | Tauri | Electron | Reasoning |
|--------|-------|----------|-----------|
| Binary Size | ~30MB | ~200MB | Distribution efficiency |
| Memory | ~50-100MB | ~200-400MB | Performance budget |
| Native Integration | ✓ Direct Windows APIs | ✗ Chromium wrapper | Native feel requirement |
| Performance | ✓ Low overhead | ✗ V8 engine | CPU budget 5% |
| Distribution | ✓ Small, fast | ✗ Large updates | User experience |

**Vue 3**: Template-driven development, Pinia store integration (proven in existing web GUI), excellent TypeScript support, rapid development.

**State Management: Pinia (Centralized Store)**

Benefits:
- Single source of truth (backend is authority)
- Vue DevTools integration (debugging)
- Time-travel debugging
- SSE updates coordinated centrally
- Easy offline caching

**Communication: REST + SSE**

- REST for mutations (stateless, simple)
- SSE for real-time streams (logs, pipeline, health)
- Built-in reconnection + exponential backoff
- Backend already implements these

**Backend: Node.js (No Changes)**

Existing server.js is authoritative:
- 25+ REST endpoints already implemented
- SSE feeds already working  
- Process management fully operational
- Database client validated

---

## Components and Interfaces

### 2.1 Core Components (7 Main Modules)

#### Component 1: Pipeline Visualizer

**Purpose:** Display real-time 4-phase translation progress

**Interface:**
```typescript
export interface PhaseStatus {
  name: 'SCAN' | 'LLM' | 'QA' | 'SAVE'
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number  // 0-100
  startedAt: number | null
  completedAt: number | null
  eta: number | null  // seconds remaining
  errorMessage: string | null
}
```

**Inputs (Props):**
- phases: Phase[] (always 4 items)
- errors: string[] (error log)

**Outputs (Events):**
- @phase-retry(index) — User clicked Retry on failed phase
- @phase-pause() — User clicked Pause
- @phase-resume() — User clicked Resume

**Integration:**
- SSE: /api/pipeline/stream (real-time updates)
- REST: GET /api/preflight-status (initialization)
- Store: usePipelineStore

**UI Behavior:**
- Horizontal 4-box layout
- Current phase: thick blue border + filled background
- Completed phase: checkmark + green
- Error phase: red border + error text
- Show progress bar (0-100%) for running phase
- Show ETA countdown for running phase
- NO animations, only color/text state changes

---

#### Component 2: DB Browser

**Purpose:** Search, edit, and view translation entry history

**Interface:**
```typescript
export interface DBEntry {
  id: string
  key: string
  value: string
  translatedValue: string | null
  metadata: Record<string, any>
  lastModified: number
}

export interface DBRevision {
  version: number
  text: string
  timestamp: number
  author: string | null
}
```

**Inputs:**
- entries: DBEntry[]
- totalCount: number
- searchResults: number

**Outputs:**
- @search(query, caseSensitive) — User searched
- @entry-select(id) — User selected entry
- @entry-save(id, newText) — User saved edit
- @revision-view(revisionId) — User clicked revision

**Integration:**
- REST: GET /api/db/search?q={query}
- REST: POST /api/db/entry/{id}/update
- REST: GET /api/db/entry/{id}/revisions
- Store: useDatabaseStore

**UI Behavior:**
- Top: Search bar + filter buttons
- Middle: Virtual scrolled list (1000+ items)
- Bottom: Selected entry detail (multi-line text area)
- Right: Revision timeline
- NO placeholder data; show "No results" if query matches nothing

---

#### Component 3: Settings Panel

**Purpose:** Live provider/model/language/batch-size configuration

**Interface:**
```typescript
export interface Settings {
  provider: string  // 'openai' | 'anthropic' | 'google' | ...
  model: string     // 'gpt-4-turbo' | 'claude-3' | ...
  language: string  // 'de' | 'fr' | 'es' | ...
  batchSize: number // 1-1000
}
```

**Inputs:**
- provider: string
- model: string
- language: string
- batchSize: number

**Outputs:**
- @setting-changed(key, value) — User changed setting
- @settings-save() — User clicked Save
- @settings-cancel() — User clicked Cancel

**Integration:**
- REST: GET /api/config (load)
- REST: POST /api/config (save)
- Store: useSettingsStore
- Validation: batchSize in [1, 1000], provider in list, language in list

**UI Behavior:**
- Dropdown: Provider
- Dropdown: Model (populated based on provider)
- Dropdown: Language
- Number input: Batch Size
- Inline validation errors
- Save/Cancel buttons

---

#### Component 4: Process Indicator Manager

**Purpose:** Show all running operations (Sync, Repair, Restore, etc.)

**Interface:**
```typescript
export interface Process {
  id: string
  name: string  // "Sync: Songs of Syx", "DB Repair", etc.
  type: 'SYNC' | 'REPAIR' | 'RESTORE' | 'UPLOAD' | ...
  status: 'running' | 'completed' | 'error'
  progress: number  // 0-100
  eta: number | null  // seconds
  startedAt: number
  completedAt: number | null
  logsCount: number
  errorMessage: string | null
}
```

**Inputs:**
- processes: Process[]

**Outputs:**
- @process-cancel(id) — User cancelled process
- @process-expand(id) — User expanded details

**Integration:**
- SSE: /api/process/stream
- REST: POST /api/process/{id}/cancel
- Store: useProcessStore

**UI Behavior:**
- Vertical list of process cards
- Per card: name, progress bar, ETA, status
- Running: yellow card
- Completed: green card with timestamp
- Error: red card with error message + Retry button
- Max 3 visible; older processes scroll
- NO animations

---

#### Component 5: System Health Monitor

**Purpose:** Display backend, database, and resource status

**Interface:**
```typescript
export interface SystemHealth {
  backend: { status: 'online' | 'offline'; lastCheck: number }
  database: { status: 'ok' | 'warning' | 'error'; lastCheck: number }
  memory: { available: number; percentage: number; lastCheck: number }
  providers: Record<string, { ping: number; available: boolean; rateLimitRem: number | null }>
}
```

**Inputs:**
- healthData: SystemHealth

**Outputs:**
- @health-refresh() — User clicked Refresh
- @warning-click(issue) — User clicked warning badge

**Integration:**
- SSE: /api/health/stream
- REST: GET /api/system-health
- Store: useSystemStore

**UI Behavior:**
- 3 sections: Backend, Database, Resources
- Per section: status icon (🟢/🟡/🔴), value, last check time
- NO placeholder data: show "—" or "Not measured" if unavailable
- Collapsible sections for details

---

#### Component 6: Terminal/Logs Viewer

**Purpose:** Display live log stream with filtering

**Interface:**
```typescript
export interface LogEntry {
  timestamp: number
  level: 'INFO' | 'WARN' | 'ERROR'
  message: string
}
```

**Inputs:**
- logs: LogEntry[] (max 1000)
- logLevel: 'all' | 'info' | 'warn' | 'error'

**Outputs:**
- @log-level-change(level) — User changed filter
- @log-export() — User clicked Export

**Integration:**
- SSE: /api/logs/stream
- Store: separate logs store or integrated into processes

**UI Behavior:**
- Monospace font, scrollable panel
- Per log: timestamp, level badge (color-coded), message
- Filter buttons: All / Info / Warn / Error
- Auto-scroll to bottom on new log
- Search box to filter logs
- Export button → download as .txt
- Virtual scrolling for performance

---

#### Component 7: Navigation Context

**Purpose:** Manage workflow phases and context preservation

**Interface:**
```typescript
export type WorkflowPhase = 
  | 'overview' 
  | 'sorting' 
  | 'scan' 
  | 'translate' 
  | 'qa' 
  | 'save' 
  | 'upload' 
  | 'next-game'

export interface NavigationContext {
  currentPhase: WorkflowPhase
  history: WorkflowPhase[]
  contextData: Record<string, any>  // Preserves data across nav
}
```

**Inputs:**
- currentPhase: WorkflowPhase
- canSkipPhase: boolean

**Outputs:**
- @navigate(phase) — User navigated to phase
- @context-update(key, value) — User data changed

**Integration:**
- Store: useUIStore
- Coordinates between all major components

**UI Behavior:**
- Tab bar showing phases
- Highlight current phase
- "Next →" button on completion
- "← Back" to previous phase
- Preserve scroll/selection within phase

---

## Data Models

### 3.1 State Management (Pinia Stores)

**Store 1: Pipeline Store**
```typescript
export const usePipelineStore = defineStore('pipeline', {
  state: () => ({
    phases: [
      { name: 'SCAN', status: 'pending', progress: 0, ... },
      { name: 'LLM', status: 'pending', progress: 0, ... },
      { name: 'QA', status: 'pending', progress: 0, ... },
      { name: 'SAVE', status: 'pending', progress: 0, ... }
    ],
    errors: [],
    currentSyncId: null
  })
})
```

**Store 2: Process Store**
```typescript
export const useProcessStore = defineStore('processes', {
  state: () => ({
    processes: {}  // { [id]: Process }
  })
})
```

**Store 3: Database Store**
```typescript
export const useDatabaseStore = defineStore('database', {
  state: () => ({
    entries: [],
    searchFilter: { query: '', caseSensitive: false },
    selectedEntryId: null,
    totalCount: 0,
    searchResults: 0,
    pageSize: 50,
    currentPage: 0
  })
})
```

**Store 4: Settings Store**
```typescript
export const useSettingsStore = defineStore('settings', {
  state: () => ({
    provider: 'openai',
    model: 'gpt-4-turbo',
    language: 'de',
    batchSize: 50,
    lastModified: null
  })
})
```

**Store 5: System Store**
```typescript
export const useSystemStore = defineStore('system', {
  state: () => ({
    backend: { status: 'unknown', lastCheck: null },
    database: { status: 'unknown', lastCheck: null },
    memory: { available: 0, percentage: 0, lastCheck: null },
    providers: {},
    fcmModels: [],
    runtimeScore: { ... }
  })
})
```

**Store 6: UI Store**
```typescript
export const useUIStore = defineStore('ui', {
  state: () => ({
    activeTab: 'overview',
    sidebarOpen: true,
    rightPanelOpen: true,
    runtimeScoreMinimized: true,
    notifications: [],
    darkMode: true
  })
})
```

### 3.2 Data Flow: Backend Authority Model

**Principle:** Backend is ALWAYS the source of truth

**Flow 1: App Startup**
```
App Mounts
  → Fetch /api/preflight-status
  → Populate all 6 Pinia stores
  → Subscribe to SSE streams
  → Render UI with initial state
```

**Flow 2: SSE Event Arrives**
```
SSE message received
  → Validate data (DataValidator)
  → Update Pinia store
  → Component re-renders
```

**Flow 3: User Action (Settings Change)**
```
User changes provider
  → Local store updates (optimistic)
  → REST POST /api/config (save)
  → Backend returns updated config
  → Merge response into store (backend wins if conflict)
```

**Flow 4: Conflict Resolution**
```
Local state: progress 45
Backend state: progress 60
  → Backend wins (authority principle)
  → Update local to 60
  → Notification: "State synced with backend"
```

### 3.3 REST Endpoints (Backend Authority)

```
GET  /api/config
  Response: { provider, model, language, batchSize }

POST /api/config
  Request: { provider?, model?, language?, batchSize? }
  Response: { success, updated }

GET  /api/preflight-status
  Response: { phases, mode, errors }

GET  /api/system-health
  Response: { backend, database, memory }

GET  /api/db/search?q={query}
  Response: { entries, total, searchResults }

POST /api/db/entry/{id}/update
  Request: { text }
  Response: { id, key, value, updatedAt }

GET  /api/db/entry/{id}/revisions
  Response: { revisions }

POST /api/db-repair
  Response: { success, itemsRepaired }

GET  /api/backups
  Response: { backups: [{ name, timestamp, size }] }

POST /api/backups/{name}/restore
  Response: { success, message }

POST /api/process/{id}/cancel
  Response: { success }
```

### 3.4 SSE Streams

```
SSE /api/pipeline/stream
  Event: { phases, activePhaseIndex, currentPhase }
  Frequency: Every 100ms during sync

SSE /api/process/stream
  Event: { processId, status, progress, eta }
  Frequency: Every 500ms

SSE /api/logs/stream
  Event: { timestamp, level, message }
  Frequency: Immediate

SSE /api/health/stream
  Event: { backend, database, memory }
  Frequency: Every 5s

SSE /api/fcm-rankings/stream
  Event: { models }
  Frequency: Every 30s or on change
```

---

## Error Handling

### 4.1 Error Categories

**Category 1: SSE Connection Loss**

Recovery:
- Auto-retry with exponential backoff (3s, 6s, 12s, 30s max)
- Show yellow "Connection Lost" banner
- Disable Start buttons
- Allow offline browsing (cached data)
- On reconnect: full state resync

**Category 2: Invalid Data from Backend**

Recovery:
- Validate all REST + SSE responses
- Skip invalid items, log errors
- If >10% batch invalid: show warning
- Offer DB-Repair as remedy
- Never show invalid data to UI

**Category 3: State Divergence**

Recovery:
- Backend is authority (backend state wins)
- Log divergence
- Notify user: "State updated from backend"
- Refresh affected components

**Category 4: Process Failure**

Recovery:
- Show error in process card
- Display error message
- Offer Retry button
- Log full error for debugging

---

## Testing Strategy

### 5.1 Test Classification

Based on prework analysis, this feature requires **Integration + Acceptance tests**, NOT property-based tests.

**Breakdown by Requirement:**

| Req | Test Type | Strategy | Expected Tests |
|-----|-----------|----------|-----------------|
| 1.1-1.3 | Property | Render pipeline with various states, verify visual indicators | 4 |
| 2.1-2.3 | Integration | Search → Edit → Save → Revisions workflows | 5 |
| 3.1-3.2 | Property+Int | Settings validation + live update workflow | 4 |
| 4.1 | Integration | API key test button interaction | 1 |
| 5.1 | Property | FCM rankings display with various data | 2 |
| 6.1 | Property | Runtime score display after sync | 2 |
| 7.1 | Integration | DB repair progress workflow | 2 |
| 8.1-8.2 | Integration | Backup creation + restore workflow | 2 |
| 9.1 | Property | Mode status indicator rendering | 1 |
| 10.1-10.2 | Property | Log stream display + filtering | 3 |
| 11.1 | Smoke | Native window controls (minimize, maximize, close) | 1 |
| 12.1-12.2 | Integration | Workflow navigation + context preservation | 3 |
| 13.1-13.2 | Acceptance | Code audit: no custom controls, respects theme | 1 |
| 14.1-14.2 | Property | Process indicators completeness + progress | 2 |
| 15.1 | Acceptance | Code audit: only real data, no placeholders | 1 |
| 16.1 | Acceptance | Health monitor displays real metrics | 1 |
| 17.1 | Architecture | Code review: modular design for future features | 0 (design review) |
| 18.1 | Acceptance | Audit: no placeholder UI elements | 1 |
| **TOTAL** | | | **~40-50 tests** |

### 5.2 Test Framework & Structure

**Unit Tests:**
- Pinia store mutations (actions, getters)
- DataValidator class
- SSE reconnection logic
- API client wrapper

**Integration Tests:**
- Components + real API calls (with mocks)
- Workflows (search → edit → save → verify)
- SSE stream subscription + updates
- Process management (start, progress, completion)
- State synchronization (backend authority)

**Acceptance Tests:**
- Code audit: no custom controls (component inspection)
- Code audit: no placeholder data (text search)
- Visual regression: theme compliance (screenshot tests with dark/light mode)
- UI interactions: window lifecycle

### 5.3 Offline/Error Scenarios

- SSE connection loss → auto-retry + cached display
- Invalid data from backend → validation gate blocks bad data
- DB corruption detected → DB-Repair suggestion shown
- Settings save fails → error notification + rollback to previous value
- Process failure → error message in process card + retry option

### 5.4 Performance Benchmarks

- CPU usage during SCAN phase: Target <5%
- Search 10,000 entries: <200ms
- Render 1,000 log entries: <100ms (with virtual scrolling)
- SSE reconnection: <5s total after connection loss
- Component re-render: <16ms (60fps target)

### 5.5 Acceptance Criteria Validation

All 18 requirements covered:

**Requirements 1-12: Workflow Integration Tests**
- Verify components receive + display real backend data
- Verify user actions → API calls → state updates → re-renders
- Verify SSE streams trigger real-time updates
- Verify error handling (invalid data, connection loss)

**Requirements 13-15: Visual/Data Compliance**
- Code audit: verify only native Windows controls used
- Text search: no hardcoded placeholders in components
- Screenshot tests: verify dark mode + light mode rendering

**Requirement 16: System Health Compliance**
- Verify health panel shows real metrics or "—"
- No placeholder values like "---", "N/A", "0"

**Requirement 17: Architecture**
- Code review: modular store structure
- Verify plugin boundaries (Settings, Pipeline, DB are independent)
- Verify new modules can be added without breaking existing

**Requirement 18: No Placeholders**
- Audit all components for hardcoded placeholder text
- Verify offline behavior shows "Fetching..." not "---"

---

## Correctness Properties

### 6.1 Assessment: PBT Applicability

This feature is **UI-driven integration with backend services**. Most acceptance criteria test specific user workflows (UI interactions + data display) rather than universal mathematical properties. 

**Conclusion:** This feature is NOT suitable for property-based testing. Instead, recommend:
- **Property Tests (8 criteria)**: UI rendering + data transformation logic
- **Integration Tests (7 criteria)**: API interactions + workflows  
- **Smoke Tests (1 criterion)**: Native window lifecycle
- **Acceptance Tests (2 criteria)**: Architectural/visual compliance

**Total Test Coverage:** ~40-50 tests across all categories

### 6.2 Component-Level Properties (Testable with Randomization)

#### Property 1: Pipeline Phase Rendering
*For any* pipeline state with 4 phases in various states (pending/running/completed/error), the rendered component SHALL display each phase with correct visual indicators (color, progress bar, status text).

**Validates: Req 1.1, 1.2, 1.3**

#### Property 2: DB Entry Search Results
*For any* search query and database entries, the search results displayed SHALL be a subset of entries matching the query criteria.

**Validates: Req 2.1**

#### Property 3: Entry Edit and Persistence
*For any* DB entry being edited and saved, the new value SHALL be persisted to both local state and backend, with the backend response merged into store.

**Validates: Req 2.2**

#### Property 4: Revision History Display
*For any* entry with revision history, the displayed revision list SHALL match the backend data exactly, showing all versions with timestamps.

**Validates: Req 2.3**

#### Property 5: Settings Validation
*For any* invalid settings value (batch size < 1, batch size > 1000, unknown provider), the validation SHALL reject it and display an error message, preventing save.

**Validates: Req 3.2**

#### Property 6: FCM Rankings Data Display
*For any* FCM rankings data from the SSE stream, the displayed model list SHALL include all models with correct tier, ping, and stability metrics.

**Validates: Req 5.1**

#### Property 7: Runtime Score Display
*For any* completed sync with runtime metrics, the runtime score panel SHALL display all metrics matching the backend data (confidence, throughput, error rate).

**Validates: Req 6.1**

#### Property 8: Process Indicator Completeness
*For any* set of running processes (Sync, Repair, Restore), the UI SHALL display a visible indicator for each process with accurate progress (0-100%).

**Validates: Req 14.1, 14.2**

### 6.3 Why PBT Is Not Appropriate for This Feature

1. **Infrastructure/UI Domain**: The feature is primarily UI rendering + HTTP API interactions, not algorithm logic. PBT works best for pure functions (parsers, serializers, business logic).

2. **External Service Dependencies**: Components depend on SSE streams and REST responses from backend. Testing backend behavior 100x is wasteful — 2-3 representative examples are sufficient.

3. **Stateful UI Rendering**: Vue component rendering depends on view state + props. Running 100 random prop combinations would generate 95 redundant tests. Example-based tests are clearer and faster.

4. **Visual/UX Validation**: Acceptance criteria 13, 16, 18 involve visual compliance and placeholder-detection — not amenable to randomized input generation.

5. **Workflow Context**: User journeys (sorthing → scanning → translating → uploading) require sequential operations. PBT's random input generation breaks workflow semantics.

**Recommendation**: Use targeted integration tests + acceptance tests (40-50 total) instead of property-based tests.

---

## File Structure

```
syx-bridge-gui/
├── src/
│   ├── main.ts                    # Tauri + Vue entry
│   ├── App.vue                    # Root component
│   ├── lib/
│   │   ├── api-client.ts          # REST + SSE wrapper
│   │   ├── data-validator.ts      # Validation rules
│   │   ├── error-handler.ts       # Centralized errors
│   │   ├── types.ts               # TypeScript interfaces
│   │   └── constants.ts           # API endpoints
│   ├── stores/
│   │   ├── pipeline.ts
│   │   ├── processes.ts
│   │   ├── database.ts
│   │   ├── settings.ts
│   │   ├── system.ts
│   │   └── ui.ts
│   ├── components/
│   │   ├── PipelineVisualizer.vue
│   │   ├── DBBrowser.vue
│   │   ├── SettingsPanel.vue
│   │   ├── ProcessIndicator.vue
│   │   ├── SystemHealth.vue
│   │   ├── TerminalLogs.vue
│   │   └── NavigationContext.vue
│   └── assets/
│       ├── styles/
│       │   ├── main.css
│       │   ├── windows-theme.css
│       │   └── components.css
│       └── icons/
├── src-tauri/
│   ├── src/main.rs
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

**Design Document Complete**

Next Phase: PBT Prework Analysis → Task Creation
