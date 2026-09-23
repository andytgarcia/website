"use client";

import { useEffect, useRef, useState } from "react";
import { Map, Marker, NavigationControl, type MapOptions } from "maplibre-gl";
import {
  launchRegions,
  type LaunchRegionId,
} from "@/lib/launches-core";
import styles from "./launch-ui.module.css";

const MAP_STYLE: NonNullable<MapOptions["style"]> = {
  version: 8,
  sources: {
    "range-terrain": {
      type: "raster",
      tiles: [
        "https://tiles.openfreemap.org/natural_earth/ne2sr/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 6,
      attribution:
        '<a href="https://openfreemap.org" target="_blank" rel="noopener noreferrer">OpenFreeMap</a> · Natural Earth',
    },
  },
  layers: [
    {
      id: "range-background",
      type: "background",
      paint: { "background-color": "#07101b" },
    },
    {
      id: "range-terrain",
      type: "raster",
      source: "range-terrain",
      minzoom: 0,
      maxzoom: 10,
      paint: {
        "raster-brightness-min": 0.03,
        "raster-brightness-max": 0.62,
        "raster-contrast": 0.25,
        "raster-saturation": -0.72,
      },
    },
  ],
};

interface LaunchMapProps {
  counts: Record<LaunchRegionId, number>;
  activeRegion: LaunchRegionId | null;
}

export default function LaunchMap({ counts, activeRegion }: LaunchMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const [mapFailed, setMapFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [-98.25, 37.35],
      zoom: 2.65,
      minZoom: 2.2,
      maxZoom: 9,
      pitch: 0,
      bearing: 0,
      attributionControl: { compact: true },
    });

    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    map.addControl(new NavigationControl({ showCompass: false }), "bottom-right");
    map.once("load", () => {
      setMapFailed(false);
      map.resize();
    });
    map.on("error", (event) => {
      if (event.error?.message) setMapFailed(true);
    });

    const resizeObserver = new ResizeObserver(() => map.resize());
    resizeObserver.observe(containerRef.current);

    const markers = launchRegions.map((region) => {
      const markerElement = document.createElement("button");
      markerElement.type = "button";
      markerElement.className = styles.mapMarker;
      markerElement.dataset.active = String(region.id === activeRegion);
      markerElement.setAttribute(
        "aria-label",
        `${region.label}: ${counts[region.id]} launches in the seven-day window`,
      );

      const pulse = document.createElement("span");
      pulse.className = styles.markerPulse;
      const count = document.createElement("strong");
      count.textContent = counts[region.id].toString();
      const label = document.createElement("small");
      label.textContent = region.shortLabel;
      markerElement.append(pulse, count, label);

      markerElement.addEventListener("click", () => {
        map.flyTo({ center: region.coordinates, zoom: 5.5, duration: 900 });
      });

      return new Marker({ element: markerElement, anchor: "center" })
        .setLngLat(region.coordinates)
        .addTo(map);
    });

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      markers.forEach((marker) => marker.remove());
      map.remove();
      mapRef.current = null;
    };
  }, [activeRegion, counts]);

  return (
    <div className={styles.mapFrame}>
      <div ref={containerRef} className={styles.mapHost} />
      <div className={styles.mapTone} aria-hidden />
      <div className={styles.mapScanline} aria-hidden />
      <p className={styles.mapInstruction}>Select a range to inspect</p>
      {mapFailed && (
        <p className={styles.mapError}>Map tiles unavailable · site telemetry remains active</p>
      )}
    </div>
  );
}
