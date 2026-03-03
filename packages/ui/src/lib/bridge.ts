import type { Library, LoadedLibrary, SaveLibraryResult } from "@rekordbox/types";

export interface DesktopBridge {
  openLibrary(): Promise<LoadedLibrary | null>;
  saveLibraryAs(input: { library: Library; sourcePath: string | null }): Promise<SaveLibraryResult | null>;
}
