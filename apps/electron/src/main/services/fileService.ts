import { readFile, rename, stat, writeFile, copyFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { parseRekordboxXml, serializeRekordboxXml, validateLibrary } from "@rekordbox/core";
import type { Library, LoadedLibrary, SaveLibraryRequest, SaveLibraryResult } from "@rekordbox/types";

function createBackupPath(destinationPath: string): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0")
  ].join("") +
    "-" +
    [String(now.getHours()).padStart(2, "0"), String(now.getMinutes()).padStart(2, "0"), String(now.getSeconds()).padStart(2, "0")].join("");

  const dir = path.dirname(destinationPath);
  const ext = path.extname(destinationPath) || ".xml";
  const base = path.basename(destinationPath, ext);
  return path.join(dir, `${base}.backup.${stamp}${ext}`);
}

export async function loadLibraryFromPath(sourcePath: string): Promise<LoadedLibrary> {
  const xmlText = await readFile(sourcePath, "utf8");
  const library = parseRekordboxXml(xmlText);
  return {
    sourcePath,
    library
  };
}

export async function saveLibrarySafely(request: SaveLibraryRequest): Promise<SaveLibraryResult> {
  const validation = validateLibrary(request.library);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(" | ")}`);
  }

  let backupPath: string | undefined;
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

export function validateLibraryPayload(library: Library) {
  return validateLibrary(library);
}
