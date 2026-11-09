import Link from "next/link";
import { Suspense } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { getSiteSettings } from "@/lib/settings";
import { getShopTelHref, tryBuildWhatsAppLink } from "@/lib/whatsapp";

export async function Header() {
  const settings = await getSiteSettings();
  const whatsappHref = tryBuildWhatsAppLink(
    `Hi ${settings.shopName} — I'd like to ask about frames or send my prescription.`,
    settings.whatsappNumber,
  );
  const telHref = getShopTelHref(
    settings.phoneNumber || settings.whatsappNumber,
  );

  return (
    <header className="sticky top-2 sm:top-3 z-40 mx-auto w-full max-w-7xl px-3 sm:px-8">
      {/* Main Responsive Header Pill */}
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 rounded-full border border-foreground/15 bg-background/90 px-3 py-2 sm:px-6 sm:py-3 shadow-[0_12px_32px_rgba(21,24,30,0.08)] backdrop-blur-xl">
        {/* Left Brand Emblem + Title */}
        <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
          <Link
            href="/"
            className="group flex items-center gap-2.5 sm:gap-3.5 focus-visible:outline-none min-w-0"
          >
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 border-[#5AA2E6] bg-[#15181E] font-display text-base sm:text-lg font-bold text-[#F4F2EC] italic shadow-[0_4px_14px_rgba(90,162,230,0.35)] transition-transform duration-300 group-hover:scale-105">
              M
            </span>
            <div className="min-w-0">
              <span className="block truncate font-display text-base sm:text-2xl leading-none font-bold tracking-tight text-foreground">
                {settings.shopName}
              </span>
              <span className="mt-0.5 sm:mt-1 block truncate font-mono text-[8px] sm:text-[9px] font-semibold tracking-[0.2em] text-accent uppercase">
                HAUTE OPTIQUE · LAHORE
              </span>
            </div>
          </Link>
        </div>

        {/* Center Dynamic Pill Navigation (Desktop lg+) */}
        <Suspense fallback={null}>
          <HeaderNav
            whatsappHref={whatsappHref}
            telHref={telHref}
            shopName={settings.shopName}
          />
        </Suspense>

        {/* Right Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Send prescription or inquire via WhatsApp"
              className="group inline-flex items-center gap-1.5 sm:gap-2.5 rounded-full border border-[#15181E] bg-[#15181E] px-3 py-1.5 sm:px-5 sm:py-2.5 font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.14em] text-[#F4F2EC] uppercase shadow-[0_6px_18px_rgba(21,24,30,0.18)] transition-all hover:-translate-y-0.5 hover:border-[#5AA2E6]"
            >
              <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-[#7EC0FF] shadow-[0_0_8px_#7EC0FF]" />
              <span className="hidden xs:inline">Send Rx / Inquire</span>
              <span className="xs:hidden">Rx ↗</span>
            </a>
          ) : null}
        </div>
      </div>

      {/* Mobile & Tablet Quick-Nav Pill Strip (< lg) */}
      <div className="mt-2 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none lg:hidden">
        {[
          { href: "/", label: "01 Flagship" },
          { href: "/collection", label: "02 Archive" },
          { href: "/collection?category=eyeglasses", label: "03 Optical" },
          { href: "/collection?category=sunglasses", label: "04 Sun" },
          { href: "/about", label: "05 Atelier" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-full border border-foreground/15 bg-background/85 px-3 py-1 font-mono text-[10px] font-semibold tracking-wider text-foreground/80 uppercase shadow-xs backdrop-blur-md transition hover:border-[#5AA2E6] hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}
