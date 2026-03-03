import type { Playlist } from "@rekordbox/types";

interface PlaylistSidebarProps {
  playlists: Playlist[];
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string | null) => void;
}

interface PlaylistNodeProps {
  node: Playlist;
  depth: number;
  selectedPlaylistId: string | null;
  onSelectPlaylist: (playlistId: string) => void;
}

function PlaylistNode({ node, depth, selectedPlaylistId, onSelectPlaylist }: PlaylistNodeProps) {
  const isSelected = selectedPlaylistId === node.id;

  return (
    <li>
      <button
        className={`playlist-node ${isSelected ? "active" : ""}`}
        style={{ paddingLeft: `${10 + depth * 14}px` }}
        onClick={() => onSelectPlaylist(node.id)}
      >
        <span className="playlist-kind">{node.kind === "folder" ? "Folder" : "List"}</span>
        <span>{node.name}</span>
      </button>
      {node.children.length > 0 ? (
        <ul className="playlist-tree">
          {node.children.map((child) => (
            <PlaylistNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedPlaylistId={selectedPlaylistId}
              onSelectPlaylist={onSelectPlaylist}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function PlaylistSidebar({ playlists, selectedPlaylistId, onSelectPlaylist }: PlaylistSidebarProps) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Playlists</h2>
        <button onClick={() => onSelectPlaylist(null)}>All tracks</button>
      </div>
      <ul className="playlist-tree">
        {playlists.map((playlist) => (
          <PlaylistNode
            key={playlist.id}
            node={playlist}
            depth={0}
            selectedPlaylistId={selectedPlaylistId}
            onSelectPlaylist={onSelectPlaylist}
          />
        ))}
      </ul>
    </div>
  );
}
