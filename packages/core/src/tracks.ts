import type { BulkEditPatch, Track } from "@rekordbox/types";

export function applyBulkPatch(track: Track, patch: BulkEditPatch): Track {
  return {
    ...track,
    ...patch
  };
}

export function searchableText(track: Track): string {
  return [
    track.title,
    track.artist,
    track.album,
    track.genre,
    track.key,
    track.comments,
    track.location
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}
