import { useCallback, useEffect, useState } from "react";
import { open, save } from "@tauri-apps/plugin-dialog";
import { AppLayout } from "./components/AppLayout";
import { BulkEditModal } from "./components/BulkEditModal";
import { MetadataEditor } from "./components/MetadataEditor";
import { PlaylistSidebar } from "./components/PlaylistSidebar";
import { Toolbar } from "./components/Toolbar";
import { TrackTable } from "./components/TrackTable";
import { useLibraryState } from "./features/library/useLibraryState";
import { openRekordboxXml, saveRekordboxXml, validateLibraryXml } from "./lib/tauriApi";

function App() {
  const state = useLibraryState();
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Open a Rekordbox XML file to begin.");

  const openXml = useCallback(async () => {
    const selected = await open({
      title: "Open Rekordbox XML",
      multiple: false,
      filters: [{ name: "XML", extensions: ["xml"] }]
    });

    if (!selected || Array.isArray(selected)) {
      return;
    }

    try {
      const loaded = await openRekordboxXml(selected);
      state.replaceLibrary(loaded.library, loaded.sourcePath);
      setStatusMessage(`Loaded ${loaded.library.tracks.length} tracks.`);
    } catch (error) {
      setStatusMessage(`Open failed: ${String(error)}`);
    }
  }, [state]);

  const saveAsXml = useCallback(async () => {
    if (!state.library) {
      return;
    }

    const destination = await save({
      title: "Save Rekordbox XML",
      filters: [{ name: "XML", extensions: ["xml"] }],
      defaultPath: state.sourcePath ?? "library.xml"
    });

    if (!destination) {
      return;
    }

    try {
      const request = {
        sourcePath: state.sourcePath ?? undefined,
        destinationPath: destination,
        createBackup: true,
        library: state.library
      };

      const validation = await validateLibraryXml(request);
      if (!validation.valid) {
        setStatusMessage(`Cannot save: ${validation.errors.join(" | ")}`);
        return;
      }

      const result = await saveRekordboxXml(request);
      state.setUnsavedChanges(false);
      setStatusMessage(
        result.backupPath
          ? `Saved. Backup created at ${result.backupPath}`
          : `Saved to ${result.destinationPath}`
      );
    } catch (error) {
      setStatusMessage(`Save failed: ${String(error)}`);
    }
  }, [state]);

  useEffect(() => {
    const keyHandler = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      if (isSaveShortcut) {
        event.preventDefault();
        void saveAsXml();
      }
    };

    window.addEventListener("keydown", keyHandler);
    return () => window.removeEventListener("keydown", keyHandler);
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
        inspector={<MetadataEditor track={state.selectedTrack} onChange={state.updateTrack} />}
      />

      <BulkEditModal
        open={showBulkEdit}
        selectedCount={state.selectedTrackIds.length}
        onClose={() => setShowBulkEdit(false)}
        onApply={(patch) => state.applyBulkEdit(state.selectedTrackIds, patch)}
      />
    </>
  );
}

export default App;
