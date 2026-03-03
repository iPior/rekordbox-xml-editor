import type { Library, SaveLibraryRequest } from "@rekordbox/types";

declare global {
  interface Window {
    rekordboxBridge: {
      openLibrary: () => Promise<unknown>;
      saveLibraryAs: (request: Omit<SaveLibraryRequest, "destinationPath">) => Promise<unknown>;
      validateLibrary: (library: Library) => Promise<unknown>;
    };
  }
}

export {};
