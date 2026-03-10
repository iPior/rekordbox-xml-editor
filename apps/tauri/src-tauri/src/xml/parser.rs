use crate::error::{AppError, AppResult};
use crate::models::{Library, LibraryMetadata, Playlist, PlaylistKind, Track};
use roxmltree::{Document, Node};
use std::collections::HashMap;

pub fn parse_rekordbox_xml(xml: &str) -> AppResult<Library> {
    // roxmltree is fast and read-only, useful for defensive parsing in backend commands.
    let doc = Document::parse(xml).map_err(|e| AppError::XmlParse(e.to_string()))?;
    let root = doc
        .descendants()
        .find(|node| node.has_tag_name("DJ_PLAYLISTS"))
        .ok_or_else(|| AppError::XmlParse("Missing DJ_PLAYLISTS root element".to_string()))?;

    let metadata = parse_metadata(root);
    let tracks = parse_tracks(root);
    let track_lookup = tracks
        .iter()
        .map(|track| {
            (
                track.id.clone(),
                track.location.clone().unwrap_or_else(String::new),
            )
        })
        .collect::<HashMap<_, _>>();

    let playlists = parse_playlists(root, &track_lookup);

    Ok(Library {
        tracks,
        playlists,
        metadata,
    })
}

fn parse_metadata(root: Node<'_, '_>) -> LibraryMetadata {
    let rekordbox_version = root.attribute("Version").map(ToOwned::to_owned);
    let product = root
        .children()
        .find(|node| node.is_element() && node.has_tag_name("PRODUCT"));

    let product_name = product.and_then(|node| node.attribute("Name").map(ToOwned::to_owned));
    let product_version = product.and_then(|node| node.attribute("Version").map(ToOwned::to_owned));

    LibraryMetadata {
        rekordbox_version,
        product_name,
        product_version,
    }
}

fn parse_tracks(root: Node<'_, '_>) -> Vec<Track> {
    let collection = root
        .children()
        .find(|node| node.is_element() && node.has_tag_name("COLLECTION"));

    let mut fallback_index = 0_u64;
    collection
        .into_iter()
        .flat_map(|node| node.children())
        .filter(|node| node.is_element() && node.has_tag_name("TRACK"))
        .map(|track_node| {
            fallback_index += 1;
            let id = track_node
                .attribute("TrackID")
                .or_else(|| track_node.attribute("ID"))
                .map(ToOwned::to_owned)
                .unwrap_or_else(|| format!("generated-{fallback_index}"));

            Track {
                id,
                title: track_node.attribute("Name").map(ToOwned::to_owned),
                artist: track_node.attribute("Artist").map(ToOwned::to_owned),
                album: track_node.attribute("Album").map(ToOwned::to_owned),
                genre: track_node.attribute("Genre").map(ToOwned::to_owned),
                bpm: track_node
                    .attribute("AverageBpm")
                    .and_then(|value| value.parse::<f32>().ok()),
                key: track_node.attribute("Tonality").map(ToOwned::to_owned),
                rating: track_node
                    .attribute("Rating")
                    .and_then(|value| value.parse::<u8>().ok()),
                comments: track_node.attribute("Comments").map(ToOwned::to_owned),
                location: track_node.attribute("Location").map(ToOwned::to_owned),
            }
        })
        .collect()
}

fn parse_playlists(root: Node<'_, '_>, track_lookup: &HashMap<String, String>) -> Vec<Playlist> {
    let playlists_root = root
        .children()
        .find(|node| node.is_element() && node.has_tag_name("PLAYLISTS"));

    playlists_root
        .into_iter()
        .flat_map(|playlist_parent| playlist_parent.children())
        .filter(|node| node.is_element() && node.has_tag_name("NODE"))
        .enumerate()
        .flat_map(|(index, node)| {
            let path = format!("{}", index + 1);
            if node.attribute("Type") == Some("0") {
                node.children()
                    .filter(|child| child.is_element() && child.has_tag_name("NODE"))
                    .enumerate()
                    .map(|(child_index, child)| {
                        parse_playlist_node(
                            child,
                            track_lookup,
                            format!("{}.{}", path, child_index + 1),
                        )
                    })
                    .collect::<Vec<_>>()
            } else {
                vec![parse_playlist_node(node, track_lookup, path)]
            }
        })
        .collect()
}

fn parse_playlist_node(
    node: Node<'_, '_>,
    track_lookup: &HashMap<String, String>,
    path_id: String,
) -> Playlist {
    let id = node
        .attribute("Id")
        .or_else(|| node.attribute("ID"))
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| format!("playlist-{path_id}"));
    let name = node
        .attribute("Name")
        .map(ToOwned::to_owned)
        .unwrap_or_else(|| "Untitled".to_string());
    let kind = if node.attribute("Type") == Some("0") {
        PlaylistKind::Folder
    } else {
        PlaylistKind::Playlist
    };

    let track_ids = node
        .children()
        .filter(|child| child.is_element() && child.has_tag_name("TRACK"))
        .filter_map(|track| {
            if let Some(id_ref) = track.attribute("Key") {
                return Some(id_ref.to_string());
            }

            if let Some(id_ref) = track.attribute("TrackID") {
                return Some(id_ref.to_string());
            }

            let location = track.attribute("Location")?;
            track_lookup.iter().find_map(|(track_id, track_location)| {
                if track_location == location {
                    Some(track_id.clone())
                } else {
                    None
                }
            })
        })
        .collect();

    let children = node
        .children()
        .filter(|child| child.is_element() && child.has_tag_name("NODE"))
        .enumerate()
        .map(|(index, child)| {
            parse_playlist_node(child, track_lookup, format!("{}.{}", path_id, index + 1))
        })
        .collect();

    Playlist {
        id,
        name,
        kind,
        track_ids,
        children,
    }
}
