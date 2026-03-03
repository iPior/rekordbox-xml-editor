import { contextBridge, ipcRenderer } from "electron";
import type { Library, SaveLibraryRequest } from "@rekordbox/types";

contextBridge.exposeInMainWorld("rekordboxBridge", {
  openLibrary: () => ipcRenderer.invoke("library:open"),
  saveLibraryAs: (request: Omit<SaveLibraryRequest, "destinationPath">) =>
    ipcRenderer.invoke("library:saveAs", request),
  validateLibrary: (library: Library) => ipcRenderer.invoke("library:validate", library)
});
