"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedMetricValue({
  enabled,
  value,
}: {
  enabled: boolean;
  value: string;
}) {
  const elementRef = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const match = /^([^0-9]*)([0-9][0-9,.]*)(.*)$/u.exec(value);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!enabled || reduce || !match || !elementRef.current) {
      setDisplay(value);
      return;
    }
    const [, prefix = "", number = "", suffix = ""] = match;
    const target = Number(number.replaceAll(",", ""));
    if (!Number.isFinite(target)) return;
    const decimals = number.includes(".") ? (number.split(".")[1]?.length ?? 0) : 0;
    const grouped = number.includes(",");
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const started = performance.now();
        const tick = (time: number) => {
          const progress = Math.min(1, (time - started) / 1_200);
          const eased = 1 - (1 - progress) ** 3;
          const numeric = (target * eased).toFixed(decimals);
          const formatted = grouped
            ? Number(numeric).toLocaleString("en-US", {
                maximumFractionDigits: decimals,
                minimumFractionDigits: decimals,
              })
            : numeric;
          setDisplay(`${prefix}${formatted}${suffix}`);
          if (progress < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.35 },
    );
    observer.observe(elementRef.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [enabled, value]);

  return (
    <span aria-label={value} ref={elementRef}>
      {display}
    </span>
  );
}
