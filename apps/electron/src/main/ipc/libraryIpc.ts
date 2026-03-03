import { dialog, ipcMain } from "electron";
import type { SaveLibraryRequest } from "@rekordbox/types";
import { loadLibraryFromPath, saveLibrarySafely, validateLibraryPayload } from "../services/fileService";

export function registerLibraryIpcHandlers() {
  ipcMain.handle("library:open", async () => {
    const selected = await dialog.showOpenDialog({
      title: "Open Rekordbox XML",
      properties: ["openFile"],
      filters: [{ name: "XML", extensions: ["xml"] }]
    });

    if (selected.canceled || selected.filePaths.length === 0) {
      return null;
    }

    return loadLibraryFromPath(selected.filePaths[0]);
  });

  ipcMain.handle("library:saveAs", async (_event, payload: Omit<SaveLibraryRequest, "destinationPath">) => {
    const selected = await dialog.showSaveDialog({
      title: "Save Rekordbox XML",
      filters: [{ name: "XML", extensions: ["xml"] }],
      defaultPath: payload.sourcePath ?? "library.xml"
    });

    if (selected.canceled || !selected.filePath) {
      return null;
    }

    return saveLibrarySafely({
      ...payload,
      destinationPath: selected.filePath
    });
  });

  ipcMain.handle("library:validate", async (_event, library) => {
    return validateLibraryPayload(library);
  });
}
