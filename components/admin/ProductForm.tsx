"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FormEvent } from "react";
import { revalidateCatalog } from "@/app/admin/actions";
import { ProductImage } from "@/components/ProductImage";
import { resizeImageToWebP } from "@/lib/client-image";
import type { Product, ProductImageItem } from "@/lib/products";

const MAX_IMAGES = 8;

const CATEGORIES = [
  { value: "eyeglasses", label: "Eyeglasses" },
  { value: "sunglasses", label: "Sunglasses" },
] as const;

const GENDERS = [
  { value: "unisex", label: "Unisex" },
  { value: "men", label: "Men" },
  { value: "women", label: "Women" },
  { value: "kids", label: "Kids" },
] as const;

const FRAME_SHAPES = [
  { value: "", label: "Select shape (optional)" },
  { value: "aviator", label: "Aviator" },
  { value: "wayfarer", label: "Wayfarer" },
  { value: "round", label: "Round" },
  { value: "oval", label: "Oval" },
  { value: "rectangle", label: "Rectangle" },
  { value: "cat-eye", label: "Cat-Eye" },
  { value: "square", label: "Square" },
  { value: "geometric", label: "Geometric" },
] as const;

type PendingPhoto = {
  key: string;
  file: File;
  previewUrl: string;
};

type ProductFormProps = {
  initialProduct?: Product;
};

export function ProductForm({ initialProduct }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(initialProduct);

  const [name, setName] = useState(initialProduct?.name ?? "");
  const [brand, setBrand] = useState(initialProduct?.brand ?? "");
  const [category, setCategory] = useState(
    initialProduct?.category ?? "eyeglasses",
  );
  const [gender, setGender] = useState(initialProduct?.gender ?? "unisex");
  const [frameShape, setFrameShape] = useState(
    initialProduct?.frameShape ?? "",
  );
  const [material, setMaterial] = useState(initialProduct?.material ?? "");
  const [color, setColor] = useState(initialProduct?.color ?? "");
  const [price, setPrice] = useState(
    initialProduct?.price !== undefined ? String(initialProduct.price) : "",
  );
  const [description, setDescription] = useState(
    initialProduct?.description ?? "",
  );
  const [inStock, setInStock] = useState(initialProduct?.inStock ?? true);
  const [featured, setFeatured] = useState(initialProduct?.featured ?? false);

  const [savedImages, setSavedImages] = useState<ProductImageItem[]>(
    initialProduct?.imageItems ?? [],
  );
  const [pendingPhotos, setPendingPhotos] = useState<PendingPhoto[]>([]);
  const [orderDirty, setOrderDirty] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const totalImages = savedImages.length + pendingPhotos.length;

  async function onSelectFiles(event: ChangeEvent<HTMLInputElement>) {
    const fileList = event.target.files;
    if (!fileList || fileList.length === 0) return;

    setError(null);
    const remaining = MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      setError(`Maximum ${MAX_IMAGES} photos per product.`);
      event.target.value = "";
      return;
    }

    const picked = Array.from(fileList).slice(0, remaining);
    setStatusMessage("Resizing photos for fast upload…");

    try {
      const prepared: PendingPhoto[] = [];
      for (const rawFile of picked) {
        const webpFile = await resizeImageToWebP(rawFile);
        prepared.push({
          key: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          file: webpFile,
          previewUrl: URL.createObjectURL(webpFile),
        });
      }
      setPendingPhotos((prev) => [...prev, ...prepared]);
      setStatusMessage(null);
    } catch {
      setError("Could not process one of the selected photos.");
      setStatusMessage(null);
    } finally {
      event.target.value = "";
    }
  }

  function removePending(key: string) {
    setPendingPhotos((prev) => {
      const target = prev.find((p) => p.key === key);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((p) => p.key !== key);
    });
  }

  function movePending(index: number, delta: number) {
    setPendingPhotos((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function moveSaved(index: number, delta: number) {
    setSavedImages((prev) => {
      const target = index + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
    setOrderDirty(true);
  }

  function onDropSaved(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      return;
    }
    setSavedImages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(targetIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setOrderDirty(true);
  }

  async function deleteSavedImage(image: ProductImageItem) {
    if (!initialProduct) return;
    setError(null);
    try {
      const res = await fetch(
        `/api/admin/products/${initialProduct.id}/images/${image.id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      if (!res.ok) {
        setError("Could not delete photo.");
        return;
      }
      setSavedImages((prev) => prev.filter((img) => img.id !== image.id));
      await revalidateCatalog(initialProduct.slug);
    } catch {
      setError("Could not delete photo.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatusMessage(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Product name is required.");
      return;
    }

    let parsedPrice: number | null = null;
    if (price.trim() !== "") {
      const num = Number(price.trim());
      if (!Number.isInteger(num) || num < 0) {
        setError("Price must be a whole number (or leave blank).");
        return;
      }
      parsedPrice = num;
    }

    setSaving(true);
    setStatusMessage("Saving product details…");

    try {
      const payload = {
        name: trimmedName,
        brand: brand.trim(),
        category,
        gender,
        frameShape,
        material: material.trim(),
        color: color.trim(),
        price: parsedPrice,
        description: description.trim(),
        inStock,
        featured,
      };

      const endpoint = isEdit
        ? `/api/admin/products/${initialProduct!.id}`
        : "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }

      if (!res.ok) {
        const errBody = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(errBody.error ?? "Could not save product.");
        setSaving(false);
        setStatusMessage(null);
        return;
      }

      const saved = (await res.json()) as Product;

      // Save reordered existing images if changed.
      if (isEdit && orderDirty && savedImages.length > 1) {
        setStatusMessage("Updating photo order…");
        const reorderRes = await fetch(
          `/api/admin/products/${saved.id}/images`,
          {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageIds: savedImages.map((img) => img.id),
            }),
          },
        );
        if (!reorderRes.ok) {
          setError("Product saved, but photo order could not be updated.");
          setSaving(false);
          setStatusMessage(null);
          return;
        }
        setOrderDirty(false);
      }

      // Upload any new pending photos.
      if (pendingPhotos.length > 0) {
        setStatusMessage(
          `Uploading ${pendingPhotos.length} photo${
            pendingPhotos.length === 1 ? "" : "s"
          }…`,
        );
        const formData = new FormData();
        for (const item of pendingPhotos) {
          formData.append("images", item.file);
          formData.append("alt", trimmedName);
        }

        const uploadRes = await fetch(
          `/api/admin/products/${saved.id}/images`,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );

        if (!uploadRes.ok) {
          const errBody = (await uploadRes.json().catch(() => ({}))) as {
            error?: string;
          };
          setError(
            errBody.error ??
              "Product saved, but photo upload failed. Tap Save again to retry.",
          );
          setSaving(false);
          setStatusMessage(null);
          return;
        }

        for (const item of pendingPhotos) {
          URL.revokeObjectURL(item.previewUrl);
        }
        setPendingPhotos([]);
      }

      await revalidateCatalog(saved.slug);
      router.push("/admin");
      router.refresh();
    } catch {
      setError("Network error while saving. Tap Save to try again.");
      setSaving(false);
      setStatusMessage(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-5">
        <h1 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
          {isEdit ? "Edit product" : "Add product"}
        </h1>
        <Link
          href="/admin"
          className="min-h-11 inline-flex items-center text-sm text-foreground/70 hover:text-accent"
        >
          Back to list
        </Link>
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-foreground"
        >
          {error}
        </div>
      ) : null}

      {statusMessage ? (
        <div
          aria-live="polite"
          className="mt-6 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm text-foreground"
        >
          {statusMessage}
        </div>
      ) : null}

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-6 rounded-xl border border-foreground/15 bg-surface p-5 sm:p-6"
      >
        {/* Photos section */}
        <section className="border border-foreground/15 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg text-foreground">
                Photos ({totalImages}/{MAX_IMAGES})
              </h2>
              <p className="mt-0.5 text-xs text-foreground/65">
                First photo is the main cover image.
              </p>
            </div>

            {totalImages < MAX_IMAGES ? (
              <label className="inline-flex min-h-12 cursor-pointer items-center justify-center border border-accent bg-accent px-4 py-2.5 text-sm font-medium text-background transition-opacity duration-200 hover:opacity-90">
                <span>Take or choose photos</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/*"
                  multiple
                  onChange={onSelectFiles}
                  className="sr-only"
                />
              </label>
            ) : null}
          </div>

          {savedImages.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/55">
                Uploaded photos
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {savedImages.map((img, idx) => (
                  <li
                    key={img.id}
                    draggable
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => onDropSaved(idx)}
                    className="border border-foreground/15 bg-background p-2"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#EDE6DC]">
                      <ProductImage
                        src={img.thumbPath ?? img.path}
                        alt={img.alt || name || "Product photo"}
                        fill
                        sizes="160px"
                        className="object-cover"
                      />
                      {idx === 0 ? (
                        <span className="absolute left-1.5 top-1.5 bg-accent px-2 py-0.5 text-[11px] font-medium text-background">
                          Cover
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSaved(idx, -1)}
                          aria-label="Move photo earlier"
                          className="min-h-9 min-w-9 border border-foreground/20 px-2 text-xs text-foreground disabled:opacity-35"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={idx === savedImages.length - 1}
                          onClick={() => moveSaved(idx, 1)}
                          aria-label="Move photo later"
                          className="min-h-9 min-w-9 border border-foreground/20 px-2 text-xs text-foreground disabled:opacity-35"
                        >
                          →
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteSavedImage(img)}
                        className="min-h-9 border border-foreground/20 px-2 text-xs text-foreground/80 hover:border-accent hover:text-accent"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {pendingPhotos.length > 0 ? (
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-foreground/55">
                Ready to upload on Save
              </p>
              <ul className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {pendingPhotos.map((item, idx) => (
                  <li
                    key={item.key}
                    className="border border-foreground/15 bg-background p-2"
                  >
                    <div className="relative aspect-square overflow-hidden bg-[#EDE6DC]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.previewUrl}
                        alt="New upload preview"
                        className="h-full w-full object-cover"
                      />
                      {savedImages.length === 0 && idx === 0 ? (
                        <span className="absolute left-1.5 top-1.5 bg-accent px-2 py-0.5 text-[11px] font-medium text-background">
                          Cover
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => movePending(idx, -1)}
                          aria-label="Move photo earlier"
                          className="min-h-9 min-w-9 border border-foreground/20 px-2 text-xs text-foreground disabled:opacity-35"
                        >
                          ←
                        </button>
                        <button
                          type="button"
                          disabled={idx === pendingPhotos.length - 1}
                          onClick={() => movePending(idx, 1)}
                          aria-label="Move photo later"
                          className="min-h-9 min-w-9 border border-foreground/20 px-2 text-xs text-foreground disabled:opacity-35"
                        >
                          →
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePending(item.key)}
                        className="min-h-9 border border-foreground/20 px-2 text-xs text-foreground/80 hover:border-accent hover:text-accent"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        {/* Product fields */}
        <div>
          <label
            htmlFor="field-name"
            className="block text-sm font-medium text-foreground"
          >
            Product name *
          </label>
          <input
            id="field-name"
            type="text"
            required
            placeholder="e.g. Classic Gold Aviator"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="field-category"
              className="block text-sm font-medium text-foreground"
            >
              Category *
            </label>
            <select
              id="field-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="field-gender"
              className="block text-sm font-medium text-foreground"
            >
              Gender *
            </label>
            <select
              id="field-gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {GENDERS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label
              htmlFor="field-brand"
              className="block text-sm font-medium text-foreground"
            >
              Brand
            </label>
            <input
              id="field-brand"
              type="text"
              placeholder="e.g. Ray-Ban"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          <div>
            <label
              htmlFor="field-shape"
              className="block text-sm font-medium text-foreground"
            >
              Frame shape
            </label>
            <select
              id="field-shape"
              value={frameShape}
              onChange={(e) => setFrameShape(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {FRAME_SHAPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label
              htmlFor="field-material"
              className="block text-sm font-medium text-foreground"
            >
              Material
            </label>
            <input
              id="field-material"
              type="text"
              placeholder="e.g. Metal, Acetate"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          <div>
            <label
              htmlFor="field-color"
              className="block text-sm font-medium text-foreground"
            >
              Color
            </label>
            <input
              id="field-color"
              type="text"
              placeholder="e.g. Gold, Black"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>

          <div>
            <label
              htmlFor="field-price"
              className="block text-sm font-medium text-foreground"
            >
              Price (PKR, optional)
            </label>
            <input
              id="field-price"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="Leave blank if hidden"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 block min-h-12 w-full border border-foreground/20 bg-background px-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="field-description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <textarea
            id="field-description"
            rows={3}
            placeholder="Frame notes, lens options, or fit details."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-2 block w-full border border-foreground/20 bg-background p-4 text-base text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-foreground/20 px-4 py-3">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="h-5 w-5 accent-[#5A2E1F]"
            />
            <span className="text-base font-medium text-foreground">
              In stock
            </span>
          </label>

          <label className="flex min-h-12 cursor-pointer items-center gap-3 border border-foreground/20 px-4 py-3">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-5 w-5 accent-[#5A2E1F]"
            />
            <span className="text-base font-medium text-foreground">
              Featured on home page
            </span>
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-12 flex-1 items-center justify-center border border-accent bg-accent px-6 py-3 text-base font-medium text-background transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
          <Link
            href="/admin"
            className="inline-flex min-h-12 items-center justify-center border border-foreground/20 px-5 py-3 text-base text-foreground"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

