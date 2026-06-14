# CHANGELOG

## [Unreleased]
### Added
- **GUI Layout Overhaul:** Reorganized the Dashboard for better space utilization and clarity.
- **Top Settings Dropdown:** API, Model configuration, and provider stats are now housed in a top-center dropdown menu (only accessible during idle).
- **Dynamic Center Stack:** The central screen area now automatically toggles between the DB Browser (when idle) and the LLM Terminal View (during active runs).
- **Neon Progress Border:** Implemented a glowing, animated progress line running along the screen edge during active sync processes.
- **Streamlined Sidebars:** Consolidated all statistics and diagnostics to the right sidebar, while keeping the left sidebar focused exclusively on workflow controls.

## [0.13.0a] - 2026-06-06
### Added
- **Linux Support:** Platform-aware path handling for Linux/macOS users.
- **Improved Troubleshooting (Mi7):** Comprehensive guide for mod detection and manual workarounds, including OS compatibility warnings.
- **Native GUI Dashboard:** Full-featured management interface with real-time telemetry.

### Fixed
- **Mi5:** Fixed silent catch in `ensureDir` and `bundleBridgeCore`.
- **M5:** Corrected Gemini API payload structure (moved `responseMimeType` and `responseSchema` to top-level).
- **C2:** Stabilized CPU usage calculation (no more global namespace pollution).
- **C3:** Resolved race condition during GUI shutdown.
- **C4:** Removed non-functional menu options for a cleaner experience.

### Changed
- Improved Linux installation documentation.
- Enhanced silent error reporting in core modules.
- Refined README with Windows vs Linux specific instructions.

## [0.13.0] - Pre-Alpha
### Added
- Native GUI management dashboard with full parity to CLI settings.
- Glass-morphism header and enhanced dashboard UI.
- Real-time telemetry dashboard with live logs and "Stichprobe" (sample) tracking.
- Interactive system health indicators and management buttons for Argos and Ollama.
- Dependency management scripts (`scripts/check_argos.js`, `scripts/start_ollama.js`) integrated into startup.

### Changed
- GUI set as the default startup mode (`--gui`).
- Refactored model configuration (Gemini 2.0 default).
- Implemented model immutability principle during runtime.
- Enhanced 429 error handling: Immediate model exclusion.

### Fixed
- Fixed Argos installation infinite loop.
- Improved Ollama process startup via detached spawn.
- Resolved inconsistent model references in logs and configuration.
