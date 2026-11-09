import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";

type CategoryTileProps = {
  label: string;
  href: string;
  product: Product | null;
  index?: number;
};

export function CategoryTile({
  label,
  href,
  product,
  index = 0,
}: CategoryTileProps) {
  const image = product?.images[0] || "/images/products/round-tortoise.jpg";
  const code = `DEPT // 0${index + 1}`;

  return (
    <Link
      href={href}
      className="group relative block overflow-hidden border border-foreground/15 bg-surface transition-all duration-500 hover:-translate-y-1 hover:border-accent"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2 font-mono text-[10px] tracking-[0.18em] text-foreground/55 uppercase">
        <span className="text-accent">{code}</span>
        <span>EXPLORE ↗</span>
      </div>

      <div className="relative aspect-[4/4.6] overflow-hidden bg-background">
        <ProductImage
          src={image}
          alt={
            product
              ? `${label} frames — ${product.name}`
              : `${label} frames`
          }
          fill
          sizes="(max-width: 640px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="font-mono text-[10px] tracking-[0.2em] text-white/65 uppercase">
            {product ? product.brand : "CURATED ARCHIVE"}
          </p>
          <div className="mt-1 flex items-end justify-between gap-2">
            <span className="font-display text-2xl leading-none tracking-tight sm:text-3xl">
              {label}
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 bg-white/10 font-mono text-xs backdrop-blur-md transition-colors group-hover:border-[#5AA2E6] group-hover:bg-[#5AA2E6] group-hover:text-[#15181E]">
              →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
