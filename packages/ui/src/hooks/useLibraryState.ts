import { applyBulkEdit, filterTracks, findPlaylistById, updateTrack } from "@rekordbox/core";
import type { BulkEditPatch, Library, Track } from "@rekordbox/types";
import { useMemo, useState } from "react";

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

  const selectedTrack = useMemo(() => {
    if (!library || selectedTrackIds.length !== 1) {
      return null;
    }
    return library.tracks.find((track) => track.id === selectedTrackIds[0]) ?? null;
  }, [library, selectedTrackIds]);

  const visibleTracks = useMemo(() => {
    if (!library) {
      return [];
    }
    return filterTracks(library.tracks, searchQuery, selectedPlaylist, genreFilter);
  }, [library, searchQuery, selectedPlaylist, genreFilter]);

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

  const onUpdateTrack = (track: Track) => {
    if (!library) {
      return;
    }
    setLibrary(updateTrack(library, track));
    setUnsavedChanges(true);
  };

  const onApplyBulkEdit = (trackIds: string[], patch: BulkEditPatch) => {
    if (!library) {
      return;
    }
    setLibrary(applyBulkEdit(library, trackIds, patch));
    setUnsavedChanges(true);
  };

  return {
    library,
    sourcePath,
    selectedTrackIds,
    selectedPlaylistId,
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
    onUpdateTrack,
    onApplyBulkEdit
  };
}
