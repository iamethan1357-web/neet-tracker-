"use client";
import { useEffect, useRef, useState } from "react";

interface Planet {
  name: string;
  radius: number;
  orbitRadius: number;
  speed: number;
  color: string;
  glowColor: string;
  angle: number;
  ringCount?: number;
  moons?: { radius: number; orbitRadius: number; speed: number; color: string; angle: number }[];
  label?: string;
}

export default function SolarSystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [dims, setDims] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.scale(dpr, dpr);
      setDims({ w, h });
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: MouseEvent | TouchEvent) => {
      const ev = "touches" in e ? e.touches[0] : e;
      mouseRef.current = { x: ev.clientX, y: ev.clientY };
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove as EventListener);

    // Stars
    const stars: { x: number; y: number; s: number; b: number; bSpeed: number }[] = [];
    for (let i = 0; i < 300; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        s: Math.random() * 2 + 0.5,
        b: Math.random(),
        bSpeed: 0.005 + Math.random() * 0.02,
      });
    }

    // Shooting stars
    const shootingStars: { x: number; y: number; vx: number; vy: number; life: number; maxLife: number }[] = [];
    let shootTimer = 0;

    // Planets — mapped to NEET subjects
    const planets: Planet[] = [
      {
        name: "Physics",
        radius: 14,
        orbitRadius: 80,
        speed: 0.008,
        color: "#fbbf24",
        glowColor: "rgba(251, 191, 36, 0.3)",
        angle: 0,
        label: "⚡ Physics",
      },
      {
        name: "Chemistry",
        radius: 18,
        orbitRadius: 130,
        speed: 0.005,
        color: "#60a5fa",
        glowColor: "rgba(96, 165, 250, 0.3)",
        angle: Math.PI * 0.7,
        ringCount: 2,
        label: "🧪 Chemistry",
      },
      {
        name: "Botany",
        radius: 16,
        orbitRadius: 185,
        speed: 0.003,
        color: "#34d399",
        glowColor: "rgba(52, 211, 153, 0.3)",
        angle: Math.PI * 1.3,
        label: "🌿 Botany",
        moons: [
          { radius: 4, orbitRadius: 26, speed: 0.02, color: "#a7f3d0", angle: 0 },
        ],
      },
      {
        name: "Zoology",
        radius: 20,
        orbitRadius: 250,
        speed: 0.002,
        color: "#c084fc",
        glowColor: "rgba(192, 132, 252, 0.3)",
        angle: Math.PI * 0.3,
        label: "🧬 Zoology",
        moons: [
          { radius: 5, orbitRadius: 32, speed: 0.015, color: "#e9d5ff", angle: 0 },
          { radius: 3, orbitRadius: 42, speed: 0.025, color: "#d8b4fe", angle: Math.PI },
        ],
      },
      {
        name: "NEET",
        radius: 10,
        orbitRadius: 310,
        speed: 0.0015,
        color: "#f87171",
        glowColor: "rgba(248, 113, 113, 0.25)",
        angle: Math.PI * 1.8,
        label: "🎯 NEET 2027",
      },
    ];

    // Asteroid belt particles
    const asteroids: { angle: number; radius: number; size: number; speed: number; offset: number }[] = [];
    for (let i = 0; i < 80; i++) {
      asteroids.push({
        angle: Math.random() * Math.PI * 2,
        radius: 155 + Math.random() * 25,
        size: 1 + Math.random() * 2,
        speed: 0.001 + Math.random() * 0.002,
        offset: (Math.random() - 0.5) * 12,
      });
    }

    let time = 0;

    const draw = () => {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      const cx = w / 2;
      const cy = h / 2;

      // Parallax offset based on mouse
      const px = (mouseRef.current.x - cx) * 0.02;
      const py = (mouseRef.current.y - cy) * 0.02;

      // Background gradient
      const bg = ctx.createRadialGradient(cx + px * 2, cy + py * 2, 0, cx, cy, Math.max(w, h));
      bg.addColorStop(0, "#0a0a0f");
      bg.addColorStop(0.4, "#05050a");
      bg.addColorStop(1, "#000000");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Stars with parallax
      stars.forEach((star) => {
        star.b += star.bSpeed;
        const brightness = 0.3 + Math.abs(Math.sin(star.b)) * 0.7;
        const sx = star.x + px * (star.s * 0.5);
        const sy = star.y + py * (star.s * 0.5);
        ctx.beginPath();
        ctx.arc(sx, sy, star.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
        ctx.fill();

        // Star glow
        if (star.s > 1.5) {
          ctx.beginPath();
          ctx.arc(sx, sy, star.s * 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${brightness * 0.1})`;
          ctx.fill();
        }
      });

      // Shooting stars
      shootTimer++;
      if (shootTimer > 120 + Math.random() * 200) {
        shootTimer = 0;
        shootingStars.push({
          x: Math.random() * w,
          y: Math.random() * h * 0.3,
          vx: 4 + Math.random() * 4,
          vy: 2 + Math.random() * 2,
          life: 0,
          maxLife: 40 + Math.random() * 30,
        });
      }
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += ss.vx;
        ss.y += ss.vy;
        ss.life++;
        const alpha = 1 - ss.life / ss.maxLife;
        // Trail
        ctx.beginPath();
        ctx.moveTo(ss.x, ss.y);
        ctx.lineTo(ss.x - ss.vx * 8, ss.y - ss.vy * 8);
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Head
        ctx.beginPath();
        ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        if (ss.life >= ss.maxLife) shootingStars.splice(i, 1);
      }

      // Tilt perspective
      const tiltX = (mouseRef.current.x - cx) / cx;
      const tiltY = (mouseRef.current.y - cy) / cy;

      // Orbit paths
      planets.forEach((p) => {
        ctx.beginPath();
        ctx.ellipse(
          cx + px * 3,
          cy + py * 3,
          p.orbitRadius * (1 + tiltX * 0.05),
          p.orbitRadius * 0.35 * (1 + tiltY * 0.05),
          0, 0, Math.PI * 2
        );
        ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Asteroid belt
      asteroids.forEach((a) => {
        a.angle += a.speed;
        const ax = cx + px * 3 + Math.cos(a.angle) * (a.radius + a.offset) * (1 + tiltX * 0.05);
        const ay = cy + py * 3 + Math.sin(a.angle) * (a.radius + a.offset) * 0.35 * (1 + tiltY * 0.05);
        ctx.beginPath();
        ctx.arc(ax, ay, a.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 180, 180, ${0.2 + Math.sin(a.angle * 3) * 0.15})`;
        ctx.fill();
      });

      // Sun with pulsing glow
      const sunPulse = 1 + Math.sin(time * 0.03) * 0.08;
      const sunX = cx + px * 3;
      const sunY = cy + py * 3;

      // Sun outer glow
      for (let i = 3; i >= 0; i--) {
        const grad = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, (30 + i * 25) * sunPulse);
        grad.addColorStop(0, `rgba(255, 200, 50, ${0.15 - i * 0.03})`);
        grad.addColorStop(1, "rgba(255, 200, 50, 0)");
        ctx.beginPath();
        ctx.arc(sunX, sunY, (30 + i * 25) * sunPulse, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      }

      // Sun body
      const sunGrad = ctx.createRadialGradient(sunX - 5, sunY - 5, 0, sunX, sunY, 25 * sunPulse);
      sunGrad.addColorStop(0, "#fff7e0");
      sunGrad.addColorStop(0.3, "#fbbf24");
      sunGrad.addColorStop(0.7, "#f59e0b");
      sunGrad.addColorStop(1, "#d97706");
      ctx.beginPath();
      ctx.arc(sunX, sunY, 25 * sunPulse, 0, Math.PI * 2);
      ctx.fillStyle = sunGrad;
      ctx.fill();

      // Corona rays
      for (let i = 0; i < 12; i++) {
        const rayAngle = (i / 12) * Math.PI * 2 + time * 0.005;
        const rayLen = 35 + Math.sin(time * 0.05 + i) * 10;
        ctx.beginPath();
        ctx.moveTo(
          sunX + Math.cos(rayAngle) * 26 * sunPulse,
          sunY + Math.sin(rayAngle) * 26 * sunPulse
        );
        ctx.lineTo(
          sunX + Math.cos(rayAngle) * rayLen * sunPulse,
          sunY + Math.sin(rayAngle) * rayLen * sunPulse
        );
        ctx.strokeStyle = `rgba(251, 191, 36, ${0.15 + Math.sin(time * 0.03 + i) * 0.1})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Planets
      planets.forEach((p) => {
        p.angle += p.speed;
        const scaleX = 1 + tiltX * 0.05;
        const scaleY = 1 + tiltY * 0.05;
        const planetX = cx + px * 3 + Math.cos(p.angle) * p.orbitRadius * scaleX;
        const planetY = cy + py * 3 + Math.sin(p.angle) * p.orbitRadius * 0.35 * scaleY;

        // Depth effect — further away = smaller & dimmer
        const depth = Math.sin(p.angle);
        const depthScale = 0.8 + depth * 0.2;
        const depthAlpha = 0.7 + depth * 0.3;

        // Planet glow
        const glowGrad = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, p.radius * 3 * depthScale);
        glowGrad.addColorStop(0, p.glowColor);
        glowGrad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(planetX, planetY, p.radius * 3 * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.fill();

        // Planet body with 3D shading
        const pGrad = ctx.createRadialGradient(
          planetX - p.radius * 0.3 * depthScale,
          planetY - p.radius * 0.3 * depthScale,
          0,
          planetX,
          planetY,
          p.radius * depthScale
        );
        pGrad.addColorStop(0, "#ffffff");
        pGrad.addColorStop(0.2, p.color);
        pGrad.addColorStop(1, `rgba(0,0,0,0.5)`);
        ctx.beginPath();
        ctx.arc(planetX, planetY, p.radius * depthScale, 0, Math.PI * 2);
        ctx.fillStyle = pGrad;
        ctx.globalAlpha = depthAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Rings (for Chemistry/Saturn)
        if (p.ringCount) {
          for (let r = 0; r < p.ringCount; r++) {
            const ringR = p.radius * (1.5 + r * 0.5) * depthScale;
            ctx.beginPath();
            ctx.ellipse(planetX, planetY, ringR, ringR * 0.3, p.angle * 0.3, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255,255,255,${0.2 * depthAlpha})`;
            ctx.lineWidth = 2;
            ctx.stroke();
          }
        }

        // Moons
        if (p.moons) {
          p.moons.forEach((m) => {
            m.angle += m.speed;
            const mx = planetX + Math.cos(m.angle) * m.orbitRadius * depthScale;
            const my = planetY + Math.sin(m.angle) * m.orbitRadius * 0.4 * depthScale;
            ctx.beginPath();
            ctx.arc(mx, my, m.radius * depthScale, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.globalAlpha = depthAlpha;
            ctx.fill();
            ctx.globalAlpha = 1;
          });
        }

        // Planet label
        if (p.label) {
          ctx.font = `${11 * depthScale}px -apple-system, sans-serif`;
          ctx.fillStyle = `rgba(255,255,255,${0.5 * depthAlpha})`;
          ctx.textAlign = "center";
          ctx.fillText(p.label, planetX, planetY + p.radius * depthScale + 16);
        }
      });

      // Center text "NEET" on the Sun
      ctx.font = "bold 10px -apple-system, sans-serif";
      ctx.fillStyle = "rgba(120, 80, 0, 0.7)";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("☀️", sunX, sunY);

      time++;
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove as EventListener);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ touchAction: "none" }}
    />
  );
}
