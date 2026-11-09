import { cacheLife, cacheTag } from "next/cache";
import Link from "next/link";
import { CategoryTile } from "@/components/CategoryTile";
import { FaceShapeFinder } from "@/components/FaceShapeFinder";
import { FadeIn } from "@/components/FadeIn";
import { FeaturedFrameCard } from "@/components/FeaturedFrameCard";
import { HeroShowcase } from "@/components/HeroShowcase";
import { LensGuideSection } from "@/components/LensGuideSection";
import { getFeatured, getProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/settings";
import { getShopTelHref, tryBuildWhatsAppLink } from "@/lib/whatsapp";

export default async function HomePage() {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("settings", "products");

  const [settings, featuredAll, allProducts, men, women, kids, sunglasses] =
    await Promise.all([
      getSiteSettings(),
      getFeatured(),
      getProducts(),
      getProducts({ gender: "men" }),
      getProducts({ gender: "women" }),
      getProducts({ gender: "kids" }),
      getProducts({ category: "sunglasses" }),
    ]);

  const featured =
    featuredAll.length > 0 ? featuredAll.slice(0, 4) : allProducts.slice(0, 4);

  const whatsappHref = tryBuildWhatsAppLink(
    `Hi ${settings.shopName} — I'd like to ask about frames.`,
    settings.whatsappNumber,
  );
  const telHref = getShopTelHref(
    settings.phoneNumber || settings.whatsappNumber,
  );

  const fullAddress = [
    settings.addressStreet,
    settings.addressCity,
    settings.addressRegion,
  ]
    .filter(Boolean)
    .join(", ");

  const categories = [
    {
      label: "Men",
      href: "/collection?gender=men",
      product: men[0] ?? allProducts[2] ?? null,
    },
    {
      label: "Women",
      href: "/collection?gender=women",
      product: women[0] ?? allProducts[3] ?? null,
    },
    {
      label: "Kids",
      href: "/collection?gender=kids",
      product: kids[0] ?? allProducts[1] ?? null,
    },
    {
      label: "Sunglasses",
      href: "/collection?category=sunglasses",
      product: sunglasses[0] ?? allProducts[0] ?? null,
    },
  ] as const;

  const whyPoints = [
    {
      num: "01",
      tag: "ANATOMICAL CALIBRATION",
      text: settings.whyPoint1,
    },
    {
      num: "02",
      tag: "IN-HOUSE DIGITAL LAB",
      text: settings.whyPoint2,
    },
    {
      num: "03",
      tag: "DIRECT WHATSAPP DISPENSING",
      text: settings.whyPoint3,
    },
  ];

  return (
    <div>
      {/* 1. Interactive Editorial Hero Stage */}
      <HeroShowcase
        settings={settings}
        featured={featured}
        whatsappHref={whatsappHref}
      />

      {/* 2. Curated Archive Featured Frames (Alternating Light Cool Grey Section) */}
      <section className="border-b border-foreground/15 bg-[#DCE2EC]/90 backdrop-blur-[2px]">
        <FadeIn className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
          <div className="mb-10 flex flex-col justify-between gap-4 border-b border-foreground/15 pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
                [01] CURATED ARCHIVE // SEASON EDIT
              </p>
              <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-5xl">
                {settings.featuredHeading}
              </h2>
              <p className="mt-2 text-sm text-foreground/70">
                {settings.featuredSubheading}
              </p>
            </div>
            <Link
              href="/collection"
              className="inline-flex items-center gap-2 border border-foreground/20 bg-surface px-5 py-2.5 font-mono text-xs font-semibold tracking-wider text-foreground uppercase transition hover:border-accent hover:text-accent"
              style={{ borderRadius: "var(--radius-btn)" }}
            >
              <span>Inspect Full Archive ({allProducts.length})</span>
              <span>→</span>
            </Link>
          </div>

          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((product, index) => (
              <li key={product.id}>
                <FeaturedFrameCard
                  product={product}
                  index={index}
                  priority={index < 2}
                />
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* 3. Interactive Face Shape & Anatomical Fit Studio */}
      {settings.showFaceShapeGuide ? (
        <FaceShapeFinder
          heading={settings.faceShapeHeading}
          subtitle={settings.faceShapeSubtitle}
          products={allProducts}
        />
      ) : null}

      {/* 4. Interactive Optical Lab & Coating Simulator */}
      <LensGuideSection settings={settings} />

      {/* 5. Department Lookbook Grid */}
      <section className="border-b border-foreground/15">
        <FadeIn className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
          <div className="mb-10 border-b border-foreground/15 pb-6">
            <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
              [04] DEPARTMENTS // SILHOUETTE INDEX
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-5xl">
              {settings.categoriesHeading}
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              {settings.categoriesSubheading}
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category, idx) => (
              <li key={category.label}>
                <CategoryTile
                  label={category.label}
                  href={category.href}
                  product={category.product}
                  index={idx}
                />
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* 6. The Mehar Optical Standard (Alternating Light Cool Grey Section) */}
      <section className="border-b border-foreground/15 bg-[#DCE2EC]/90 backdrop-blur-[2px]">
        <FadeIn className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
          <div className="mb-10 border-b border-foreground/15 pb-6">
            <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
              [05] CRAFT &amp; CLINICAL PRECISION
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-5xl">
              {settings.whyHeading}
            </h2>
          </div>

          <ol className="grid gap-6 lg:grid-cols-3">
            {whyPoints.map((point) => (
              <li
                key={point.num}
                className="relative flex flex-col justify-between border border-foreground/15 bg-surface p-7 sm:p-9"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                  <span className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                    {point.tag}
                  </span>
                  <span className="font-display text-3xl text-accent">
                    {point.num}
                  </span>
                </div>
                <p className="mt-6 text-base leading-relaxed text-foreground/85 sm:text-lg">
                  {point.text}
                </p>
              </li>
            ))}
          </ol>
        </FadeIn>
      </section>

      {/* 7. Flagship Studio Location & Appointment Desk */}
      <section>
        <FadeIn className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-8 lg:py-24">
          <div className="mb-10 border-b border-foreground/15 pb-6">
            <p className="font-mono text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
              [06] PRIVATE FITTING &amp; CONSULTATION
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-foreground sm:text-5xl">
              {settings.visitHeading}
            </h2>
          </div>

          <div className="grid gap-8 lg:grid-cols-12">
            <div
              className="flex flex-col justify-between border border-foreground/15 bg-surface p-7 sm:p-10 lg:col-span-5"
              style={{ borderRadius: "var(--radius-card)" }}
            >
              <div className="space-y-6">
                <div>
                  <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                    ATELIER ADDRESS
                  </p>
                  <p className="mt-2 font-display text-2xl text-foreground">
                    {fullAddress}
                  </p>
                </div>

                <div className="border-t border-foreground/10 pt-5">
                  <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                    DISPENSING HOURS
                  </p>
                  <p className="mt-2 font-mono text-sm text-foreground/80">
                    {settings.openingHours}
                  </p>
                </div>

                <div className="border-t border-foreground/10 pt-5">
                  <p className="font-mono text-[10px] font-semibold tracking-[0.2em] text-accent uppercase">
                    SERVICES AVAILABLE
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/70">
                    In-person bridge &amp; temple calibration · Computerized eye
                    testing · Same-day blue-cut &amp; prescription lens mounting.
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-3 border-t border-foreground/10 pt-6">
                {telHref ? (
                  <a
                    href={telHref}
                    className="inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-6 py-2.5 font-mono text-xs font-bold tracking-wider text-background uppercase transition hover:opacity-90"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    Call Optical Desk
                  </a>
                ) : null}
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center border border-foreground/20 bg-background px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-foreground uppercase transition hover:border-accent hover:text-accent"
                    style={{ borderRadius: "var(--radius-btn)" }}
                  >
                    WhatsApp Directions &amp; Rx ↗
                  </a>
                ) : null}
              </div>
            </div>

            {settings.mapEmbedUrl ? (
              <div
                className="min-h-80 overflow-hidden border border-foreground/15 bg-surface lg:col-span-7"
                style={{ borderRadius: "var(--radius-card)" }}
              >
                <iframe
                  src={settings.mapEmbedUrl}
                  title={`${settings.shopName} location map`}
                  className="h-full min-h-80 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div
                className="relative flex min-h-80 flex-col justify-between overflow-hidden border border-foreground/15 bg-surface p-8 lg:col-span-7"
                style={{ borderRadius: "var(--radius-card)" }}
                aria-label="Shop location note"
              >
                <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.2em] text-accent uppercase">
                  <span>COORDINATES // 31.5204° N, 74.3587° E</span>
                  <span>LAHORE, PK</span>
                </div>
                <div className="my-auto max-w-lg">
                  <p className="font-display text-2xl leading-snug text-foreground sm:text-3xl">
                    {settings.mapCaption || fullAddress}
                  </p>
                  <p className="mt-3 font-mono text-xs text-foreground/55 uppercase">
                    WALK-INS WELCOME · OR SEND YOUR PRESCRIPTION ON WHATSAPP FOR
                    DOORSTEP DISPATCH
                  </p>
                </div>
                <div className="border-t border-foreground/10 pt-4 font-mono text-[10px] tracking-widest text-foreground/45 uppercase">
                  {fullAddress}
                </div>
              </div>
            )}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
