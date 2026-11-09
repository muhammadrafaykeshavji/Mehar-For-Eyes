import Link from "next/link";
import type { Product } from "@/lib/products";
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
  const primary = product.images[0] || "/images/products/aviator-gold.jpg";
  const secondary = product.images[1];
  const whatsappHref = tryBuildWhatsAppLink(
    `Hi Mehar for Eyes — I'm interested in ${product.name}.`,
  );

  return (
    <article
      className="group flex flex-col justify-between overflow-hidden border border-foreground/15 bg-background/90 shadow-[0_12px_30px_rgba(21,24,30,0.06)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-[#5AA2E6] hover:shadow-[0_22px_44px_rgba(21,24,30,0.14)]"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <Link
        href={`/collection/${product.slug}`}
        className="block focus-visible:outline-none"
      >
        {/* Top Spec Strip */}
        <div className="flex items-center justify-between border-b border-foreground/10 px-4 py-2.5 font-mono text-[10px] tracking-[0.15em] text-foreground/60 uppercase">
          <span>52 □ 19 — 145</span>
          <span className="rounded-full bg-[#D8ECFF] px-2.5 py-0.5 font-semibold text-[#2B6CB0]">
            {product.frameShape}
          </span>
        </div>

        <div className="relative aspect-[4/3.6] overflow-hidden bg-white">
          <ProductImage
            src={primary}
            alt={`${product.name} by ${product.brand}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={`object-cover transition-all duration-700 group-hover:scale-108 ${
              secondary ? "group-hover:opacity-0" : ""
            }`}
            priority={priority}
          />
          {secondary ? (
            <ProductImage
              src={secondary}
              alt={`${product.name} by ${product.brand} — alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          ) : null}

          <div className="absolute top-2.5 left-2.5">
            <span className="rounded-full border border-[#5AA2E6]/40 bg-[#15181E]/85 px-2.5 py-0.5 font-mono text-[9px] tracking-widest text-[#99CEFF] uppercase backdrop-blur-md">
              {product.category}
            </span>
          </div>
        </div>

        <div className="p-4 pb-2 sm:p-5 sm:pb-3">
          <p className="font-mono text-[10px] tracking-[0.16em] text-foreground/55 uppercase">
            {product.brand}
          </p>
          <h2 className="mt-1 font-display text-lg font-bold text-foreground transition-colors group-hover:text-accent sm:text-xl">
            {product.name}
          </h2>
          <p className="mt-1 line-clamp-1 text-xs text-foreground/65">
            {product.material} · {product.color}
          </p>
        </div>
      </Link>

      <div className="mt-2 flex items-center justify-between border-t border-foreground/10 px-4 py-3.5 sm:px-5">
        <span className="font-mono text-xs font-semibold text-foreground">
          {product.price
            ? `PKR ${product.price.toLocaleString()}`
            : "INQUIRE"}
        </span>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] font-semibold tracking-widest text-accent uppercase transition-opacity hover:opacity-80"
          >
            WhatsApp Order ↗
          </a>
        ) : (
          <span className="font-mono text-[10px] text-foreground/45 uppercase">
            In-Store
          </span>
        )}
      </div>
    </article>
  );
}
