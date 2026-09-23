import { describe, expect, it } from "vitest";
import {
  normalizeLaunch,
  partitionLaunches,
  WEEK_MS,
  type RawLaunch,
} from "./launches-core";

const baseLaunch: RawLaunch = {
  id: "mission-01",
  url: "https://example.test/mission-01",
  name: "Falcon 9 | Example Payload",
  net: "2026-08-28T18:30:00Z",
  net_precision: {
    name: "Minute",
    description: "The time is accurate to the minute.",
  },
  status: { name: "Go for Launch", abbrev: "Go", description: "Range is go." },
  launch_service_provider: { name: "Example Launch Co." },
  rocket: {
    configuration: { full_name: "Falcon 9 Block 5" },
    payloads: [{ payload: { name: "Payload Alpha" } }],
  },
  mission: {
    type: "Earth Science",
    description: "A public test mission.",
    orbit: { name: "Low Earth Orbit", abbrev: "LEO" },
  },
  pad: {
    name: "Space Launch Complex 4E",
    latitude: "34.632",
    longitude: "-120.611",
    location: { id: 11, name: "Vandenberg SFB" },
  },
  vid_urls: [
    { url: "https://example.test/recorded", live: false },
    { url: "https://example.test/live", live: true },
  ],
};

describe("normalizeLaunch", () => {
  it("normalizes mission, vehicle, pad, precision, and webcast fields", () => {
    const launch = normalizeLaunch(baseLaunch);

    expect(launch).toMatchObject({
      id: "mission-01",
      vehicle: "Falcon 9 Block 5",
      missionName: "Payload Alpha",
      orbit: "Low Earth Orbit (LEO)",
      countdownEligible: true,
      webcastUrl: "https://example.test/live",
      pad: {
        region: "vandenberg",
        timezone: "America/Los_Angeles",
        coordinates: [-120.611, 34.632],
      },
    });
  });

  it("withholds a countdown when only day-level precision is published", () => {
    const launch = normalizeLaunch({
      ...baseLaunch,
      net_precision: { name: "Day" },
    });

    expect(launch?.countdownEligible).toBe(false);
    expect(launch?.precision).toBe("Day");
  });

  it("drops records without a stable identity or valid target time", () => {
    expect(normalizeLaunch({ ...baseLaunch, id: undefined })).toBeNull();
    expect(normalizeLaunch({ ...baseLaunch, net: "not-a-date" })).toBeNull();
  });

  it("replaces an invalid upstream timezone with a usable regional timezone", () => {
    const launch = normalizeLaunch({
      ...baseLaunch,
      pad: { ...baseLaunch.pad, location: { id: 11, timezone_name: "Invalid/AuditZone" } },
    })!;
    expect(launch.pad.timezone).toBe("America/Los_Angeles");
    expect(() => new Intl.DateTimeFormat("en-US", { timeZone: launch.pad.timezone }).format(new Date(launch.net))).not.toThrow();
  });

  it("filters unsafe links while preserving a valid webcast fallback", () => {
    const launch = normalizeLaunch({
      ...baseLaunch,
      url: "javascript:alert(1)",
      vid_urls: [
        { url: "data:text/html,unsafe", live: true },
        { url: "https://example.test/watch", live: false },
      ],
    })!;
    expect(launch.sourceUrl).toBe("https://ll.thespacedevs.com/2.3.0/launches/mission-01/");
    expect(launch.webcastUrl).toBe("https://example.test/watch");
  });

  it("drops out-of-range pad coordinates", () => {
    expect(normalizeLaunch({ ...baseLaunch, pad: { ...baseLaunch.pad, latitude: 91, longitude: 181 } })?.pad.coordinates).toBeNull();
  });
});

describe("partitionLaunches", () => {
  it("sorts the rolling week and promotes the first later mission to on deck", () => {
    const now = new Date("2026-08-25T12:00:00Z");
    const normalized = normalizeLaunch(baseLaunch);
    expect(normalized).not.toBeNull();

    const insideLater = {
      ...normalized!,
      id: "inside-later",
      net: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    };
    const insideSooner = {
      ...normalized!,
      id: "inside-sooner",
      net: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
    };
    const boundary = {
      ...normalized!,
      id: "boundary",
      net: new Date(now.getTime() + WEEK_MS).toISOString(),
    };

    const result = partitionLaunches(
      [boundary, insideLater, insideSooner],
      now,
    );

    expect(result.weeklyLaunches.map((launch) => launch.id)).toEqual([
      "inside-sooner",
      "inside-later",
    ]);
    expect(result.onDeck?.id).toBe("boundary");
  });
});
