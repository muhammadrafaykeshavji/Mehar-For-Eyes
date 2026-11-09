"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

interface AdminShellProps {
  children: ReactNode;
}

const navLinks = [
  {
    href: "/admin",
    label: "Inventory & Catalog",
    icon: "◫",
    exact: true,
  },
  {
    href: "/admin/products/new",
    label: "Add New Frame",
    icon: "＋",
    exact: false,
  },
  {
    href: "/admin/settings",
    label: "Theme & Studio Customizer",
    icon: "✦",
    exact: false,
  },
] as const;

const liveStoreLinks = [
  { href: "/", label: "Storefront Home ↗" },
  { href: "/collection", label: "Frame Catalog ↗" },
  { href: "/about", label: "Optical Lab & About ↗" },
] as const;

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [adminTheme, setAdminTheme] = useState<"dark_slate" | "light_saas">(
    () => {
      if (typeof window !== "undefined") {
        const saved = window.localStorage.getItem("mehar_admin_theme");
        if (saved === "light_saas" || saved === "dark_slate") {
          return saved;
        }
      }
      return "dark_slate";
    },
  );

  // Automatically attach X-Admin-Session header from localStorage to /api/admin/* fetches
  // so VS Code / Antigravity's built-in browser iframe (which blocks HTTP cookies) works seamlessly.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const origFetch = window.fetch.bind(window);
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const urlStr =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (urlStr.startsWith("/api/admin") || urlStr.includes("/api/admin/")) {
        const token = window.localStorage.getItem("mehar_admin_token");
        if (token) {
          const headers = new Headers(init?.headers);
          if (!headers.has("x-admin-session")) {
            headers.set("x-admin-session", token);
          }
          return origFetch(input, { ...init, headers });
        }
      }
      return origFetch(input, init);
    };
    return () => {
      window.fetch = origFetch;
    };
  }, []);

  // Verify session on protected admin routes
  useEffect(() => {
    if (pathname === "/admin/login") return;
    let active = true;
    async function checkSession() {
      const token =
        typeof window !== "undefined"
          ? window.localStorage.getItem("mehar_admin_token")
          : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["x-admin-session"] = token;
      }
      try {
        const res = await fetch("/api/admin/me", {
          credentials: "include",
          headers,
          cache: "no-store",
        });
        if (!res.ok && active) {
          window.localStorage.removeItem("mehar_admin_token");
          router.replace("/admin/login");
        }
      } catch {
        // Keep page active if network is momentarily busy
      }
    }
    void checkSession();
    return () => {
      active = false;
    };
  }, [pathname, router]);

  function toggleAdminTheme() {
    const next = adminTheme === "dark_slate" ? "light_saas" : "dark_slate";
    setAdminTheme(next);
    window.localStorage.setItem("mehar_admin_theme", next);
  }

  // Isolate Admin Console palette from customer storefront theme variables
  const paletteVars =
    adminTheme === "dark_slate"
      ? ({
          "--background": "#090D16",
          "--surface": "#111827",
          "--foreground": "#F8FAFC",
          "--accent": "#3B82F6",
          "--radius-card": "0.875rem",
          "--radius-btn": "0.5rem",
        } as React.CSSProperties)
      : ({
          "--background": "#F8FAFC",
          "--surface": "#FFFFFF",
          "--foreground": "#0F172A",
          "--accent": "#2563EB",
          "--radius-card": "0.875rem",
          "--radius-btn": "0.5rem",
        } as React.CSSProperties);

  if (pathname === "/admin/login") {
    return (
      <div
        style={paletteVars}
        className="min-h-screen bg-background text-foreground"
      >
        <header className="border-b border-foreground/10 bg-surface">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-sm font-bold text-white">
                M
              </span>
              <span className="font-display text-lg text-foreground">
                Mehar for Eyes
              </span>
              <span className="rounded-md border border-foreground/15 bg-background px-2.5 py-0.5 text-[11px] font-semibold tracking-wider text-accent uppercase">
                Studio OS
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={toggleAdminTheme}
                className="rounded-lg border border-foreground/15 bg-background px-3 py-1.5 text-xs font-medium text-foreground/80 transition hover:border-accent"
              >
                {adminTheme === "dark_slate" ? "☀ Light UI" : "☾ Dark UI"}
              </button>
              <Link
                href="/"
                className="text-xs font-medium text-foreground/75 transition-colors hover:text-accent"
              >
                View Storefront ↗
              </Link>
            </div>
          </div>
        </header>
        {children}
      </div>
    );
  }

  async function handleLogout() {
    const token =
      typeof window !== "undefined"
        ? window.localStorage.getItem("mehar_admin_token")
        : null;
    await fetch("/api/admin/logout", {
      method: "POST",
      credentials: "include",
      headers: token ? { "x-admin-session": token } : undefined,
    }).catch(() => null);
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("mehar_admin_token");
    }
    router.replace("/admin/login");
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  const isCustomizerRoute = pathname.startsWith("/admin/settings");

  return (
    <div
      style={paletteVars}
      className="min-h-screen bg-background text-foreground lg:grid lg:grid-cols-[16.5rem_1fr]"
    >
      {/* Sidebar (Desktop) & Topbar (Mobile) */}
      <aside className="border-b border-foreground/10 bg-surface lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:border-r lg:border-b-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center justify-between border-b border-foreground/10 px-5 py-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-base font-bold text-white shadow-sm">
                M
              </span>
              <div>
                <Link
                  href="/admin"
                  className="font-display text-lg leading-none tracking-tight text-foreground"
                >
                  Mehar for Eyes
                </Link>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.16em] text-accent uppercase">
                  Optical Studio OS
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={toggleAdminTheme}
                className="rounded-lg border border-foreground/15 bg-background px-2.5 py-1.5 text-xs text-foreground"
              >
                {adminTheme === "dark_slate" ? "☀" : "☾"}
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-foreground/20 px-3 py-1.5 text-xs font-medium text-foreground hover:border-accent"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Primary Navigation */}
          <nav aria-label="Admin navigation" className="p-3 sm:p-4">
            <p className="hidden px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-foreground/45 uppercase lg:block">
              Workspace
            </p>
            <ul className="flex flex-wrap gap-1.5 lg:flex-col">
              {navLinks.map((item) => {
                const active = isActive(item.href, item.exact);
                return (
                  <li key={item.href} className="flex-1 lg:flex-initial">
                    <Link
                      href={item.href}
                      className={`flex min-h-10 items-center justify-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm font-medium transition-all lg:justify-start ${
                        active
                          ? "border-accent bg-accent text-white shadow-sm"
                          : "border-transparent text-foreground/75 hover:border-foreground/10 hover:bg-background hover:text-foreground"
                      }`}
                    >
                      <span className="text-base leading-none">
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 hidden px-3 pb-2 text-[10px] font-semibold tracking-[0.14em] text-foreground/45 uppercase lg:block">
              Live Customer Store
            </p>
            <ul className="mt-1 hidden space-y-1 lg:block">
              {liveStoreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-9 items-center justify-between rounded-lg px-3.5 py-1.5 text-xs text-foreground/70 transition-colors hover:bg-background hover:text-accent"
                  >
                    <span>{link.label.replace(" ↗", "")}</span>
                    <span className="text-foreground/40">↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Desktop Sidebar Footer */}
        <div className="hidden space-y-3 border-t border-foreground/10 p-4 lg:block">
          <div className="flex items-center justify-between rounded-lg border border-foreground/10 bg-background px-3 py-2 text-xs">
            <span className="text-foreground/65">Admin Appearance</span>
            <button
              type="button"
              onClick={toggleAdminTheme}
              className="font-medium text-accent hover:underline"
            >
              {adminTheme === "dark_slate" ? "☀ Light Mode" : "☾ Dark Slate"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-10 w-full items-center justify-center rounded-lg border border-foreground/15 bg-background px-4 py-2 text-xs font-medium text-foreground/80 transition-colors hover:border-accent hover:text-accent"
          >
            Sign out of Admin
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="min-w-0 flex-1">
        <div
          className={`mx-auto w-full px-4 py-6 sm:px-8 sm:py-8 ${
            isCustomizerRoute ? "max-w-[1600px]" : "max-w-6xl"
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
