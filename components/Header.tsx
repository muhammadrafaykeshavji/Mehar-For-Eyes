import Link from "next/link";

const navItems = [
  { href: "/collection", label: "Collection" },
  { href: "/about", label: "About" },
  { href: "/about#visit", label: "Visit" },
] as const;

export function Header() {
  return (
    <header className="border-b border-foreground/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-foreground transition-opacity duration-200 hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:text-2xl"
        >
          Mehar for Eyes
        </Link>

        <nav aria-label="Primary">
          <ul className="flex items-center gap-5 sm:gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-foreground/80 transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
