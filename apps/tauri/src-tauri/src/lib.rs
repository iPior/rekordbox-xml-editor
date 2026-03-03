mod commands;
mod error;
mod models;
mod services;
mod xml;

use commands::{open_rekordbox_xml, save_rekordbox_xml, validate_library_xml};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            open_rekordbox_xml,
            save_rekordbox_xml,
            validate_library_xml,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
