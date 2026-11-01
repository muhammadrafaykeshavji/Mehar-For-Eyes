import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        Page not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75">
        That page is not here. Head back to the collection or home.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/collection"
          className="inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 py-2.5 text-sm text-background transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Browse collection
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center border border-foreground/15 px-5 py-2.5 text-sm text-foreground transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Home
        </Link>
      </div>
    </div>
  );
}
