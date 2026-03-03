import { useCallback, useEffect, useState } from "react";
import { AppLayout } from "./components/AppLayout";
import { BulkEditModal } from "./components/BulkEditModal";
import { MetadataEditor } from "./components/MetadataEditor";
import { PlaylistSidebar } from "./components/PlaylistSidebar";
import { Toolbar } from "./components/Toolbar";
import { TrackTable } from "./components/TrackTable";
import { useLibraryState } from "./hooks/useLibraryState";
import type { DesktopBridge } from "./lib/bridge";

interface LibraryManagerAppProps {
  bridge: DesktopBridge;
  shellName: "electron" | "tauri";
}

export function LibraryManagerApp({ bridge, shellName }: LibraryManagerAppProps) {
  const state = useLibraryState();
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    `Open a Rekordbox XML file in ${shellName} mode to begin.`
  );

  const openXml = useCallback(async () => {
    try {
      const loaded = await bridge.openLibrary();
      if (!loaded) {
        return;
      }

      state.replaceLibrary(loaded.library, loaded.sourcePath);
      setStatusMessage(`Loaded ${loaded.library.tracks.length} tracks.`);
    } catch (error) {
      setStatusMessage(`Open failed: ${String(error)}`);
    }
  }, [bridge, state]);

  const saveAsXml = useCallback(async () => {
    if (!state.library) {
      return;
    }

    try {
      const result = await bridge.saveLibraryAs({
        library: state.library,
        sourcePath: state.sourcePath
      });

      if (!result) {
        return;
      }

      state.setUnsavedChanges(false);
      setStatusMessage(
        result.backupPath
          ? `Saved. Backup created at ${result.backupPath}`
          : `Saved to ${result.destinationPath}`
      );
    } catch (error) {
      setStatusMessage(`Save failed: ${String(error)}`);
    }
  }, [bridge, state]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      if (!isSaveShortcut) {
        return;
      }

      event.preventDefault();
      void saveAsXml();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveAsXml]);

  return (
    <>
      <AppLayout
        toolbar={
          <Toolbar
            onOpen={() => void openXml()}
            onSaveAs={() => void saveAsXml()}
            canSave={Boolean(state.library)}
            unsavedChanges={state.unsavedChanges}
            sourcePath={state.sourcePath}
            query={state.searchQuery}
            onQueryChange={state.setSearchQuery}
            genreFilter={state.genreFilter}
            onGenreFilterChange={state.setGenreFilter}
            genres={state.genres}
          />
        }
        sidebar={
          <PlaylistSidebar
            playlists={state.library?.playlists ?? []}
            selectedPlaylistId={state.selectedPlaylistId}
            onSelectPlaylist={state.setSelectedPlaylistId}
          />
        }
        content={
          <div className="content">
            <div className="content-topline">
              <span>{statusMessage}</span>
              <button
                disabled={state.selectedTrackIds.length === 0}
                onClick={() => setShowBulkEdit(true)}
              >
                Bulk Edit ({state.selectedTrackIds.length})
              </button>
            </div>

            <TrackTable
              tracks={state.visibleTracks}
              selectedTrackIds={state.selectedTrackIds}
              onSelectTrackIds={state.setSelectedTrackIds}
            />
          </div>
        }
        inspector={<MetadataEditor track={state.selectedTrack} onChange={state.onUpdateTrack} />}
      />

      <BulkEditModal
        open={showBulkEdit}
        selectedCount={state.selectedTrackIds.length}
        onClose={() => setShowBulkEdit(false)}
        onApply={(patch) => state.onApplyBulkEdit(state.selectedTrackIds, patch)}
      />
    </>
  );
}
