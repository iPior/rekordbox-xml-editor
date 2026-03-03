import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("rekordboxBridge", {
  openLibrary: () => ipcRenderer.invoke("library:open"),
  saveLibraryAs: (request) => ipcRenderer.invoke("library:saveAs", request),
  validateLibrary: (library) => ipcRenderer.invoke("library:validate", library)
});
