import type { Playlist, Track } from "../types/library";

export function collectTrackIdsForPlaylist(root: Playlist): Set<string> {
  const ids = new Set<string>();
  const walk = (node: Playlist): void => {
    if (node.kind === "playlist") {
      for (const trackId of node.trackIds) {
        ids.add(trackId);
      }
    }
    for (const child of node.children) {
      walk(child);
    }
  };

  walk(root);
  return ids;
}

export function filterTracks(
  tracks: Track[],
  query: string,
  selectedPlaylist: Playlist | null,
  genreFilter: string
): Track[] {
  const normalizedQuery = query.trim().toLowerCase();
  const playlistTrackIds = selectedPlaylist
    ? collectTrackIdsForPlaylist(selectedPlaylist)
    : null;

  return tracks.filter((track) => {
    if (playlistTrackIds && !playlistTrackIds.has(track.id)) {
      return false;
    }

    if (genreFilter !== "all" && (track.genre ?? "") !== genreFilter) {
      return false;
    }

    if (!normalizedQuery) {
      return true;
    }

    const haystack = [
      track.title,
      track.artist,
      track.album,
      track.genre,
      track.comments,
      track.location
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedQuery);
  });
}
