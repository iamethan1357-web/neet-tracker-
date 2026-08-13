"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";

const MEDICAL_ICONS = ["🧬", "🔬", "⚕️", "🩺", "💊", "🧪", "🫀", "🫁", "🦠", "💉", "🩻", "🧫", "📚", "⚡", "🌿", "🧠", "🏥", "✚", "🔭", "⚗️"];
const CARD_TEXTS = [
  "Physics ⚡", "Chemistry 🧪", "Botany 🌿", "Zoology 🧬",
  "NEET 2027", "Study Hard!", "You got this!", "Future Doctor 🩺",
  "720/720 🎯", "Keep Going!", "Revise Daily 🔄", "Focus Mode ⏱",
  "Solve MCQs 🧠", "NCERT First 📚", "Stay Consistent 🔥", "Sleep Well 😴",
];

interface PhysicsElement {
  body: Matter.Body;
  el: HTMLDivElement;
  type: "icon" | "card";
  text: string;
}

export default function AntigravityMode({ active, onClose }: { active: boolean; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderLoopRef = useRef<number>(0);
  const elementsRef = useRef<PhysicsElement[]>([]);
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null);
  const [gravityDir, setGravityDir] = useState<"down" | "up" | "left" | "right" | "zero">("down");
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const initPhysics = useCallback(() => {
    if (!containerRef.current || !mounted) return;

    const container = containerRef.current;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1, scale: 0.001 },
    });
    engineRef.current = engine;

    // Walls
    const wallThickness = 60;
    const walls = [
      Matter.Bodies.rectangle(w / 2, h + wallThickness / 2, w + 100, wallThickness, { isStatic: true }),
      Matter.Bodies.rectangle(w / 2, -wallThickness / 2, w + 100, wallThickness, { isStatic: true }),
      Matter.Bodies.rectangle(-wallThickness / 2, h / 2, wallThickness, h + 100, { isStatic: true }),
      Matter.Bodies.rectangle(w + wallThickness / 2, h / 2, wallThickness, h + 100, { isStatic: true }),
    ];
    Matter.Composite.add(engine.world, walls);

    // Create medical icon bodies
    const elements: PhysicsElement[] = [];
    for (let i = 0; i < 30; i++) {
      const size = 30 + Math.random() * 40;
      const x = Math.random() * (w - 100) + 50;
      const y = Math.random() * (h - 200) + 50;

      const body = Matter.Bodies.circle(x, y, size / 2, {
        restitution: 0.7,
        friction: 0.05,
        frictionAir: 0.01,
        density: 0.001,
        render: { visible: false },
      });

      // Random initial velocity
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);

      Matter.Composite.add(engine.world, body);

      const el = document.createElement("div");
      el.textContent = MEDICAL_ICONS[i % MEDICAL_ICONS.length];
      el.style.position = "fixed";
      el.style.fontSize = `${size}px`;
      el.style.lineHeight = "1";
      el.style.zIndex = "60";
      el.style.pointerEvents = "none";
      el.style.willChange = "transform";
      el.style.filter = "drop-shadow(0 4px 12px rgba(0,0,0,0.15))";
      el.style.userSelect = "none";
      container.appendChild(el);

      elements.push({ body, el, type: "icon", text: MEDICAL_ICONS[i % MEDICAL_ICONS.length] });
    }

    // Create card bodies
    for (let i = 0; i < 12; i++) {
      const cardW = 120 + Math.random() * 60;
      const cardH = 45 + Math.random() * 20;
      const x = Math.random() * (w - 200) + 100;
      const y = Math.random() * (h - 300) + 100;

      const body = Matter.Bodies.rectangle(x, y, cardW, cardH, {
        restitution: 0.5,
        friction: 0.1,
        frictionAir: 0.015,
        density: 0.002,
        chamfer: { radius: 12 },
        render: { visible: false },
      });

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);

      Matter.Composite.add(engine.world, body);

      const el = document.createElement("div");
      el.textContent = CARD_TEXTS[i % CARD_TEXTS.length];
      el.style.position = "fixed";
      el.style.width = `${cardW}px`;
      el.style.height = `${cardH}px`;
      el.style.display = "flex";
      el.style.alignItems = "center";
      el.style.justifyContent = "center";
      el.style.fontSize = "13px";
      el.style.fontWeight = "600";
      el.style.background = "white";
      el.style.border = "1px solid #e5e7eb";
      el.style.borderRadius = "12px";
      el.style.zIndex = "60";
      el.style.pointerEvents = "none";
      el.style.willChange = "transform";
      el.style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
      el.style.userSelect = "none";
      el.style.padding = "0 12px";
      el.style.textAlign = "center";
      container.appendChild(el);

      elements.push({ body, el, type: "card", text: CARD_TEXTS[i % CARD_TEXTS.length] });
    }

    elementsRef.current = elements;

    // Mouse interaction
    const mouse = Matter.Mouse.create(container);
    mouse.pixelRatio = window.devicePixelRatio || 1;

    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: { visible: false },
      },
    });
    Matter.Composite.add(engine.world, mouseConstraint);
    mouseConstraintRef.current = mouseConstraint;

    // Enable pointer events on bodies when dragging
    elements.forEach((e) => { e.el.style.pointerEvents = "auto"; e.el.style.cursor = "grab"; });

    // Render loop
    const render = () => {
      Matter.Engine.update(engine, 1000 / 60);

      elements.forEach(({ body, el }) => {
        const { x: bx, y: by } = body.position;
        const angle = body.angle;
        el.style.transform = `translate(${bx - parseFloat(el.style.width || "40") / 2}px, ${by - parseFloat(el.style.height || "40") / 2}px) rotate(${angle}rad)`;
      });

      renderLoopRef.current = requestAnimationFrame(render);
    };
    renderLoopRef.current = requestAnimationFrame(render);
  }, [mounted]);

  useEffect(() => {
    if (active && mounted) {
      initPhysics();
    }
    return () => {
      cancelAnimationFrame(renderLoopRef.current);
      if (engineRef.current) {
        Matter.Engine.clear(engineRef.current);
      }
      elementsRef.current.forEach(({ el }) => el.remove());
      elementsRef.current = [];
    };
  }, [active, initPhysics, mounted]);

  // Change gravity
  useEffect(() => {
    if (!engineRef.current) return;
    const engine = engineRef.current;
    switch (gravityDir) {
      case "down": engine.gravity.x = 0; engine.gravity.y = 1; break;
      case "up": engine.gravity.x = 0; engine.gravity.y = -1; break;
      case "left": engine.gravity.x = -1; engine.gravity.y = 0; break;
      case "right": engine.gravity.x = 1; engine.gravity.y = 0; break;
      case "zero": engine.gravity.x = 0; engine.gravity.y = 0; break;
    }
  }, [gravityDir]);

  const shake = () => {
    elementsRef.current.forEach(({ body }) => {
      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 30,
        y: (Math.random() - 0.5) * 30,
      });
      Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.5);
    });
  };

  const explode = () => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    elementsRef.current.forEach(({ body }) => {
      const dx = body.position.x - cx;
      const dy = body.position.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      Matter.Body.setVelocity(body, {
        x: (dx / dist) * 25,
        y: (dy / dist) * 25,
      });
    });
  };

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-gray-100 backdrop-blur-sm" />

      {/* Physics container */}
      <div ref={containerRef} className="absolute inset-0" style={{ touchAction: "none" }} />

      {/* Controls */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-3">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-3 border border-gray-200">
          <span className="text-lg animate-heartbeat">🧬</span>
          <span className="font-bold text-sm">Antigravity Lab</span>
          <span className="text-xs text-gray-400">|</span>
          <span className="text-xs text-gray-500">Drag & throw objects!</span>
        </div>

        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-3 py-2 flex items-center gap-1.5 border border-gray-200">
          {/* Gravity controls */}
          {[
            { dir: "up" as const, icon: "⬆️" },
            { dir: "down" as const, icon: "⬇️" },
            { dir: "left" as const, icon: "⬅️" },
            { dir: "right" as const, icon: "➡️" },
            { dir: "zero" as const, icon: "🪐" },
          ].map(({ dir, icon }) => (
            <button
              key={dir}
              onClick={() => setGravityDir(dir)}
              className={`w-9 h-9 rounded-xl text-sm flex items-center justify-center transition-all ${
                gravityDir === dir ? "bg-black text-white shadow-md scale-110" : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {icon}
            </button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button onClick={shake} className="w-9 h-9 rounded-xl text-sm bg-gray-100 hover:bg-orange-100 flex items-center justify-center transition-all active:scale-90" title="Shake">
            🌊
          </button>
          <button onClick={explode} className="w-9 h-9 rounded-xl text-sm bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-all active:scale-90" title="Explode">
            💥
          </button>
        </div>
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[70] bg-black text-white px-8 py-3.5 rounded-2xl text-sm font-medium shadow-2xl hover:bg-gray-800 transition-all active:scale-95"
      >
        ✕ Exit Antigravity
      </button>
    </div>
  );
}
