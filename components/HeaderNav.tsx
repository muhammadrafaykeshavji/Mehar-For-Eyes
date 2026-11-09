"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { num: "01", href: "/", label: "Flagship", match: "home" },
  { num: "02", href: "/collection", label: "Archive", match: "all" },
  {
    num: "03",
    href: "/collection?category=eyeglasses",
    label: "Optical",
    match: "eyeglasses",
  },
  {
    num: "04",
    href: "/collection?category=sunglasses",
    label: "Sun",
    match: "sunglasses",
  },
  { num: "05", href: "/about", label: "Atelier", match: "about" },
] as const;

interface HeaderNavProps {
  whatsappHref?: string | null;
  telHref?: string | null;
  shopName?: string;
}

export function HeaderNav({
  whatsappHref,
  telHref,
  shopName = "Mehar for Eyes",
}: HeaderNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileMenuOpen]);

  const isItemActive = (match: (typeof navItems)[number]["match"]) => {
    if (match === "home") {
      return pathname === "/";
    }
    if (match === "all") {
      return (
        (pathname === "/collection" && !category) ||
        (pathname.startsWith("/collection/") && pathname !== "/collection")
      );
    }
    if (match === "eyeglasses") {
      return pathname === "/collection" && category === "eyeglasses";
    }
    if (match === "sunglasses") {
      return pathname === "/collection" && category === "sunglasses";
    }
    if (match === "about") {
      return pathname.startsWith("/about");
    }
    return false;
  };

  return (
    <>
      {/* 1. Desktop Inline Pill Nav (lg+) */}
      <nav aria-label="Primary Desktop" className="hidden lg:block">
        <ul className="flex items-center gap-1">
          {navItems.map((item) => {
            const active = isItemActive(item.match);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`group inline-flex items-center gap-1.5 rounded-full px-4 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-all ${
                    active
                      ? "border border-[#5AA2E6]/50 bg-[#15181E] font-bold text-[#F4F2EC] shadow-[0_4px_14px_rgba(21,24,30,0.18)]"
                      : "text-foreground/75 hover:bg-surface/80 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`text-[9.5px] ${
                      active ? "text-[#7EC0FF]" : "text-accent"
                    }`}
                  >
                    {item.num} /
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 2. Mobile / Tablet Hamburger Toggle Button (< lg) */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen((v) => !v)}
        aria-expanded={mobileMenuOpen}
        aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/20 bg-background/90 text-foreground transition hover:border-accent hover:text-accent lg:hidden"
      >
        {mobileMenuOpen ? (
          <span className="font-mono text-base font-bold leading-none">✕</span>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1">
            <span className="h-0.5 w-4 rounded-full bg-foreground" />
            <span className="h-0.5 w-4 rounded-full bg-foreground" />
            <span className="h-0.5 w-4 rounded-full bg-foreground" />
          </div>
        )}
      </button>

      {/* 3. Mobile Slide-Down / Modal Navigation Drawer */}
      {mobileMenuOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Mobile Navigation"
          className="fixed inset-0 top-[72px] z-50 flex flex-col bg-[#15181E]/95 p-5 text-[#F4F2EC] backdrop-blur-2xl lg:hidden"
        >
          <div className="flex flex-col justify-between flex-1 overflow-y-auto pb-8">
            <div>
              <p className="font-mono text-[10px] font-bold tracking-[0.22em] text-[#82C3FF] uppercase border-b border-white/10 pb-3">
                MEHAR OPTIQUE // DIRECTORY
              </p>

              <ul className="mt-4 space-y-2">
                {navItems.map((item) => {
                  const active = isItemActive(item.match);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between rounded-2xl px-4 py-3.5 font-display text-lg tracking-wide transition-all ${
                          active
                            ? "border border-[#5AA2E6]/60 bg-[#5AA2E6]/15 font-bold text-[#99CEFF] shadow-sm"
                            : "border border-white/5 bg-white/5 text-[#F4F2EC] hover:bg-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#7EC0FF]">
                            {item.num}
                          </span>
                          <span>{item.label}</span>
                        </div>
                        <span className="font-mono text-xs text-[#82C3FF]">
                          {active ? "● ACTIVE" : "→"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Quick Contact & WhatsApp Actions inside Drawer */}
            <div className="mt-8 border-t border-white/10 pt-5 space-y-3">
              <p className="font-mono text-[9.5px] tracking-[0.2em] text-[#9FB1C6] uppercase">
                DIRECT OPTICAL ASSISTANCE
              </p>

              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-full border border-[#5AA2E6] bg-[#5AA2E6] py-3 font-mono text-xs font-bold tracking-wider text-[#15181E] uppercase shadow-lg transition hover:bg-[#7EC0FF]"
                >
                  <span className="h-2 w-2 rounded-full bg-[#15181E]" />
                  <span>Send Rx on WhatsApp ↗</span>
                </a>
              ) : null}

              {telHref ? (
                <a
                  href={telHref}
                  className="flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 py-3 font-mono text-xs font-semibold tracking-wider text-[#F4F2EC] uppercase transition hover:bg-white/20"
                >
                  <span>📞 Call Lahore Flagship Desk</span>
                </a>
              ) : null}

              <p className="text-center font-mono text-[9px] text-[#9FB1C6] tracking-wider uppercase pt-2">
                {shopName} · Haute Optique · Lahore, Pakistan
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
