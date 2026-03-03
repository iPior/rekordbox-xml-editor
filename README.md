# Rekordbox XML Editor Monorepo

Bun workspace monorepo for comparing two desktop shells for the same product:

- Electron + React + TypeScript
- Tauri + Rust + React + TypeScript

Both apps share UI, types, and domain logic to keep the comparison fair.

## Workspace layout

- `apps/electron` - Electron shell, secure preload bridge, IPC file operations
- `apps/tauri` - Tauri shell, Rust commands for open/save/backup/validation
- `packages/types` - shared DTOs and data model types
- `packages/core` - shared domain logic, filtering, bulk edit, TS XML helpers
- `packages/ui` - shared React UI and app-level stateful workflow
- `fixtures/sample-library.xml` - example Rekordbox-style XML test fixture

## Shared MVP scope

1. Open XML
2. Parse into normalized internal `Library` model
3. Render playlists and tracks
4. Edit track metadata
5. Bulk edit selected tracks
6. Save safely with validation + backup before overwrite

## Setup

1. Install Bun 1.2+, Rust stable, and platform prerequisites:
   - Electron prerequisites for your OS
   - Tauri prerequisites for your OS: <https://tauri.app/start/prerequisites/>
2. Install dependencies:

   ```bash
   bun install
   ```

## Run apps

- Electron dev:

  ```bash
  bun run dev:electron
  ```

- Tauri dev:

  ```bash
  bun run dev:tauri
  ```

## Build apps

- Electron build:

  ```bash
  bun run build:electron
  ```

- Tauri build:

  ```bash
  bun run build:tauri
  ```

## Workspace scripts

- `bun run typecheck` - typecheck all packages and apps
- `bun run lint` - alias to typecheck for MVP scaffold

## Security notes

- Electron renderer has no direct filesystem access.
- Electron uses `contextIsolation: true`, `nodeIntegration: false`, and IPC handlers.
- Tauri keeps file access in Rust commands.
- Both save flows validate output and create backups before overwrite.
