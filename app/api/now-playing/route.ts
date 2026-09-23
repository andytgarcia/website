import { getNowPlaying, SpotifyConfigError, SpotifyUpstreamError } from "@/lib/spotify";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await getNowPlaying();

    if (!data) {
      return Response.json(
        { isPlaying: false, message: "Nothing playing" },
        {
          status: 200,
          headers: {
            "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
          },
        },
      );
    }

    return Response.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=20, stale-while-revalidate=40",
      },
    });
  } catch (error) {
    if (
      error instanceof SpotifyConfigError ||
      (error instanceof Error && error.name === "SpotifyConfigError")
    ) {
      return Response.json(
        { isPlaying: false, error: "Spotify is not configured" },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return Response.json(
      { isPlaying: false, error: "Failed to fetch now-playing data" },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store",
          "Retry-After": String(error instanceof SpotifyUpstreamError ? error.retryAfter : 20),
        },
      },
    );
  }
}
