import type { Metadata } from "next";
import Link from "next/link";
import { LaunchCountdown } from "@/components/launches/LaunchCountdown";
import { LaunchMapShell } from "@/components/launches/LaunchMapShell";
import {
  getLaunchOperationsData,
  launchRegions,
  type LaunchRegionId,
  type LaunchSummary,
} from "@/lib/launches";
import styles from "./launches.module.css";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Launch Operations | Mission Control",
  description:
    "A live seven-day launch manifest for Vandenberg, Cape Canaveral, Kennedy Space Center, and Wallops Flight Facility.",
  openGraph: {
    title: "Launch Operations | Mission Control",
    description:
      "A live seven-day launch manifest for Vandenberg, Cape Canaveral, Kennedy Space Center, and Wallops Flight Facility.",
    images: [
      {
        url: "/og.png",
        width: 1536,
        height: 1024,
        alt: "Launch Operations seven-day range status map",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Launch Operations | Mission Control",
    description:
      "A live seven-day launch manifest for Vandenberg, Cape Canaveral, Kennedy Space Center, and Wallops Flight Facility.",
    images: ["/og.png"],
  },
};

function formatDateTime(value: string, timezone: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone,
    timeZoneName: "short",
  }).format(new Date(value));
}

function formatWindow(start: string, end: string) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${formatter.format(new Date(start))} — ${formatter.format(new Date(end))}`;
}

function getRegionCounts(launches: LaunchSummary[]) {
  return launches.reduce<Record<LaunchRegionId, number>>(
    (counts, launch) => {
      counts[launch.pad.region] += 1;
      return counts;
    },
    { vandenberg: 0, "space-coast": 0, wallops: 0 },
  );
}

function statusTone(status: LaunchSummary["status"]) {
  const normalized = `${status.name} ${status.abbreviation}`.toLowerCase();
  if (normalized.includes("go") || normalized.includes("success")) return "go";
  if (normalized.includes("hold") || normalized.includes("failure")) return "alert";
  return "pending";
}

export default async function LaunchesPage() {
  const data = await getLaunchOperationsData();
  const featured = data.weeklyLaunches[0] ?? data.onDeck;
  const isOnDeck = data.weeklyLaunches.length === 0 && Boolean(data.onDeck);
  const regionCounts = getRegionCounts(data.weeklyLaunches);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          <span aria-hidden>←</span> Return to portfolio
        </Link>

        <div className={styles.eyebrowRow}>
          <p className="section-label">{"// Live mission intelligence"}</p>
          <span className={styles.liveStatus} data-state={data.sourceStatus}>
            <span className="status-ping" />
            {data.sourceStatus === "live"
              ? "Data link nominal"
              : "Data link interrupted"}
          </span>
        </div>

        <div className={styles.titleRow}>
          <h1>Launch<br />Operations</h1>
          <p className={styles.lede}>
            A rolling seven-day range board for the U.S. West Coast, Space Coast,
            and Wallops — sourced from live public launch data.
          </p>
        </div>

        <div className={styles.telemetryStrip}>
          <div>
            <span>Tracking window</span>
            <strong>{formatWindow(data.windowStart, data.windowEnd)}</strong>
          </div>
          <div>
            <span>Launches in range</span>
            <strong>{data.weeklyLaunches.length.toString().padStart(2, "0")}</strong>
          </div>
          <div>
            <span>Range network</span>
            <strong>{launchRegions.length} sites</strong>
          </div>
          <div>
            <span>Refresh cadence</span>
            <strong>30 min</strong>
          </div>
        </div>
      </header>

      <div className={styles.main}>
        <section className={styles.primaryGrid} aria-labelledby="next-launch-heading">
          <article className={styles.featurePanel}>
            <div className={styles.panelTopline}>
              <p>{isOnDeck ? "ON DECK · OUTSIDE 7-DAY WINDOW" : "NEXT LAUNCH"}</p>
              <span
                className={styles.statusChip}
                data-tone={featured ? statusTone(featured.status) : "pending"}
                title={featured?.status.description}
              >
                {featured?.status.abbreviation ?? "NO DATA"}
              </span>
            </div>

            {featured ? (
              <>
                <div className={styles.featureLead}>
                  <div>
                    <p className={styles.operator}>{featured.provider}</p>
                    <h2 id="next-launch-heading">{featured.name}</h2>
                    <p className={styles.targetTime}>
                      {formatDateTime(featured.net, featured.pad.timezone)}
                      <span> · {featured.precision} precision</span>
                    </p>
                  </div>
                  <LaunchCountdown
                    target={featured.net}
                    eligible={featured.countdownEligible}
                    precision={featured.precision}
                    precisionDescription={featured.precisionDescription}
                  />
                </div>

                <p className={styles.missionCopy}>
                  {featured.missionDescription ??
                    "Public mission details have not been released for this flight."}
                </p>

                <dl className={styles.flightGrid}>
                  <div><dt>Vehicle</dt><dd>{featured.vehicle}</dd></div>
                  <div><dt>Mission / payload</dt><dd>{featured.missionName}</dd></div>
                  <div><dt>Target orbit</dt><dd>{featured.orbit ?? "Not published"}</dd></div>
                  <div><dt>Mission class</dt><dd>{featured.missionType ?? "Not published"}</dd></div>
                  <div className={styles.padDetail}>
                    <dt>Launch complex</dt>
                    <dd>{featured.pad.name} · {featured.pad.location}</dd>
                  </div>
                </dl>

                <div className={styles.actions}>
                  {featured.webcastUrl && (
                    <a href={featured.webcastUrl} target="_blank" rel="noopener noreferrer">
                      Watch webcast <span aria-hidden>↗</span>
                    </a>
                  )}
                  <a href={featured.sourceUrl} target="_blank" rel="noopener noreferrer">
                    Mission source <span aria-hidden>↗</span>
                  </a>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <span>LINK / 503</span>
                <h2 id="next-launch-heading">No published launch data</h2>
                <p>
                  The flight schedule is temporarily unavailable. This panel will
                  recover automatically on the next data refresh.
                </p>
              </div>
            )}
          </article>

          <aside className={styles.mapPanel} aria-labelledby="range-map-heading">
            <div className={styles.mapHeader}>
              <div>
                <p>RANGE MAP</p>
                <h2 id="range-map-heading">Coastal network</h2>
              </div>
              <span>CONUS / LIVE</span>
            </div>
            <div className={styles.mapViewport}>
              <LaunchMapShell
                counts={regionCounts}
                activeRegion={featured?.pad.region ?? null}
              />
            </div>
            <ul className={styles.siteList}>
              {launchRegions.map((region) => (
                <li key={region.id} data-active={region.id === featured?.pad.region}>
                  <span className={styles.siteIndicator} />
                  <div>
                    <strong>{region.shortLabel}</strong>
                    <small>{region.label}</small>
                  </div>
                  <b>{regionCounts[region.id].toString().padStart(2, "0")}</b>
                </li>
              ))}
            </ul>
          </aside>
        </section>

        <section className={styles.schedule} aria-labelledby="schedule-heading">
          <div className={styles.sectionHeading}>
            <div>
              <p className="section-label">{"// Flight manifest"}</p>
              <h2 id="schedule-heading">Seven-day schedule</h2>
            </div>
            <p>
              {data.weeklyLaunches.length === 1
                ? "1 scheduled mission"
                : `${data.weeklyLaunches.length} scheduled missions`}
            </p>
          </div>

          {data.weeklyLaunches.length > 0 ? (
            <div className={styles.scheduleRows}>
              {data.weeklyLaunches.map((launch, index) => (
                <article key={launch.id}>
                  <div className={styles.sequence}>
                    <span>{(index + 1).toString().padStart(2, "0")}</span>
                    <i />
                  </div>
                  <time dateTime={launch.net}>
                    {formatDateTime(launch.net, launch.pad.timezone)}
                  </time>
                  <div className={styles.scheduleMission}>
                    <p>{launch.provider}</p>
                    <h3>{launch.name}</h3>
                    <small>{launch.vehicle} · {launch.missionName}</small>
                  </div>
                  <div className={styles.scheduleRange}>
                    <span>{launch.pad.region === "space-coast" ? "SPACE COAST" : launch.pad.region.toUpperCase()}</span>
                    <small>{launch.pad.name}</small>
                  </div>
                  <a href={launch.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open source for ${launch.name}`}>
                    ↗
                  </a>
                </article>
              ))}
            </div>
          ) : (
            <div className={styles.weekEmpty}>
              <div>
                <span>7D / CLEAR RANGE</span>
                <h3>No missions currently published in this window.</h3>
              </div>
              {data.onDeck && (
                <p>
                  Next on deck: <strong>{data.onDeck.name}</strong> · {formatDateTime(data.onDeck.net, data.onDeck.pad.timezone)}
                </p>
              )}
            </div>
          )}
        </section>

        <footer className={styles.sourceNote}>
          <div>
            <span>Schedule data</span>
            <a href="https://thespacedevs.com/llapi" target="_blank" rel="noopener noreferrer">
              The Space Devs · Launch Library 2 ↗
            </a>
          </div>
          <p>Launch times and payload details can change. Always confirm with the launch provider.</p>
        </footer>
      </div>
    </div>
  );
}
