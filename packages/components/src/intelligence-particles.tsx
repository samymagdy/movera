"use client";

import { useEffect, useRef } from "react";

type Particle = {
  depth: number;
  phase: number;
  radius: number;
  speed: number;
  x: number;
  y: number;
};

export type IntelligenceParticlesProps = {
  color: string;
  density: number;
  direction: "inward" | "outward" | "clockwise" | "counterClockwise";
  intensity: number;
  reducedMotion: "reduce" | "static" | "hide";
  speed: number;
};

function seeded(index: number, salt: number): number {
  const value = Math.sin(index * 12.9898 + salt * 78.233) * 43_758.5453;
  return value - Math.floor(value);
}

export function IntelligenceParticles({
  color,
  density,
  direction,
  intensity,
  reducedMotion,
  speed,
}: IntelligenceParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion === "hide") return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let width = 1;
    let height = 1;
    let particles: Particle[] = [];

    const rebuild = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      const count = Math.max(12, Math.round(18 + density * 72));
      particles = Array.from({ length: count }, (_, index) => ({
        depth: 0.25 + seeded(index, 5) * 0.75,
        phase: seeded(index, 4) * Math.PI * 2,
        radius: 0.55 + seeded(index, 3) * 1.45,
        speed: 0.22 + seeded(index, 2) * 0.78,
        x: seeded(index, 0) * width,
        y: seeded(index, 1) * height,
      }));
    };

    const render = (time: number) => {
      context.clearRect(0, 0, width, height);
      const reduce = motionQuery.matches || reducedMotion === "static";
      const elapsed = reduce ? 0 : time * 0.00012 * speed;
      const centerX = width * 0.62;
      const centerY = height * 0.52;

      for (const particle of particles) {
        const directionMultiplier = direction === "outward" ? -1 : 1;
        const orbitMultiplier = direction === "counterClockwise" ? -1 : 1;
        let x = particle.x;
        let y = particle.y;
        if (direction === "clockwise" || direction === "counterClockwise") {
          const radius = Math.hypot(particle.x - centerX, particle.y - centerY);
          const angle =
            Math.atan2(particle.y - centerY, particle.x - centerX) +
            elapsed * particle.speed * orbitMultiplier;
          x = centerX + Math.cos(angle) * radius;
          y = centerY + Math.sin(angle) * radius * 0.58;
        } else {
          x += Math.cos(particle.phase) * elapsed * 62 * directionMultiplier;
          y += Math.sin(particle.phase) * elapsed * 32 * directionMultiplier;
        }
        x = ((x % width) + width) % width;
        y = ((y % height) + height) % height;
        const alpha = (0.2 + particle.depth * 0.7) * Math.max(0.15, intensity);
        context.globalAlpha = alpha;
        context.fillStyle = color;
        context.shadowBlur = 8 + intensity * 16;
        context.shadowColor = color;
        context.beginPath();
        context.arc(x, y, particle.radius * particle.depth, 0, Math.PI * 2);
        context.fill();
      }
      context.globalAlpha = 1;
      context.shadowBlur = 0;
      if (!reduce) frame = window.requestAnimationFrame(render);
    };

    rebuild();
    render(0);
    const observer = new ResizeObserver(() => {
      rebuild();
      if (motionQuery.matches || reducedMotion === "static") render(0);
    });
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [color, density, direction, intensity, reducedMotion, speed]);

  if (reducedMotion === "hide") return null;
  return (
    <canvas aria-hidden="true" className="tw-intelligence-particles" ref={canvasRef} />
  );
}
