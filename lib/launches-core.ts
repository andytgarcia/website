import { safeHttpsUrl } from "./safe-url";

export const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type LaunchRegionId = "vandenberg" | "space-coast" | "wallops";

export interface LaunchRegion {
  id: LaunchRegionId;
  label: string;
  shortLabel: string;
  coordinates: [number, number];
  locationIds: number[];
}

export const launchRegions: LaunchRegion[] = [
  {
    id: "vandenberg",
    label: "Vandenberg Space Force Base",
    shortLabel: "Vandenberg",
    coordinates: [-120.5724, 34.742],
    locationIds: [11],
  },
  {
    id: "space-coast",
    label: "Cape Canaveral + Kennedy Space Center",
    shortLabel: "Space Coast",
    coordinates: [-80.604, 28.555],
    locationIds: [12, 27],
  },
  {
    id: "wallops",
    label: "Wallops Flight Facility",
    shortLabel: "Wallops",
    coordinates: [-75.469, 37.86],
    locationIds: [21],
  },
];

export interface RawLaunch {
  id?: string;
  url?: string;
  name?: string;
  status?: { name?: string; abbrev?: string; description?: string };
  last_updated?: string;
  net?: string;
  net_precision?: { name?: string; abbrev?: string; description?: string } | null;
  window_start?: string;
  window_end?: string;
  launch_service_provider?: { name?: string } | null;
  rocket?: {
    configuration?: { name?: string; full_name?: string } | null;
    payloads?: Array<{ payload?: { name?: string } | null }>;
  } | null;
  mission?: {
    name?: string;
    type?: string;
    description?: string;
    orbit?: { name?: string; abbrev?: string } | null;
    vid_urls?: Array<{ url?: string; live?: boolean }>;
  } | null;
  pad?: {
    name?: string;
    latitude?: number | string | null;
    longitude?: number | string | null;
    location?: {
      id?: number;
      name?: string;
      timezone_name?: string;
    } | null;
  } | null;
  vid_urls?: Array<{ url?: string; live?: boolean }>;
}

export interface LaunchSummary {
  id: string;
  sourceUrl: string;
  name: string;
  status: {
    name: string;
    abbreviation: string;
    description: string;
  };
  lastUpdated: string;
  net: string;
  precision: string;
  precisionDescription: string;
  countdownEligible: boolean;
  windowStart: string | null;
  windowEnd: string | null;
  provider: string;
  vehicle: string;
  missionName: string;
  missionType: string | null;
  missionDescription: string | null;
  payloadNames: string[];
  orbit: string | null;
  pad: {
    name: string;
    location: string;
    coordinates: [number, number] | null;
    timezone: string;
    region: LaunchRegionId;
  };
  webcastUrl: string | null;
}

export interface LaunchOperationsData {
  sourceStatus: "live" | "unavailable";
  checkedAt: string;
  windowStart: string;
  windowEnd: string;
  weeklyLaunches: LaunchSummary[];
  onDeck: LaunchSummary | null;
}

function asNumber(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getRegion(locationId: number | undefined): LaunchRegionId {
  if (locationId === 11) return "vandenberg";
  if (locationId === 21) return "wallops";
  return "space-coast";
}

function getFallbackTimezone(region: LaunchRegionId): string {
  return region === "vandenberg"
    ? "America/Los_Angeles"
    : "America/New_York";
}

function firstWebcast(raw: RawLaunch): string | null {
  const urls = [...(raw.vid_urls ?? []), ...(raw.mission?.vid_urls ?? [])]
    .map((item) => ({ ...item, url: safeHttpsUrl(item.url) }));
  return (
    urls.find((item) => item.live && item.url)?.url ??
    urls.find((item) => item.url)?.url ??
    null
  );
}

function safeTimezone(value: string | undefined, region: LaunchRegionId): string {
  if (value) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: value });
      return value;
    } catch {
      // A malformed upstream timezone must not take down the launch page.
    }
  }
  return getFallbackTimezone(region);
}

export function normalizeLaunch(raw: RawLaunch): LaunchSummary | null {
  if (!raw.id || !raw.name || !raw.net) return null;

  const netDate = new Date(raw.net);
  if (Number.isNaN(netDate.getTime())) return null;

  const region = getRegion(raw.pad?.location?.id);
  const longitude = asNumber(raw.pad?.longitude);
  const latitude = asNumber(raw.pad?.latitude);
  const payloadNames = (raw.rocket?.payloads ?? [])
    .map((flight) => flight.payload?.name?.trim())
    .filter((name): name is string => Boolean(name));
  const precision = raw.net_precision?.name ?? "Unknown";

  return {
    id: raw.id,
    sourceUrl:
      safeHttpsUrl(raw.url) ?? `https://ll.thespacedevs.com/2.3.0/launches/${encodeURIComponent(raw.id)}/`,
    name: raw.name,
    status: {
      name: raw.status?.name ?? "Status unavailable",
      abbreviation: raw.status?.abbrev ?? "TBD",
      description:
        raw.status?.description ?? "Launch status has not been published.",
    },
    lastUpdated: raw.last_updated ?? raw.net,
    net: netDate.toISOString(),
    precision,
    precisionDescription:
      raw.net_precision?.description ??
      "The published launch time precision is unavailable.",
    countdownEligible: ["Second", "Minute", "Hour"].includes(precision),
    windowStart: raw.window_start ?? null,
    windowEnd: raw.window_end ?? null,
    provider: raw.launch_service_provider?.name ?? "Provider not published",
    vehicle:
      raw.rocket?.configuration?.full_name ??
      raw.rocket?.configuration?.name ??
      "Vehicle not published",
    missionName:
      raw.mission?.name ?? (payloadNames.join(", ") || "Not publicly disclosed"),
    missionType: raw.mission?.type ?? null,
    missionDescription: raw.mission?.description?.trim() || null,
    payloadNames,
    orbit:
      raw.mission?.orbit?.abbrev && raw.mission.orbit.name
        ? `${raw.mission.orbit.name} (${raw.mission.orbit.abbrev})`
        : raw.mission?.orbit?.name ?? null,
    pad: {
      name: raw.pad?.name ?? "Pad not published",
      location: raw.pad?.location?.name ?? "Location not published",
      coordinates:
        longitude !== null && Math.abs(longitude) <= 180 &&
        latitude !== null && Math.abs(latitude) <= 90
          ? [longitude, latitude]
          : null,
      timezone:
        safeTimezone(raw.pad?.location?.timezone_name, region),
      region,
    },
    webcastUrl: firstWebcast(raw),
  };
}

export function partitionLaunches(
  launches: LaunchSummary[],
  now: Date,
): Pick<
  LaunchOperationsData,
  "windowStart" | "windowEnd" | "weeklyLaunches" | "onDeck"
> {
  const start = now.getTime();
  const end = start + WEEK_MS;
  const future = launches
    .filter((launch) => new Date(launch.net).getTime() >= start)
    .sort((a, b) => new Date(a.net).getTime() - new Date(b.net).getTime());

  return {
    windowStart: new Date(start).toISOString(),
    windowEnd: new Date(end).toISOString(),
    weeklyLaunches: future.filter(
      (launch) => new Date(launch.net).getTime() < end,
    ),
    onDeck:
      future.find((launch) => new Date(launch.net).getTime() >= end) ?? null,
  };
}
