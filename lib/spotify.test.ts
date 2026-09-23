import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

const track = {
  name: "Test track",
  artists: [{ name: "Test artist" }],
  album: { images: [{ url: "https://i.scdn.co/image/test" }] },
  external_urls: { spotify: "https://open.spotify.com/track/test" },
};
const token = () => Response.json({ access_token: "test-access-token", expires_in: 3600 });
const playing = () => Response.json({ is_playing: true, item: track });
const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-09-22T12:00:00Z"));
  vi.stubEnv("SPOTIFY_CLIENT_ID", "test-client");
  vi.stubEnv("SPOTIFY_CLIENT_SECRET", "test-secret");
  vi.stubEnv("SPOTIFY_REFRESH_TOKEN", "test-refresh");
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Spotify request protection", () => {
  it("coalesces concurrent callers and caches their result without exposing tokens", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(playing());
    const { getNowPlaying } = await import("./spotify");
    const results = await Promise.all(Array.from({ length: 10 }, () => getNowPlaying()));
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(results[0]).toEqual({ isPlaying: true, title: "Test track", artist: "Test artist", albumArtUrl: "https://i.scdn.co/image/test", trackUrl: "https://open.spotify.com/track/test" });
    await getNowPlaying();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(20_001);
    fetchMock.mockResolvedValueOnce(playing());
    await getNowPlaying();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("caches empty playback results too", async () => {
    fetchMock.mockResolvedValueOnce(token())
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(Response.json({ items: [] }));
    const { getNowPlaying } = await import("./spotify");
    expect(await getNowPlaying()).toBeNull();
    expect(await getNowPlaying()).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("honors upstream rate limits without making fallback requests", async () => {
    fetchMock.mockResolvedValueOnce(token())
      .mockResolvedValueOnce(new Response(null, { status: 429, headers: { "Retry-After": "120" } }));
    const { getNowPlaying } = await import("./spotify");
    await expect(getNowPlaying()).rejects.toMatchObject({ retryAfter: 120 });
    vi.advanceTimersByTime(119_000);
    await expect(getNowPlaying()).rejects.toThrow("429");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1_001);
    fetchMock.mockResolvedValueOnce(playing());
    expect(await getNowPlaying()).toMatchObject({ isPlaying: true });
  });

  it("backs off on network failures and recovers", async () => {
    fetchMock.mockRejectedValueOnce(new Error("sensitive transport details"));
    const { getNowPlaying } = await import("./spotify");
    await expect(getNowPlaying()).rejects.toThrow("Spotify is temporarily unavailable");
    await expect(getNowPlaying()).rejects.toThrow("Spotify is temporarily unavailable");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(20_001);
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(playing());
    await expect(getNowPlaying()).resolves.toMatchObject({ isPlaying: true });
  });

  it("refreshes a rejected token after the failure cooldown", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(new Response(null, { status: 401 }));
    const { getNowPlaying } = await import("./spotify");
    await expect(getNowPlaying()).rejects.toThrow("401");
    vi.advanceTimersByTime(20_001);
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(playing());
    await getNowPlaying();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("applies one deadline to the entire upstream operation", async () => {
    vi.spyOn(AbortSignal, "timeout").mockImplementation((delay) => {
      const controller = new AbortController();
      setTimeout(() => controller.abort(new DOMException("Timed out", "TimeoutError")), delay);
      return controller.signal;
    });
    fetchMock.mockResolvedValueOnce(token()).mockImplementationOnce((_url, init) => new Promise((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => reject(init.signal?.reason), { once: true });
    }));
    const { getNowPlaying } = await import("./spotify");
    const result = expect(getNowPlaying()).rejects.toThrow("Spotify is temporarily unavailable");
    await vi.advanceTimersByTimeAsync(8_000);
    await result;
    expect(fetchMock.mock.calls[0][1]?.signal).toBe(fetchMock.mock.calls[1][1]?.signal);
    expect(fetchMock.mock.calls.every(([, init]) => init?.redirect === "error")).toBe(true);
  });

  it("rejects malformed token responses before requesting playback", async () => {
    fetchMock.mockResolvedValueOnce(Response.json({ access_token: null }));
    const { getNowPlaying } = await import("./spotify");
    await expect(getNowPlaying()).rejects.toThrow("invalid access token");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("withholds links and images outside the trusted Spotify hosts", async () => {
    fetchMock.mockResolvedValueOnce(token()).mockResolvedValueOnce(Response.json({ is_playing: true, item: {
      ...track, album: { images: [{ url: "https://tracker.example/image" }] },
      external_urls: { spotify: "https://open.spotify.com.evil.example/track" },
    } }));
    const { getNowPlaying } = await import("./spotify");
    expect(await getNowPlaying()).toMatchObject({ albumArtUrl: "", trackUrl: "" });
  });

  it("fails safely without credentials and makes no external request", async () => {
    vi.stubEnv("SPOTIFY_CLIENT_SECRET", "");
    const { getNowPlaying } = await import("./spotify");
    await expect(getNowPlaying()).rejects.toMatchObject({ name: "SpotifyConfigError" });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
