import { useState } from "react";
import type { BulkEditPatch } from "../types/library";

interface BulkEditModalProps {
  open: boolean;
  selectedCount: number;
  onClose: () => void;
  onApply: (patch: BulkEditPatch) => void;
}

export function BulkEditModal({
  open,
  selectedCount,
  onClose,
  onApply
}: BulkEditModalProps) {
  const [patch, setPatch] = useState<BulkEditPatch>({});

  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <h2>Bulk Edit {selectedCount} Tracks</h2>
        <p>Only fill fields that should be changed for all selected tracks.</p>

        <label>
          Artist
          <input
            value={patch.artist ?? ""}
            onChange={(event) => setPatch({ ...patch, artist: event.target.value })}
          />
        </label>

        <label>
          Album
          <input
            value={patch.album ?? ""}
            onChange={(event) => setPatch({ ...patch, album: event.target.value })}
          />
        </label>

        <label>
          Genre
          <input
            value={patch.genre ?? ""}
            onChange={(event) => setPatch({ ...patch, genre: event.target.value })}
          />
        </label>

        <label>
          Key
          <input
            value={patch.key ?? ""}
            onChange={(event) => setPatch({ ...patch, key: event.target.value })}
          />
        </label>

        <label>
          Rating
          <input
            type="number"
            min={0}
            max={5}
            value={patch.rating ?? ""}
            onChange={(event) => {
              const value = event.target.value.trim();
              setPatch({ ...patch, rating: value ? Number(value) : undefined });
            }}
          />
        </label>

        <label>
          Comments
          <textarea
            rows={3}
            value={patch.comments ?? ""}
            onChange={(event) => setPatch({ ...patch, comments: event.target.value })}
          />
        </label>

        <div className="modal-actions">
          <button onClick={onClose}>Cancel</button>
          <button
            onClick={() => {
              onApply(patch);
              setPatch({});
              onClose();
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
