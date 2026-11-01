import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-display text-3xl tracking-tight text-foreground sm:text-4xl">
        Frame not found
      </h1>
      <p className="mt-4 max-w-md text-base leading-relaxed text-foreground/75">
        That frame is not in the collection, or the link is out of date.
      </p>
      <Link
        href="/collection"
        className="mt-8 inline-flex min-h-11 items-center justify-center border border-accent bg-accent px-5 py-2.5 text-sm text-background transition-opacity duration-200 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        Back to collection
      </Link>
    </div>
  );
}
