import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";

type ProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const image = product.images[0];

  return (
    <Link
      href={`/collection/${product.slug}`}
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-[4/3] overflow-hidden border border-foreground/10 bg-[#EDE6DC]">
        {image ? (
          <ProductImage
            src={image}
            alt={`${product.name} by ${product.brand}`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={priority}
          />
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-xs uppercase tracking-[0.12em] text-foreground/55">
          {product.brand}
        </p>
        <h3 className="font-display text-lg text-foreground">{product.name}</h3>
        <p className="text-sm text-foreground/70">
          {product.frameShape} · {product.color}
        </p>
      </div>
    </Link>
  );
}
