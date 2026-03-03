use crate::error::{AppError, AppResult};
use crate::models::{
    Library, LoadedLibrary, SaveLibraryRequest, SaveLibraryResult, ValidationResult,
};
use crate::services::backup_service;
use crate::xml::{parser, serializer, validation};
use std::path::Path;

pub fn open_rekordbox_xml(path: &str) -> AppResult<LoadedLibrary> {
    // Convert XML to normalized models immediately to keep UI decoupled from raw XML nodes.
    let xml = std::fs::read_to_string(path)?;
    let library = parser::parse_rekordbox_xml(&xml)?;

    Ok(LoadedLibrary {
        source_path: path.to_string(),
        library,
    })
}

pub fn validate_library(library: &Library) -> ValidationResult {
    let errors = validation::validate_library(library);
    ValidationResult {
        valid: errors.is_empty(),
        errors,
    }
}

pub fn save_rekordbox_xml(request: &SaveLibraryRequest) -> AppResult<SaveLibraryResult> {
    let validation_errors = validation::validate_library(&request.library);
    if !validation_errors.is_empty() {
        return Err(AppError::Validation(validation_errors.join(" | ")));
    }

    let destination = Path::new(&request.destination_path);
    let mut backup_path = None;

    if request.create_backup && destination.exists() {
        backup_path = Some(backup_service::create_timestamped_backup(destination)?);
    }

    // Write to a temp file first, then rename. This avoids partial writes.
    let xml = serializer::serialize_rekordbox_xml(&request.library);
    let temp_path = destination.with_extension("xml.tmp");

    std::fs::write(&temp_path, xml)?;

    if destination.exists() {
        std::fs::remove_file(destination)?;
    }
    std::fs::rename(&temp_path, destination)?;

    Ok(SaveLibraryResult {
        destination_path: request.destination_path.clone(),
        backup_path: backup_path.map(|path| path.to_string_lossy().to_string()),
    })
}
