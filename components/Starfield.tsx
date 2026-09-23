"use client";

import { useEffect, useRef } from "react";

type Star = {
  x: number;
  y: number;
  layer: number;
  size: number;
  twinkle: number;
  twinkleSpeed: number;
};

type Meteor = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
};

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduceMotion = motionQuery.matches;

    let width = 0;
    let height = 0;
    let stars: Star[] = [];
    const meteors: Meteor[] = [];
    let frame = 0;
    let lastMeteorAt = 0;
    let nextMeteorIn = 7000;

    const initStars = () => {
      const density = Math.min(320, Math.floor((width * height) / 7200));
      stars = Array.from({ length: density }, () => {
        const layer = Math.random();
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          layer,
          size: 0.35 + layer * 1.35,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.006 + Math.random() * 0.018,
        };
      });
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    };

    const spawnMeteor = () => {
      meteors.push({
        x: Math.random() * width * 0.7,
        y: Math.random() * height * 0.35,
        vx: 5.5 + Math.random() * 4.5,
        vy: 1.8 + Math.random() * 2.4,
        life: 1,
      });
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!reduceMotion) {
          star.x += 0.015 + star.layer * 0.055;
          if (star.x > width + 2) star.x = -2;
          star.twinkle += star.twinkleSpeed;
        }

        const pulse = reduceMotion
          ? 1
          : 0.55 + 0.45 * Math.sin(star.twinkle);
        const alpha = (0.22 + star.layer * 0.58) * pulse;

        ctx.beginPath();
        ctx.fillStyle = `rgba(226, 234, 255, ${alpha})`;
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();

        if (star.layer > 0.88) {
          ctx.strokeStyle = `rgba(79, 209, 255, ${0.18 * pulse})`;
          ctx.lineWidth = 0.6;
          ctx.beginPath();
          ctx.moveTo(star.x - star.size * 4.5, star.y);
          ctx.lineTo(star.x + star.size * 4.5, star.y);
          ctx.moveTo(star.x, star.y - star.size * 4.5);
          ctx.lineTo(star.x, star.y + star.size * 4.5);
          ctx.stroke();
        }
      }

      if (!reduceMotion) {
        if (time - lastMeteorAt > nextMeteorIn) {
          spawnMeteor();
          lastMeteorAt = time;
          nextMeteorIn = 8000 + Math.random() * 9000;
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
          const meteor = meteors[i];
          meteor.x += meteor.vx;
          meteor.y += meteor.vy;
          meteor.life -= 0.011;

          const tailX = meteor.x - meteor.vx * 10;
          const tailY = meteor.y - meteor.vy * 10;
          const gradient = ctx.createLinearGradient(
            tailX,
            tailY,
            meteor.x,
            meteor.y,
          );
          gradient.addColorStop(0, "rgba(180, 220, 255, 0)");
          gradient.addColorStop(1, `rgba(190, 230, 255, ${Math.max(meteor.life, 0)})`);

          ctx.strokeStyle = gradient;
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(meteor.x, meteor.y);
          ctx.stroke();

          if (meteor.life <= 0 || meteor.x > width || meteor.y > height) {
            meteors.splice(i, 1);
          }
        }
      }

      if (!reduceMotion) {
        frame = requestAnimationFrame(draw);
      }
    };

    const onMotionChange = () => {
      reduceMotion = motionQuery.matches;
      cancelAnimationFrame(frame);
      if (reduceMotion) {
        draw(0);
      } else {
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    window.addEventListener("resize", resize);
    motionQuery.addEventListener("change", onMotionChange);

    if (reduceMotion) {
      draw(0);
    } else {
      frame = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
    />
  );
}
