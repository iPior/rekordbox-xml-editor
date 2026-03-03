import { useMemo, useState } from "react";
import type { Track } from "../types/library";

type SortColumn = keyof Pick<
  Track,
  "title" | "artist" | "album" | "genre" | "bpm" | "key" | "rating"
>;

interface TrackTableProps {
  tracks: Track[];
  selectedTrackIds: string[];
  onSelectTrackIds: (trackIds: string[]) => void;
}

function toComparableValue(track: Track, column: SortColumn): string | number {
  const value = track[column];
  if (typeof value === "number") {
    return value;
  }

  return (value ?? "").toString().toLowerCase();
}

export function TrackTable({ tracks, selectedTrackIds, onSelectTrackIds }: TrackTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>("title");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const sortedTracks = useMemo(() => {
    const next = [...tracks].sort((left, right) => {
      const a = toComparableValue(left, sortColumn);
      const b = toComparableValue(right, sortColumn);

      if (a < b) return sortDirection === "asc" ? -1 : 1;
      if (a > b) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return next;
  }, [tracks, sortColumn, sortDirection]);

  const isSelected = (trackId: string) => selectedTrackIds.includes(trackId);

  const toggleTrackSelection = (trackId: string, multi: boolean) => {
    if (!multi) {
      onSelectTrackIds([trackId]);
      return;
    }

    if (isSelected(trackId)) {
      onSelectTrackIds(selectedTrackIds.filter((id) => id !== trackId));
      return;
    }

    onSelectTrackIds([...selectedTrackIds, trackId]);
  };

  const toggleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  const selectAllVisible = (checked: boolean) => {
    if (!checked) {
      onSelectTrackIds([]);
      return;
    }

    onSelectTrackIds(sortedTracks.map((track) => track.id));
  };

  return (
    <div className="table-wrap">
      <table className="track-table">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={tracks.length > 0 && selectedTrackIds.length === tracks.length}
                onChange={(event) => selectAllVisible(event.target.checked)}
                aria-label="Select all visible tracks"
              />
            </th>
            {([
              ["title", "Title"],
              ["artist", "Artist"],
              ["album", "Album"],
              ["genre", "Genre"],
              ["bpm", "BPM"],
              ["key", "Key"],
              ["rating", "Rating"]
            ] as Array<[SortColumn, string]>).map(([column, label]) => (
              <th key={column}>
                <button className="sort-button" onClick={() => toggleSort(column)}>
                  {label}
                </button>
              </th>
            ))}
            <th>Comments</th>
            <th>Location</th>
          </tr>
        </thead>

        <tbody>
          {sortedTracks.map((track) => {
            const selected = isSelected(track.id);
            return (
              <tr
                key={track.id}
                className={selected ? "selected" : ""}
                onClick={(event) => toggleTrackSelection(track.id, event.ctrlKey || event.metaKey)}
              >
                <td>
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={(event) => {
                      event.stopPropagation();
                      toggleTrackSelection(track.id, true);
                    }}
                    aria-label={`Select ${track.title ?? track.id}`}
                  />
                </td>
                <td>{track.title ?? ""}</td>
                <td>{track.artist ?? ""}</td>
                <td>{track.album ?? ""}</td>
                <td>{track.genre ?? ""}</td>
                <td>{track.bpm ?? ""}</td>
                <td>{track.key ?? ""}</td>
                <td>{track.rating ?? ""}</td>
                <td className="comments-cell">{track.comments ?? ""}</td>
                <td className="location-cell">{track.location ?? ""}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
