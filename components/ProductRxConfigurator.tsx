"use client";

import { useState } from "react";
import { tryBuildWhatsAppLink } from "@/lib/whatsapp";

interface ProductRxConfiguratorProps {
  productName: string;
  brand: string;
  basePrice: number | null;
  inStock: boolean;
  whatsappNumber: string;
  shopName: string;
}

const LENS_PACKAGES = [
  {
    id: "frame_only",
    title: "Frame Only (Demo Lenses)",
    badge: "Base Chassis",
    desc: "Shipped with factory demo lenses or ready for your local optician.",
    addonPrice: 0,
  },
  {
    id: "blue_cut",
    title: "Sapphire Digital Blue-Cut + Anti-Glare",
    badge: "Most Popular",
    desc: "Zero-power or Single-Vision Rx with 415–455nm screen filter & UV400.",
    addonPrice: 2500,
  },
  {
    id: "photochromic",
    title: "Photochromic (Sun-Reactive Transitions®)",
    badge: "Indoor + Outdoor",
    desc: "Clear indoors and automatically darkens into sunglasses in sunlight.",
    addonPrice: 4500,
  },
  {
    id: "hi_index",
    title: "1.67 Hi-Index Ultra-Thin Aspheric",
    badge: "Strong Rx",
    desc: "Up to 40% thinner & lighter lenses for higher prescriptions.",
    addonPrice: 5500,
  },
  {
    id: "progressive",
    title: "Digital Freeform Progressive Multifocal",
    badge: "Distance + Near",
    desc: "Seamless distance, intermediate & reading zones with zero dividing line.",
    addonPrice: 8500,
  },
] as const;

export function ProductRxConfigurator({
  productName,
  brand,
  basePrice,
  inStock,
  whatsappNumber,
  shopName,
}: ProductRxConfiguratorProps) {
  const [selectedId, setSelectedId] = useState<string>("blue_cut");

  const activePkg =
    LENS_PACKAGES.find((p) => p.id === selectedId) ?? LENS_PACKAGES[0];
  const totalPrice =
    basePrice !== null ? basePrice + activePkg.addonPrice : null;

  const message =
    totalPrice !== null
      ? `Hi ${shopName} — I'd like to order *${productName}* (${brand}) with *${activePkg.title}* (Estimated Total: PKR ${totalPrice.toLocaleString()}).`
      : `Hi ${shopName} — I'd like to inquire about *${productName}* (${brand}) with *${activePkg.title}*.`;

  const whatsappHref = tryBuildWhatsAppLink(message, whatsappNumber);

  return (
    <div className="mt-6 rounded-2xl border border-foreground/15 bg-[#DCE2EC]/95 p-3.5 sm:p-5 shadow-sm backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-foreground/12 pb-3">
        <div>
          <p className="font-mono text-[9.5px] sm:text-[10px] font-bold tracking-[0.16em] text-[#2B6CB0] uppercase">
            CUSTOMIZE LENS &amp; RX PACKAGE
          </p>
          <p className="mt-0.5 text-xs text-foreground/70">
            Select optical lens grade to calculate total fitted price:
          </p>
        </div>
        <span className="rounded-full bg-[#15181E] px-2.5 py-1 font-mono text-[9px] sm:text-[10px] font-bold text-[#99CEFF]">
          IN-HOUSE LAB
        </span>
      </div>

      <div className="mt-3.5 space-y-2">
        {LENS_PACKAGES.map((pkg) => {
          const active = pkg.id === selectedId;
          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedId(pkg.id)}
              className={`flex w-full items-start justify-between gap-2.5 sm:gap-3 rounded-xl border p-2.5 sm:p-3 text-left transition-all ${
                active
                  ? "border-[#2B6CB0] bg-background shadow-sm ring-1 ring-[#2B6CB0]"
                  : "border-foreground/12 bg-background/60 hover:bg-background"
              }`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="font-display text-xs sm:text-sm font-bold text-foreground">
                    {pkg.title}
                  </span>
                  <span className="rounded-full bg-[#D8ECFF] px-2 py-0.5 font-mono text-[8.5px] sm:text-[9px] font-bold text-[#2B6CB0] uppercase">
                    {pkg.badge}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] sm:text-[11.5px] text-foreground/65 leading-snug">
                  {pkg.desc}
                </p>
              </div>
              <span className="shrink-0 font-mono text-xs font-bold text-[#15181E]">
                {pkg.addonPrice === 0
                  ? "Included"
                  : `+Rs ${pkg.addonPrice.toLocaleString()}`}
              </span>
            </button>
          );
        })}
      </div>

      {/* Total Price Summary & WhatsApp Order CTA */}
      <div className="mt-4 sm:mt-5 flex flex-col justify-between gap-3.5 sm:gap-4 rounded-xl bg-[#15181E] p-3.5 sm:p-4 text-[#F4F2EC] sm:flex-row sm:items-center">
        <div>
          <p className="font-mono text-[9px] sm:text-[9.5px] tracking-[0.18em] text-[#82C3FF] uppercase">
            ESTIMATED FITTED TOTAL
          </p>
          <p className="mt-0.5 font-display text-xl sm:text-2xl font-bold text-[#F4F2EC]">
            {totalPrice !== null
              ? `PKR ${totalPrice.toLocaleString()}`
              : "Price on Inquiry"}
          </p>
          <p className="font-mono text-[9.5px] sm:text-[10px] text-[#CBD2DC]">
            {basePrice
              ? `Frame Rs ${basePrice.toLocaleString()} + Lens Rs ${activePkg.addonPrice.toLocaleString()}`
              : activePkg.title}
          </p>
        </div>

        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full border border-[#5AA2E6] bg-[#5AA2E6] px-5 sm:px-6 py-2.5 sm:py-3 font-mono text-xs font-bold tracking-[0.12em] text-[#15181E] uppercase shadow-[0_8px_20px_rgba(90,162,230,0.35)] transition hover:bg-[#7EC0FF]"
          >
            <span>
              {inStock ? "Order Frame + Lens on WhatsApp" : "Inquire on WhatsApp"}
            </span>
            <span>↗</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
