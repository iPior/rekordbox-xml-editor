import { invoke } from "@tauri-apps/api/core";
import type {
  LoadedLibrary,
  SaveLibraryRequest,
  SaveLibraryResult,
  ValidationResult
} from "../types/library";

export async function openRekordboxXml(path: string): Promise<LoadedLibrary> {
  return invoke<LoadedLibrary>("open_rekordbox_xml", { path });
}

export async function validateLibraryXml(
  request: SaveLibraryRequest
): Promise<ValidationResult> {
  return invoke<ValidationResult>("validate_library_xml", { request });
}

export async function saveRekordboxXml(
  request: SaveLibraryRequest
): Promise<SaveLibraryResult> {
  return invoke<SaveLibraryResult>("save_rekordbox_xml", { request });
}
