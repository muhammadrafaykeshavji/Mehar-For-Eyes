import Link from "next/link";
import type { Product } from "@/data/products";
import { ProductImage } from "@/components/ProductImage";
import { tryBuildWhatsAppLink } from "@/lib/whatsapp";

type CollectionProductCardProps = {
  product: Product;
  priority?: boolean;
};

export function CollectionProductCard({
  product,
  priority = false,
}: CollectionProductCardProps) {
  const primary = product.images[0];
  const secondary = product.images[1];
  const whatsappHref = tryBuildWhatsAppLink(
    `Hi Mehar for Eyes — I'm interested in ${product.name}.`,
  );

  return (
    <article className="group">
      <Link
        href={`/collection/${product.slug}`}
        className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <div className="relative aspect-[4/5] overflow-hidden border border-foreground/10 bg-[#EDE6DC]">
          {primary ? (
            <ProductImage
              src={primary}
              alt={`${product.name} by ${product.brand}`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className={`object-cover transition-opacity duration-300 ${
                secondary ? "group-hover:opacity-0" : ""
              }`}
              priority={priority}
            />
          ) : null}
          {secondary ? (
            <ProductImage
              src={secondary}
              alt={`${product.name} by ${product.brand} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />
          ) : null}
        </div>

        <div className="mt-3 space-y-1">
          <h2 className="font-display text-base text-foreground sm:text-lg">
            {product.name}
          </h2>
          <p className="text-sm text-foreground/65">{product.brand}</p>
          <p className="text-sm text-foreground/55">
            {product.material} · {product.color}
          </p>
        </div>
      </Link>

      {whatsappHref ? (
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block text-sm text-accent underline-offset-4 transition-opacity duration-200 hover:underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Order on WhatsApp
        </a>
      ) : (
        <p className="mt-2 text-sm text-foreground/45">Order on WhatsApp</p>
      )}
    </article>
  );
}
