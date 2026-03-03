import { useEffect, useState } from "react";
import type { Track } from "@rekordbox/types";

interface MetadataEditorProps {
  track: Track | null;
  onChange: (updated: Track) => void;
}

export function MetadataEditor({ track, onChange }: MetadataEditorProps) {
  const [draft, setDraft] = useState<Track | null>(track);

  useEffect(() => {
    setDraft(track);
  }, [track]);

  if (!draft) {
    return (
      <div className="editor empty">
        <h2>Track Editor</h2>
        <p>Select a single track to edit metadata.</p>
      </div>
    );
  }

  const updateField = <K extends keyof Track>(field: K, value: Track[K]) => {
    const next = {
      ...draft,
      [field]: value
    };
    setDraft(next);
    onChange(next);
  };

  return (
    <div className="editor">
      <h2>Track Editor</h2>
      <label>
        Title
        <input value={draft.title ?? ""} onChange={(event) => updateField("title", event.target.value)} />
      </label>
      <label>
        Artist
        <input value={draft.artist ?? ""} onChange={(event) => updateField("artist", event.target.value)} />
      </label>
      <label>
        Album
        <input value={draft.album ?? ""} onChange={(event) => updateField("album", event.target.value)} />
      </label>
      <label>
        Genre
        <input value={draft.genre ?? ""} onChange={(event) => updateField("genre", event.target.value)} />
      </label>
      <label>
        BPM
        <input
          type="number"
          value={draft.bpm ?? ""}
          onChange={(event) => {
            const value = event.target.value.trim();
            updateField("bpm", value ? Number(value) : undefined);
          }}
        />
      </label>
      <label>
        Key
        <input value={draft.key ?? ""} onChange={(event) => updateField("key", event.target.value)} />
      </label>
      <label>
        Rating
        <input
          type="number"
          min={0}
          max={5}
          value={draft.rating ?? ""}
          onChange={(event) => {
            const value = event.target.value.trim();
            updateField("rating", value ? Number(value) : undefined);
          }}
        />
      </label>
      <label>
        Comments
        <textarea
          rows={4}
          value={draft.comments ?? ""}
          onChange={(event) => updateField("comments", event.target.value)}
        />
      </label>
      <label>
        Location
        <input
          value={draft.location ?? ""}
          onChange={(event) => updateField("location", event.target.value)}
        />
      </label>
    </div>
  );
}
