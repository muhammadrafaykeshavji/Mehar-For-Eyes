"use client";

import { useEffect, useRef, useState } from "react";
import type { BgPrintId } from "@/lib/settings-types";

interface CoutureBackgroundPrintProps {
  initialPrint: BgPrintId;
  initialIntensity: number;
  themePreset: string;
}

export const COUTURE_PRINTS: {
  id: BgPrintId;
  code: string;
  name: string;
  shortName: string;
  subtitle: string;
}[] = [
  {
    id: "toile",
    code: "01",
    name: "Full-Coverage Optical Toile Wallpaper",
    shortName: "01. Optical Toile Wallpaper",
    subtitle:
      "Dense edge-to-edge French Toile engraving of vintage frames, prisms, compasses & botanicals",
  },
  {
    id: "editorial",
    code: "02",
    name: "Newsprint Typography & Halftone",
    shortName: "02. Editorial Halftone",
    subtitle:
      "Avant-garde lookbook serif watermarks, ice-blue halftone dots & crosshairs",
  },
  {
    id: "terrazzo",
    code: "03",
    name: "Venetian Terrazzo & Sea-Glass",
    shortName: "03. Venetian Terrazzo",
    subtitle:
      "Translucent glacier sea-glass chips, obsidian marble & travertine stone",
  },
  {
    id: "astrolabe",
    code: "04",
    name: "Celestial Prism & Ray-Tracing",
    shortName: "04. Celestial Prism",
    subtitle:
      "Golden-ratio astrolabe degree rings & glacier-blue light refraction cones",
  },
  {
    id: "shibori",
    code: "05",
    name: "Washi Silk & Glacier Ink Wash",
    shortName: "05. Washi Silk",
    subtitle:
      "Japanese raw silk weave with watercolor glacier blooms & Seigaiha lens arches",
  },
  {
    id: "none",
    code: "00",
    name: "Solid Cotton Canvas (No Print)",
    shortName: "Solid Canvas",
    subtitle: "Pure warm off-white cotton paper grain without pattern overlay",
  },
];

export function CoutureBackgroundPrint({
  initialPrint,
  initialIntensity,
}: CoutureBackgroundPrintProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [overridePrint, setOverridePrint] = useState<BgPrintId | null>(null);
  const [overrideIntensity, setOverrideIntensity] = useState<number | null>(
    null,
  );
  const [dockOpen, setDockOpen] = useState<boolean>(false);

  const activePrint = overridePrint ?? initialPrint;
  const intensity = overrideIntensity ?? initialIntensity;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      if (activePrint === "editorial") {
        drawEditorialNewsprint(ctx, w, h);
      } else if (activePrint === "terrazzo") {
        drawVenetianTerrazzo(ctx, w, h);
      } else if (activePrint === "astrolabe") {
        drawCelestialAstrolabe(ctx, w, h);
      } else if (activePrint === "shibori") {
        drawWashiShibori(ctx, w, h);
      }
    };

    render();
    window.addEventListener("resize", render);
    return () => window.removeEventListener("resize", render);
  }, [activePrint]);

  const currentMeta =
    COUTURE_PRINTS.find((p) => p.id === activePrint) ?? COUTURE_PRINTS[0];

  return (
    <>
      {/* 01. Full-Coverage Seamless Luxury Optical Toile Wallpaper Layer */}
      {activePrint === "toile" ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
          style={{
            backgroundImage: `url("/images/editorial/optical-toile-wallpaper.jpg")`,
            backgroundRepeat: "repeat",
            backgroundSize: "440px 440px",
            mixBlendMode: "multiply",
            opacity: Math.min(0.45, 0.22 * intensity),
          }}
        />
      ) : null}

      {/* Procedural Canvas Layer for Prints 02 - 05 */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 h-screen w-screen transition-opacity duration-300"
        style={{
          opacity:
            activePrint === "none" || activePrint === "toile" ? 0 : intensity,
        }}
      />

      {/* Tactile Heavy Cotton Paper Grain Overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-25"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Floating Couture Print Switcher Pill (Positioned cleanly at bottom-left above dev tools) */}
      <div className="fixed bottom-16 left-5 z-40 hidden sm:block">
        {dockOpen ? (
          <div className="w-80 rounded-2xl border border-[#5AA2E6]/40 bg-[#15181E]/95 p-4 text-[#F4F2EC] shadow-[0_24px_60px_rgba(15,18,24,0.45)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#5AA2E6] shadow-[0_0_8px_#5AA2E6]" />
                <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-[#99CEFF] uppercase">
                  WALLPAPER PRINT STUDIO
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDockOpen(false)}
                className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white/70 hover:bg-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-1.5">
              {COUTURE_PRINTS.map((item) => {
                const selected = item.id === activePrint;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setOverridePrint(item.id)}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left font-mono text-[11px] transition-all ${
                      selected
                        ? "bg-gradient-to-r from-[#6EB5F7] to-[#3E84C9] font-bold text-[#0D1117] shadow-[0_0_16px_rgba(110,181,247,0.4)]"
                        : "bg-white/5 text-[#D0D7E2] hover:bg-white/10"
                    }`}
                  >
                    <span>{item.shortName}</span>
                    {selected ? <span>● ACTIVE</span> : null}
                  </button>
                );
              })}
            </div>

            <div className="mt-3.5 border-t border-white/10 pt-3">
              <div className="flex items-center justify-between font-mono text-[10px] text-[#9FB1C6]">
                <span>WALLPAPER CONTRAST</span>
                <span>{Math.round(intensity * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="1.8"
                step="0.05"
                value={intensity}
                onChange={(e) =>
                  setOverrideIntensity(parseFloat(e.target.value))
                }
                className="mt-1.5 w-full cursor-pointer accent-[#6EB5F7]"
              />
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setDockOpen(true)}
            className="group flex items-center gap-2 rounded-full border border-[#5AA2E6]/45 bg-[#15181E]/90 px-3.5 py-2 text-[#F4F2EC] shadow-[0_12px_32px_rgba(21,24,30,0.28)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-[#7EC0FF]"
          >
            <span className="h-2 w-2 rounded-full bg-[#5AA2E6] shadow-[0_0_8px_#5AA2E6]" />
            <span className="font-mono text-[10px] font-semibold tracking-[0.12em] uppercase">
              Wallpaper:{" "}
              <strong className="text-[#99CEFF]">{currentMeta.shortName}</strong>
            </span>
          </button>
        )}
      </div>
    </>
  );
}

/* ============================================================================
   02. NEWSPRINT TYPOGRAPHY & SWISS HALFTONE
   ============================================================================ */
function drawEditorialNewsprint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  ctx.strokeStyle = "rgba(21, 24, 30, 0.08)";
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 180) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 180) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  for (let gx = 90; gx < w; gx += 260) {
    for (let gy = 90; gy < h; gy += 260) {
      for (let dx = -70; dx <= 70; dx += 12) {
        for (let dy = -70; dy <= 70; dy += 12) {
          const dist = Math.hypot(dx, dy);
          if (dist < 72) {
            const r = (1 - dist / 75) * 3.5;
            ctx.fillStyle = "rgba(90, 162, 230, 0.22)";
            ctx.beginPath();
            ctx.arc(gx + dx, gy + dy, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  ctx.save();
  ctx.font = 'italic 700 150px Georgia, "Times New Roman", serif';
  ctx.strokeStyle = "rgba(21, 24, 30, 0.08)";
  ctx.lineWidth = 1.4;
  for (let y = 180; y < h + 200; y += 260) {
    ctx.strokeText("MEHAR OPTIQUE · ATELIER LAHORE", -40, y);
  }
  ctx.restore();
}

/* ============================================================================
   03. VENETIAN TERRAZZO & FROSTED SEA-GLASS
   ============================================================================ */
function drawVenetianTerrazzo(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  const palette = [
    { fill: "rgba(90, 162, 230, 0.22)", stroke: "rgba(43, 108, 176, 0.35)" },
    { fill: "rgba(168, 214, 255, 0.32)", stroke: "rgba(90, 162, 230, 0.4)" },
    { fill: "rgba(21, 24, 30, 0.15)", stroke: "rgba(21, 24, 30, 0.28)" },
    { fill: "rgba(100, 110, 125, 0.16)", stroke: "rgba(100, 110, 125, 0.26)" },
    { fill: "rgba(255, 255, 255, 0.65)", stroke: "rgba(21, 24, 30, 0.12)" },
  ];

  const count = Math.floor((w * h) / 4200);
  for (let i = 0; i < count; i++) {
    const cx = rand() * w;
    const cy = rand() * h;
    const radius = 8 + rand() * 28;
    const sides = 5 + Math.floor(rand() * 4);
    const style = palette[Math.floor(rand() * palette.length)];

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rand() * Math.PI * 2);

    ctx.beginPath();
    for (let s = 0; s < sides; s++) {
      const angle = (s / sides) * Math.PI * 2;
      const r = radius * (0.65 + rand() * 0.45);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = style.fill;
    ctx.fill();
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
}

/* ============================================================================
   04. CELESTIAL PRISM & OPTICAL RAY-TRACING
   ============================================================================ */
function drawCelestialAstrolabe(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  for (let x = 220; x < w + 300; x += 440) {
    for (let y = 220; y < h + 300; y += 440) {
      ctx.save();
      ctx.translate(x, y);
      [60, 110, 165, 215].forEach((r, idx) => {
        ctx.strokeStyle =
          idx % 2 === 0
            ? "rgba(21, 24, 30, 0.14)"
            : "rgba(43, 108, 176, 0.24)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.restore();
    }
  }
}

/* ============================================================================
   05. WASHI SILK & GLACIER INK WASH
   ============================================================================ */
function drawWashiShibori(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
) {
  const stepX = 120;
  const stepY = 60;
  for (let row = 0; row < h / stepY + 2; row++) {
    for (let col = -1; col < w / stepX + 2; col++) {
      const cx = col * stepX + (row % 2 === 0 ? 0 : stepX / 2);
      const cy = row * stepY;

      [52, 38, 24, 12].forEach((radius, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, radius, Math.PI * 1.1, Math.PI * 1.9);
        ctx.strokeStyle =
          idx % 2 === 0
            ? "rgba(43, 108, 176, 0.22)"
            : "rgba(21, 24, 30, 0.14)";
        ctx.lineWidth = 1.1;
        ctx.stroke();
      });
    }
  }
}
