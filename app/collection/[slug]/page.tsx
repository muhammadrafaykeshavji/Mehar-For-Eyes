import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollectionProductCard } from "@/components/CollectionProductCard";
import { ProductDetailSkeleton } from "@/components/PageSkeletons";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductRxConfigurator } from "@/components/ProductRxConfigurator";
import { ProductWhatsAppButton } from "@/components/ProductWhatsAppButton";
import {
  formatSpecLabel,
  getProductWhatsAppOrder,
} from "@/lib/product-order";
import {
  getProductBySlug,
  getProducts,
  getRelated,
} from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

export async function generateStaticParams() {
  const products = await getProducts();
  if (products.length === 0) {
    return [{ slug: "_placeholder" }];
  }
  return products.map((product) => ({ slug: product.slug }));
}

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Frame not found" };
  }

  return {
    title: product.name,
    description: product.description,
  };
}

function ProductFallback() {
  return <ProductDetailSkeleton />;
}

async function ProductDetail({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) {
    notFound();
  }

  const related = await getRelated(slug);
  const order = getProductWhatsAppOrder(product, {
    whatsappNumber: settings.whatsappNumber,
    shopName: settings.shopName,
  });

  const specs = [
    { label: "Category", value: product.category },
    { label: "Department", value: product.gender },
    { label: "Frame Silhouette", value: product.frameShape },
    { label: "Chassis Material", value: product.material },
    { label: "Colorway", value: product.color },
    { label: "Caliper Sizing", value: "52 □ 19 — 145 mm" },
  ] as const;

  return (
    <div>
      {/* Section 1: Main Product Stage on Off-White Printed Canvas */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-8 sm:pt-12 lg:pb-20">
        <Link
          href="/collection"
          className="inline-flex items-center gap-2 rounded-full border border-foreground/15 bg-[#DCE2EC]/90 px-4 py-1.5 font-mono text-xs font-semibold tracking-wider text-foreground uppercase transition hover:border-accent hover:text-accent"
        >
          <span>← Back to Archive</span>
        </Link>

        <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
          {/* Left Column (6 cols): Dual-Zoom + Virtual Face Try-On Gallery */}
          <div className="lg:col-span-6">
            <ProductGallery
              images={product.images}
              productName={product.name}
              brand={product.brand}
              frameShape={product.frameShape}
              price={product.price}
            />
          </div>

          {/* Right Column (6 cols): Technical Specs & Interactive Lens Package Configurator */}
          <div className="lg:col-span-6">
            <div className="rounded-3xl border border-foreground/15 bg-background/95 p-6 shadow-[0_14px_36px_rgba(21,24,30,0.06)] backdrop-blur-md sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs font-bold tracking-[0.2em] text-accent uppercase">
                  {product.brand}
                </p>
                <span
                  className={`rounded-full px-3 py-0.5 font-mono text-[10px] font-bold uppercase ${
                    product.inStock
                      ? "bg-[#D8ECFF] text-[#2B6CB0]"
                      : "bg-foreground/10 text-foreground/60"
                  }`}
                >
                  {product.inStock ? "● In Stock · Ready for Rx" : "Out of Stock"}
                </span>
              </div>

              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {product.name}
              </h1>

              {product.price ? (
                <p className="mt-2 font-mono text-lg font-bold text-[#15181E]">
                  PKR {product.price.toLocaleString()}{" "}
                  <span className="text-xs font-normal text-foreground/60">
                    (Frame Base Price)
                  </span>
                </p>
              ) : null}

              <p className="mt-4 text-sm leading-relaxed text-foreground/80 sm:text-base">
                {product.description}
              </p>

              {/* Technical Spec Grid */}
              <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="rounded-xl border border-foreground/12 bg-[#DCE2EC]/70 p-3"
                  >
                    <p className="font-mono text-[9.5px] tracking-widest text-foreground/60 uppercase">
                      {spec.label}
                    </p>
                    <p className="mt-1 font-mono text-xs font-bold text-foreground">
                      {formatSpecLabel(spec.value)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Interactive Prescription & Lens Package Configurator */}
              <ProductRxConfigurator
                productName={product.name}
                brand={product.brand}
                basePrice={product.price ?? null}
                inStock={product.inStock}
                whatsappNumber={settings.whatsappNumber}
                shopName={settings.shopName}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Alternating Light Cool Grey Section for Related Frames */}
      {related.length > 0 ? (
        <section className="border-t border-foreground/15 bg-[#DCE2EC]/90 py-14 backdrop-blur-[2px] sm:py-20">
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
            <div className="mb-8 flex items-end justify-between border-b border-foreground/15 pb-4">
              <div>
                <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-accent uppercase">
                  [SIMILAR OPTICAL GEOMETRY]
                </p>
                <h2 className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
                  You May Also Like
                </h2>
              </div>
              <Link
                href="/collection"
                className="font-mono text-xs font-bold tracking-wider text-accent uppercase hover:underline"
              >
                View All →
              </Link>
            </div>

            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <li key={item.id}>
                  <CollectionProductCard product={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      {/* Mobile sticky WhatsApp bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/15 bg-background/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto w-full max-w-6xl">
          <ProductWhatsAppButton href={order.href} label={order.label} />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({
  params,
}: ProductPageProps) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
