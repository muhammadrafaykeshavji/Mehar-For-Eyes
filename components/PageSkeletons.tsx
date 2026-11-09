export function FrameCardSkeleton({ dark = false }: { dark?: boolean }) {
  return (
    <div
      className={`flex flex-col justify-between overflow-hidden rounded-[20px] border ${
        dark
          ? "border-[#5AA2E6]/35 bg-[#15181E]"
          : "border-foreground/15 bg-background/90"
      }`}
    >
      {/* Top Caliper Bar */}
      <div
        className={`flex items-center justify-between border-b px-4 py-3 ${
          dark ? "border-white/10" : "border-foreground/10"
        }`}
      >
        <div className="skeleton-shimmer h-3 w-24 rounded-full" />
        <div className="skeleton-shimmer h-4 w-16 rounded-full" />
      </div>

      {/* Image Viewport */}
      <div className="skeleton-shimmer aspect-[4/3.6] w-full" />

      {/* Card Body */}
      <div className="space-y-2.5 p-5">
        <div className="skeleton-shimmer h-2.5 w-20 rounded-full" />
        <div className="skeleton-shimmer h-6 w-3/4 rounded-lg" />
        <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
        <div
          className={`mt-4 flex items-center justify-between border-t pt-3.5 ${
            dark ? "border-white/10" : "border-foreground/10"
          }`}
        >
          <div className="skeleton-shimmer h-4 w-20 rounded-full" />
          <div className="skeleton-shimmer h-3.5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading flagship storefront">
      {/* 1. Hero Magazine Collage Skeleton */}
      <section className="border-b border-foreground/15">
        <div className="mx-auto max-w-7xl px-4 pt-6 pb-14 sm:px-8 sm:pt-10 sm:pb-20">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            {/* Left Editorial Column */}
            <div className="space-y-6 lg:col-span-6">
              <div className="skeleton-shimmer h-7 w-72 rounded-full border border-[#5AA2E6]/30" />

              <div className="space-y-3">
                <div className="skeleton-shimmer h-14 w-4/5 rounded-2xl sm:h-16" />
                <div className="skeleton-shimmer h-14 w-3/5 rounded-2xl sm:h-16" />
                <div className="skeleton-shimmer-dark h-14 w-4/6 rounded-2xl sm:h-16" />
              </div>

              <div className="skeleton-shimmer h-20 max-w-xl rounded-r-2xl border-l-[3px] border-[#5AA2E6]" />

              <div className="flex flex-wrap gap-3.5">
                <div className="skeleton-shimmer-dark h-13 w-52 rounded-full" />
                <div className="skeleton-shimmer h-13 w-44 rounded-full" />
              </div>

              {/* 3-Card Bento Spec Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="skeleton-shimmer h-24 rounded-2xl border border-foreground/15" />
                <div className="skeleton-shimmer-dark h-24 rounded-2xl border border-[#5AA2E6]/35" />
                <div className="skeleton-shimmer h-24 rounded-2xl border border-[#5AA2E6]/40" />
              </div>
            </div>

            {/* Right Asymmetric Magazine Collage Stage */}
            <div className="relative mx-auto w-full max-w-xl lg:col-span-6 lg:max-w-none">
              <div className="relative p-3 sm:p-4">
                <div className="overflow-hidden rounded-[24px] border-2 border-[#15181E] bg-[#15181E] shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                    <div className="skeleton-shimmer h-3 w-40 rounded-full" />
                    <div className="skeleton-shimmer h-3 w-32 rounded-full" />
                  </div>
                  <div className="skeleton-shimmer-dark h-[400px] w-full sm:h-[450px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Alternating Light Cool Grey Featured Archive Skeleton */}
      <section className="border-b border-foreground/15 bg-[#DCE2EC]/90 py-16 lg:py-24">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
            <div className="space-y-2.5">
              <div className="skeleton-shimmer h-3 w-48 rounded-full" />
              <div className="skeleton-shimmer h-10 w-72 rounded-xl" />
              <div className="skeleton-shimmer h-4 w-80 rounded-full" />
            </div>
            <div className="skeleton-shimmer h-10 w-48 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FrameCardSkeleton />
            <FrameCardSkeleton dark />
            <FrameCardSkeleton />
            <FrameCardSkeleton />
          </div>
        </div>
      </section>
    </div>
  );
}

export function CollectionResultsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading frame collection">
      {/* Filter Deck Skeleton */}
      <div className="mx-auto w-full max-w-7xl px-4 pb-10 sm:px-8">
        <div className="space-y-4 rounded-2xl border border-foreground/15 bg-[#DCE2EC]/90 p-5 sm:p-6">
          <div className="flex flex-wrap gap-3">
            <div className="skeleton-shimmer h-8 w-28 rounded-full" />
            <div className="skeleton-shimmer h-8 w-28 rounded-full" />
            <div className="skeleton-shimmer h-8 w-28 rounded-full" />
            <div className="skeleton-shimmer h-8 w-32 rounded-full" />
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, idx) => (
              <div
                key={idx}
                className="skeleton-shimmer h-7 w-24 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Alternating Light Cool Grey Grid Section */}
      <section className="border-t border-foreground/15 bg-[#DCE2EC]/90 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-8">
          <div className="mb-8 flex items-center justify-between border-b border-foreground/15 pb-4">
            <div className="skeleton-shimmer h-4 w-56 rounded-full" />
            <div className="skeleton-shimmer-dark h-6 w-48 rounded-full" />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <FrameCardSkeleton key={idx} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function CollectionPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading collection page">
      <div className="mx-auto w-full max-w-7xl px-4 pt-10 pb-6 sm:px-8 sm:pt-14">
        <div className="max-w-2xl space-y-3">
          <div className="skeleton-shimmer h-3 w-52 rounded-full" />
          <div className="skeleton-shimmer h-11 w-72 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-96 max-w-full rounded-full" />
        </div>
      </div>
      <CollectionResultsSkeleton />
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading product specification sheet"
      className="mx-auto w-full max-w-7xl px-4 pt-8 pb-16 sm:px-8 sm:pt-12 lg:pb-20"
    >
      <div className="skeleton-shimmer h-8 w-40 rounded-full" />

      <div className="mt-7 grid gap-10 lg:grid-cols-12 lg:items-start lg:gap-12">
        {/* Left Gallery Column */}
        <div className="space-y-3 lg:col-span-6">
          <div className="skeleton-shimmer h-12 w-full rounded-2xl border border-foreground/15" />
          <div className="skeleton-shimmer aspect-[4/4.2] w-full rounded-3xl border border-foreground/15" />
          <div className="flex gap-2.5">
            <div className="skeleton-shimmer h-18 w-18 rounded-xl" />
            <div className="skeleton-shimmer h-18 w-18 rounded-xl" />
          </div>
        </div>

        {/* Right Specs & Rx Configurator Column */}
        <div className="lg:col-span-6">
          <div className="space-y-5 rounded-3xl border border-foreground/15 bg-background/95 p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <div className="skeleton-shimmer h-4 w-28 rounded-full" />
              <div className="skeleton-shimmer h-5 w-36 rounded-full" />
            </div>

            <div className="skeleton-shimmer h-10 w-4/5 rounded-xl" />
            <div className="skeleton-shimmer h-6 w-40 rounded-lg" />
            <div className="skeleton-shimmer h-16 w-full rounded-xl" />

            {/* 6-box Spec Grid */}
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="skeleton-shimmer h-14 rounded-xl border border-foreground/10"
                />
              ))}
            </div>

            {/* Lens Package Configurator Skeleton */}
            <div className="space-y-2.5 rounded-2xl border border-foreground/15 bg-[#DCE2EC]/90 p-5">
              <div className="skeleton-shimmer h-4 w-56 rounded-full" />
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className="skeleton-shimmer h-14 w-full rounded-xl"
                />
              ))}
              <div className="skeleton-shimmer-dark mt-3 h-18 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AboutPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading atelier story">
      <section className="border-b border-foreground/15">
        <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-14 sm:px-6 lg:py-20">
          <div className="skeleton-shimmer h-3 w-48 rounded-full" />
          <div className="skeleton-shimmer h-11 w-80 rounded-xl" />
          <div className="skeleton-shimmer h-24 max-w-2xl rounded-r-2xl border-l-[3px] border-[#5AA2E6]" />
        </div>
      </section>

      <section className="border-b border-foreground/15 bg-[#DCE2EC]/90">
        <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-14 sm:px-6 lg:py-20">
          <div className="skeleton-shimmer h-3 w-44 rounded-full" />
          <div className="skeleton-shimmer h-9 w-64 rounded-xl" />
          <div className="grid gap-6 md:grid-cols-2">
            <div className="skeleton-shimmer h-36 rounded-2xl" />
            <div className="skeleton-shimmer-dark h-36 rounded-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading admin studio"
      className="space-y-6 py-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton-shimmer h-8 w-56 rounded-xl" />
          <div className="skeleton-shimmer h-4 w-72 rounded-full" />
        </div>
        <div className="skeleton-shimmer h-10 w-36 rounded-full" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div
            key={idx}
            className="skeleton-shimmer h-24 rounded-2xl border border-foreground/10"
          />
        ))}
      </div>

      <div className="space-y-3 rounded-2xl border border-foreground/10 bg-surface p-5">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="skeleton-shimmer h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

