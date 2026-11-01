import Link from "next/link";
import type { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";

type FeaturedFrameCardProps = {
  product: Product;
  priority?: boolean;
};

export function FeaturedFrameCard({
  product,
  priority = false,
}: FeaturedFrameCardProps) {
  const image = product.images[0];

  return (
    <Link
      href={`/collection/${product.slug}`}
      className="group block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <div className="relative aspect-[4/5] overflow-hidden border border-foreground/10 bg-[#EDE6DC]">
        {image ? (
          <ProductImage
            src={image}
            alt={`${product.name} by ${product.brand}`}
            fill
            sizes="(max-width: 640px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            priority={priority}
          />
        ) : null}
      </div>
      <div className="mt-3 space-y-0.5">
        <h3 className="font-display text-base text-foreground sm:text-lg">
          {product.name}
        </h3>
        <p className="text-sm text-foreground/65">{product.brand}</p>
      </div>
    </Link>
  );
}
