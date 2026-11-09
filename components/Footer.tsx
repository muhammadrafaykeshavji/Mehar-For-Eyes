import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";

export async function Footer() {
  "use cache";
  cacheLife({ revalidate: 3600, stale: 3600, expire: 86400 });
  cacheTag("settings");

  const settings = await getSiteSettings();
  const currentYear = new Date().getFullYear();
  const fullAddress = [
    settings.addressStreet,
    settings.addressCity,
    settings.addressRegion,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="relative z-10 mt-auto border-t border-[#5AA2E6]/30 bg-[#15181E] text-[#F4F2EC]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-10 border-b border-white/12 pb-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-mono text-[10px] tracking-[0.22em] text-[#82C3FF] uppercase">
              OPTICAL ATELIER // LAHORE FLAGSHIP
            </p>
            <p className="mt-3 font-display text-3xl tracking-tight text-[#F4F2EC] sm:text-4xl">
              {settings.shopName}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#CBD2DC]">
              {settings.tagline}
            </p>
          </div>

          <div className="lg:col-span-4">
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#82C3FF] uppercase">
              STUDIO LOCATION &amp; HOURS
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[#F4F2EC]/90">
              {fullAddress}
            </p>
            <p className="mt-2 font-mono text-xs text-[#9FB1C6]">
              {settings.openingHours}
            </p>
          </div>

          <div className="lg:col-span-3">
            <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-[#82C3FF] uppercase">
              DIRECTORY
            </p>
            <ul className="mt-3 space-y-2.5 font-mono text-xs tracking-wider text-[#CBD2DC] uppercase">
              <li>
                <Link
                  href="/collection"
                  className="transition-colors hover:text-[#82C3FF]"
                >
                  01 // Full Frame Archive
                </Link>
              </li>
              <li>
                <Link
                  href="/collection?category=eyeglasses"
                  className="transition-colors hover:text-[#82C3FF]"
                >
                  02 // Prescription Optical
                </Link>
              </li>
              <li>
                <Link
                  href="/collection?category=sunglasses"
                  className="transition-colors hover:text-[#82C3FF]"
                >
                  03 // Polarized Sun
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="transition-colors hover:text-[#82C3FF]"
                >
                  04 // About the Atelier
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 font-mono text-[10px] tracking-[0.18em] text-[#9FB1C6] uppercase">
          <span>
            © {currentYear} {settings.shopName}. ALL RIGHTS RESERVED.
          </span>
          <span>PRECISION OPTICS · HAND-FITTED IN LAHORE</span>
        </div>
      </div>
    </footer>
  );
}
