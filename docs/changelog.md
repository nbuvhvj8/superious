# Changelog

All notable changes to the Outlier project will be documented in this file.

## [Unreleased]

### Architecture & Infrastructure
- **Architectural Migration to Native Vite/Rust Architecture** ([#46](https://github.com/nbuvhvj8/superious/pull/46)) by @nbuvhvj8
  - Transitioned from Next.js to a native-first Vite and Rust (Tauri) architecture.
  - *Files: `vite.config.ts`, `src-tauri/tauri.conf.json`, `package.json`*
- **CircleCI Integration** ([#48](https://github.com/nbuvhvj8/superious/pull/48)) by @nbuvhvj8
  - Added CircleCI configuration to automate builds and testing.
  - *File: `.circleci/config.yml`*
- **Build System & Documentation Assets** ([#49](https://github.com/nbuvhvj8/superious/pull/49)) by @nbuvhvj8
  - Fixed application build processes and implemented automated screenshot capture.
  - *Files: `scripts/`, `screenshots/`*
- **Workflow Security Hardening** ([#52](https://github.com/nbuvhvj8/superious/pull/52), [#58](https://github.com/nbuvhvj8/superious/pull/58)) by @nbuvhvj8
  - Resolved code scanning alerts (no. 10 and 12) by explicitly defining workflow permissions.
  - *Files: `.github/workflows/ci.yml`, `.github/workflows/desktop-build.yml`, `.github/workflows/release-desktop.yml`*

### Features & Improvements
- **Icon Library Migration** ([#45](https://github.com/nbuvhvj8/superious/pull/45)) by @nbuvhvj8
  - Migrated from Lucide to Hugeicons for a modernized UI look and feel.
  - *Files: `src/components/Sidebar.tsx`, `src/components/UpdaterManager.tsx`, `src/components/ui/StatusBadge.tsx`*
- **Auto-Updater UI & Cleanup** ([#51](https://github.com/nbuvhvj8/superious/pull/51)) by @nbuvhvj8
  - Implemented the auto-updater interface and removed the legacy Operations Hub.
  - *Files: `src/components/UpdaterManager.tsx`, `src/components/Sidebar.tsx`*
- **Tauri Core Enhancements** ([#47](https://github.com/nbuvhvj8/superious/pull/47)) by @nbuvhvj8
  - Added hugeicons/tauri declarations and hardened the Tauri zoom hook for stability.
  - *Files: `types/hugeicons.d.ts`, `src/lib/useZoom.ts`, `types/tauri-globals.d.ts`*
- **README Revamp** ([#50](https://github.com/nbuvhvj8/superious/pull/50)) by @nbuvhvj8
  - Modernized and professionalized the project documentation.
  - *File: `README.md`*

### Bug Fixes & Maintenance
- **UI & Logic Refinement** ([#56](https://github.com/nbuvhvj8/superious/pull/56)) by @nbuvhvj8
  - Fixed Sidebar coloring, improved provider logic, and updated cryptography tests.
  - *Files: `src/components/Sidebar.tsx`, `src/lib/providers.ts`, `tests/crypto.test.ts`*
- **Comprehensive Codebase Debug** ([#55](https://github.com/nbuvhvj8/superious/pull/55)) by @nbuvhvj8
  - General stability fixes and debugging across the entire codebase.
  - *Files: various files in `src/`*
