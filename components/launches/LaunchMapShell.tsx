"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import type { LaunchRegionId } from "@/lib/launches-core";
import styles from "./launch-ui.module.css";

const LaunchMap = dynamic(() => import("./LaunchMap"), {
  ssr: false,
  loading: () => (
    <div className={styles.mapLoading} aria-label="Loading launch range map">
      <span />
      <p>Acquiring range telemetry…</p>
    </div>
  ),
});

interface LaunchMapShellProps {
  counts: Record<LaunchRegionId, number>;
  activeRegion: LaunchRegionId | null;
}

export function LaunchMapShell(props: LaunchMapShellProps) {
  return <MapErrorBoundary><LaunchMap {...props} /></MapErrorBoundary>;
}

// A browser without WebGL can fail during map construction, before its error
// event listener exists. Contain that failure so the schedule remains usable.
class MapErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <div className={styles.mapLoading} role="status">
        <p>Map unavailable · launch schedule remains available below.</p>
      </div>
    ) : this.props.children;
  }
}
