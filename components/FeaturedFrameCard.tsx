import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductImage } from "@/components/ProductImage";

type FeaturedFrameCardProps = {
  product: Product;
  index?: number;
  priority?: boolean;
};

const CALIPER_SPECS = [
  "52 □ 19 — 145",
  "49 □ 21 — 145",
  "54 □ 17 — 148",
  "51 □ 20 — 142",
];

export function FeaturedFrameCard({
  product,
  index = 0,
  priority = false,
}: FeaturedFrameCardProps) {
  const image = product.images[0] || "/images/products/aviator-gold.jpg";
  const specCode = CALIPER_SPECS[index % CALIPER_SPECS.length];
  const archiveNo = String(index + 1).padStart(2, "0");
  const isCharcoalEdition = index % 4 === 1;

  return (
    <Link
      href={`/collection/${product.slug}`}
      className={`group relative flex flex-col justify-between overflow-hidden border transition-all duration-300 hover:-translate-y-1.5 hover:border-[#5AA2E6] hover:shadow-[0_22px_44px_rgba(21,24,30,0.14)] ${
        isCharcoalEdition
          ? "border-[#5AA2E6]/45 bg-[#15181E] text-[#F4F2EC] shadow-[0_16px_36px_rgba(21,24,30,0.2)]"
          : "border-foreground/15 bg-background/90 text-foreground shadow-[0_12px_30px_rgba(21,24,30,0.06)] backdrop-blur-md"
      }`}
      style={{ borderRadius: "var(--radius-card)" }}
    >
      {/* Top Technical Spec Ledger */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 font-mono text-[10px] tracking-[0.15em] uppercase ${
          isCharcoalEdition
            ? "border-white/10 text-[#99CEFF]"
            : "border-foreground/10 text-foreground/65"
        }`}
      >
        <span>
          ARCHIVE {archiveNo} {"//"} {product.category}
        </span>
        <span
          className={`rounded-full px-2.5 py-0.5 font-semibold ${
            isCharcoalEdition
              ? "bg-[#5AA2E6]/22 text-[#99CEFF]"
              : "bg-[#D8ECFF] text-[#2B6CB0]"
          }`}
        >
          {product.frameShape}
        </span>
      </div>

      {/* Studio White Image Stage */}
      <div className="relative aspect-[4/3.6] w-full overflow-hidden bg-white">
        <ProductImage
          src={image}
          alt={`${product.name} by ${product.brand}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
          priority={priority}
        />

        {/* Hover Slide-Up Spec Bar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full border-t border-[#5AA2E6]/30 bg-[#15181E]/90 px-4 py-2.5 text-[#F4F2EC] backdrop-blur-md transition-transform duration-300 group-hover:translate-y-0">
          <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase">
            <span>CALIPER: {specCode}</span>
            <span className="text-[#82C3FF]">INSPECT SPEC ↗</span>
          </div>
        </div>
      </div>

      {/* Bottom Architectural Metadata */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <p
            className={`font-mono text-[10px] tracking-[0.16em] uppercase ${
              isCharcoalEdition ? "text-[#99CEFF]/75" : "text-foreground/55"
            }`}
          >
            {product.brand}
          </p>
          <h3
            className={`mt-1 font-display text-xl font-bold leading-snug transition-colors sm:text-2xl ${
              isCharcoalEdition
                ? "text-[#F4F2EC] group-hover:text-[#82C3FF]"
                : "text-foreground group-hover:text-accent"
            }`}
          >
            {product.name}
          </h3>
          <p
            className={`mt-1 line-clamp-1 text-xs ${
              isCharcoalEdition ? "text-[#B0BAC9]" : "text-foreground/65"
            }`}
          >
            {product.material} · {product.color}
          </p>
        </div>

        <div
          className={`mt-4 flex items-center justify-between border-t pt-3.5 font-mono text-xs font-semibold ${
            isCharcoalEdition ? "border-white/12" : "border-foreground/12"
          }`}
        >
          <span className={isCharcoalEdition ? "text-[#82C3FF]" : "text-foreground"}>
            {product.price
              ? `PKR ${product.price.toLocaleString()}`
              : "PRICE ON REQUEST"}
          </span>
          <span
            className={`text-[11px] tracking-wider uppercase ${
              isCharcoalEdition ? "text-white" : "text-accent"
            }`}
          >
            INSPECT FRAME →
          </span>
        </div>
      </div>
    </Link>
  );
}
