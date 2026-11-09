"use client";

import Link from "next/link";
import { useState } from "react";
import { ProductImage } from "@/components/ProductImage";
import type { Product } from "@/lib/products";

interface FaceShapeSpec {
  id: "round" | "square" | "oval" | "heart";
  code: string;
  label: string;
  ratio: string;
  tagline: string;
  advice: string;
  recommendedShapes: Array<Product["frameShape"]>;
  recommendedLabels: string[];
}

const FACE_SHAPES: FaceShapeSpec[] = [
  {
    id: "round",
    code: "GEO // 01",
    label: "Round Profile",
    ratio: "1 : 1.05 Cheek-to-Length",
    tagline: "Soft radial curves & equal facial width-to-height proportions",
    advice:
      "Angular geometry introduces architectural structure. Choose crisp Rectangular, bold Wayfarer, or upswept Cat-Eye silhouettes to define soft cheek lines.",
    recommendedShapes: ["rectangle", "wayfarer", "cat-eye"],
    recommendedLabels: ["Rectangle", "Wayfarer", "Cat-Eye"],
  },
  {
    id: "square",
    code: "GEO // 02",
    label: "Square / Angular",
    ratio: "1 : 1.12 Jawline Ratio",
    tagline: "Pronounced mandibular angle & broad forehead line",
    advice:
      "Curved optical rims counter-balance strong angles. Opt for Round Havana acetate, minimalist Oval wireframes, or double-bridge Teardrop Aviators.",
    recommendedShapes: ["round", "oval", "aviator"],
    recommendedLabels: ["Round", "Oval", "Aviator"],
  },
  {
    id: "oval",
    code: "GEO // 03",
    label: "Oval Profile",
    ratio: "1 : 1.45 Golden Proportion",
    tagline: "Balanced zygomatic arch & gently tapered chin",
    advice:
      "The benchmark optical profile. Bold Wayfarers, geometric Aviators, and sculpted Rectangles preserve your natural anatomical symmetry.",
    recommendedShapes: ["wayfarer", "aviator", "rectangle", "round"],
    recommendedLabels: ["Wayfarer", "Aviator", "Rectangle"],
  },
  {
    id: "heart",
    code: "GEO // 04",
    label: "Heart / Diamond",
    ratio: "1 : 1.32 Tapered Chin",
    tagline: "High cheekbones tapering to a narrow jawline",
    advice:
      "Frames with upswept browlines or delicate lower rims harmonize facial width. Try Bordeaux Cat-Eye, Sterling Oval, or Titanium Aviators.",
    recommendedShapes: ["cat-eye", "oval", "aviator"],
    recommendedLabels: ["Cat-Eye", "Oval", "Aviator"],
  },
];

function FaceGeometrySvg({ shapeId }: { shapeId: FaceShapeSpec["id"] }) {
  return (
    <svg
      viewBox="0 0 180 180"
      className="h-24 w-24 sm:h-28 sm:w-28 shrink-0 text-accent"
      fill="none"
      aria-hidden="true"
    >
      {/* Blueprint Grid Circles & Axis */}
      <circle
        cx="90"
        cy="90"
        r="76"
        stroke="currentColor"
        strokeOpacity="0.2"
        strokeDasharray="3 3"
      />
      <line
        x1="14"
        y1="90"
        x2="166"
        y2="90"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      <line
        x1="90"
        y1="14"
        x2="90"
        y2="166"
        stroke="currentColor"
        strokeOpacity="0.25"
      />

      {/* Face Contour Path */}
      {shapeId === "round" ? (
        <circle
          cx="90"
          cy="90"
          r="52"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : null}
      {shapeId === "square" ? (
        <rect
          x="42"
          y="38"
          width="96"
          height="104"
          rx="14"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : null}
      {shapeId === "oval" ? (
        <ellipse
          cx="90"
          cy="90"
          rx="44"
          ry="60"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : null}
      {shapeId === "heart" ? (
        <path
          d="M90 148 C52 122 38 86 44 56 C48 38 72 36 90 54 C108 36 132 38 136 56 C142 86 128 122 90 148 Z"
          stroke="currentColor"
          strokeWidth="2"
        />
      ) : null}

      {/* Recommended Eyewear Silhouette Overlay */}
      <rect
        x="50"
        y="68"
        width="34"
        height="22"
        rx={shapeId === "square" ? "11" : "3"}
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <rect
        x="96"
        y="68"
        width="34"
        height="22"
        rx={shapeId === "square" ? "11" : "3"}
        fill="currentColor"
        fillOpacity="0.18"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <line
        x1="84"
        y1="77"
        x2="96"
        y2="77"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  );
}

interface FaceShapeFinderProps {
  heading: string;
  subtitle: string;
  products: Product[];
}

export function FaceShapeFinder({
  heading,
  subtitle,
  products,
}: FaceShapeFinderProps) {
  const [selectedId, setSelectedId] = useState<FaceShapeSpec["id"]>("round");
  const active =
    FACE_SHAPES.find((s) => s.id === selectedId) ?? FACE_SHAPES[0];

  const matchingProducts = products
    .filter((p) => active.recommendedShapes.includes(p.frameShape))
    .slice(0, 3);

  const displayProducts =
    matchingProducts.length > 0 ? matchingProducts : products.slice(0, 3);

  return (
    <section
      id="face-shape-guide"
      className="border-b border-foreground/15 bg-transparent"
    >
      <div className="mx-auto w-full max-w-7xl px-3 py-12 sm:px-8 sm:py-20 lg:py-24">
        <div className="flex flex-col justify-between gap-5 border-b border-foreground/15 pb-6 sm:pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] text-accent uppercase">
              [02] ANATOMICAL FIT &amp; GEOMETRY STUDIO
            </p>
            <h2 className="mt-2.5 font-display text-2xl sm:text-4xl lg:text-5xl tracking-tight text-foreground">
              {heading}
            </h2>
            <p className="mt-2 max-w-xl text-xs sm:text-sm text-foreground/70">
              {subtitle}
            </p>
          </div>

          {/* Face shape selector tabs */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            {FACE_SHAPES.map((shape) => {
              const isSelected = shape.id === selectedId;
              return (
                <button
                  key={shape.id}
                  type="button"
                  onClick={() => setSelectedId(shape.id)}
                  className={`px-3 py-2 sm:px-4 sm:py-2.5 font-mono text-[11px] sm:text-xs font-semibold tracking-wider uppercase transition-all duration-200 text-center ${
                    isSelected
                      ? "border border-accent bg-accent text-background shadow-md"
                      : "border border-foreground/15 bg-background text-foreground/75 hover:border-accent hover:text-accent"
                  }`}
                  style={{ borderRadius: "var(--radius-btn)" }}
                >
                  {shape.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-8 sm:mt-10 grid gap-6 lg:grid-cols-12">
          {/* Left Anatomical Blueprint Card */}
          <div
            className="flex flex-col justify-between border border-foreground/15 bg-surface p-5 sm:p-8 lg:col-span-5"
            style={{ borderRadius: "var(--radius-card)" }}
          >
            <div>
              <div className="flex items-center justify-between border-b border-foreground/10 pb-3 font-mono text-[9.5px] sm:text-[10px] tracking-[0.18em] text-foreground/55 uppercase">
                <span className="text-accent">{active.code}</span>
                <span>{active.ratio}</span>
              </div>

              <div className="mt-5 sm:mt-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <FaceGeometrySvg shapeId={active.id} />
                <div>
                  <h3 className="font-display text-xl sm:text-2xl leading-snug text-foreground">
                    {active.tagline}
                  </h3>
                  <p className="mt-2 text-xs sm:text-sm leading-relaxed text-foreground/75">
                    {active.advice}
                  </p>
                </div>
              </div>

              <div className="mt-6 sm:mt-7 border-t border-foreground/10 pt-4 sm:pt-5">
                <p className="font-mono text-[9.5px] sm:text-[10px] tracking-[0.18em] text-foreground/55 uppercase">
                  RECOMMENDED FRAME SILHOUETTES
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {active.recommendedLabels.map((lbl, idx) => (
                    <Link
                      key={lbl}
                      href={`/collection?shape=${active.recommendedShapes[idx] ?? "round"}`}
                      className="inline-flex items-center gap-1.5 sm:gap-2 border border-accent/40 bg-background px-3 py-1 sm:px-3.5 sm:py-1.5 font-mono text-[10px] sm:text-[11px] font-medium text-foreground uppercase transition-colors hover:border-accent hover:text-accent"
                      style={{ borderRadius: "var(--radius-btn)" }}
                    >
                      <span className="text-accent">✦</span>
                      <span>{lbl}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 border-t border-foreground/10 pt-4">
              <Link
                href={`/collection?shape=${active.recommendedShapes[0]}`}
                className="inline-flex items-center gap-2 font-mono text-xs font-bold tracking-wider text-accent uppercase transition-opacity hover:opacity-80"
              >
                <span>
                  Explore all {active.recommendedLabels[0]} frames in Archive
                </span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Right matching frames grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:col-span-7">
            {displayProducts.map((product, idx) => {
              const img =
                product.images[0] || "/images/products/aviator-gold.jpg";
              return (
                <Link
                  key={product.id}
                  href={`/collection/${product.slug}`}
                  className="group flex flex-col justify-between overflow-hidden border border-foreground/15 bg-surface transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl"
                  style={{ borderRadius: "var(--radius-card)" }}
                >
                  <div>
                    <div className="flex items-center justify-between border-b border-foreground/10 px-3.5 py-2 font-mono text-[9px] tracking-[0.18em] text-foreground/55 uppercase">
                      <span className="text-accent">MATCH // 0{idx + 1}</span>
                      <span>{product.frameShape}</span>
                    </div>

                    <div className="relative aspect-[4/3.6] overflow-hidden bg-background">
                      <ProductImage
                        src={img}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 90vw, 260px"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="p-3.5 sm:p-4">
                      <p className="font-mono text-[9.5px] sm:text-[10px] tracking-widest text-foreground/55 uppercase">
                        {product.brand}
                      </p>
                      <h4 className="mt-1 font-display text-base sm:text-lg text-foreground group-hover:text-accent">
                        {product.name}
                      </h4>
                      <p className="mt-0.5 line-clamp-1 text-xs text-foreground/60">
                        {product.material}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-foreground/10 px-3.5 sm:px-4 py-2.5 sm:py-3 font-mono text-[10.5px] sm:text-[11px]">
                    <span className="font-bold text-foreground">
                      {product.price
                        ? `PKR ${product.price.toLocaleString()}`
                        : "INQUIRE"}
                    </span>
                    <span className="text-accent">INSPECT →</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
