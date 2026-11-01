import Link from "next/link";
import type { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";

type CategoryTileProps = {
  label: string;
  href: string;
  product: Product | null;
};

export function CategoryTile({ label, href, product }: CategoryTileProps) {
  const image = product?.images[0];

  return (
    <Link
      href={href}
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-foreground/10 bg-[#EDE6DC] sm:aspect-[3/4]">
        {image ? (
          <ProductImage
            src={image}
            alt={
              product
                ? `${label} frames — ${product.name}`
                : `${label} frames`
            }
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : null}
        <span className="absolute inset-x-0 bottom-0 border-t border-foreground/10 bg-background/95 px-4 py-3 font-display text-xl text-foreground sm:px-5 sm:py-4 sm:text-2xl">
          {label}
        </span>
      </div>
    </Link>
  );
}
