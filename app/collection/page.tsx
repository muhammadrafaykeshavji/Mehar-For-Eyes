import Link from "next/link";
import { Suspense } from "react";
import { CollectionFilters } from "@/components/CollectionFilters";
import { CollectionProductCard } from "@/components/CollectionProductCard";
import {
  filtersFromSearchParams,
  hasActiveFilters,
  type CollectionSearchParams,
} from "@/lib/collection-url";
import { getFilterOptions, getProducts } from "@/lib/products";

export const metadata = {
  title: "Collection",
  description: "Browse eyeglass frames, sunglasses and kids eyewear from Mehar for Eyes. Order on WhatsApp.",
};

function CollectionFallback() {
  return (
    <div className="mt-8 border-t border-foreground/10 pt-8">
      <p className="text-sm text-foreground/60">Loading framesâ€¦</p>
    </div>
  );
}

async function CollectionResults({
  searchParams,
}: Pick<PageProps<"/collection">, "searchParams">) {
  const params = (await searchParams) as CollectionSearchParams;
  const filters = filtersFromSearchParams(params);
  const [products, options] = await Promise.all([
    getProducts(filters),
    getFilterOptions(),
  ]);

  const count = products.length;
  const filtersOn = hasActiveFilters(filters);
  const countLabel = filtersOn
    ? count === 1
      ? "1 frame matches these filters"
      : `${count} frames match these filters`
    : count === 1
      ? "1 frame in the collection"
      : `${count} frames in the collection`;

  return (
    <>
      <div className="mt-8">
        <CollectionFilters options={options} active={filters} />
      </div>

      <p className="mt-6 text-sm text-foreground/65" aria-live="polite">
        {countLabel}
      </p>

      {count === 0 ? (
        <div className="mt-12 border border-foreground/10 px-6 py-14 text-center">
          <p className="font-display text-xl text-foreground">
            No frames match this filter
          </p>
          <p className="mt-3 text-sm text-foreground/65">
            Try another shape, gender, or category.
          </p>
          <Link
            href="/collection"
            prefetch={true}
            className="mt-6 inline-block text-sm text-accent underline-offset-4 transition-opacity duration-200 hover:underline hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-12">
          {products.map((product, index) => (
            <li key={product.id}>
              <CollectionProductCard
                product={product}
                priority={index < 4}
              />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default function CollectionPage({
  searchParams,
}: PageProps<"/collection">) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
      <div className="max-w-xl">
        <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
          Collection
        </h1>
        <p className="mt-3 text-base leading-relaxed text-foreground/75">
          Frames on the floor and ready to try. Filter by what you need, then
          message us on WhatsApp.
        </p>
      </div>

      <Suspense fallback={<CollectionFallback />}>
        <CollectionResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
