import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { CollectionFilters } from "@/components/CollectionFilters";
import { CollectionProductCard } from "@/components/CollectionProductCard";
import { CollectionResultsSkeleton } from "@/components/PageSkeletons";
import {
  filtersFromSearchParams,
  hasActiveFilters,
  type CollectionSearchParams,
} from "@/lib/collection-url";
import { getFilterOptions, getProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.collectionHeading,
    description: settings.collectionSubtitle,
  };
}

function CollectionFallback() {
  return <CollectionResultsSkeleton />;
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
      {/* Filter Deck inside Off-White Printed Section */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8">
        <div className="rounded-2xl border border-foreground/15 bg-[#DCE2EC]/90 p-5 shadow-sm backdrop-blur-md sm:p-6">
          <CollectionFilters options={options} active={filters} />
        </div>
      </div>

      {/* Alternating Light Cool Grey Section for Frame Archive Grid */}
      <section className="border-t border-foreground/15 bg-[#DCE2EC]/90 py-12 backdrop-blur-[2px] sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b border-foreground/15 pb-4">
            <p
              className="font-mono text-xs font-semibold tracking-[0.16em] text-foreground/75 uppercase"
              aria-live="polite"
            >
              ARCHIVE INDEX // {countLabel}
            </p>
            <span className="rounded-full bg-[#15181E] px-3 py-1 font-mono text-[10px] tracking-widest text-[#99CEFF] uppercase">
              VIRTUAL TRY-ON &amp; DUAL ZOOM READY
            </span>
          </div>

          {count === 0 ? (
            <div className="rounded-2xl border border-foreground/15 bg-background/90 px-6 py-14 text-center">
              <p className="font-display text-xl text-foreground">
                No frames match this filter
              </p>
              <p className="mt-3 text-sm text-foreground/65">
                Try another shape, gender, or category.
              </p>
              <Link
                href="/collection"
                prefetch={true}
                className="mt-6 inline-block rounded-full bg-[#15181E] px-5 py-2 font-mono text-xs text-[#F4F2EC] uppercase transition hover:bg-accent"
              >
                Clear filters
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
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
        </div>
      </section>
    </>
  );
}

export default async function CollectionPage({
  searchParams,
}: PageProps<"/collection">) {
  const settings = await getSiteSettings();

  return (
    <div>
      {/* Section 1: Off-White Printed Header */}
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-8 sm:pt-14">
        <div className="max-w-2xl">
          <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-accent uppercase">
            [ARCHIVE // OPTICAL &amp; SUN COLLECTION]
          </p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            {settings.collectionHeading}
          </h1>
          <p className="mt-3 text-base leading-relaxed text-foreground/80">
            {settings.collectionSubtitle}
          </p>
        </div>
      </div>

      <Suspense fallback={<CollectionFallback />}>
        <CollectionResults searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
