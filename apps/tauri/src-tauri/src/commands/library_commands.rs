use crate::models::{LoadedLibrary, SaveLibraryRequest, SaveLibraryResult, ValidationResult};
use crate::services::library_service;

// Command modules stay intentionally thin. Business rules and IO flow belong to services.
#[tauri::command]
pub fn open_rekordbox_xml(path: String) -> Result<LoadedLibrary, String> {
    library_service::open_rekordbox_xml(&path).map_err(|error| error.to_string())
}

#[tauri::command]
pub fn validate_library_xml(request: SaveLibraryRequest) -> Result<ValidationResult, String> {
    Ok(library_service::validate_library(&request.library))
}

#[tauri::command]
pub fn save_rekordbox_xml(request: SaveLibraryRequest) -> Result<SaveLibraryResult, String> {
    library_service::save_rekordbox_xml(&request).map_err(|error| error.to_string())
}
