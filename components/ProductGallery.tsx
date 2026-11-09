"use client";

import {
  type MouseEvent,
  type TouchEvent,
  useRef,
  useState,
} from "react";
import { ProductImage } from "@/components/ProductImage";
import { VirtualTryOnModal } from "@/components/VirtualTryOnModal";

type ProductGalleryProps = {
  images: string[];
  productName: string;
  brand: string;
  frameShape?: string;
  price?: number | null;
};

export function ProductGallery({
  images,
  productName,
  brand,
  frameShape = "Optical",
  price = null,
}: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const [magnifierEnabled, setMagnifierEnabled] = useState<boolean>(true);
  const [loupeVisible, setLoupeVisible] = useState<boolean>(false);
  const [loupePos, setLoupePos] = useState<{ x: number; y: number }>({
    x: 50,
    y: 50,
  });

  const [tryOnOpen, setTryOnOpen] = useState<boolean>(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  const safeImages =
    images.length > 0 ? images : ["/images/products/aviator-gold.jpg"];
  const hasMultiple = safeImages.length > 1;
  const active = safeImages[index] ?? safeImages[0];

  function goTo(next: number) {
    if (safeImages.length === 0) return;
    const wrapped = (next + safeImages.length) % safeImages.length;
    setIndex(wrapped);
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }

  function handleZoomIn() {
    setZoomLevel((prev) => Math.min(3, Number((prev + 0.5).toFixed(1))));
  }

  function handleZoomOut() {
    setZoomLevel((prev) => {
      const next = Math.max(1, Number((prev - 0.5).toFixed(1)));
      if (next === 1) setPan({ x: 0, y: 0 });
      return next;
    });
  }

  function handleResetZoom() {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
  }

  function onMouseDown(e: MouseEvent<HTMLDivElement>) {
    if (zoomLevel <= 1) return;
    setIsPanning(true);
    panStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  }

  function onMouseMove(e: MouseEvent<HTMLDivElement>) {
    if (stageRef.current) {
      const rect = stageRef.current.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * 100;
      const relY = ((e.clientY - rect.top) / rect.height) * 100;
      setLoupePos({
        x: Math.max(0, Math.min(100, relX)),
        y: Math.max(0, Math.min(100, relY)),
      });
    }

    if (!isPanning || zoomLevel <= 1) return;
    setPan({
      x: Math.max(-180, Math.min(180, e.clientX - panStart.current.x)),
      y: Math.max(-180, Math.min(180, e.clientY - panStart.current.y)),
    });
  }

  function onMouseUp() {
    setIsPanning(false);
  }

  function onTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  }

  function onTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null || !hasMultiple || zoomLevel > 1) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 48) return;
    if (delta < 0) goTo(index + 1);
    else goTo(index - 1);
  }

  return (
    <div>
      {/* Top Dual-Zoom & Virtual Try-On Control Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-foreground/15 bg-[#DCE2EC]/95 p-2.5 sm:px-3.5 sm:py-2.5 shadow-sm">
        {/* 1. Plus / Minus Step Zoom Controls */}
        <div className="flex items-center gap-1.5">
          <span className="mr-0.5 font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider text-foreground/70 uppercase">
            ZOOM:
          </span>
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            aria-label="Zoom out"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-foreground/20 bg-background font-mono text-sm font-bold text-foreground transition hover:border-accent disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-10 text-center font-mono text-[10.5px] sm:text-[11px] font-bold text-accent">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
            aria-label="Zoom in"
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-foreground/20 bg-background font-mono text-sm font-bold text-foreground transition hover:border-accent disabled:opacity-40"
          >
            +
          </button>
          {zoomLevel > 1 ? (
            <button
              type="button"
              onClick={handleResetZoom}
              className="ml-1 rounded-lg bg-[#15181E] px-2 py-1 font-mono text-[9px] font-semibold text-[#F4F2EC] uppercase"
            >
              Reset
            </button>
          ) : null}
        </div>

        {/* 2. Magnifying Loupe Toggle + Virtual Face Try-On */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setMagnifierEnabled((v) => !v)}
            className={`rounded-full border px-2.5 py-1 sm:px-3 font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase transition ${
              magnifierEnabled
                ? "border-[#5AA2E6] bg-[#D8ECFF] text-[#1E4E8C]"
                : "border-foreground/15 bg-background text-foreground/65"
            }`}
          >
            🔍 {magnifierEnabled ? "Loupe: ON" : "Loupe: OFF"}
          </button>

          <button
            type="button"
            onClick={() => setTryOnOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#5AA2E6] bg-[#15181E] px-3 py-1 sm:px-3.5 sm:py-1.5 font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider text-[#99CEFF] uppercase shadow-sm transition hover:bg-[#2B6CB0] hover:text-white"
          >
            <span>🪞 Try On Face</span>
          </button>
        </div>
      </div>

      {/* Main Frame Image Viewport */}
      <div
        ref={stageRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseEnter={() => setLoupeVisible(true)}
        onMouseLeave={() => {
          setLoupeVisible(false);
          setIsPanning(false);
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        className={`relative aspect-[4/4.2] select-none overflow-hidden rounded-3xl border border-foreground/15 bg-white shadow-[0_18px_45px_rgba(21,24,30,0.08)] ${
          zoomLevel > 1
            ? "cursor-grab active:cursor-grabbing"
            : magnifierEnabled
              ? "cursor-crosshair"
              : "cursor-default"
        }`}
      >
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
            transformOrigin: "center center",
          }}
          className="relative h-full w-full transition-transform duration-150 ease-out"
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

        {/* Interactive Optical Magnifying Glass Loupe (2.6x Magnification) */}
        {magnifierEnabled && loupeVisible && zoomLevel === 1 ? (
          <div
            style={{
              left: `${loupePos.x}%`,
              top: `${loupePos.y}%`,
              backgroundImage: `url("${active}")`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "260% 260%",
              backgroundPosition: `${loupePos.x}% ${loupePos.y}%`,
            }}
            className="pointer-events-none absolute z-20 hidden h-40 w-40 sm:h-44 sm:w-44 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#5AA2E6] bg-white shadow-[0_0_0_6px_rgba(21,24,30,0.22),0_20px_50px_rgba(0,0,0,0.35)] sm:block"
          >
            {/* Crosshair inside Magnifier */}
            <span className="absolute top-1/2 left-0 h-px w-full bg-[#5AA2E6]/35" />
            <span className="absolute top-0 left-1/2 h-full w-px bg-[#5AA2E6]/35" />
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#15181E]/90 px-2 py-0.5 font-mono text-[7.5px] sm:text-[8px] font-bold tracking-widest text-[#99CEFF]">
              2.6× OPTICAL LOUPE
            </span>
          </div>
        ) : null}

        {/* Bottom Floating Hint + Virtual Try-On Trigger */}
        <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 z-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          <span className="rounded-full border border-foreground/15 bg-background/90 px-3 py-1 text-center font-mono text-[9px] sm:text-[9.5px] font-semibold tracking-wider text-foreground/75 uppercase backdrop-blur-md">
            {zoomLevel > 1
              ? "Drag image to pan · Click Reset for 100%"
              : "Hover for 2.6× Loupe · Or use + / − Zoom"}
          </span>

          <button
            type="button"
            onClick={() => setTryOnOpen(true)}
            className="rounded-full border border-[#5AA2E6] bg-[#15181E]/95 px-3.5 py-1.5 text-center font-mono text-[9.5px] sm:text-[10px] font-bold tracking-widest text-[#99CEFF] uppercase shadow-lg backdrop-blur-md transition hover:scale-105 hover:bg-[#2B6CB0] hover:text-white"
          >
            🪞 Try Frame On Your Face →
          </button>
        </div>
      </div>

      {/* Multi-Image Thumbnails */}
      {hasMultiple ? (
        <ul className="mt-3 flex gap-2 sm:gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {safeImages.map((src, i) => {
            const selected = i === index;
            return (
              <li key={`${src}-${i}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Show image ${i + 1} of ${safeImages.length}`}
                  aria-current={selected ? "true" : undefined}
                  className={`relative block h-16 w-16 sm:h-18 sm:w-18 overflow-hidden rounded-xl border-2 bg-white transition-all ${
                    selected
                      ? "border-[#2B6CB0] shadow-md"
                      : "border-foreground/15 opacity-75 hover:opacity-100"
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

      {/* Virtual Face Try-On Studio Modal */}
      <VirtualTryOnModal
        open={tryOnOpen}
        onClose={() => setTryOnOpen(false)}
        productName={productName}
        brand={brand}
        frameShape={frameShape}
        frameImage={active}
        price={price}
      />
    </div>
  );
}
