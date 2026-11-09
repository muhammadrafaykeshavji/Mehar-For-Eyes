import { cacheLife, cacheTag } from "next/cache";
import type { Metadata } from "next";
import { FadeIn } from "@/components/FadeIn";
import { getSiteSettings } from "@/lib/settings";
import { getShopTelHref, tryBuildWhatsAppLink } from "@/lib/whatsapp";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: "About",
    description: settings.aboutIntro,
  };
}

export default async function AboutPage() {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("settings");

  const settings = await getSiteSettings();
  const whatsappHref = tryBuildWhatsAppLink(
    `Hi ${settings.shopName}, I have a question.`,
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

  return (
    <div>
      {/* 1. Intro (Off-White Printed Canvas) */}
      <section className="border-b border-foreground/15">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-accent uppercase">
            [01 // OPTICAL ATELIER HERITAGE]
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {settings.aboutHeading}
          </h1>
          <p className="mt-5 max-w-2xl rounded-r-2xl border-l-[3px] border-[#5AA2E6] bg-[#DCE2EC]/85 px-5 py-4 text-base leading-relaxed text-foreground/85">
            {settings.aboutIntro}
          </p>
        </FadeIn>
      </section>

      {/* 2. Our story (Alternating Light Cool Grey Section) */}
      <section className="border-b border-foreground/15 bg-[#DCE2EC]/90 backdrop-blur-[2px]">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-accent uppercase">
            [02 // CLINICAL PHILOSOPHY]
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {settings.storyHeading}
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <p className="rounded-2xl border border-foreground/15 bg-background/90 p-6 text-base leading-relaxed text-foreground/85">
              {settings.storyParagraph1}
            </p>
            <p className="rounded-2xl border border-[#5AA2E6]/35 bg-[#15181E] p-6 text-base leading-relaxed text-[#F4F2EC]">
              {settings.storyParagraph2}
            </p>
          </div>
        </FadeIn>
      </section>

      {/* 3. What we offer (Off-White Printed Canvas) */}
      <section className="border-b border-foreground/15">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-accent uppercase">
            [03 // DISPENSING CAPABILITIES]
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {settings.offerHeading}
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {settings.offerItems.map((item, idx) => (
              <li
                key={idx}
                className="rounded-2xl border border-foreground/15 bg-[#DCE2EC]/90 p-5 text-sm leading-relaxed text-foreground/85 shadow-sm backdrop-blur-md"
              >
                <span className="mb-2 block font-mono text-[10px] font-bold tracking-widest text-accent uppercase">
                  SERVICE 0{idx + 1}
                </span>
                {item}
              </li>
            ))}
          </ul>
        </FadeIn>
      </section>

      {/* 4. Visit us (Alternating Light Cool Grey Section) */}
      <section id="visit" className="bg-[#DCE2EC]/90 backdrop-blur-[2px]">
        <FadeIn className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
          <p className="font-mono text-[10.5px] font-semibold tracking-[0.22em] text-accent uppercase">
            [04 // LAHORE STUDIO LOCATION]
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {settings.visitHeading}
          </h2>

          <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:gap-12">
            <div className="rounded-2xl border border-foreground/15 bg-background/95 p-6 shadow-sm">
              <p className="font-mono text-xs font-bold tracking-wider text-accent uppercase">
                Address
              </p>
              <p className="mt-2 font-display text-xl text-foreground">
                {fullAddress}
              </p>

              <p className="mt-6 font-mono text-xs font-bold tracking-wider text-accent uppercase">
                Hours
              </p>
              <p className="mt-2 text-base leading-relaxed text-foreground/80">
                {settings.openingHours}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {telHref ? (
                  <a
                    href={telHref}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#15181E] bg-[#15181E] px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-[#F4F2EC] uppercase transition hover:opacity-90"
                  >
                    Call Optical Desk
                  </a>
                ) : null}
                {whatsappHref ? (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-foreground/20 bg-[#DCE2EC] px-6 py-2.5 font-mono text-xs font-semibold tracking-wider text-foreground uppercase transition hover:border-accent hover:text-accent"
                  >
                    WhatsApp Consultation ↗
                  </a>
                ) : null}
              </div>
            </div>

            {settings.mapEmbedUrl ? (
              <div className="min-h-56 overflow-hidden rounded-2xl border border-foreground/15 bg-background sm:min-h-72">
                <iframe
                  src={settings.mapEmbedUrl}
                  title={`${settings.shopName} location map`}
                  className="h-full min-h-56 w-full border-0 sm:min-h-72"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            ) : (
              <div
                className="flex min-h-56 items-center justify-center rounded-2xl border border-[#5AA2E6]/40 bg-[#15181E] p-6 text-[#F4F2EC] sm:min-h-72"
                aria-label="Shop location note"
              >
                <p className="px-6 text-center font-display text-xl leading-relaxed">
                  {settings.mapCaption || fullAddress}
                </p>
              </div>
            )}
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
