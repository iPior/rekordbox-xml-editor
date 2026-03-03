import type { BulkEditPatch, Library, Playlist, Track, ValidationResult } from "@rekordbox/types";
import { collectTrackIdsForPlaylist } from "./playlists";
import { applyBulkPatch, searchableText } from "./tracks";

export function filterTracks(
  tracks: Track[],
  query: string,
  selectedPlaylist: Playlist | null,
  genre: string
): Track[] {
  const normalizedQuery = query.trim().toLowerCase();
  const playlistTrackIds = selectedPlaylist
    ? collectTrackIdsForPlaylist(selectedPlaylist)
    : null;

  return tracks.filter((track) => {
    if (playlistTrackIds && !playlistTrackIds.has(track.id)) {
      return false;
    }

    if (genre !== "all" && (track.genre ?? "") !== genre) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    return searchableText(track).includes(normalizedQuery);
  });
}

export function updateTrack(library: Library, updatedTrack: Track): Library {
  return {
    ...library,
    tracks: library.tracks.map((track) => (track.id === updatedTrack.id ? updatedTrack : track))
  };
}

export function applyBulkEdit(library: Library, trackIds: string[], patch: BulkEditPatch): Library {
  if (trackIds.length === 0) {
    return library;
  }

  return {
    ...library,
    tracks: library.tracks.map((track) => {
      if (!trackIds.includes(track.id)) {
        return track;
      }
      return applyBulkPatch(track, patch);
    })
  };
}

export function validateLibrary(library: Library): ValidationResult {
  const errors: string[] = [];
  const trackIds = new Set<string>();

  for (const track of library.tracks) {
    if (!track.id.trim()) {
      errors.push("Track id is empty");
      continue;
    }

    if (trackIds.has(track.id)) {
      errors.push(`Duplicate track id: ${track.id}`);
      continue;
    }

    trackIds.add(track.id);
  }

  const validatePlaylist = (playlist: Playlist): void => {
    if (!playlist.name.trim()) {
      errors.push(`Playlist ${playlist.id} has empty name`);
    }

    for (const trackId of playlist.trackIds) {
      if (!trackIds.has(trackId)) {
        errors.push(`Playlist ${playlist.name} references unknown track id ${trackId}`);
      }
    }

    for (const child of playlist.children) {
      validatePlaylist(child);
    }
  };

  for (const playlist of library.playlists) {
    validatePlaylist(playlist);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
