import Link from "next/link";
import { CategoryTile } from "@/components/CategoryTile";
import { FadeIn } from "@/components/FadeIn";
import { FeaturedFrameCard } from "@/components/FeaturedFrameCard";
import { ProductImage } from "@/components/ProductImage";
import { getFeatured, getProducts } from "@/lib/products";
import {
  getShopTelHref,
  tryBuildWhatsAppLink,
} from "@/lib/whatsapp";

export default async function HomePage() {
  const [featuredAll, men, women, kids, sunglasses] = await Promise.all([
    getFeatured(),
    getProducts({ gender: "men" }),
    getProducts({ gender: "women" }),
    getProducts({ gender: "kids" }),
    getProducts({ category: "sunglasses" }),
  ]);

  const featured = featuredAll.slice(0, 4);
  const heroProduct = featured[0] ?? null;
  const heroImage = heroProduct?.images[0];

  const whatsappHref = tryBuildWhatsAppLink(
    "Hi Mehar for Eyes — I'd like to ask about frames.",
  );
  const telHref = getShopTelHref();

  const categories = [
    {
      label: "Men",
      href: "/collection?gender=men",
      product: men[0] ?? null,
    },
    {
      label: "Women",
      href: "/collection?gender=women",
      product: women[0] ?? null,
    },
    {
      label: "Kids",
      href: "/collection?gender=kids",
      product: kids[0] ?? null,
    },
    {
      label: "Sunglasses",
      href: "/collection?category=sunglasses",
      product: sunglasses[0] ?? null,
    },
  ] as const;

  return (
    <div>
      {/* 1. Hero */}
      <section className="border-b border-foreground/10">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-20">
          <div className="order-1">
            <h1 className="font-display text-[2.5rem] leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Mehar for Eyes
            </h1>
            <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75 sm:text-lg">
              Frames fitted in the shop. Message us when you are ready to order.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/collection"
                className="inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 py-2.5 text-sm text-background transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Browse collection
              </Link>
              {whatsappHref ? (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center border border-foreground/15 px-5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Order on WhatsApp
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center border border-foreground/10 px-5 py-2.5 text-sm text-foreground/45">
                  Order on WhatsApp
                </span>
              )}
            </div>
          </div>

          <div className="order-2 flex justify-center lg:justify-end">
            <div className="relative aspect-square w-[min(100%,20rem)] overflow-hidden rounded-full border border-foreground/10 bg-[#EDE6DC] sm:w-[min(100%,24rem)] lg:w-[min(100%,28rem)]">
              {heroImage && heroProduct ? (
                <ProductImage
                  src={heroImage}
                  alt={`${heroProduct.name} by ${heroProduct.brand}`}
                  fill
                  sizes="(max-width: 640px) 80vw, 28rem"
                  className="object-cover"
                  priority
                />
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Featured frames */}
      <section className="border-b border-foreground/10">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="mb-8 sm:mb-10">
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Featured frames
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Four from the current shelf.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-10">
            {featured.map((product, index) => (
              <li key={product.id}>
                <FeaturedFrameCard
                  product={product}
                  priority={index < 2}
                />
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* 3. Shop by category */}
      <section className="border-b border-foreground/10">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="mb-8 sm:mb-10">
            <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
              Shop by category
            </h2>
            <p className="mt-2 text-sm text-foreground/70">
              Jump straight to the shelf you need.
            </p>
          </div>

          <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            {categories.map((category) => (
              <li key={category.label}>
                <CategoryTile
                  label={category.label}
                  href={category.href}
                  product={category.product}
                />
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* 4. Why Mehar for Eyes */}
      <section className="border-b border-foreground/10">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Why Mehar for Eyes
          </h2>

          <ol className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <li>
              <p className="font-display text-3xl text-accent sm:text-4xl">
                01
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground/80">
                TODO — Replace with a real fact about how long the shop has
                served this area, or who fits the frames.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl text-accent sm:text-4xl">
                02
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground/80">
                TODO — Replace with a real fact about lens work, brands carried,
                or what a typical visit includes.
              </p>
            </li>
            <li>
              <p className="font-display text-3xl text-accent sm:text-4xl">
                03
              </p>
              <p className="mt-3 text-base leading-relaxed text-foreground/80">
                TODO — Replace with a real fact about WhatsApp orders, repair
                turnaround, or aftercare.
              </p>
            </li>
          </ol>
        </FadeIn>
      </section>

      {/* 5. Visit us */}
      <section>
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Visit us
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-sm font-medium text-foreground">Address</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/75">
                {/* TODO: Replace with the real shop address */}
                TODO — Street address, area, city
              </p>

              <p className="mt-6 text-sm font-medium text-foreground">Hours</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/75">
                {/* TODO: Replace with real opening hours */}
                TODO — Day–Day, 00:00–00:00
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {telHref ? (
                  <a
                    href={telHref}
                    className="inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 py-2.5 text-sm text-background transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    Call
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center border border-foreground/10 px-5 py-2.5 text-sm text-foreground/45">
                    Call
                  </span>
                )}
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center border border-foreground/15 px-5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    WhatsApp
                  </a>
                ) : (
                  <span className="inline-flex min-h-11 items-center border border-foreground/10 px-5 py-2.5 text-sm text-foreground/45">
                    WhatsApp
                  </span>
                )}
              </div>
            </div>

            <div
              className="flex min-h-56 items-center justify-center border border-foreground/10 bg-[#EDE6DC] sm:min-h-72"
              aria-label="Map placeholder"
            >
              <p className="px-4 text-center text-sm text-foreground/55">
                {/* TODO: Embed shop map */}
                TODO — Map goes here
              </p>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
