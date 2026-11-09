"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  Suspense,
  useEffect,
  useState,
} from "react";
import { revalidateSettings } from "@/app/admin/actions";
import { COUTURE_PRINTS } from "@/components/CoutureBackgroundPrint";
import { ProductImage } from "@/components/ProductImage";
import {
  type ApiSiteSettingsPayload,
  type CardStyleId,
  defaultSiteSettings,
  type HeroLayoutId,
  type LensOption,
  mapApiToSiteSettings,
  mapSiteSettingsToApi,
  resolveActiveThemeColors,
  type SiteSettings,
  THEME_PRESETS,
  type ThemePresetId,
} from "@/lib/settings-types";

type SettingsTab = "theme" | "widgets" | "contact" | "home" | "pages";

const tabs: { id: SettingsTab; label: string; badge: string }[] = [
  { id: "theme", label: "1. Theme & Layout", badge: "Design" },
  { id: "widgets", label: "2. Hero Photo & Widgets", badge: "Optical" },
  { id: "contact", label: "3. Shop & WhatsApp", badge: "Contact" },
  { id: "home", label: "4. Home Page Copy", badge: "Text" },
  { id: "pages", label: "5. Collection & About", badge: "Pages" },
];

const inputClass =
  "mt-1.5 block w-full rounded-lg border border-foreground/15 bg-background px-3.5 py-2 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none";

const labelClass = "block text-xs font-medium text-foreground/85";

function extractMapIframeSrc(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.toLowerCase().includes("<iframe")) {
    const match = trimmed.match(/src=["']([^"']+)["']/i);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return trimmed;
}

function resolveInitialTab(param: string | null): SettingsTab {
  if (
    param === "theme" ||
    param === "widgets" ||
    param === "contact" ||
    param === "home" ||
    param === "pages"
  ) {
    return param;
  }
  if (param === "collection" || param === "about") {
    return "pages";
  }
  return "theme";
}

function AdminSettingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<SettingsTab>(() =>
    resolveInitialTab(searchParams.get("tab")),
  );
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );

  const [form, setForm] = useState<SiteSettings>(defaultSiteSettings);
  const [offerText, setOfferText] = useState<string>(
    defaultSiteSettings.offerItems.join("\n"),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedToast, setSavedToast] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/admin/settings", {
          credentials: "include",
          cache: "no-store",
        });
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) {
          if (active) setError("Could not load site settings.");
          return;
        }
        const raw = (await res.json()) as ApiSiteSettingsPayload;
        if (active) {
          const mapped = mapApiToSiteSettings(raw);
          setForm(mapped);
          setOfferText(mapped.offerItems.join("\n"));
        }
      } catch {
        if (active) setError("Could not reach the server.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [router]);

  function updateField<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedToast(false);
  }

  function applyThemePreset(presetId: ThemePresetId) {
    if (presetId === "custom") {
      updateField("themePreset", "custom");
      return;
    }
    const found = THEME_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setForm((prev) => ({
      ...prev,
      themePreset: found.id,
      bgColor: found.bgColor,
      surfaceColor: found.surfaceColor,
      textColor: found.textColor,
      accentColor: found.accentColor,
      cardStyle: found.cardStyle,
      heroLayout: found.heroLayout,
    }));
    setSavedToast(false);
  }

  function updateCustomColor(
    field: "bgColor" | "surfaceColor" | "textColor" | "accentColor",
    hex: string,
  ) {
    setForm((prev) => ({
      ...prev,
      themePreset: "custom",
      [field]: hex,
    }));
    setSavedToast(false);
  }

  function updateLensOption(
    index: number,
    field: keyof LensOption,
    value: string,
  ) {
    setForm((prev) => {
      const next = prev.lensOptions.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      );
      return { ...prev, lensOptions: next };
    });
    setSavedToast(false);
  }

  async function handleHeroFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingHero(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await fetch("/api/admin/site-assets/hero", {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Could not upload hero banner photo.");
        return;
      }
      const data = (await res.json()) as { url: string };
      updateField("heroImageUrl", data.url);
    } catch {
      setError("Network error while uploading hero image.");
    } finally {
      setUploadingHero(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSavedToast(false);

    const items = offerText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const nextSettings: SiteSettings = {
      ...form,
      mapEmbedUrl: extractMapIframeSrc(form.mapEmbedUrl),
      offerItems: items.length > 0 ? items : defaultSiteSettings.offerItems,
    };

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mapSiteSettingsToApi(nextSettings)),
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        setError(data?.error ?? "Could not save settings.");
        return;
      }

      const savedRaw = (await res.json()) as ApiSiteSettingsPayload;
      const saved = mapApiToSiteSettings(savedRaw);
      setForm(saved);
      setOfferText(saved.offerItems.join("\n"));
      await revalidateSettings();
      setSavedToast(true);
    } catch {
      setError("Network error while saving settings.");
    } finally {
      setSaving(false);
    }
  }

  const activeColors = resolveActiveThemeColors(form);
  const previewHeroImg =
    form.heroImageUrl.trim() || "/images/editorial/hero-campaign.jpg";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-[11px] font-semibold tracking-wider text-accent uppercase">
              ✦ Live Storefront Studio
            </span>
            {savedToast ? (
              <span className="rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-medium text-emerald-400">
                ✓ Published to Live Storefront
              </span>
            ) : null}
          </div>
          <h1 className="mt-2 font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Theme, Layout &amp; Content Customizer
          </h1>
          <p className="mt-0.5 text-xs text-foreground/65">
            Every change previews live on the right. Click{" "}
            <strong>Save &amp; Publish</strong> to update the customer website
            instantly.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground/15 bg-surface px-3.5 py-2 text-xs font-medium text-foreground transition hover:border-accent hover:text-accent"
          >
            Open Live Site ↗
          </Link>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Publishing…" : "Save & Publish Changes"}
          </button>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-foreground"
        >
          {error}
        </div>
      ) : null}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-1.5 border-b border-foreground/10 pb-3">
        {tabs.map((tab) => {
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-all ${
                isCurrent
                  ? "border-accent bg-accent text-white shadow-sm"
                  : "border-foreground/10 bg-surface text-foreground/75 hover:border-accent/50 hover:text-foreground"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  isCurrent
                    ? "bg-white/20 text-white"
                    : "bg-background text-foreground/60"
                }`}
              >
                {tab.badge}
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="rounded-xl border border-foreground/10 bg-surface p-12 text-center text-sm text-foreground/65">
          Loading storefront studio settings…
        </div>
      ) : (
        <div className="grid items-start gap-6 xl:grid-cols-12">
          {/* LEFT CONTROLS PANE (5 cols on XL) */}
          <div className="space-y-6 xl:col-span-5">
            {/* TAB 1: THEME & LAYOUT STUDIO */}
            {activeTab === "theme" ? (
              <div className="space-y-6 rounded-xl border border-foreground/10 bg-surface p-5 sm:p-6">
                <div>
                  <h2 className="font-display text-lg text-foreground">
                    One-Click Design Personalities
                  </h2>
                  <p className="mt-1 text-xs text-foreground/65">
                    Choose a curated optical brand aesthetic or customize your
                    own colors below.
                  </p>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {THEME_PRESETS.map((preset) => {
                      const selected = form.themePreset === preset.id;
                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyThemePreset(preset.id)}
                          className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                            selected
                              ? "border-accent bg-accent/10 ring-1 ring-accent"
                              : "border-foreground/15 bg-background hover:border-accent/50"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-display text-sm font-medium text-foreground">
                                {preset.name}
                              </span>
                              {selected ? (
                                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-white">
                                  Active
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-1 text-[11px] leading-snug text-foreground/60">
                              {preset.vibe}
                            </p>
                          </div>

                          {/* Color Swatch Strip */}
                          <div className="mt-3 flex items-center gap-1.5">
                            <span
                              className="h-5 w-5 rounded-full border border-foreground/20"
                              style={{ backgroundColor: preset.bgColor }}
                              title={`Background: ${preset.bgColor}`}
                            />
                            <span
                              className="h-5 w-5 rounded-full border border-foreground/20"
                              style={{ backgroundColor: preset.surfaceColor }}
                              title={`Surface: ${preset.surfaceColor}`}
                            />
                            <span
                              className="h-5 w-5 rounded-full border border-foreground/20"
                              style={{ backgroundColor: preset.textColor }}
                              title={`Text: ${preset.textColor}`}
                            />
                            <span
                              className="h-5 w-5 rounded-full border border-foreground/20"
                              style={{ backgroundColor: preset.accentColor }}
                              title={`Accent: ${preset.accentColor}`}
                            />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Pickers */}
                <div className="border-t border-foreground/10 pt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wider text-foreground/75 uppercase">
                      Custom Brand Colors
                    </h3>
                    {form.themePreset === "custom" ? (
                      <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                        Custom Palette Active
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {(
                      [
                        {
                          key: "bgColor",
                          label: "Page Background",
                          val: activeColors.bgColor,
                        },
                        {
                          key: "surfaceColor",
                          label: "Card / Surface",
                          val: activeColors.surfaceColor,
                        },
                        {
                          key: "textColor",
                          label: "Primary Text",
                          val: activeColors.textColor,
                        },
                        {
                          key: "accentColor",
                          label: "Brand Accent",
                          val: activeColors.accentColor,
                        },
                      ] as const
                    ).map((c) => (
                      <div
                        key={c.key}
                        className="rounded-lg border border-foreground/15 bg-background p-2.5"
                      >
                        <label className="block text-[11px] font-medium text-foreground/70">
                          {c.label}
                        </label>
                        <div className="mt-1.5 flex items-center gap-2">
                          <input
                            type="color"
                            value={c.val}
                            onChange={(e) =>
                              updateCustomColor(c.key, e.target.value)
                            }
                            className="h-8 w-10 cursor-pointer rounded border border-foreground/20 bg-transparent p-0"
                          />
                          <input
                            type="text"
                            value={c.val}
                            onChange={(e) =>
                              updateCustomColor(c.key, e.target.value)
                            }
                            className="w-full rounded border border-foreground/15 bg-surface px-2 py-1 font-mono text-xs text-foreground uppercase"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Couture Background Print Studio */}
                <div className="border-t border-foreground/10 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-semibold tracking-wider text-foreground/75 uppercase">
                        Couture Background Print &amp; Canvas Texture
                      </h3>
                      <p className="mt-0.5 text-[11px] text-foreground/60">
                        Artistic salon print layered over the off-white cotton
                        background so it never looks empty.
                      </p>
                    </div>
                    <span className="rounded-full bg-accent/15 px-2.5 py-0.5 font-mono text-[10px] font-bold text-accent uppercase">
                      {form.bgPrint}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {COUTURE_PRINTS.map((printItem) => {
                      const active = form.bgPrint === printItem.id;
                      return (
                        <button
                          key={printItem.id}
                          type="button"
                          onClick={() => updateField("bgPrint", printItem.id)}
                          className={`flex flex-col justify-between rounded-xl border p-3 text-left transition ${
                            active
                              ? "border-accent bg-accent/15 text-foreground ring-1 ring-accent"
                              : "border-foreground/15 bg-background text-foreground/75 hover:border-accent/50"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-mono text-xs font-bold">
                              {printItem.shortName}
                            </span>
                            {active ? (
                              <span className="rounded-full bg-accent px-2 py-0.5 text-[9px] font-bold text-white">
                                Active
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[10px] leading-snug text-foreground/60">
                            {printItem.subtitle}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 rounded-xl border border-foreground/15 bg-background p-3">
                    <div className="flex items-center justify-between font-mono text-xs text-foreground/80">
                      <span>BACKGROUND PRINT INTENSITY</span>
                      <span className="font-bold text-accent">
                        {Math.round((form.printIntensity ?? 1.05) * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.35"
                      max="1.6"
                      step="0.05"
                      value={form.printIntensity ?? 1.05}
                      onChange={(e) =>
                        updateField("printIntensity", parseFloat(e.target.value))
                      }
                      className="mt-2 w-full cursor-pointer accent-accent"
                    />
                  </div>
                </div>

                {/* Hero Layout Architecture */}
                <div className="border-t border-foreground/10 pt-5">
                  <h3 className="text-xs font-semibold tracking-wider text-foreground/75 uppercase">
                    Homepage Hero Layout
                  </h3>
                  <div className="mt-3 grid grid-cols-3 gap-2.5">
                    {(
                      [
                        {
                          id: "bento",
                          title: "Bento Grid",
                          desc: "Multi-tile optical studio showcase",
                        },
                        {
                          id: "cinematic",
                          title: "Cinematic",
                          desc: "Full-bleed banner with glass overlay",
                        },
                        {
                          id: "split",
                          title: "Editorial Split",
                          desc: "2-column headline + lookbook frame",
                        },
                      ] as { id: HeroLayoutId; title: string; desc: string }[]
                    ).map((layout) => {
                      const active = form.heroLayout === layout.id;
                      return (
                        <button
                          key={layout.id}
                          type="button"
                          onClick={() => updateField("heroLayout", layout.id)}
                          className={`rounded-lg border p-3 text-left transition ${
                            active
                              ? "border-accent bg-accent/15 text-foreground"
                              : "border-foreground/15 bg-background text-foreground/75 hover:border-accent/50"
                          }`}
                        >
                          <p className="text-xs font-semibold">{layout.title}</p>
                          <p className="mt-1 text-[10px] leading-tight text-foreground/60">
                            {layout.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Card & Button Geometry */}
                <div className="border-t border-foreground/10 pt-5">
                  <h3 className="text-xs font-semibold tracking-wider text-foreground/75 uppercase">
                    Card &amp; Button Corners
                  </h3>
                  <div className="mt-3 grid grid-cols-3 gap-2.5">
                    {(
                      [
                        {
                          id: "rounded",
                          title: "Soft Rounded",
                          desc: "20px cards & pill buttons",
                        },
                        {
                          id: "glass",
                          title: "Luxury Glass",
                          desc: "24px cards & sleek 12px buttons",
                        },
                        {
                          id: "sharp",
                          title: "Architectural",
                          desc: "Crisp 0px gallery corners",
                        },
                      ] as { id: CardStyleId; title: string; desc: string }[]
                    ).map((style) => {
                      const active = form.cardStyle === style.id;
                      return (
                        <button
                          key={style.id}
                          type="button"
                          onClick={() => updateField("cardStyle", style.id)}
                          className={`rounded-lg border p-3 text-left transition ${
                            active
                              ? "border-accent bg-accent/15 text-foreground"
                              : "border-foreground/15 bg-background text-foreground/75 hover:border-accent/50"
                          }`}
                        >
                          <p className="text-xs font-semibold">{style.title}</p>
                          <p className="mt-1 text-[10px] leading-tight text-foreground/60">
                            {style.desc}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : null}

            {/* TAB 2: HERO PHOTO & INTERACTIVE OPTICAL WIDGETS */}
            {activeTab === "widgets" ? (
              <div className="space-y-6 rounded-xl border border-foreground/10 bg-surface p-5 sm:p-6">
                {/* Custom Hero Banner Upload */}
                <div>
                  <h2 className="font-display text-lg text-foreground">
                    Hero Lookbook / Studio Photo
                  </h2>
                  <p className="mt-1 text-xs text-foreground/65">
                    Upload a dedicated hero photo (automatically optimized to
                    WebP) or leave blank to showcase your first featured frame.
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <label className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90">
                      <span>
                        {uploadingHero
                          ? "Uploading & Optimizing…"
                          : "Upload Hero Photo"}
                      </span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleHeroFileChange}
                        disabled={uploadingHero}
                        className="sr-only"
                      />
                    </label>
                    {form.heroImageUrl ? (
                      <button
                        type="button"
                        onClick={() => updateField("heroImageUrl", "")}
                        className="rounded-lg border border-foreground/20 bg-background px-3 py-2 text-xs text-foreground/75 hover:border-red-500 hover:text-red-400"
                      >
                        Use Featured Frame Photo Instead
                      </button>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <label className={labelClass}>
                      Hero Eyebrow Badge Pill
                      <input
                        type="text"
                        value={form.heroBadge}
                        onChange={(e) =>
                          updateField("heroBadge", e.target.value)
                        }
                        placeholder="IN-HOUSE OPTICAL LAB · LAHORE"
                        className={inputClass}
                      />
                    </label>
                  </div>
                </div>

                {/* Top Announcement Bar */}
                <div className="border-t border-foreground/10 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base text-foreground">
                        Top Announcement Bar
                      </h3>
                      <p className="text-xs text-foreground/60">
                        Promotional ribbon at the very top of every page.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.announcementEnabled}
                      onChange={(e) =>
                        updateField("announcementEnabled", e.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                  </div>
                  {form.announcementEnabled ? (
                    <label className={`${labelClass} mt-3`}>
                      Announcement Text
                      <input
                        type="text"
                        value={form.announcementText}
                        onChange={(e) =>
                          updateField("announcementText", e.target.value)
                        }
                        className={inputClass}
                      />
                    </label>
                  ) : null}
                </div>

                {/* Interactive Face Shape Guide */}
                <div className="border-t border-foreground/10 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base text-foreground">
                        Interactive Face Shape Frame Finder
                      </h3>
                      <p className="text-xs text-foreground/60">
                        Lets visitors click Round, Square, Oval, or Heart to see
                        matching frames.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.showFaceShapeGuide}
                      onChange={(e) =>
                        updateField("showFaceShapeGuide", e.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                  </div>
                  {form.showFaceShapeGuide ? (
                    <div className="mt-3 space-y-3">
                      <label className={labelClass}>
                        Section Heading
                        <input
                          type="text"
                          value={form.faceShapeHeading}
                          onChange={(e) =>
                            updateField("faceShapeHeading", e.target.value)
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className={labelClass}>
                        Section Subtitle
                        <input
                          type="text"
                          value={form.faceShapeSubtitle}
                          onChange={(e) =>
                            updateField("faceShapeSubtitle", e.target.value)
                          }
                          className={inputClass}
                        />
                      </label>
                    </div>
                  ) : null}
                </div>

                {/* Prescription Lens & Coatings Guide */}
                <div className="border-t border-foreground/10 pt-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display text-base text-foreground">
                        Prescription Lenses &amp; Coatings Guide
                      </h3>
                      <p className="text-xs text-foreground/60">
                        Showcases your optical lab lens options and starting
                        prices.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={form.showLensGuide}
                      onChange={(e) =>
                        updateField("showLensGuide", e.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                  </div>

                  {form.showLensGuide ? (
                    <div className="mt-3 space-y-4">
                      <label className={labelClass}>
                        Lens Section Heading
                        <input
                          type="text"
                          value={form.lensGuideHeading}
                          onChange={(e) =>
                            updateField("lensGuideHeading", e.target.value)
                          }
                          className={inputClass}
                        />
                      </label>
                      <label className={labelClass}>
                        Lens Section Subtitle
                        <input
                          type="text"
                          value={form.lensGuideSubtitle}
                          onChange={(e) =>
                            updateField("lensGuideSubtitle", e.target.value)
                          }
                          className={inputClass}
                        />
                      </label>

                      <div className="space-y-3 pt-2">
                        <p className="text-xs font-semibold tracking-wider text-foreground/70 uppercase">
                          Lens Cards ({form.lensOptions.length})
                        </p>
                        {form.lensOptions.map((opt, idx) => (
                          <div
                            key={idx}
                            className="space-y-2.5 rounded-lg border border-foreground/15 bg-background p-3.5"
                          >
                            <div className="grid grid-cols-2 gap-2.5">
                              <label className={labelClass}>
                                Card {idx + 1} Title
                                <input
                                  type="text"
                                  value={opt.title}
                                  onChange={(e) =>
                                    updateLensOption(
                                      idx,
                                      "title",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                />
                              </label>
                              <label className={labelClass}>
                                Badge Pill
                                <input
                                  type="text"
                                  value={opt.badge}
                                  onChange={(e) =>
                                    updateLensOption(
                                      idx,
                                      "badge",
                                      e.target.value,
                                    )
                                  }
                                  className={inputClass}
                                />
                              </label>
                            </div>
                            <label className={labelClass}>
                              Description
                              <textarea
                                rows={2}
                                value={opt.description}
                                onChange={(e) =>
                                  updateLensOption(
                                    idx,
                                    "description",
                                    e.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </label>
                            <label className={labelClass}>
                              Starting Price / Hint
                              <input
                                type="text"
                                value={opt.priceHint}
                                onChange={(e) =>
                                  updateLensOption(
                                    idx,
                                    "priceHint",
                                    e.target.value,
                                  )
                                }
                                className={inputClass}
                              />
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* TAB 3: SHOP IDENTITY & CONTACT */}
            {activeTab === "contact" ? (
              <div className="space-y-4 rounded-xl border border-foreground/10 bg-surface p-5 sm:p-6">
                <h2 className="font-display text-lg text-foreground">
                  Shop Identity, WhatsApp &amp; Location
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Shop Name
                    <input
                      type="text"
                      required
                      value={form.shopName}
                      onChange={(e) => updateField("shopName", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Footer Tagline
                    <input
                      type="text"
                      required
                      value={form.tagline}
                      onChange={(e) => updateField("tagline", e.target.value)}
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className={labelClass}>
                  SEO Meta Description
                  <textarea
                    rows={2}
                    required
                    value={form.metaDescription}
                    onChange={(e) =>
                      updateField("metaDescription", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    WhatsApp Number (digits, e.g. 923001234567)
                    <input
                      type="text"
                      required
                      value={form.whatsappNumber}
                      onChange={(e) =>
                        updateField("whatsappNumber", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Call Phone Number
                    <input
                      type="text"
                      required
                      value={form.phoneNumber}
                      onChange={(e) =>
                        updateField("phoneNumber", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Street Address / Area
                    <input
                      type="text"
                      required
                      value={form.addressStreet}
                      onChange={(e) =>
                        updateField("addressStreet", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    City
                    <input
                      type="text"
                      required
                      value={form.addressCity}
                      onChange={(e) =>
                        updateField("addressCity", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Province / Region
                    <input
                      type="text"
                      required
                      value={form.addressRegion}
                      onChange={(e) =>
                        updateField("addressRegion", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Opening Hours
                    <input
                      type="text"
                      required
                      value={form.openingHours}
                      onChange={(e) =>
                        updateField("openingHours", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className={labelClass}>
                  Google Maps Embed URL or &lt;iframe&gt; Code (optional)
                  <input
                    type="text"
                    value={form.mapEmbedUrl}
                    onChange={(e) =>
                      updateField(
                        "mapEmbedUrl",
                        extractMapIframeSrc(e.target.value),
                      )
                    }
                    placeholder="https://www.google.com/maps/embed?pb=..."
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Location Fallback Note (shown when no map URL is set)
                  <input
                    type="text"
                    value={form.mapCaption}
                    onChange={(e) => updateField("mapCaption", e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : null}

            {/* TAB 4: HOME PAGE COPY */}
            {activeTab === "home" ? (
              <div className="space-y-4 rounded-xl border border-foreground/10 bg-surface p-5 sm:p-6">
                <h2 className="font-display text-lg text-foreground">
                  Homepage Headlines &amp; Copy
                </h2>
                <label className={labelClass}>
                  Hero Headline
                  <input
                    type="text"
                    required
                    value={form.heroTitle}
                    onChange={(e) => updateField("heroTitle", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Hero Subtitle
                  <textarea
                    rows={2}
                    required
                    value={form.heroSubtitle}
                    onChange={(e) =>
                      updateField("heroSubtitle", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Primary Button Label
                    <input
                      type="text"
                      required
                      value={form.heroPrimaryCta}
                      onChange={(e) =>
                        updateField("heroPrimaryCta", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Secondary Button Label
                    <input
                      type="text"
                      required
                      value={form.heroSecondaryCta}
                      onChange={(e) =>
                        updateField("heroSecondaryCta", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Featured Frames Heading
                    <input
                      type="text"
                      required
                      value={form.featuredHeading}
                      onChange={(e) =>
                        updateField("featuredHeading", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Featured Frames Subheading
                    <input
                      type="text"
                      required
                      value={form.featuredSubheading}
                      onChange={(e) =>
                        updateField("featuredSubheading", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className={labelClass}>
                    Categories Heading
                    <input
                      type="text"
                      required
                      value={form.categoriesHeading}
                      onChange={(e) =>
                        updateField("categoriesHeading", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                  <label className={labelClass}>
                    Categories Subheading
                    <input
                      type="text"
                      required
                      value={form.categoriesSubheading}
                      onChange={(e) =>
                        updateField("categoriesSubheading", e.target.value)
                      }
                      className={inputClass}
                    />
                  </label>
                </div>

                <label className={labelClass}>
                  &ldquo;Why Us&rdquo; Section Heading
                  <input
                    type="text"
                    required
                    value={form.whyHeading}
                    onChange={(e) => updateField("whyHeading", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Point 01
                  <textarea
                    rows={2}
                    required
                    value={form.whyPoint1}
                    onChange={(e) => updateField("whyPoint1", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Point 02
                  <textarea
                    rows={2}
                    required
                    value={form.whyPoint2}
                    onChange={(e) => updateField("whyPoint2", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Point 03
                  <textarea
                    rows={2}
                    required
                    value={form.whyPoint3}
                    onChange={(e) => updateField("whyPoint3", e.target.value)}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : null}

            {/* TAB 5: COLLECTION & ABOUT PAGES */}
            {activeTab === "pages" ? (
              <div className="space-y-4 rounded-xl border border-foreground/10 bg-surface p-5 sm:p-6">
                <h2 className="font-display text-lg text-foreground">
                  Collection &amp; About Page Copy
                </h2>
                <label className={labelClass}>
                  Collection Page Heading
                  <input
                    type="text"
                    required
                    value={form.collectionHeading}
                    onChange={(e) =>
                      updateField("collectionHeading", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Collection Page Subtitle
                  <textarea
                    rows={2}
                    required
                    value={form.collectionSubtitle}
                    onChange={(e) =>
                      updateField("collectionSubtitle", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>

                <hr className="border-foreground/10" />

                <label className={labelClass}>
                  About Page Heading
                  <input
                    type="text"
                    required
                    value={form.aboutHeading}
                    onChange={(e) =>
                      updateField("aboutHeading", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  About Intro Paragraph
                  <textarea
                    rows={2}
                    required
                    value={form.aboutIntro}
                    onChange={(e) => updateField("aboutIntro", e.target.value)}
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Story Heading
                  <input
                    type="text"
                    required
                    value={form.storyHeading}
                    onChange={(e) =>
                      updateField("storyHeading", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Story Paragraph 1
                  <textarea
                    rows={2}
                    required
                    value={form.storyParagraph1}
                    onChange={(e) =>
                      updateField("storyParagraph1", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  Story Paragraph 2
                  <textarea
                    rows={2}
                    required
                    value={form.storyParagraph2}
                    onChange={(e) =>
                      updateField("storyParagraph2", e.target.value)
                    }
                    className={inputClass}
                  />
                </label>
                <label className={labelClass}>
                  &ldquo;What We Offer&rdquo; Bullet Items (one per line)
                  <textarea
                    rows={4}
                    required
                    value={offerText}
                    onChange={(e) => {
                      setOfferText(e.target.value);
                      setSavedToast(false);
                    }}
                    className={inputClass}
                  />
                </label>
              </div>
            ) : null}
          </div>

          {/* RIGHT LIVE INTERACTIVE STOREFRONT PREVIEW (7 cols on XL) */}
          <div className="xl:sticky xl:top-6 xl:col-span-7">
            <div className="overflow-hidden rounded-2xl border border-foreground/15 bg-surface shadow-xl">
              {/* Browser Chrome Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-foreground/10 bg-background px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
                  <span className="ml-2 rounded-md border border-foreground/10 bg-surface px-3 py-1 font-mono text-[11px] text-foreground/65">
                    meharforeyes.com · Live Theme Preview
                  </span>
                </div>

                {/* Desktop / Mobile Viewport Toggle */}
                <div className="flex items-center gap-1 rounded-lg border border-foreground/15 bg-surface p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                      previewDevice === "desktop"
                        ? "bg-accent text-white"
                        : "text-foreground/65 hover:text-foreground"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`rounded-md px-2.5 py-1 text-[11px] font-medium transition ${
                      previewDevice === "mobile"
                        ? "bg-accent text-white"
                        : "text-foreground/65 hover:text-foreground"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Live Storefront Canvas */}
              <div className="flex justify-center bg-black/20 p-3 sm:p-5">
                <div
                  style={{
                    backgroundColor: activeColors.bgColor,
                    color: activeColors.textColor,
                  }}
                  className={`max-h-[760px] overflow-y-auto border border-white/10 shadow-2xl transition-all duration-300 ${
                    previewDevice === "mobile"
                      ? "w-[375px] rounded-[28px]"
                      : "w-full rounded-xl"
                  }`}
                >
                  {/* 1. Preview Announcement Bar */}
                  {form.announcementEnabled && form.announcementText.trim() ? (
                    <div
                      style={{
                        backgroundColor: activeColors.accentColor,
                        color: activeColors.bgColor,
                      }}
                      className="px-4 py-1.5 text-center text-[11px] font-medium"
                    >
                      {form.announcementText}
                    </div>
                  ) : null}

                  {/* 2. Preview Sticky Glass Header */}
                  <div
                    style={{
                      borderColor: `${activeColors.textColor}18`,
                      backgroundColor: `${activeColors.bgColor}E6`,
                    }}
                    className="sticky top-0 z-20 flex items-center justify-between border-b px-5 py-3.5 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{
                          color: activeColors.accentColor,
                          borderColor: `${activeColors.accentColor}40`,
                          borderRadius: activeColors.radiusBtn,
                        }}
                        className="inline-flex h-6 w-6 items-center justify-center border text-xs font-bold"
                      >
                        ◑
                      </span>
                      <span className="font-display text-base font-semibold">
                        {form.shopName}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="hidden opacity-75 sm:inline">
                        Collection
                      </span>
                      <span className="hidden opacity-75 sm:inline">
                        Eyeglasses
                      </span>
                      <span
                        style={{
                          backgroundColor: activeColors.accentColor,
                          color: activeColors.bgColor,
                          borderRadius: activeColors.radiusBtn,
                        }}
                        className="px-3 py-1 text-[11px] font-medium"
                      >
                        Send Rx
                      </span>
                    </div>
                  </div>

                  {/* 3. Preview Hero (Adapts to Bento, Cinematic, or Split) */}
                  <div
                    style={{ borderColor: `${activeColors.textColor}18` }}
                    className="border-b p-5"
                  >
                    {form.heroLayout === "cinematic" ? (
                      <div
                        style={{
                          backgroundColor: activeColors.surfaceColor,
                          borderRadius: activeColors.radiusCard,
                          borderColor: `${activeColors.textColor}20`,
                        }}
                        className="relative overflow-hidden border p-6"
                      >
                        {form.heroBadge ? (
                          <span
                            style={{
                              color: activeColors.accentColor,
                              borderColor: `${activeColors.accentColor}40`,
                              borderRadius: activeColors.radiusBtn,
                            }}
                            className="inline-block border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                          >
                            {form.heroBadge}
                          </span>
                        ) : null}
                        <h3 className="mt-3 font-display text-2xl leading-tight sm:text-3xl">
                          {form.heroTitle}
                        </h3>
                        <p className="mt-2 max-w-md text-xs leading-relaxed opacity-75">
                          {form.heroSubtitle}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          <span
                            style={{
                              backgroundColor: activeColors.accentColor,
                              color: activeColors.bgColor,
                              borderRadius: activeColors.radiusBtn,
                            }}
                            className="px-4 py-2 text-xs font-medium"
                          >
                            {form.heroPrimaryCta}
                          </span>
                          <span
                            style={{
                              borderColor: `${activeColors.textColor}30`,
                              borderRadius: activeColors.radiusBtn,
                            }}
                            className="border px-4 py-2 text-xs font-medium"
                          >
                            {form.heroSecondaryCta}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        className={`grid gap-4 ${
                          previewDevice === "mobile"
                            ? "grid-cols-1"
                            : "sm:grid-cols-12"
                        }`}
                      >
                        <div
                          style={{
                            backgroundColor: activeColors.surfaceColor,
                            borderRadius: activeColors.radiusCard,
                            borderColor: `${activeColors.textColor}18`,
                          }}
                          className="flex flex-col justify-between border p-5 sm:col-span-7"
                        >
                          <div>
                            {form.heroBadge ? (
                              <span
                                style={{
                                  color: activeColors.accentColor,
                                  borderColor: `${activeColors.accentColor}40`,
                                  borderRadius: activeColors.radiusBtn,
                                }}
                                className="inline-block border px-2.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase"
                              >
                                {form.heroBadge}
                              </span>
                            ) : null}
                            <h3 className="mt-3 font-display text-2xl leading-tight">
                              {form.heroTitle}
                            </h3>
                            <p className="mt-2 text-xs leading-relaxed opacity-75">
                              {form.heroSubtitle}
                            </p>
                          </div>
                          <div className="mt-5 flex flex-wrap gap-2">
                            <span
                              style={{
                                backgroundColor: activeColors.accentColor,
                                color: activeColors.bgColor,
                                borderRadius: activeColors.radiusBtn,
                              }}
                              className="px-3.5 py-1.5 text-xs font-medium"
                            >
                              {form.heroPrimaryCta}
                            </span>
                            <span
                              style={{
                                borderColor: `${activeColors.textColor}25`,
                                borderRadius: activeColors.radiusBtn,
                              }}
                              className="border px-3.5 py-1.5 text-xs font-medium"
                            >
                              {form.heroSecondaryCta}
                            </span>
                          </div>
                        </div>

                        <div
                          style={{
                            backgroundColor: activeColors.surfaceColor,
                            borderRadius: activeColors.radiusCard,
                            borderColor: `${activeColors.textColor}18`,
                          }}
                          className="relative min-h-[180px] overflow-hidden border sm:col-span-5"
                        >
                          <ProductImage
                            src={previewHeroImg}
                            alt="Hero Preview"
                            fill
                            sizes="300px"
                            className="object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Preview Interactive Face Shape Finder */}
                  {form.showFaceShapeGuide ? (
                    <div
                      style={{ borderColor: `${activeColors.textColor}18` }}
                      className="border-b p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span
                            style={{ color: activeColors.accentColor }}
                            className="text-[10px] font-semibold tracking-wider uppercase"
                          >
                            Interactive Fit Studio
                          </span>
                          <h4 className="font-display text-lg">
                            {form.faceShapeHeading}
                          </h4>
                        </div>
                        <div className="flex gap-1.5">
                          {["Round", "Square", "Oval", "Heart"].map(
                            (shape, i) => (
                              <span
                                key={shape}
                                style={
                                  i === 0
                                    ? {
                                        backgroundColor:
                                          activeColors.accentColor,
                                        color: activeColors.bgColor,
                                        borderRadius: activeColors.radiusBtn,
                                      }
                                    : {
                                        borderColor: `${activeColors.textColor}25`,
                                        borderRadius: activeColors.radiusBtn,
                                      }
                                }
                                className="border px-2.5 py-1 text-[10px] font-medium"
                              >
                                {shape}
                              </span>
                            ),
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}

                  {/* 5. Preview Prescription Lens Guide */}
                  {form.showLensGuide ? (
                    <div className="p-5">
                      <span
                        style={{ color: activeColors.accentColor }}
                        className="text-[10px] font-semibold tracking-wider uppercase"
                      >
                        In-House Optical Lab
                      </span>
                      <h4 className="font-display text-lg">
                        {form.lensGuideHeading}
                      </h4>
                      <div
                        className={`mt-3 grid gap-2.5 ${
                          previewDevice === "mobile"
                            ? "grid-cols-1"
                            : "grid-cols-2"
                        }`}
                      >
                        {form.lensOptions.slice(0, 4).map((lens, idx) => (
                          <div
                            key={idx}
                            style={{
                              backgroundColor: activeColors.surfaceColor,
                              borderRadius: activeColors.radiusCard,
                              borderColor: `${activeColors.textColor}18`,
                            }}
                            className="border p-3.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] opacity-50">
                                0{idx + 1}
                              </span>
                              <span
                                style={{
                                  color: activeColors.accentColor,
                                  borderColor: `${activeColors.accentColor}40`,
                                  borderRadius: activeColors.radiusBtn,
                                }}
                                className="border px-2 py-0.5 text-[9px] font-semibold"
                              >
                                {lens.badge}
                              </span>
                            </div>
                            <p className="mt-1.5 font-display text-sm">
                              {lens.title}
                            </p>
                            <p className="mt-1 text-[11px] opacity-70">
                              {lens.priceHint}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-foreground/10 bg-surface p-10 text-center text-sm text-foreground/65">
          Loading storefront studio…
        </div>
      }
    >
      <AdminSettingsContent />
    </Suspense>
  );
}
