import type { Playlist } from "../../types/library";

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
