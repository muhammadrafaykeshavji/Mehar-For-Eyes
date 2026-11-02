import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { siteConfig } from "@/lib/site";
import { tryBuildWhatsAppLink } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "About",
  description: "TODO — One sentence about Mehar for Eyes and what makes the shop worth visiting.",
};

export default function AboutPage() {
  const whatsappHref = tryBuildWhatsAppLink("Hi Mehar for Eyes, I have a question.");
  const telHref = siteConfig.phone ? `tel:${siteConfig.phone}` : null;

  return (
    <div>
      {/* 1. Intro */}
      <section className="border-b border-foreground/10">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
            About the shop
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-foreground/75">
            TODO — Two or three sentences about how long the shop has served the area and what it is known for.
          </p>
        </FadeIn>
      </section>

      {/* 2. Our story */}
      <section className="border-b border-foreground/10">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Our story
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-foreground/75">
            TODO — First paragraph of the shop history. Replace with a real story about how and when the shop started.
          </p>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-foreground/75">
            TODO — Second paragraph of the shop history. Replace with the real story about the team, values, or growth.
          </p>
        </FadeIn>
      </section>

      {/* 3. What we offer */}
      <section className="border-b border-foreground/10">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            What we offer
          </h2>
          <ul className="mt-6 space-y-3 text-base leading-relaxed text-foreground/75">
            <li>TODO — Eyeglass frames: range of styles, brands, and materials available in-store.</li>
            <li>TODO — Prescription lenses: single vision, bifocal, and progressive options.</li>
            <li>TODO — Sunglasses: prescription and non-prescription, men and women.</li>
            <li>TODO — Kids eyewear: durable frames and lenses fitted for children.</li>
          </ul>
        </FadeIn>
      </section>

      {/* 4. Visit us */}
      <section>
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <h2 className="font-display text-2xl tracking-tight text-foreground sm:text-3xl">
            Visit us
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className="text-sm font-medium text-foreground">Address</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/75">
                {siteConfig.address.street},{" "}
                {siteConfig.address.locality},{" "}
                {siteConfig.address.region}
              </p>

              <p className="mt-6 text-sm font-medium text-foreground">Hours</p>
              <p className="mt-2 text-base leading-relaxed text-foreground/75">
                {siteConfig.hours}
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
