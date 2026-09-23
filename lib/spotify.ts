import "server-only";
import { safeHttpsUrl } from "./safe-url";

/**
 * Spotify API integration — token refresh and API calls.
 *
 * Prerequisites (set as env vars, server-side only):
 *   SPOTIFY_CLIENT_ID
 *   SPOTIFY_CLIENT_SECRET
 *   SPOTIFY_REFRESH_TOKEN
 *
 * See plan.md § 5 for the full setup guide.
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const SPOTIFY_RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyTrackItem {
  type?: string;
  name: string;
  artists?: SpotifyArtist[];
  album?: { images?: SpotifyImage[]; name?: string };
  images?: SpotifyImage[];
  show?: { name?: string; images?: SpotifyImage[] };
  external_urls?: { spotify?: string };
}

export interface NowPlayingData {
  isPlaying: boolean;
  title: string;
  artist: string;
  albumArtUrl: string;
  trackUrl: string;
}

export class SpotifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SpotifyConfigError";
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;
const RESULT_TTL_MS = 20_000;
const REQUEST_TIMEOUT_MS = 8_000;
const ART_HOSTS = ["i.scdn.co", "image-cdn-ak.spotifycdn.com", "image-cdn-fa.spotifycdn.com", "mosaic.scdn.co"];

export class SpotifyUpstreamError extends Error {
  constructor(message: string, public readonly retryAfter = 20) {
    super(message);
    this.name = "SpotifyUpstreamError";
  }
}

// Bounded, process-local cache shared by every URL/query for this owner's feed.
// A hosting firewall/shared rate limiter is still needed across server instances.
let cachedResult: { data: NowPlayingData | null; expiresAt: number } | null = null;
let cachedFailure: { error: Error; expiresAt: number } | null = null;
let pendingResult: Promise<NowPlayingData | null> | null = null;

async function spotifyFetch(url: string, init: RequestInit): Promise<Response> {
  const response = await fetch(url, { ...init, cache: "no-store", redirect: "error" });
  if (response.status === 401 || response.status === 403) cachedToken = null;
  if (!response.ok) {
    const retryHeader = response.headers.get("Retry-After");
    const retrySeconds = retryHeader ? Number(retryHeader) : 20;
    const retryAfter = response.status === 429 && Number.isFinite(retrySeconds)
      ? Math.max(20, Math.ceil(retrySeconds))
      : 20;
    throw new SpotifyUpstreamError(`Spotify request failed: ${response.status}`, retryAfter);
  }
  return response;
}

function pickAlbumArt(images?: SpotifyImage[]): string {
  if (!images?.length) return "";
  // Prefer ~300px over 640px for a compact widget.
  return safeHttpsUrl(images[1]?.url ?? images[0]?.url, ART_HOSTS) ?? "";
}

function normalizeItem(
  item: SpotifyTrackItem | null | undefined,
  isPlaying: boolean,
): NowPlayingData | null {
  if (!item?.name) return null;

  const isEpisode = item.type === "episode";
  const artist = isEpisode
    ? (item.show?.name ?? "Podcast")
    : (item.artists ?? []).map((a) => a.name).join(", ");

  const albumArtUrl = isEpisode
    ? pickAlbumArt(item.images ?? item.show?.images)
    : pickAlbumArt(item.album?.images);

  return {
    isPlaying,
    title: item.name,
    artist: artist || "Unknown artist",
    albumArtUrl,
    trackUrl: safeHttpsUrl(item.external_urls?.spotify, ["open.spotify.com"]) ?? "",
  };
}

/**
 * Request a fresh access token using the stored refresh token.
 */
async function getAccessToken(signal: AbortSignal): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.value;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();

  if (!clientId || !clientSecret || !refreshToken) {
    throw new SpotifyConfigError(
      "Missing Spotify credentials. Set SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, and SPOTIFY_REFRESH_TOKEN.",
    );
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await spotifyFetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
    signal,
  });

  const data: SpotifyTokenResponse = await response.json();
  if (typeof data.access_token !== "string" || !data.access_token ||
      typeof data.expires_in !== "number" || !Number.isFinite(data.expires_in) || data.expires_in <= 0) {
    throw new SpotifyUpstreamError("Spotify returned an invalid access token");
  }
  const safetyWindowMs = 60_000;
  cachedToken = {
    value: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000 - safetyWindowMs,
  };
  return data.access_token;
}

/**
 * Fetch the owner's currently-playing track, or fall back
 * to the most recently played track.
 */
async function fetchNowPlaying(): Promise<NowPlayingData | null> {
  // One deadline covers token refresh and both playback requests.
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  const accessToken = await getAccessToken(signal);
  const auth = { Authorization: `Bearer ${accessToken}` };

  const nowRes = await spotifyFetch(SPOTIFY_NOW_PLAYING_URL, {
    headers: auth,
    signal,
  });

  if (nowRes.status === 200) {
    const data = await nowRes.json();
    if (data?.is_playing && data?.item) {
      const playing = normalizeItem(data.item, true);
      if (playing) return playing;
    }
  }

  const recentRes = await spotifyFetch(SPOTIFY_RECENTLY_PLAYED_URL, {
    headers: auth,
    signal,
  });

  const recent = await recentRes.json();
  return normalizeItem(recent.items?.[0]?.track, false);
}

export async function getNowPlaying(): Promise<NowPlayingData | null> {
  const now = Date.now();
  if (cachedResult && now < cachedResult.expiresAt) return cachedResult.data;
  if (cachedFailure && now < cachedFailure.expiresAt) throw cachedFailure.error;
  if (pendingResult) return pendingResult;

  pendingResult = fetchNowPlaying()
    .then((data) => {
      cachedResult = { data, expiresAt: Date.now() + RESULT_TTL_MS };
      cachedFailure = null;
      return data;
    })
    .catch((cause: unknown) => {
      const error = cause instanceof SpotifyConfigError || cause instanceof SpotifyUpstreamError
        ? cause
        : new SpotifyUpstreamError("Spotify is temporarily unavailable");
      const cooldown = error instanceof SpotifyUpstreamError ? error.retryAfter * 1000 : RESULT_TTL_MS;
      cachedFailure = { error, expiresAt: Date.now() + cooldown };
      throw error;
    })
    .finally(() => { pendingResult = null; });

  return pendingResult;
}
