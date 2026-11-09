"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ProductForm } from "@/components/admin/ProductForm";
import type { Product } from "@/lib/products";

function EditProductContent() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let active = true;

    async function load() {
      try {
        const res = await fetch(`/api/admin/products/${encodeURIComponent(id)}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (res.status === 404) {
          if (active) setError("Product not found.");
          return;
        }
        if (!res.ok) {
          if (active) setError("Could not load product.");
          return;
        }
        const data = (await res.json()) as Product;
        if (active) setProduct(data);
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
  }, [id, router]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <p className="text-sm text-foreground/65">Loading product…</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <p className="font-display text-xl text-foreground">
          {error ?? "Product not found"}
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm text-accent underline-offset-4 hover:underline"
        >
          Back to product list
        </Link>
      </div>
    );
  }

  return <ProductForm initialProduct={product} />;
}

export default function EditProductPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
          <p className="text-sm text-foreground/65">Loading product…</p>
        </div>
      }
    >
      <EditProductContent />
    </Suspense>
  );
}
