"use client";

import { useEffect, useState } from "react";
import styles from "./launch-ui.module.css";

interface LaunchCountdownProps {
  target: string;
  eligible: boolean;
  precision: string;
  precisionDescription: string;
}

function formatRemaining(target: number, current: number) {
  const difference = Math.max(0, target - current);
  const totalSeconds = Math.floor(difference / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;

  return {
    days,
    time: [hours, minutes, seconds]
      .map((unit) => unit.toString().padStart(2, "0"))
      .join(":"),
    complete: difference === 0,
  };
}

export function LaunchCountdown({
  target,
  eligible,
  precision,
  precisionDescription,
}: LaunchCountdownProps) {
  const [current, setCurrent] = useState<number | null>(null);
  const targetTime = new Date(target).getTime();

  useEffect(() => {
    if (!eligible) return;

    const update = () => setCurrent(Date.now());
    update();
    const timer = window.setInterval(update, 1_000);
    return () => window.clearInterval(timer);
  }, [eligible]);

  if (!eligible) {
    return (
      <div className={styles.countdown} title={precisionDescription}>
        <span>Target resolution</span>
        <strong>{precision}</strong>
        <small>Countdown withheld until the schedule is hour-precise.</small>
      </div>
    );
  }

  const remaining = current === null ? null : formatRemaining(targetTime, current);

  return (
    <div className={styles.countdown} role="timer" aria-live="off">
      <span>{remaining?.complete ? "Target time reached" : "T minus"}</span>
      <strong suppressHydrationWarning>
        {remaining ? (
          <>
            {remaining.days > 0 && <b>{remaining.days}D</b>}
            {remaining.time}
          </>
        ) : (
          "— — : — — : — —"
        )}
      </strong>
      <small>{precision} precision · synchronized to your system clock</small>
    </div>
  );
}
