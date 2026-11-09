"use client";

import Link from "next/link";
import { useState } from "react";
import { COUTURE_PRINTS } from "@/components/CoutureBackgroundPrint";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/lib/products";
import type { SiteSettings } from "@/lib/settings-types";

interface HeroShowcaseProps {
  settings: SiteSettings;
  featured: Product[];
  whatsappHref: string | null;
}

const HOTSPOTS = [
  {
    id: "bridge",
    code: "01",
    shortTab: "① Bridge",
    label: "24K Filigree Bridge",
    loupeTag: "BRIDGE // TI-6AL-4V",
    detail:
      "Japanese Beta-Titanium nose bridge engineered for zero-pinch weight distribution.",
    x: "46%",
    y: "41%",
  },
  {
    id: "lens",
    code: "02",
    shortTab: "② Sapphire Lens",
    label: "Sapphire AR Blue-Cut",
    loupeTag: "GLACIER AR // +2.00D",
    detail:
      "Multi-layer anti-reflective glacier optical coating filtering 415–455nm digital blue light.",
    x: "36%",
    y: "44%",
  },
  {
    id: "temple",
    code: "03",
    shortTab: "③ Temple Acetate",
    label: "Mazzucchelli Acetate",
    loupeTag: "TEMPLE // 8MM ACETATE",
    detail:
      "Hand-tumbled Italian cellulose acetate cured for 12 weeks for deep architectural luster.",
    x: "58%",
    y: "39%",
  },
] as const;

export function HeroShowcase({
  settings,
  featured,
  whatsappHref,
}: HeroShowcaseProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<string>("lens");

  const activeProduct = featured[activeIdx] ?? featured[0] ?? null;
  const campaignImage =
    settings.heroImageUrl.trim() || "/images/editorial/hero-campaign.jpg";
  const activeFrameImage =
    activeProduct?.images[0] || "/images/products/aviator-gold.jpg";
  const selectedSpot =
    HOTSPOTS.find((h) => h.id === activeHotspot) ?? HOTSPOTS[1];
  const printMeta =
    COUTURE_PRINTS.find((p) => p.id === settings.bgPrint) ?? COUTURE_PRINTS[0];

  // 1. CINEMATIC FULL-BLEED CAMPAIGN STAGE
  if (settings.heroLayout === "cinematic") {
    return (
      <section className="relative border-b border-foreground/15">
        <div className="mx-auto max-w-7xl px-3 py-6 sm:px-8 sm:py-10">
          <div
            className="relative min-h-[500px] overflow-hidden border border-foreground/20 bg-[#15181E] sm:min-h-[640px]"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <ProductImage
              src={campaignImage}
              alt={settings.heroTitle}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(95deg, rgba(15,18,24,0.94) 0%, rgba(15,18,24,0.68) 48%, rgba(15,18,24,0.18) 100%)",
              }}
            />

            <div className="relative z-10 flex min-h-[500px] flex-col justify-between p-5 text-[#F4F2EC] sm:min-h-[640px] sm:p-12 lg:p-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2.5 rounded-full border border-[#5AA2E6]/40 bg-[#15181E]/75 px-3.5 py-1.5 font-mono text-[9.5px] sm:text-[10px] tracking-[0.2em] text-[#99CEFF] uppercase backdrop-blur-md">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#5AA2E6]" />
                  <span>{settings.heroBadge || "HAUTE OPTIQUE // LAHORE"}</span>
                </div>

                <h1 className="mt-5 font-display text-3xl leading-[1.04] tracking-tight sm:text-6xl lg:text-7xl">
                  {settings.heroTitle}
                </h1>
                <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/80 sm:text-lg">
                  {settings.heroSubtitle}
                </p>

                <div className="mt-7 flex flex-col sm:flex-row gap-3">
                  <Link
                    href="/collection"
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full border border-[#5AA2E6] bg-[#5AA2E6] px-7 py-3 font-mono text-xs font-bold tracking-[0.16em] text-[#15181E] uppercase transition hover:opacity-90"
                  >
                    <span>{settings.heroPrimaryCta}</span>
                    <span>↗</span>
                  </Link>
                  {whatsappHref ? (
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-black/50 px-7 py-3 font-mono text-xs font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-md transition hover:border-[#5AA2E6] hover:text-[#99CEFF]"
                    >
                      <span>{settings.heroSecondaryCta}</span>
                      <span>↗</span>
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 2. V2 ASYMMETRIC MAGAZINE COLLAGE & COUTURE PRINT STAGE (Default Flagship)
  return (
    <section className="relative overflow-x-clip border-b border-foreground/15">
      <div className="mx-auto max-w-7xl px-3 pt-6 pb-12 sm:px-8 sm:pt-10 sm:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-10">
          {/* LEFT COLUMN: EDITORIAL TYPOGRAPHY & 3-CARD PALETTE/SPEC STRIP (6 cols) */}
          <div className="lg:col-span-6">
            {/* Active Couture Print Indicator Pill */}
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-[#5AA2E6]/45 bg-gradient-to-r from-[#D8ECFF]/95 to-[#DFE4EC]/95 px-3.5 py-1.5 font-mono text-[9px] sm:text-[10px] tracking-[0.14em] text-[#15181E] uppercase shadow-[0_4px_16px_rgba(90,162,230,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2B6CB0]" />
              <span>{settings.heroBadge || "HAUTE OPTIQUE // LAHORE"}</span>
              <span className="font-bold text-[#2B6CB0]">
                · {printMeta.shortName}
              </span>
            </div>

            {/* Sculpted Editorial Display Heading */}
            <h1 className="mt-5 sm:mt-6 font-display text-4xl leading-[0.98] font-semibold tracking-tight text-foreground sm:text-6xl xl:text-[4.65rem]">
              <span className="block">Sculpted for</span>
              <span className="mt-1.5 inline-block rounded-2xl border border-[#5AA2E6]/45 bg-gradient-to-r from-[#5AA2E6]/25 to-[#D8ECFF]/75 px-3 py-0.5 font-normal text-[#2B6CB0] italic">
                Crystalline
              </span>{" "}
              <span className="mt-1.5 inline-block rounded-2xl bg-[#15181E] px-3.5 pt-1 pb-1.5 text-[0.82em] text-[#F4F2EC] shadow-[0_12px_28px_rgba(21,24,30,0.22)]">
                DISTINCTION.
              </span>
            </h1>

            {/* Frosted Grey-Cotton Lead Callout */}
            <p className="mt-5 sm:mt-6 max-w-xl rounded-r-2xl border border-foreground/10 border-l-[3px] border-l-[#5AA2E6] bg-[#E5E9F0]/90 px-4 py-3.5 sm:px-5 sm:py-4 text-sm sm:text-[17px] leading-relaxed text-foreground/90 shadow-sm backdrop-blur-md">
              {settings.heroSubtitle}
            </p>

            {/* Primary & Secondary Couture CTAs */}
            <div className="mt-7 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href="/collection"
                className="group inline-flex min-h-12 sm:min-h-13 items-center justify-center gap-3 rounded-full border border-[#15181E] bg-[#15181E] px-6 py-3.5 font-mono text-xs font-semibold tracking-[0.16em] text-[#F4F2EC] uppercase shadow-[0_14px_28px_rgba(21,24,30,0.22)] transition-all hover:-translate-y-0.5"
              >
                <span>{settings.heroPrimaryCta}</span>
                <span className="grid h-5 w-5 sm:h-6 sm:w-6 place-items-center rounded-full bg-[#5AA2E6] font-bold text-[#15181E] transition-transform group-hover:translate-x-0.5">
                  ↗
                </span>
              </Link>

              <Link
                href="/#lens-simulator"
                className="inline-flex min-h-12 sm:min-h-13 items-center justify-center gap-2 rounded-full border border-foreground/20 bg-[#DCE2EC]/95 px-5 py-3.5 font-mono text-xs font-semibold tracking-[0.14em] text-foreground uppercase backdrop-blur-md transition hover:border-[#5AA2E6] hover:bg-[#D8ECFF]/70"
              >
                <span>Interactive Lens Lab</span>
              </Link>
            </div>

            {/* 3-Card Bento Spec Strip (Cool Slate Grey + Deep Charcoal + Glacier Blue Ice) */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
              <div className="rounded-2xl border border-foreground/15 bg-[#E2E7F0]/95 p-3.5 sm:p-4 shadow-[0_10px_24px_rgba(21,24,30,0.06)] backdrop-blur-md">
                <p className="font-mono text-[9px] sm:text-[9.5px] font-semibold tracking-[0.18em] text-foreground/65 uppercase">
                  OPTICAL GRADE
                </p>
                <p className="mt-1 font-display text-xl sm:text-[26px] font-bold text-foreground">
                  1.67 / 1.74
                </p>
                <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-foreground/75">
                  Hi-Index Aspheric Optics
                </p>
              </div>

              <div className="rounded-2xl border border-[#5AA2E6]/35 bg-[#15181E] p-3.5 sm:p-4 text-[#F4F2EC] shadow-[0_12px_28px_rgba(21,24,30,0.16)]">
                <p className="font-mono text-[9px] sm:text-[9.5px] tracking-[0.18em] text-[#82C3FF] uppercase">
                  CHASSIS CRAFT
                </p>
                <p className="mt-1 font-display text-xl sm:text-[26px] font-bold text-[#F4F2EC]">
                  Beta-Titanium
                </p>
                <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-[#CBD2DC]">
                  &amp; Italian Acetate
                </p>
              </div>

              <div className="rounded-2xl border border-[#5AA2E6]/45 bg-gradient-to-br from-[#D8ECFF] to-[#DFE4EC] p-3.5 sm:p-4 text-[#15181E] shadow-[0_10px_24px_rgba(90,162,230,0.12)]">
                <p className="font-mono text-[9px] sm:text-[9.5px] font-semibold tracking-[0.18em] text-[#1E4E8C] uppercase">
                  RX DISPENSING
                </p>
                <p className="mt-1 font-display text-xl sm:text-[26px] font-bold text-[#15181E]">
                  Same-Day
                </p>
                <p className="mt-0.5 text-[10.5px] sm:text-[11px] text-[#232832]/80">
                  In-House Lab Edging
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: ASYMMETRIC MAGAZINE COLLAGE + ROTATING ATELIER SEAL (6 cols) */}
          <div className="relative mx-auto w-full max-w-xl pt-2 pb-4 lg:col-span-6 lg:max-w-none">
            <div className="relative p-2 sm:p-4">
              {/* Layer 1: Architectural Cool Slate Grey Backboard */}
              <div
                aria-hidden="true"
                className="absolute inset-y-0 right-1 left-3 sm:right-0 sm:left-6 rotate-[1.5deg] sm:rotate-[2.2deg] rounded-[24px] sm:rounded-[28px] border border-foreground/20 bg-[#D5DCE6] shadow-[0_20px_50px_rgba(21,24,30,0.1)]"
              />

              {/* Layer 2: Translucent Glacier Blue Offset Glass */}
              <div
                aria-hidden="true"
                className="absolute top-2 right-2 bottom-0 left-0 sm:top-4 sm:right-5 -rotate-[1.2deg] sm:-rotate-[1.8deg] rounded-[24px] sm:rounded-[28px] border border-[#5AA2E6]/50 bg-gradient-to-br from-[#5AA2E6]/25 to-[#D8ECFF]/60 backdrop-blur-md"
              />

              {/* Rotating SVG Atelier Seal Stamp (Top Right) */}
              <div
                aria-hidden="true"
                className="absolute -top-3 -right-2 z-30 grid h-20 w-20 sm:h-28 sm:w-28 animate-[spin_20s_linear_infinite] place-items-center rounded-full border-2 border-[#5AA2E6] bg-[#15181E] shadow-[0_14px_30px_rgba(21,24,30,0.3)]"
              >
                <svg viewBox="0 0 100 100" className="h-18 w-18 sm:h-24 sm:w-24">
                  <defs>
                    <path
                      id="atelierSealPath"
                      d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
                    />
                  </defs>
                  <text
                    fill="#99CEFF"
                    fontFamily="monospace"
                    fontSize="6.5"
                    letterSpacing="1.85"
                  >
                    <textPath href="#atelierSealPath">
                      MEHAR FOR EYES • HAUTE OPTIQUE • LAHORE •
                    </textPath>
                  </text>
                  <circle
                    cx="50"
                    cy="50"
                    r="14"
                    fill="none"
                    stroke="#5AA2E6"
                    strokeWidth="1.2"
                  />
                  <circle cx="50" cy="50" r="4" fill="#5AA2E6" />
                </svg>
              </div>

              {/* Layer 3: Main Obsidian Charcoal Campaign Card */}
              <div className="relative z-10 overflow-hidden rounded-[20px] sm:rounded-[24px] border-2 border-[#15181E] bg-[#15181E] shadow-[0_28px_60px_rgba(21,24,30,0.3)]">
                {/* Top Metadata Bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-[#15181E] px-3.5 py-2.5 sm:px-4 sm:py-3 font-mono text-[9px] sm:text-[10px] tracking-[0.14em] sm:tracking-[0.16em] text-[#F4F2EC] uppercase">
                  <span>LOOKBOOK ARCHIVE // SERIES 04</span>
                  <span className="flex items-center gap-1.5 text-[#7EC0FF]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#7EC0FF]" />
                    <span>SAPPHIRE AR</span>
                  </span>
                </div>

                {/* Campaign Image Stage with Smooth Dynamic Optical Loupe */}
                <div className="group relative h-[360px] sm:h-[450px] overflow-hidden">
                  <ProductImage
                    src={campaignImage}
                    alt="Mehar for Eyes Editorial Campaign"
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover object-center transition-transform duration-1000 group-hover:scale-[1.03]"
                    priority
                  />

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#15181E]/94 via-transparent to-black/15" />

                  {/* Movable Optical Loupe Reticle + Interactive 01 / 02 / 03 Callout Pins */}
                  <div
                    style={{ left: selectedSpot.x, top: selectedSpot.y }}
                    className="pointer-events-none absolute hidden h-28 w-28 sm:h-32 sm:w-32 -translate-x-1/2 -translate-y-1/2 items-end justify-center rounded-full border border-[#7EC0FF]/90 bg-[radial-gradient(circle,rgba(90,162,230,0.16)_0%,rgba(21,24,30,0.28)_100%)] pb-2.5 shadow-[0_0_0_6px_rgba(255,255,255,0.1),0_16px_36px_rgba(0,0,0,0.45)] backdrop-contrast-125 transition-all duration-500 ease-out sm:flex"
                  >
                    <span className="absolute top-1/2 left-0 h-px w-full bg-[#7EC0FF]/45" />
                    <span className="absolute top-0 left-1/2 h-full w-px bg-[#7EC0FF]/45" />
                    <span className="relative z-10 rounded-full border border-[#7EC0FF]/50 bg-[#15181E]/90 px-2 py-0.5 font-mono text-[7.5px] sm:text-[8px] font-bold tracking-[0.14em] text-[#99CEFF]">
                      {selectedSpot.loupeTag}
                    </span>
                  </div>

                  {/* Interactive 01, 02, 03 Frame Anatomy Callout Pins */}
                  {HOTSPOTS.map((spot) => {
                    const isSelected = spot.id === activeHotspot;
                    return (
                      <button
                        key={spot.id}
                        type="button"
                        onClick={() => setActiveHotspot(spot.id)}
                        style={{ left: spot.x, top: spot.y }}
                        className={`absolute z-20 flex h-7 w-7 sm:h-8 sm:w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-[9px] sm:text-[10px] font-bold transition-all duration-300 ${
                          isSelected
                            ? "scale-125 border-[#7EC0FF] bg-[#5AA2E6] text-[#15181E] shadow-[0_0_20px_rgba(90,162,230,0.9)]"
                            : "border-white/70 bg-[#15181E]/80 text-white backdrop-blur-md hover:scale-110 hover:border-[#7EC0FF]"
                        }`}
                        aria-label={`Inspect ${spot.label}`}
                        title={`Pin ${spot.code}: ${spot.label}`}
                      >
                        {spot.code}
                      </button>
                    );
                  })}

                  {/* Bottom Interactive Frame Anatomy Inspector Bar */}
                  <div className="absolute right-2.5 bottom-2.5 left-2.5 sm:right-4 sm:bottom-4 sm:left-52 z-20 rounded-xl border border-white/15 bg-[#15181E]/90 p-3 sm:p-3.5 text-[#F4F2EC] backdrop-blur-xl">
                    <div className="flex flex-wrap items-center justify-between gap-1 border-b border-white/10 pb-1.5">
                      <span className="font-mono text-[8.5px] sm:text-[9px] tracking-[0.14em] text-[#9FB1C6] uppercase">
                        ANATOMY PIN:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {HOTSPOTS.map((spot) => (
                          <button
                            key={spot.id}
                            type="button"
                            onClick={() => setActiveHotspot(spot.id)}
                            className={`rounded-full px-2 py-0.5 font-mono text-[8.5px] transition ${
                              spot.id === activeHotspot
                                ? "bg-[#5AA2E6] font-bold text-[#15181E] shadow-[0_0_12px_rgba(90,162,230,0.5)]"
                                : "bg-white/10 text-white/75 hover:bg-white/20"
                            }`}
                          >
                            {spot.shortTab}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1.5 font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider text-[#82C3FF] uppercase">
                      {selectedSpot.label}
                    </p>
                    <p className="mt-0.5 text-[10.5px] sm:text-[11.5px] leading-snug text-[#CBD2DC]">
                      {selectedSpot.detail}
                    </p>
                  </div>
                </div>
              </div>

              {/* Floating Polaroid Frame Switcher Inset (Bottom Left) */}
              {activeProduct ? (
                <div className="relative z-30 mt-3 sm:mt-0 w-full rounded-2xl border border-[#15181E]/25 bg-[#F4F2EC] p-2.5 text-[#15181E] shadow-[0_20px_40px_rgba(21,24,30,0.26)] sm:absolute sm:-bottom-5 sm:-left-5 sm:w-56 sm:-rotate-[3.5deg]">
                  <div className="mb-1.5 flex items-center justify-between font-mono text-[8px] sm:text-[8.5px] font-bold tracking-wider text-[#15181E]/70 uppercase">
                    <span>QUICK PREVIEW</span>
                    <div className="flex gap-1">
                      {featured.slice(0, 4).map((item, idx) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setActiveIdx(idx)}
                          title={`Preview ${item.name}`}
                          className={`rounded px-1.5 py-0.5 text-[8.5px] transition ${
                            idx === activeIdx
                              ? "bg-[#15181E] text-[#F4F2EC]"
                              : "bg-[#D5DCE6] text-[#15181E] hover:bg-[#5AA2E6]/35"
                          }`}
                        >
                          #{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/collection/${activeProduct.slug}`}
                    className="block overflow-hidden rounded-xl border border-black/10 bg-white"
                  >
                    <div className="relative h-24 sm:h-28 w-full">
                      <ProductImage
                        src={activeFrameImage}
                        alt={activeProduct.name}
                        fill
                        sizes="220px"
                        className="object-cover"
                      />
                    </div>
                  </Link>

                  <div className="mt-1.5 flex items-center justify-between font-mono text-[9px] sm:text-[9.5px]">
                    <Link
                      href={`/collection/${activeProduct.slug}`}
                      className="truncate font-bold text-[#15181E] hover:text-[#2B6CB0]"
                    >
                      {activeProduct.name}
                    </Link>
                    <span className="shrink-0 rounded-full bg-[#D8ECFF] px-2 py-0.5 font-bold text-[#2B6CB0]">
                      {activeProduct.price
                        ? `Rs ${activeProduct.price.toLocaleString()}`
                        : "Rx"}
                    </span>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
