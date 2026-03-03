use crate::error::AppResult;
use chrono::Local;
use std::path::{Path, PathBuf};

pub fn create_timestamped_backup(path: &Path) -> AppResult<PathBuf> {
    let timestamp = Local::now().format("%Y%m%d-%H%M%S").to_string();
    let mut backup_name = path
        .file_stem()
        .map(|stem| stem.to_string_lossy().to_string())
        .unwrap_or_else(|| "rekordbox-library".to_string());

    backup_name.push_str(&format!(".backup.{timestamp}.xml"));
    let backup_path = path.with_file_name(backup_name);
    std::fs::copy(path, &backup_path)?;
    Ok(backup_path)
}
