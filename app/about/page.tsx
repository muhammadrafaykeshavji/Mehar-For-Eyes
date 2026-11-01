export const metadata = {
  title: "About",
  description:
    "Mehar for Eyes — optical frames fitted in person, ordered on WhatsApp.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        About
      </h1>
      <p className="mt-5 text-base leading-relaxed text-foreground/75">
        Mehar for Eyes is an established optical shop. We help you try frames
        in person, get the fit right, and follow up on WhatsApp when you are
        ready to order.
      </p>
      <p className="mt-4 text-base leading-relaxed text-foreground/75">
        This site is a showcase of what is currently available — not a
        checkout. When you find a frame, message the shop and we will take it
        from there.
      </p>

      <section id="visit" className="mt-14 scroll-mt-24 border-t border-foreground/10 pt-10">
        <h2 className="font-display text-2xl text-foreground">Visit</h2>
        <p className="mt-4 text-base leading-relaxed text-foreground/75">
          {/* TODO: Replace with the real shop address */}
          TODO — Street address, area, city
        </p>
        <p className="mt-3 text-base leading-relaxed text-foreground/75">
          {/* TODO: Replace with real opening hours */}
          TODO — Hours: Day–Day, 00:00–00:00
        </p>
      </section>
    </div>
  );
}
