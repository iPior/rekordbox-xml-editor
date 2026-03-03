import type { BulkEditPatch, Track } from "../../types/library";

export function applyBulkPatch(track: Track, patch: BulkEditPatch): Track {
  return {
    ...track,
    ...patch
  };
}
