"use client";
import React, { useEffect, useRef } from "react";

// Lightweight canvas particle sphere — drops in place of shadcnspace's ParticleSphereAnimation
export default function ParticleSphereAnimation({ dark = true }: { dark?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const s = canvas.clientWidth;
      canvas.width = s * dpr;
      canvas.height = s * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const N = 260;
    const pts = Array.from({ length: N }, () => {
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      return { th, ph, r: 0.86 + Math.random() * 0.14 };
    });

    const draw = () => {
      const s = canvas.clientWidth;
      const cx = s / 2, cy = s / 2, R = s * 0.42;
      ctx.clearRect(0, 0, s, s);
      const rot = t * 0.0018;
      for (const p of pts) {
        const x0 = Math.sin(p.ph) * Math.cos(p.th + rot) * p.r;
        const y0 = Math.cos(p.ph) * p.r;
        const z0 = Math.sin(p.ph) * Math.sin(p.th + rot) * p.r;
        const scale = 1 / (1.6 - z0 * 0.6);
        const x = cx + x0 * R * scale;
        const y = cy + y0 * R * scale;
        const a = Math.max(0.04, Math.min(0.9, (z0 + 1) / 2));
        ctx.beginPath();
        ctx.arc(x, y, 1.4 * scale, 0, Math.PI * 2);
        ctx.fillStyle = dark ? `rgba(216,243,78,${a})` : `rgba(26,26,26,${a})`;
        ctx.fill();
      }
      t += 1;
      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [dark]);

  return <canvas ref={canvasRef} className="w-full h-full" aria-hidden="true" />;
}
