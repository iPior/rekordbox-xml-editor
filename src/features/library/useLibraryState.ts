import { useMemo, useState } from "react";
import type { BulkEditPatch, Library, Track } from "../../types/library";
import { findPlaylistById } from "../playlists/playlistTree";
import { applyBulkPatch } from "../tracks/bulkEdit";
import { filterTracks } from "../../lib/filtering";

export function useLibraryState() {
  const [library, setLibrary] = useState<Library | null>(null);
  const [sourcePath, setSourcePath] = useState<string | null>(null);
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("all");
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const selectedPlaylist = useMemo(() => {
    if (!library || !selectedPlaylistId) {
      return null;
    }

    return findPlaylistById(library.playlists, selectedPlaylistId);
  }, [library, selectedPlaylistId]);

  const visibleTracks = useMemo(() => {
    if (!library) {
      return [];
    }

    return filterTracks(library.tracks, searchQuery, selectedPlaylist, genreFilter);
  }, [library, searchQuery, selectedPlaylist, genreFilter]);

  const selectedTrack = useMemo(() => {
    if (!library || selectedTrackIds.length !== 1) {
      return null;
    }

    const selectedId = selectedTrackIds[0];
    return library.tracks.find((track) => track.id === selectedId) ?? null;
  }, [library, selectedTrackIds]);

  const genres = useMemo(() => {
    if (!library) {
      return [];
    }

    return Array.from(
      new Set(library.tracks.map((track) => track.genre).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b));
  }, [library]);

  const replaceLibrary = (nextLibrary: Library, path: string) => {
    setLibrary(nextLibrary);
    setSourcePath(path);
    setSelectedTrackIds([]);
    setSelectedPlaylistId(null);
    setSearchQuery("");
    setGenreFilter("all");
    setUnsavedChanges(false);
  };

  const updateTrack = (updatedTrack: Track) => {
    if (!library) {
      return;
    }

    setLibrary({
      ...library,
      tracks: library.tracks.map((track) =>
        track.id === updatedTrack.id ? updatedTrack : track
      )
    });
    setUnsavedChanges(true);
  };

  const applyBulkEdit = (trackIds: string[], patch: BulkEditPatch) => {
    if (!library || trackIds.length === 0) {
      return;
    }

    setLibrary({
      ...library,
      tracks: library.tracks.map((track) => {
        if (!trackIds.includes(track.id)) {
          return track;
        }

        return applyBulkPatch(track, patch);
      })
    });
    setUnsavedChanges(true);
  };

  return {
    library,
    sourcePath,
    selectedTrackIds,
    selectedPlaylistId,
    selectedPlaylist,
    selectedTrack,
    searchQuery,
    genreFilter,
    genres,
    visibleTracks,
    unsavedChanges,
    setSelectedTrackIds,
    setSelectedPlaylistId,
    setSearchQuery,
    setGenreFilter,
    setUnsavedChanges,
    replaceLibrary,
    updateTrack,
    applyBulkEdit
  };
}
