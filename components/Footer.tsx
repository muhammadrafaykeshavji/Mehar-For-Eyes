import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-foreground/10">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-lg text-foreground">Mehar for Eyes</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-foreground/70">
            Frames fitted in person. Orders over WhatsApp.
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Visit</p>
          <p className="mt-2 text-sm leading-relaxed text-foreground/70">
            {/* TODO: Replace with the real shop address */}
            TODO — Street address, area, city
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground/70">
            {/* TODO: Replace with real opening hours */}
            TODO — Hours: Day–Day, 00:00–00:00
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Explore</p>
          <ul className="mt-2 space-y-2 text-sm text-foreground/70">
            <li>
              <Link
                href="/collection"
                className="transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Collection
              </Link>
            </li>
            <li>
              <Link
                href="/about"
                className="transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                About
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
