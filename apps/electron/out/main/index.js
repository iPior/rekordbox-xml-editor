import { ipcMain, dialog, app, BrowserWindow } from "electron";
import path from "node:path";
import { readFile, copyFile, writeFile, rename, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { parseRekordboxXml, validateLibrary, serializeRekordboxXml } from "@rekordbox/core";
import __cjs_mod__ from "node:module";
const __filename = import.meta.filename;
const __dirname = import.meta.dirname;
const require2 = __cjs_mod__.createRequire(import.meta.url);
function createBackupPath(destinationPath) {
  const now = /* @__PURE__ */ new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("") + "-" + [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join("");
  const dir = path.dirname(destinationPath);
  const ext = path.extname(destinationPath) || ".xml";
  const base = path.basename(destinationPath, ext);
  return path.join(dir, `${base}.backup.${stamp}${ext}`);
}
async function loadLibraryFromPath(sourcePath) {
  const xmlText = await readFile(sourcePath, "utf8");
  const library = parseRekordboxXml(xmlText);
  return {
    sourcePath,
    library
  };
}
async function saveLibrarySafely(request) {
  const validation = validateLibrary(request.library);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(" | ")}`);
  }
  let backupPath;
  if (request.createBackup && existsSync(request.destinationPath)) {
    backupPath = createBackupPath(request.destinationPath);
    await copyFile(request.destinationPath, backupPath);
  }
  const xmlText = serializeRekordboxXml(request.library);
  const tempPath = `${request.destinationPath}.tmp`;
  await writeFile(tempPath, xmlText, "utf8");
  await rename(tempPath, request.destinationPath);
  await stat(request.destinationPath);
  return {
    destinationPath: request.destinationPath,
    backupPath
  };
}
function validateLibraryPayload(library) {
  return validateLibrary(library);
}
function registerLibraryIpcHandlers() {
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
  ipcMain.handle("library:saveAs", async (_event, payload) => {
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
let mainWindow = null;
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1500,
    height: 900,
    minWidth: 1024,
    minHeight: 680,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    void mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
}
app.whenReady().then(() => {
  registerLibraryIpcHandlers();
  createMainWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
