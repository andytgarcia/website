import "server-only";

import {
  normalizeLaunch,
  partitionLaunches,
  type LaunchOperationsData,
  type LaunchSummary,
  type RawLaunch,
} from "@/lib/launches-core";

export * from "@/lib/launches-core";

const LAUNCH_LIBRARY_URL =
  "https://ll.thespacedevs.com/2.3.0/launches/upcoming/?format=json&location__ids=11,12,21,27&hide_recent_previous=true&ordering=net&limit=20&mode=normal";

interface RawLaunchResponse {
  results?: RawLaunch[];
}

export async function getLaunchOperationsData(
  now = new Date(),
): Promise<LaunchOperationsData> {
  const checkedAt = now.toISOString();

  try {
    const response = await fetch(LAUNCH_LIBRARY_URL, {
      headers: { Accept: "application/json" },
      next: { revalidate: 1800 },
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) {
      throw new Error(`Launch Library request failed: ${response.status}`);
    }

    const data = (await response.json()) as RawLaunchResponse;
    const normalized = (data.results ?? [])
      .map(normalizeLaunch)
      .filter((launch): launch is LaunchSummary => launch !== null);

    return {
      sourceStatus: "live",
      checkedAt,
      ...partitionLaunches(normalized, now),
    };
  } catch (error) {
    console.error("Launch Library API error:", error);
    return {
      sourceStatus: "unavailable",
      checkedAt,
      ...partitionLaunches([], now),
    };
  }
}
