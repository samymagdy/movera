"use client";

import type { MouseEvent } from "react";

export function IntelligenceNewsPauseControl({
  onPausedChange,
  pauseLabel,
  paused,
  resumeLabel,
}: {
  onPausedChange: (paused: boolean) => void;
  pauseLabel: string;
  paused: boolean;
  resumeLabel: string;
}) {
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next = !paused;
    onPausedChange(next);
    event.currentTarget
      .closest<HTMLElement>(".tw-intelligence-news")
      ?.setAttribute("data-paused", String(next));
  }

  return (
    <button
      aria-label={paused ? resumeLabel : pauseLabel}
      aria-pressed={paused}
      onClick={toggle}
      title={paused ? resumeLabel : pauseLabel}
      type="button"
    >
      {paused ? "▶" : "Ⅱ"}
    </button>
  );
}
