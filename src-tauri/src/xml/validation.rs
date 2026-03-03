use crate::models::{Library, Playlist};
use std::collections::HashSet;

pub fn validate_library(library: &Library) -> Vec<String> {
    let mut errors = Vec::new();

    if library.tracks.is_empty() {
        errors.push("Library contains no tracks".to_string());
    }

    let mut unique_track_ids = HashSet::new();
    for track in &library.tracks {
        if track.id.trim().is_empty() {
            errors.push("Found track with empty id".to_string());
            continue;
        }

        if !unique_track_ids.insert(track.id.clone()) {
            errors.push(format!("Duplicate track id: {}", track.id));
        }
    }

    for playlist in &library.playlists {
        validate_playlist(playlist, &unique_track_ids, &mut errors);
    }

    errors
}

fn validate_playlist(playlist: &Playlist, track_ids: &HashSet<String>, errors: &mut Vec<String>) {
    if playlist.name.trim().is_empty() {
        errors.push(format!("Playlist {} has no name", playlist.id));
    }

    for track_id in &playlist.track_ids {
        if !track_ids.contains(track_id) {
            errors.push(format!(
                "Playlist {} references unknown track id {}",
                playlist.name, track_id
            ));
        }
    }

    for child in &playlist.children {
        validate_playlist(child, track_ids, errors);
    }
}
