"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { revalidateCatalog } from "@/app/admin/actions";
import { ProductImage } from "@/components/ProductImage";
import { formatSpecLabel } from "@/lib/product-order";
import type { Product } from "@/lib/products";

type StatusFilter = "all" | "in_stock" | "out_of_stock" | "featured";

const studioShortcuts = [
  {
    title: "Theme & Color Studio",
    badge: "Live Preview",
    desc: "Switch between 4 luxury optical themes, custom colors, rounded/glass cards & Hero layouts.",
    href: "/admin/settings?tab=theme",
  },
  {
    title: "Hero & Optical Widgets",
    badge: "Interactive",
    desc: "Upload a custom Hero banner, toggle the Face Shape Finder & edit Prescription Lens cards.",
    href: "/admin/settings?tab=widgets",
  },
  {
    title: "Shop & WhatsApp Desk",
    badge: "Contact",
    desc: "Configure your Pakistan WhatsApp number, studio address, hours & Google Map embed.",
    href: "/admin/settings?tab=contact",
  },
  {
    title: "Page Copy & Story",
    badge: "Content",
    desc: "Edit every headline, button label, Collection intro, and About page story.",
    href: "/admin/settings?tab=home",
  },
] as const;

export default function AdminDashboardPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch("/api/products?limit=100", {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) {
          if (active) setError("Could not load products.");
          return;
        }
        const data = (await res.json()) as { products?: Product[] };
        if (active) {
          setProducts(Array.isArray(data.products) ? data.products : []);
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
  }, []);

  async function handleSeedCatalog() {
    setSeeding(true);
    setError(null);
    setSeedMessage(null);
    try {
      const res = await fetch("/api/admin/products/seed", {
        method: "POST",
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not load sample frames.");
        return;
      }
      const data = (await res.json()) as { created?: number };
      await revalidateCatalog();
      const listRes = await fetch("/api/products?limit=100", {
        credentials: "include",
        cache: "no-store",
      });
      if (listRes.ok) {
        const listData = (await listRes.json()) as { products?: Product[] };
        setProducts(Array.isArray(listData.products) ? listData.products : []);
      }
      setSeedMessage(
        data.created && data.created > 0
          ? `Added ${data.created} sample optical & sunglass frames to your catalog.`
          : "Sample frames are already in your catalog.",
      );
    } catch {
      setError("Network error while seeding sample frames.");
    } finally {
      setSeeding(false);
    }
  }

  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock).length;
    const outOfStock = total - inStock;
    const featured = products.filter((p) => p.featured).length;
    return { total, inStock, outOfStock, featured };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter === "in_stock" && !p.inStock) return false;
      if (statusFilter === "out_of_stock" && p.inStock) return false;
      if (statusFilter === "featured" && !p.featured) return false;
      if (categoryFilter !== "all" && p.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.frameShape.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q)
      );
    });
  }, [products, searchQuery, statusFilter, categoryFilter]);

  async function toggleStock(product: Product) {
    const next = !product.inStock;
    setBusyId(product.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/stock`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inStock: next }),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not update stock status.");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, inStock: next } : p)),
      );
      await revalidateCatalog(product.slug);
    } catch {
      setError("Could not update stock status.");
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFeatured(product: Product) {
    const next = !product.featured;
    setBusyId(product.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${product.id}/featured`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured: next }),
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not update featured status.");
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, featured: next } : p)),
      );
      await revalidateCatalog(product.slug);
    } catch {
      setError("Could not update featured status.");
    } finally {
      setBusyId(null);
    }
  }

  async function deleteConfirmed() {
    if (!confirmDelete) return;
    const target = confirmDelete;
    setBusyId(target.id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/products/${target.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not delete product.");
        return;
      }
      setProducts((prev) => prev.filter((p) => p.id !== target.id));
      setConfirmDelete(null);
      await revalidateCatalog(target.slug);
    } catch {
      setError("Could not delete product.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-foreground/10 pb-6">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold tracking-wider text-accent uppercase">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Optical Studio Command Center
          </span>
          <h1 className="mt-2.5 font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Catalog &amp; Storefront Studio
          </h1>
          <p className="mt-1 text-sm text-foreground/65">
            Manage eyewear frames, stock availability, and live storefront
            themes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeedCatalog}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground/15 bg-surface px-4 py-2 text-xs font-medium text-foreground transition hover:border-accent hover:text-accent disabled:opacity-50"
          >
            {seeding ? "Loading Sample Frames…" : "✦ Load 8 Sample Frames"}
          </button>
          <Link
            href="/admin/settings"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground/15 bg-surface px-4 py-2 text-xs font-medium text-foreground transition hover:border-accent hover:text-accent"
          >
            Theme &amp; Studio Customizer
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-accent bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            + Add New Frame
          </Link>
        </div>
      </div>

      {seedMessage ? (
        <div className="flex items-center justify-between rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground">
          <span>{seedMessage}</span>
          <button
            type="button"
            onClick={() => setSeedMessage(null)}
            className="text-xs font-medium text-accent hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-foreground/10 bg-surface p-5">
          <p className="text-xs font-semibold tracking-wider text-foreground/55 uppercase">
            Total Frames
          </p>
          <p className="mt-2 font-display text-3xl text-foreground">
            {loading ? "—" : stats.total}
          </p>
          <p className="mt-1 text-xs text-foreground/55">
            Active in store catalog
          </p>
        </div>

        <div className="rounded-xl border border-foreground/10 bg-surface p-5">
          <p className="text-xs font-semibold tracking-wider text-foreground/55 uppercase">
            In Stock
          </p>
          <p className="mt-2 font-display text-3xl text-foreground">
            {loading ? "—" : stats.inStock}
          </p>
          <p className="mt-1 text-xs text-foreground/55">
            Ready for WhatsApp orders
          </p>
        </div>

        <div className="rounded-xl border border-foreground/10 bg-surface p-5">
          <p className="text-xs font-semibold tracking-wider text-foreground/55 uppercase">
            Out of Stock
          </p>
          <p className="mt-2 font-display text-3xl text-foreground">
            {loading ? "—" : stats.outOfStock}
          </p>
          <p className="mt-1 text-xs text-foreground/55">
            Shown as inquiry only
          </p>
        </div>

        <div className="rounded-xl border border-foreground/10 bg-surface p-5">
          <p className="text-xs font-semibold tracking-wider text-foreground/55 uppercase">
            Featured on Home
          </p>
          <p className="mt-2 font-display text-3xl text-accent">
            {loading ? "—" : `${stats.featured} / 4`}
          </p>
          <p className="mt-1 text-xs text-foreground/55">
            First 4 appear on homepage
          </p>
        </div>
      </div>

      {/* Storefront Theme & Content Studio Strip */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold tracking-[0.12em] text-foreground/60 uppercase">
            Storefront Design, Themes &amp; Optical Widgets
          </h2>
          <Link
            href="/admin/settings"
            className="text-xs font-medium text-accent hover:underline"
          >
            Launch Live Split-Screen Customizer →
          </Link>
        </div>
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {studioShortcuts.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex flex-col justify-between rounded-xl border border-foreground/10 bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-semibold text-accent">
                    {card.badge}
                  </span>
                  <span className="text-xs text-foreground/45 transition-transform group-hover:translate-x-0.5 group-hover:text-accent">
                    →
                  </span>
                </div>
                <p className="mt-3 font-display text-base text-foreground group-hover:text-accent">
                  {card.title}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-foreground/65">
                  {card.desc}
                </p>
              </div>
            </Link>
          ))}
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

      {/* Inventory Section */}
      <div className="overflow-hidden rounded-xl border border-foreground/10 bg-surface">
        {/* Filter & Search Toolbar */}
        <div className="border-b border-foreground/10 p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: `All (${stats.total})` },
                  { id: "in_stock", label: `In Stock (${stats.inStock})` },
                  {
                    id: "out_of_stock",
                    label: `Out of Stock (${stats.outOfStock})`,
                  },
                  { id: "featured", label: `Featured (${stats.featured})` },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setStatusFilter(tab.id)}
                  className={`min-h-9 rounded-lg border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    statusFilter === tab.id
                      ? "border-accent bg-accent text-white"
                      : "border-foreground/15 bg-background text-foreground/75 hover:border-accent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="min-h-10 rounded-lg border border-foreground/15 bg-background px-3 py-1.5 text-sm text-foreground focus:border-accent focus:outline-none"
              >
                <option value="all">All categories</option>
                <option value="eyeglasses">Eyeglasses</option>
                <option value="sunglasses">Sunglasses</option>
              </select>

              <input
                type="search"
                placeholder="Search name, brand, shape, color…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="min-h-10 w-full rounded-lg border border-foreground/15 bg-background px-3.5 py-1.5 text-sm text-foreground placeholder:text-foreground/45 focus:border-accent focus:outline-none sm:w-64"
              />
            </div>
          </div>
        </div>

        {/* Product List or Empty State */}
        {loading ? (
          <div className="p-12 text-center text-sm text-foreground/65">
            Loading inventory…
          </div>
        ) : products.length === 0 ? (
          <div className="p-6 sm:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold tracking-wider text-accent uppercase">
                Quick Launch
              </span>
              <h3 className="mt-3 font-display text-2xl text-foreground">
                Your catalog is empty — populate it in 1 click or add your own
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/70">
                Want to see how the themes, Bento Hero, and Face Shape Finder
                look with real optical frames right away? Click{" "}
                <strong>Load 8 Sample Frames</strong> below, or upload your own
                frames.
              </p>

              <div className="mt-8 grid gap-4 text-left sm:grid-cols-3">
                <div className="flex flex-col justify-between rounded-xl border border-accent/40 bg-background p-5">
                  <div>
                    <span className="text-xs font-semibold text-accent">
                      Instant Demo
                    </span>
                    <p className="mt-1 font-display text-lg text-foreground">
                      1. Load 8 Sample Frames
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/70">
                      Populates 8 realistic optical &amp; sunglass frames
                      (Aviator, Tortoise Round, Cat-Eye, Wayfarer) so you can
                      test the site immediately.
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={seeding}
                    onClick={handleSeedCatalog}
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
                  >
                    {seeding ? "Loading…" : "✦ Load 8 Sample Frames"}
                  </button>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-foreground/15 bg-background p-5">
                  <div>
                    <span className="text-xs font-semibold text-foreground/60">
                      Custom Inventory
                    </span>
                    <p className="mt-1 font-display text-lg text-foreground">
                      2. Upload Your Frame
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/70">
                      Add your own frame name, brand, shape, price, and up to 8
                      photos (auto-converted to fast WebP).
                    </p>
                  </div>
                  <Link
                    href="/admin/products/new"
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground/20 bg-surface px-4 py-2 text-xs font-medium text-foreground hover:border-accent hover:text-accent"
                  >
                    + Add Custom Frame
                  </Link>
                </div>

                <div className="flex flex-col justify-between rounded-xl border border-foreground/15 bg-background p-5">
                  <div>
                    <span className="text-xs font-semibold text-foreground/60">
                      Visual Studio
                    </span>
                    <p className="mt-1 font-display text-lg text-foreground">
                      3. Customize Theme
                    </p>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/70">
                      Switch between Modern Glass, Midnight Obsidian, Editorial
                      Atelier, or custom brand colors with live preview.
                    </p>
                  </div>
                  <Link
                    href="/admin/settings"
                    className="mt-5 inline-flex min-h-10 items-center justify-center rounded-lg border border-foreground/20 bg-surface px-4 py-2 text-xs font-medium text-foreground hover:border-accent hover:text-accent"
                  >
                    Open Theme Studio →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-display text-lg text-foreground">
              No frames match your current search or filter
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setCategoryFilter("all");
              }}
              className="mt-3 text-xs font-medium text-accent underline underline-offset-4"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-background/60 text-[11px] font-semibold tracking-wider text-foreground/55 uppercase">
                  <th className="py-3.5 pr-3 pl-5">Frame</th>
                  <th className="px-3 py-3.5">Specs</th>
                  <th className="px-3 py-3.5">Price</th>
                  <th className="px-3 py-3.5">Availability</th>
                  <th className="px-3 py-3.5">Homepage</th>
                  <th className="py-3.5 pr-5 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/10">
                {filteredProducts.map((product) => {
                  const thumb =
                    product.imageItems?.[0]?.thumbPath ?? product.images[0];
                  const isBusy = busyId === product.id;

                  return (
                    <tr
                      key={product.id}
                      className="transition-colors hover:bg-background/50"
                    >
                      <td className="py-4 pr-3 pl-5">
                        <div className="flex items-center gap-3.5">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-foreground/10 bg-background">
                            {thumb ? (
                              <ProductImage
                                src={thumb}
                                alt={product.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            ) : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-display text-base text-foreground">
                              {product.name}
                            </p>
                            <p className="mt-0.5 text-xs text-foreground/60">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-4 text-xs text-foreground/75">
                        <p className="font-medium text-foreground">
                          {formatSpecLabel(product.category)} ·{" "}
                          {formatSpecLabel(product.gender)}
                        </p>
                        <p className="mt-0.5 text-foreground/60">
                          {formatSpecLabel(product.frameShape)} ·{" "}
                          {product.material} · {product.color}
                        </p>
                      </td>

                      <td className="px-3 py-4 text-xs font-semibold text-foreground">
                        {typeof product.price === "number"
                          ? `Rs. ${product.price.toLocaleString("en-PK")}`
                          : "On request"}
                      </td>

                      <td className="px-3 py-4">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => toggleStock(product)}
                          aria-pressed={product.inStock}
                          className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            product.inStock
                              ? "border-emerald-500/30 bg-emerald-500/15 text-emerald-400"
                              : "border-foreground/20 bg-background text-foreground/60 hover:border-accent"
                          }`}
                        >
                          {product.inStock ? "● In Stock" : "○ Out of Stock"}
                        </button>
                      </td>

                      <td className="px-3 py-4">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => toggleFeatured(product)}
                          aria-pressed={product.featured}
                          className={`inline-flex min-h-8 items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
                            product.featured
                              ? "border-accent/40 bg-accent/15 text-accent"
                              : "border-foreground/20 bg-background text-foreground/60 hover:border-accent"
                          }`}
                        >
                          {product.featured ? "★ Featured" : "Standard"}
                        </button>
                      </td>

                      <td className="py-4 pr-5 pl-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/collection/${product.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex min-h-8 items-center rounded-lg border border-foreground/15 bg-background px-2.5 py-1 text-xs text-foreground/75 hover:border-accent hover:text-accent"
                          >
                            View ↗
                          </Link>
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="inline-flex min-h-8 items-center rounded-lg border border-foreground/20 bg-background px-3 py-1 text-xs font-medium text-foreground hover:border-accent hover:text-accent"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => setConfirmDelete(product)}
                            className="inline-flex min-h-8 items-center rounded-lg border border-foreground/15 bg-background px-2.5 py-1 text-xs text-foreground/60 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {confirmDelete ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-sm rounded-xl border border-foreground/20 bg-surface p-6 shadow-xl">
            <h2
              id="delete-dialog-title"
              className="font-display text-xl text-foreground"
            >
              Delete frame?
            </h2>
            <p className="mt-2 text-sm text-foreground/75">
              Remove{" "}
              <span className="font-medium text-foreground">
                {confirmDelete.name}
              </span>{" "}
              and all of its uploaded photos permanently?
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={busyId === confirmDelete.id}
                onClick={() => setConfirmDelete(null)}
                className="min-h-10 rounded-lg border border-foreground/20 px-4 py-2 text-xs font-medium text-foreground hover:border-accent"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busyId === confirmDelete.id}
                onClick={deleteConfirmed}
                className="min-h-10 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500 disabled:opacity-50"
              >
                {busyId === confirmDelete.id ? "Deleting…" : "Confirm delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
