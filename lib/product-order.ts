import type { Product } from "@/data/products";
import { tryBuildWhatsAppLink } from "@/lib/whatsapp";

export function getProductPageUrl(slug: string): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
  return `${base}/collection/${slug}`;
}

export function getProductWhatsAppOrder(product: Product): {
  href: string | null;
  label: string;
} {
  const productUrl = getProductPageUrl(product.slug);

  if (product.inStock) {
    return {
      label: "Order on WhatsApp",
      href: tryBuildWhatsAppLink(
        `Hi Mehar for Eyes, I want to order: ${product.name} ${productUrl}. Please confirm availability.`,
      ),
    };
  }

  return {
    label: "Ask about availability on WhatsApp",
    href: tryBuildWhatsAppLink(
      `Hi Mehar for Eyes, I'd like to ask about availability for: ${product.name} ${productUrl}.`,
    ),
  };
}

export function formatSpecLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
