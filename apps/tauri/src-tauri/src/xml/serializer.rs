use crate::models::{Library, Playlist, PlaylistKind, Track};

pub fn serialize_rekordbox_xml(library: &Library) -> String {
    let mut xml = String::new();
    xml.push_str("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    xml.push_str(&format!(
        "<DJ_PLAYLISTS Version=\"{}\">\n",
        escape_attr(
            library
                .metadata
                .rekordbox_version
                .as_deref()
                .unwrap_or("1.0.0")
        )
    ));

    xml.push_str("  <PRODUCT");
    if let Some(name) = &library.metadata.product_name {
        xml.push_str(&format!(" Name=\"{}\"", escape_attr(name)));
    }
    if let Some(version) = &library.metadata.product_version {
        xml.push_str(&format!(" Version=\"{}\"", escape_attr(version)));
    }
    xml.push_str("/>\n");

    xml.push_str(&format!("  <COLLECTION Entries=\"{}\">\n", library.tracks.len()));
    for track in &library.tracks {
        xml.push_str(&serialize_track(track));
    }
    xml.push_str("  </COLLECTION>\n");

    xml.push_str("  <PLAYLISTS>\n");
    xml.push_str("    <NODE Type=\"0\" Name=\"ROOT\">\n");
    for playlist in &library.playlists {
        xml.push_str(&serialize_playlist(playlist, 3));
    }
    xml.push_str("    </NODE>\n");
    xml.push_str("  </PLAYLISTS>\n");
    xml.push_str("</DJ_PLAYLISTS>\n");

    xml
}

fn serialize_track(track: &Track) -> String {
    let mut out = String::from("    <TRACK");
    out.push_str(&format!(" TrackID=\"{}\"", escape_attr(&track.id)));
    push_optional_attr(&mut out, "Name", track.title.as_deref());
    push_optional_attr(&mut out, "Artist", track.artist.as_deref());
    push_optional_attr(&mut out, "Album", track.album.as_deref());
    push_optional_attr(&mut out, "Genre", track.genre.as_deref());
    if let Some(bpm) = track.bpm {
        out.push_str(&format!(" AverageBpm=\"{}\"", bpm));
    }
    push_optional_attr(&mut out, "Tonality", track.key.as_deref());
    if let Some(rating) = track.rating {
        out.push_str(&format!(" Rating=\"{}\"", rating));
    }
    push_optional_attr(&mut out, "Comments", track.comments.as_deref());
    push_optional_attr(&mut out, "Location", track.location.as_deref());
    out.push_str(" />\n");
    out
}

fn serialize_playlist(playlist: &Playlist, indent_level: usize) -> String {
    let indent = "  ".repeat(indent_level);
    let mut out = format!(
        "{}<NODE Name=\"{}\" Type=\"{}\" Id=\"{}\"",
        indent,
        escape_attr(&playlist.name),
        match playlist.kind {
            PlaylistKind::Folder => "0",
            PlaylistKind::Playlist => "1",
        },
        escape_attr(&playlist.id)
    );

    if matches!(playlist.kind, PlaylistKind::Playlist) {
        out.push_str(&format!(" Entries=\"{}\"", playlist.track_ids.len()));
    }
    out.push_str(">\n");

    if matches!(playlist.kind, PlaylistKind::Playlist) {
        for track_id in &playlist.track_ids {
            out.push_str(&format!(
                "{}  <TRACK Key=\"{}\" />\n",
                indent,
                escape_attr(track_id)
            ));
        }
    }

    for child in &playlist.children {
        out.push_str(&serialize_playlist(child, indent_level + 1));
    }

    out.push_str(&format!("{}</NODE>\n", indent));
    out
}

fn push_optional_attr(buffer: &mut String, key: &str, value: Option<&str>) {
    if let Some(value) = value {
        buffer.push_str(&format!(" {}=\"{}\"", key, escape_attr(value)));
    }
}

fn escape_attr(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&apos;")
}
