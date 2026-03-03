import type { Playlist } from "@rekordbox/types";

export function findPlaylistById(playlists: Playlist[], id: string): Playlist | null {
  for (const playlist of playlists) {
    if (playlist.id === id) {
      return playlist;
    }

    const nested = findPlaylistById(playlist.children, id);
    if (nested) {
      return nested;
    }
  }

  return null;
}

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
