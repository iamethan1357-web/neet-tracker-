"use client";
import { useEffect, useRef, useState } from "react";

const MEDICAL_ICONS = ["🧬", "🔬", "⚕️", "🩺", "💊", "🧪", "🫀", "🫁", "🦠", "💉", "🩻", "🧫", "🌡️", "🏥", "📚", "✚"];

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  icon: string;
  size: number;
  rotX: number;
  rotY: number;
  rotZ: number;
  rotSpeedX: number;
  rotSpeedY: number;
  rotSpeedZ: number;
  opacity: number;
}

export default function FloatingParticles({ active }: { active: boolean }) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active || !mounted) return;

    const container = canvasRef.current;
    if (!container) return;

    const w = window.innerWidth;
    const h = window.innerHeight;

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 1.5,
        vy: (Math.random() - 0.5) * 1.5,
        vz: (Math.random() - 0.5) * 1,
        icon: MEDICAL_ICONS[Math.floor(Math.random() * MEDICAL_ICONS.length)],
        size: 20 + Math.random() * 30,
        rotX: Math.random() * 360,
        rotY: Math.random() * 360,
        rotZ: Math.random() * 360,
        rotSpeedX: (Math.random() - 0.5) * 3,
        rotSpeedY: (Math.random() - 0.5) * 3,
        rotSpeedZ: (Math.random() - 0.5) * 2,
        opacity: 0.1 + Math.random() * 0.15,
      });
    }
    particlesRef.current = particles;

    // Create DOM elements
    const elements: HTMLDivElement[] = [];
    particles.forEach((p) => {
      const el = document.createElement("div");
      el.textContent = p.icon;
      el.style.position = "fixed";
      el.style.pointerEvents = "none";
      el.style.zIndex = "1";
      el.style.fontSize = `${p.size}px`;
      el.style.willChange = "transform";
      el.style.transformStyle = "preserve-3d";
      container.appendChild(el);
      elements.push(el);
    });

    const onMouseMove = (e: MouseEvent | TouchEvent) => {
      const ev = "touches" in e ? e.touches[0] : e;
      mouseRef.current = { x: ev.clientX, y: ev.clientY };
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onMouseMove as EventListener);

    const animate = () => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      particles.forEach((p, i) => {
        // Mouse repulsion
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        // Update position
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Damping
        p.vx *= 0.99;
        p.vy *= 0.99;
        p.vz *= 0.99;

        // Wrap around edges
        if (p.x < -50) p.x = w + 50;
        if (p.x > w + 50) p.x = -50;
        if (p.y < -50) p.y = h + 50;
        if (p.y > h + 50) p.y = -50;
        if (p.z < -300) p.vz *= -1;
        if (p.z > 300) p.vz *= -1;

        // Update rotation
        p.rotX += p.rotSpeedX;
        p.rotY += p.rotSpeedY;
        p.rotZ += p.rotSpeedZ;

        // 3D perspective
        const perspective = 800;
        const scale = perspective / (perspective + p.z);
        const depthOpacity = p.opacity * scale;

        if (elements[i]) {
          elements[i].style.transform = `translate3d(${p.x}px, ${p.y}px, ${p.z}px) rotateX(${p.rotX}deg) rotateY(${p.rotY}deg) rotateZ(${p.rotZ}deg) scale(${scale})`;
          elements[i].style.opacity = `${depthOpacity}`;
        }
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onMouseMove as EventListener);
      elements.forEach((el) => el.remove());
    };
  }, [active, mounted]);

  if (!active) return null;

  return (
    <div
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      style={{ perspective: "800px", transformStyle: "preserve-3d" }}
    />
  );
}
