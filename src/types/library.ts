export interface Track {
  id: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  bpm?: number;
  key?: string;
  rating?: number;
  comments?: string;
  location?: string;
}

export interface Playlist {
  id: string;
  name: string;
  kind: "folder" | "playlist";
  trackIds: string[];
  children: Playlist[];
}

export interface LibraryMetadata {
  rekordboxVersion?: string;
  productName?: string;
  productVersion?: string;
}

export interface Library {
  tracks: Track[];
  playlists: Playlist[];
  metadata: LibraryMetadata;
}

export interface LoadedLibrary {
  sourcePath: string;
  library: Library;
}

export interface SaveLibraryRequest {
  destinationPath: string;
  sourcePath?: string;
  library: Library;
  createBackup: boolean;
}

export interface SaveLibraryResult {
  destinationPath: string;
  backupPath?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface BulkEditPatch {
  artist?: string;
  album?: string;
  genre?: string;
  key?: string;
  rating?: number;
  comments?: string;
}
