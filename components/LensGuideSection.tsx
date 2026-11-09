"use client";

import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import type { SiteSettings } from "@/lib/settings-types";
import { tryBuildWhatsAppLink } from "@/lib/whatsapp";

const SIMULATOR_MODES = [
  {
    id: "bluecut",
    code: "LAB // 01",
    name: "Sapphire Blue-Cut AR",
    wavelength: "415–455nm HEV Filter",
    thickness: "1.60 Aspheric",
    overlayStyle:
      "linear-gradient(135deg, rgba(90, 162, 230, 0.28) 0%, rgba(126, 192, 255, 0.22) 50%, rgba(43, 108, 176, 0.16) 100%)",
    effectBadge: "94% Digital Glare Neutralized",
    clinicalNote:
      "Neutralizes high-energy visible blue light from OLED & LED monitors without yellowing your color perception.",
  },
  {
    id: "photochromic",
    code: "LAB // 02",
    name: "Transitions® Sun-Reactive",
    wavelength: "100% UVA / UVB400",
    thickness: "1.60 Photo-Adaptive",
    overlayStyle:
      "linear-gradient(135deg, rgba(20, 18, 15, 0.72) 0%, rgba(45, 36, 25, 0.62) 100%)",
    effectBadge: "Outdoor UV Tint Activated (85% Absorption)",
    clinicalNote:
      "Molecules darken automatically within 18 seconds of outdoor sunlight exposure and return to crystal-clear indoors.",
  },
  {
    id: "progressive",
    code: "LAB // 03",
    name: "Digital Freeform Progressive",
    wavelength: "3-Zone Seamless Corridor",
    thickness: "1.67 Digital Freeform",
    overlayStyle:
      "radial-gradient(circle at 50% 50%, rgba(90, 162, 230, 0.22) 0%, rgba(21, 24, 30, 0.5) 100%)",
    effectBadge: "Far + Intermediate + Reading Corridor",
    clinicalNote:
      "Digitally surfaced across distance, intermediate, and reading zones with zero visible dividing lines.",
  },
  {
    id: "hiindex",
    code: "LAB // 04",
    name: "1.74 Ultra-Thin Hi-Index",
    wavelength: "45% Edge Reduction",
    thickness: "1.74 Ultra-Thin",
    overlayStyle:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(90, 162, 230, 0.2) 100%)",
    effectBadge: "1.9mm Razor Edge Profile",
    clinicalNote:
      "Engineered for high-power prescriptions (±4.00D to ±12.00D) so lenses remain featherlight and flush inside thin titanium rims.",
  },
] as const;

export function LensGuideSection({ settings }: { settings: SiteSettings }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [compareRaw, setCompareRaw] = useState(false);

  if (!settings.showLensGuide || settings.lensOptions.length === 0) {
    return null;
  }

  const activeSim = SIMULATOR_MODES[activeIdx % SIMULATOR_MODES.length];
  const activeOption =
    settings.lensOptions[activeIdx] ?? settings.lensOptions[0];
  const activeWaLink = tryBuildWhatsAppLink(
    `Hi ${settings.shopName} — I'd like to ask about ${activeOption?.title ?? activeSim.name} lenses for my prescription.`,
    settings.whatsappNumber,
  );

  return (
    <section
      id="lens-simulator"
      className="border-b border-foreground/15 bg-[#DCE2EC]/90 backdrop-blur-[2px]"
    >
      <div className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-8 sm:py-20 lg:py-24">
        {/* Top Editorial Header */}
        <div className="flex flex-col justify-between gap-5 border-b border-foreground/15 pb-6 sm:pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
              [03] IN-HOUSE OPTICAL DISPENSING LAB &amp; SIMULATOR
            </p>
            <h2 className="mt-2.5 font-display text-2xl sm:text-4xl lg:text-5xl tracking-tight text-foreground">
              {settings.lensGuideHeading}
            </h2>
          </div>
          <p className="max-w-md text-xs sm:text-sm leading-relaxed text-foreground/70">
            {settings.lensGuideSubtitle}
          </p>
        </div>

        {/* Interactive Optical Simulator + Lens Cards Grid */}
        <div className="mt-8 sm:mt-10 grid gap-6 lg:grid-cols-12">
          {/* Left: Interactive Optical Workbench & Coating Simulator (7 cols) */}
          <div className="lg:col-span-7">
            <div
              className="relative flex h-full min-h-[400px] sm:min-h-[450px] flex-col justify-between overflow-hidden border border-foreground/20 bg-surface"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              {/* Workbench Background Photo */}
              <ProductImage
                src="/images/editorial/atelier-craft.jpg"
                alt="Mehar Optical Lab Lens Simulator"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />

              {/* Dynamic Simulated Optical Coating Overlay */}
              <div
                className="pointer-events-none absolute inset-0 transition-all duration-700"
                style={{
                  background: compareRaw
                    ? "rgba(0,0,0,0.15)"
                    : activeSim.overlayStyle,
                }}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/92 via-black/40 to-black/60" />

              {/* Top Technical HUD */}
              <div className="relative z-10 flex flex-wrap items-center justify-between gap-2.5 border-b border-white/15 bg-black/65 px-4 py-3 sm:px-5 sm:py-3.5 font-mono text-[9px] sm:text-[10px] tracking-[0.16em] text-white uppercase backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#5AA2E6] shadow-[0_0_8px_#5AA2E6]" />
                  <span className="truncate max-w-[200px] sm:max-w-none">
                    LAB // {compareRaw ? "RAW GLASS" : activeSim.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareRaw((prev) => !prev)}
                  className="rounded-full border border-[#5AA2E6] bg-[#5AA2E6]/20 px-3 py-1 font-mono text-[9px] sm:text-[10px] font-bold text-[#99CEFF] transition hover:bg-[#5AA2E6] hover:text-[#15181E]"
                >
                  {compareRaw ? "ENABLE COATING" : "COMPARE RAW UNCOATED"}
                </button>
              </div>

              {/* Center Simulated Optical Reticle */}
              <div className="relative z-10 my-auto flex flex-col items-center justify-center px-4 py-6 text-center">
                <div
                  className="relative flex h-36 w-36 sm:h-48 sm:w-48 flex-col items-center justify-center rounded-full border-2 transition-all duration-500"
                  style={{
                    borderColor: compareRaw
                      ? "rgba(255,255,255,0.25)"
                      : "#5AA2E6",
                    boxShadow: compareRaw
                      ? "none"
                      : "0 0 60px rgba(90, 162, 230, 0.4), inset 0 0 40px rgba(90, 162, 230, 0.25)",
                    background: compareRaw
                      ? "rgba(255,255,255,0.03)"
                      : activeSim.overlayStyle,
                  }}
                >
                  <span className="font-mono text-[8px] sm:text-[9px] tracking-[0.2em] text-[#99CEFF] uppercase">
                    {compareRaw ? "RAW UNTREATED" : activeSim.wavelength}
                  </span>
                  <p className="mt-1 px-3 font-display text-base sm:text-xl leading-tight text-white">
                    {compareRaw
                      ? "Harsh Screen & Glare"
                      : activeOption?.title || activeSim.name}
                  </p>
                  <span className="mt-1.5 rounded-full border border-white/20 bg-black/60 px-2.5 py-0.5 font-mono text-[9px] sm:text-[10px] text-[#82C3FF]">
                    {compareRaw ? "0% Filter" : activeSim.thickness}
                  </span>
                </div>
              </div>

              {/* Bottom Lab Spec Readout */}
              <div className="relative z-10 border-t border-white/15 bg-black/80 p-4 sm:p-6 text-white backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-mono text-[9.5px] sm:text-[10px] font-bold tracking-[0.18em] text-[#82C3FF] uppercase">
                    {activeSim.code} · {activeSim.effectBadge}
                  </span>
                  {activeOption ? (
                    <span className="font-mono text-xs font-bold text-white">
                      {activeOption.priceHint}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-white/80">
                  {activeOption?.description || activeSim.clinicalNote}
                </p>
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                  <span className="font-mono text-[9px] sm:text-[10px] text-white/55 uppercase">
                    CUSTOM EDGED IN LAHORE STUDIO
                  </span>
                  {activeWaLink ? (
                    <a
                      href={activeWaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-xs font-bold tracking-wider text-[#82C3FF] uppercase hover:underline"
                    >
                      Send Rx on WhatsApp for this Lens ↗
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Interactive Selector Cards (5 cols) */}
          <div className="flex flex-col justify-between gap-3 lg:col-span-5">
            {settings.lensOptions.map((item, idx) => {
              const isSelected = idx === activeIdx;
              const simMeta = SIMULATOR_MODES[idx % SIMULATOR_MODES.length];

              return (
                <button
                  key={`${item.title}-${idx}`}
                  type="button"
                  onClick={() => {
                    setActiveIdx(idx);
                    setCompareRaw(false);
                  }}
                  className={`group w-full border p-4 sm:p-5 text-left transition-all duration-300 ${
                    isSelected
                      ? "border-[#2B6CB0] bg-surface shadow-lg ring-1 ring-[#2B6CB0]"
                      : "border-foreground/15 bg-surface/50 hover:border-accent/50 hover:bg-surface"
                  }`}
                  style={{ borderRadius: "var(--radius-card)" }}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center font-mono text-[9px] sm:text-[10px] font-bold ${
                          isSelected
                            ? "bg-[#15181E] text-[#99CEFF]"
                            : "border border-foreground/20 text-foreground/60"
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span className="font-mono text-[9px] sm:text-[10px] tracking-[0.16em] text-foreground/55 uppercase">
                        {simMeta.wavelength}
                      </span>
                    </div>

                    {item.badge ? (
                      <span className="rounded-full bg-[#D8ECFF] px-2.5 py-0.5 font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider text-[#2B6CB0] uppercase">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2.5 flex items-baseline justify-between gap-2">
                    <h3 className="font-display text-base sm:text-xl text-foreground group-hover:text-accent">
                      {item.title}
                    </h3>
                    <span className="shrink-0 font-mono text-xs font-bold text-[#2B6CB0]">
                      {item.priceHint}
                    </span>
                  </div>

                  <p className="mt-1 text-xs leading-relaxed text-foreground/70">
                    {item.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
