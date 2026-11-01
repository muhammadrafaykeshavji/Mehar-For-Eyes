"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ProductImage } from "@/components/ProductImage";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  brand: string;
};

export function ProductGallery({
  images,
  productName,
  brand,
}: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const hasMultiple = images.length > 1;
  const active = images[index] ?? images[0];

  function goTo(next: number) {
    if (images.length === 0) return;
    const wrapped = (next + images.length) % images.length;
    setIndex(wrapped);
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || !hasMultiple) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 48) return;
    if (delta < 0) goTo(index + 1);
    else goTo(index - 1);
  }

  if (!active) {
    return (
      <div className="aspect-[4/5] border border-foreground/10 bg-[#EDE6DC]" />
    );
  }

  return (
    <div>
      <div
        className="relative aspect-[4/5] overflow-hidden border border-foreground/10 bg-[#EDE6DC] touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <ProductImage
          key={active}
          src={active}
          alt={`${productName} by ${brand}`}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {hasMultiple ? (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((src, i) => {
            const selected = i === index;
            return (
              <li key={`${src}-${i}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1} of ${images.length}`}
                  aria-current={selected ? "true" : undefined}
                  className={`relative block h-16 w-14 overflow-hidden border bg-[#EDE6DC] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:h-20 sm:w-[4.5rem] ${
                    selected
                      ? "border-accent"
                      : "border-foreground/10 hover:border-foreground/30"
                  }`}
                >
                  <ProductImage
                    src={src}
                    alt=""
                    fill
                    sizes="72px"
                    className="object-cover"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
