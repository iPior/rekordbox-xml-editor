# Rekordbox XML Editor (Tauri + Rust + React + TypeScript)

MVP desktop companion app for safely browsing and bulk-editing Rekordbox XML libraries.

## What is included

- Tauri desktop shell with Rust command backend
- React + TypeScript frontend with playlist sidebar, track table, toolbar, metadata editor, and bulk edit modal
- Defensive XML parser that converts Rekordbox XML into normalized models
- Serializer that writes Rekordbox-compatible XML from internal models
- Validation layer before save
- Timestamped backup creation before overwriting an existing file

## Project structure

- `src/` - React frontend
- `src/components/` - reusable UI components
- `src/features/library/` - library state and actions
- `src/lib/` - command API and filtering helpers
- `src/types/` - shared TS models
- `src-tauri/src/commands/` - Tauri command handlers
- `src-tauri/src/models/` - Rust data models
- `src-tauri/src/services/` - file IO and backup/save orchestration
- `src-tauri/src/xml/` - parser/serializer/validation modules

## Run locally

1. Install prerequisites:
   - Node.js 18+
   - Rust stable toolchain
   - Tauri prerequisites for your OS: <https://tauri.app/start/prerequisites/>
2. Install dependencies:

   ```bash
   npm install
   ```

3. Start desktop dev app:

   ```bash
   npm run tauri dev
   ```

4. Build production bundle:

   ```bash
   npm run tauri build
   ```

## MVP flow

1. Open Rekordbox XML
2. Parse into internal `Library` model
3. Browse playlists and tracks
4. Edit single track metadata
5. Bulk edit selected tracks
6. Save As with validation and backup
