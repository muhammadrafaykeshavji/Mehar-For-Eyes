import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CollectionProductCard } from "@/components/CollectionProductCard";
import { ProductGallery } from "@/components/ProductGallery";
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

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/collection/[slug]">) {
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
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
      <p className="text-sm text-foreground/60">Loading frame…</p>
    </div>
  );
}

async function ProductDetail({
  params,
}: Pick<PageProps<"/collection/[slug]">, "params">) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = await getRelated(slug);
  const order = getProductWhatsAppOrder(product);

  const specs = [
    { label: "Category", value: product.category },
    { label: "Gender", value: product.gender },
    { label: "Frame shape", value: product.frameShape },
    { label: "Material", value: product.material },
    { label: "Color", value: product.color },
  ] as const;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-12 sm:px-6 sm:pt-16 lg:pb-20 lg:pt-20">
      <Link
        href="/collection"
        className="text-sm text-foreground/65 transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Back to collection
      </Link>

      <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-14">
        <ProductGallery
          images={product.images}
          productName={product.name}
          brand={product.brand}
        />

        <div>
          <p className="text-xs uppercase tracking-[0.12em] text-foreground/55">
            {product.brand}
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            {product.name}
          </h1>

          <table className="mt-8 w-full border-collapse text-sm">
            <tbody>
              {specs.map((spec) => (
                <tr key={spec.label} className="border-t border-foreground/10">
                  <th
                    scope="row"
                    className="w-[40%] py-3 pr-4 text-left font-normal text-foreground/55"
                  >
                    {spec.label}
                  </th>
                  <td className="py-3 text-foreground">
                    {formatSpecLabel(spec.value)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-b border-foreground/10">
                <th
                  scope="row"
                  className="w-[40%] py-3 pr-4 text-left font-normal text-foreground/55"
                >
                  Stock
                </th>
                <td className="py-3 text-foreground">
                  {product.inStock ? "In stock" : "Out of stock"}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="mt-6 text-base leading-relaxed text-foreground/75">
            {product.description}
          </p>

          <div className="mt-8 hidden lg:block">
            <ProductWhatsAppButton href={order.href} label={order.label} />
          </div>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="mt-16 border-t border-foreground/10 pt-12 sm:mt-20 sm:pt-14">
          <h2 className="font-display text-2xl tracking-tight text-foreground">
            You may also like
          </h2>
          <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-8">
            {related.map((item) => (
              <li key={item.id}>
                <CollectionProductCard product={item} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Mobile sticky WhatsApp bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/10 bg-background px-4 py-3 lg:hidden">
        <div className="mx-auto w-full max-w-6xl">
          <ProductWhatsAppButton href={order.href} label={order.label} />
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({
  params,
}: PageProps<"/collection/[slug]">) {
  return (
    <Suspense fallback={<ProductFallback />}>
      <ProductDetail params={params} />
    </Suspense>
  );
}
