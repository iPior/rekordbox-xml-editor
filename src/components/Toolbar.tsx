interface ToolbarProps {
  onOpen: () => void;
  onSaveAs: () => void;
  canSave: boolean;
  unsavedChanges: boolean;
  sourcePath: string | null;
  query: string;
  onQueryChange: (value: string) => void;
  genreFilter: string;
  onGenreFilterChange: (value: string) => void;
  genres: string[];
}

export function Toolbar({
  onOpen,
  onSaveAs,
  canSave,
  unsavedChanges,
  sourcePath,
  query,
  onQueryChange,
  genreFilter,
  onGenreFilterChange,
  genres
}: ToolbarProps) {
  return (
    <div className="toolbar">
      <div className="toolbar-actions">
        <button onClick={onOpen}>Open XML</button>
        <button onClick={onSaveAs} disabled={!canSave}>
          Save As
        </button>
      </div>

      <div className="toolbar-filters">
        <input
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search title, artist, album, comments..."
          aria-label="Search tracks"
        />

        <select
          value={genreFilter}
          onChange={(event) => onGenreFilterChange(event.target.value)}
          aria-label="Genre filter"
        >
          <option value="all">All genres</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      <div className="toolbar-status">
        <span className={unsavedChanges ? "status-pill dirty" : "status-pill clean"}>
          {unsavedChanges ? "Unsaved changes" : "All changes saved"}
        </span>
        <span className="source-path" title={sourcePath ?? "No file loaded"}>
          {sourcePath ?? "No file loaded"}
        </span>
      </div>
    </div>
  );
}
