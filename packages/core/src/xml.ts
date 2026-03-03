import { XMLBuilder, XMLParser } from "fast-xml-parser";
import type { Library, LibraryMetadata, Playlist, Track } from "@rekordbox/types";

type AnyRecord = Record<string, unknown>;

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_"
});

const builder = new XMLBuilder({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  format: true,
  suppressBooleanAttributes: false
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function parseTrack(raw: AnyRecord, fallbackIndex: number): Track {
  return {
    id: asString(raw["@_TrackID"]) ?? asString(raw["@_ID"]) ?? `generated-${fallbackIndex}`,
    title: asString(raw["@_Name"]),
    artist: asString(raw["@_Artist"]),
    album: asString(raw["@_Album"]),
    genre: asString(raw["@_Genre"]),
    bpm: Number(asString(raw["@_AverageBpm"]) ?? "") || undefined,
    key: asString(raw["@_Tonality"]),
    rating: Number(asString(raw["@_Rating"]) ?? "") || undefined,
    comments: asString(raw["@_Comments"]),
    location: asString(raw["@_Location"])
  };
}

function parsePlaylist(node: AnyRecord): Playlist {
  const nodeType = asString(node["@_Type"]) === "0" ? "folder" : "playlist";

  const trackIds = toArray(node.TRACK as AnyRecord | AnyRecord[] | undefined)
    .map((trackRef) => asString(trackRef["@_Key"]))
    .filter((value): value is string => Boolean(value));

  const children = toArray(node.NODE as AnyRecord | AnyRecord[] | undefined).map((child) =>
    parsePlaylist(child)
  );

  return {
    id: asString(node["@_Id"]) ?? asString(node["@_ID"]) ?? `playlist-${Math.random()}`,
    name: asString(node["@_Name"]) ?? "Untitled",
    kind: nodeType,
    trackIds,
    children
  };
}

export function parseRekordboxXml(xml: string): Library {
  const doc = parser.parse(xml) as AnyRecord;
  const root = (doc.DJ_PLAYLISTS ?? {}) as AnyRecord;

  const metadata: LibraryMetadata = {
    rekordboxVersion: asString(root["@_Version"]),
    productName: asString((root.PRODUCT as AnyRecord | undefined)?.["@_Name"]),
    productVersion: asString((root.PRODUCT as AnyRecord | undefined)?.["@_Version"])
  };

  const rawTracks = toArray(((root.COLLECTION as AnyRecord | undefined)?.TRACK ?? []) as
    | AnyRecord
    | AnyRecord[]);
  const tracks = rawTracks.map((track, index) => parseTrack(track, index + 1));

  const playlistsRoot = (root.PLAYLISTS as AnyRecord | undefined)?.NODE as AnyRecord | undefined;
  const rawNodes = playlistsRoot
    ? toArray((playlistsRoot.NODE ?? playlistsRoot) as AnyRecord | AnyRecord[])
    : [];

  const playlists = rawNodes.map((node) => parsePlaylist(node));

  return {
    tracks,
    playlists,
    metadata
  };
}

function serializeTrack(track: Track): AnyRecord {
  const raw: AnyRecord = {
    "@_TrackID": track.id
  };

  if (track.title) raw["@_Name"] = track.title;
  if (track.artist) raw["@_Artist"] = track.artist;
  if (track.album) raw["@_Album"] = track.album;
  if (track.genre) raw["@_Genre"] = track.genre;
  if (track.bpm !== undefined) raw["@_AverageBpm"] = String(track.bpm);
  if (track.key) raw["@_Tonality"] = track.key;
  if (track.rating !== undefined) raw["@_Rating"] = String(track.rating);
  if (track.comments) raw["@_Comments"] = track.comments;
  if (track.location) raw["@_Location"] = track.location;

  return raw;
}

function serializePlaylist(playlist: Playlist): AnyRecord {
  const raw: AnyRecord = {
    "@_Name": playlist.name,
    "@_Type": playlist.kind === "folder" ? "0" : "1",
    "@_Id": playlist.id
  };

  if (playlist.kind === "playlist") {
    raw["@_Entries"] = String(playlist.trackIds.length);
    raw.TRACK = playlist.trackIds.map((trackId) => ({ "@_Key": trackId }));
  }

  if (playlist.children.length > 0) {
    raw.NODE = playlist.children.map((child) => serializePlaylist(child));
  }

  return raw;
}

export function serializeRekordboxXml(library: Library): string {
  const root: AnyRecord = {
    DJ_PLAYLISTS: {
      "@_Version": library.metadata.rekordboxVersion ?? "1.0.0",
      PRODUCT: {
        "@_Name": library.metadata.productName ?? "rekordbox xml editor",
        "@_Version": library.metadata.productVersion ?? "0.1.0"
      },
      COLLECTION: {
        "@_Entries": String(library.tracks.length),
        TRACK: library.tracks.map((track) => serializeTrack(track))
      },
      PLAYLISTS: {
        NODE: {
          "@_Type": "0",
          "@_Name": "ROOT",
          NODE: library.playlists.map((playlist) => serializePlaylist(playlist))
        }
      }
    }
  };

  return `<?xml version="1.0" encoding="UTF-8"?>\n${builder.build(root)}`;
}
