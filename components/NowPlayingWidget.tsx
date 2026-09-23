"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NowPlayingData } from "@/lib/spotify";

const POLL_INTERVAL_MS = 25_000;

type WidgetState =
  | { status: "loading" }
  | { status: "ready"; data: NowPlayingData }
  | { status: "empty" }
  | { status: "error" };

function isTrackPayload(value: unknown): value is NowPlayingData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.title === "string" && typeof v.artist === "string" &&
    typeof v.isPlaying === "boolean" && typeof v.albumArtUrl === "string" &&
    typeof v.trackUrl === "string";
}

async function fetchWidgetState(signal: AbortSignal): Promise<WidgetState> {
  try {
    const response = await fetch("/api/now-playing", {
      cache: "no-store",
      signal: AbortSignal.any([signal, AbortSignal.timeout(10_000)]),
    });

    if (!response.ok) {
      return { status: "error" };
    }

    const payload: unknown = await response.json();
    if (isTrackPayload(payload) && payload.title) {
      return {
        status: "ready",
        data: {
          isPlaying: payload.isPlaying,
          title: payload.title,
          artist: payload.artist,
          albumArtUrl: payload.albumArtUrl,
          trackUrl: payload.trackUrl,
        },
      };
    }

    return { status: "empty" };
  } catch {
    return { status: "error" };
  }
}

export function NowPlayingWidget() {
  const [state, setState] = useState<WidgetState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    let pending = false;
    const load = () => {
      if (pending || controller.signal.aborted) return;
      pending = true;
      void fetchWidgetState(controller.signal).then((nextState) => {
        if (!controller.signal.aborted) setState(nextState);
      }).finally(() => { pending = false; });
    };
    load();

    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void load();
      }
    }, POLL_INTERVAL_MS);

    const onVisibility = () => {
      if (document.visibilityState === "visible") void load();
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      controller.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="panel">
      {state.status === "loading" && <LoadingBody />}
      {state.status === "ready" && <TrackBody data={state.data} />}
      {state.status === "empty" && (
        <FallbackBody
          label="Audio channel idle"
          detail="NO_TRACK_IN_RANGE"
        />
      )}
      {state.status === "error" && (
        <FallbackBody
          label="Listening telemetry unavailable"
          detail="SIGNAL_LOST — TRY_AGAIN_SHORTLY"
        />
      )}
    </div>
  );
}

function LoadingBody() {
  return (
    <>
      <Header label="Acquiring signal" playing={false} />
      <div className="flex items-center gap-4" aria-busy="true" aria-live="polite">
        <div className="np-art-placeholder shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="np-skeleton h-4 w-40 mb-2" />
          <div className="np-skeleton h-3 w-28" />
        </div>
      </div>
    </>
  );
}

function FallbackBody({ label, detail }: { label: string; detail: string }) {
  return (
    <>
      <Header label="Audio channel" playing={false} />
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded bg-[var(--color-bg-base)] border border-[var(--color-border)] flex items-center justify-center shrink-0">
          <span className="text-[var(--color-text-secondary)] text-xl" aria-hidden>
            ♪
          </span>
        </div>
        <div>
          <p className="text-sm text-[var(--color-text-primary)] font-semibold m-0">
            {label}
          </p>
          <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)] m-0 mt-0.5">
            {detail}
          </p>
        </div>
      </div>
    </>
  );
}

function TrackBody({ data }: { data: NowPlayingData }) {
  const label = data.isPlaying ? "Now playing" : "Last listened to";
  const art = (
    <div className="w-14 h-14 rounded overflow-hidden bg-[var(--color-bg-base)] border border-[var(--color-border)] shrink-0">
      {data.albumArtUrl ? (
        <Image
          unoptimized
          src={data.albumArtUrl}
          alt=""
          width={56}
          height={56}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[var(--color-text-secondary)]">
          ♪
        </div>
      )}
    </div>
  );

  const meta = (
    <div className="min-w-0 flex-1">
      <p className="text-sm text-[var(--color-text-primary)] font-semibold m-0 truncate">
        {data.title}
      </p>
      <p className="font-[family-name:var(--font-mono)] text-xs text-[var(--color-text-secondary)] m-0 mt-0.5 truncate">
        {data.artist}
      </p>
    </div>
  );

  return (
    <>
      <Header label={label} playing={data.isPlaying} />
      <div className="flex items-center gap-4" aria-live="polite">
        {data.trackUrl ? (
          <a
            href={data.trackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 min-w-0 flex-1 no-underline text-inherit hover:text-inherit"
          >
            {art}
            {meta}
          </a>
        ) : (
          <div className="flex items-center gap-4 min-w-0 flex-1">
            {art}
            {meta}
          </div>
        )}
        {data.isPlaying && <Equalizer />}
      </div>
    </>
  );
}

function Header({ label, playing }: { label: string; playing: boolean }) {
  return (
    <h3 className="font-[family-name:var(--font-mono)] text-xs tracking-[0.15em] uppercase text-[var(--color-accent-cool)] mb-4 flex items-center gap-2">
      <span aria-hidden>🎧</span>
      {label}
      {playing && (
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--color-accent-cool)] shadow-[0_0_8px_rgba(79,209,255,0.8)]" />
      )}
    </h3>
  );
}

function Equalizer() {
  return (
    <div
      className="eq"
      aria-hidden
      title="Currently playing"
    >
      <span className="eq-bar" />
      <span className="eq-bar" />
      <span className="eq-bar" />
    </div>
  );
}
