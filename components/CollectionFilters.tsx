"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { ProductFilterOptions, ProductFilters } from "@/lib/products";
import {
  buildCollectionHref,
  formatFilterLabel,
  hasActiveFilters,
} from "@/lib/collection-url";

type CollectionFiltersProps = {
  options: ProductFilterOptions;
  active: ProductFilters;
};

type FilterGroupProps = {
  label: string;
  values: string[];
  activeValue?: string;
  activeFilters: ProductFilters;
  paramKey: "category" | "gender" | "frameShape";
  onNavigate?: () => void;
};

function FilterGroup({
  label,
  values,
  activeValue,
  activeFilters,
  paramKey,
  onNavigate,
}: FilterGroupProps) {
  return (
    <div>
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-foreground/60">
        {label}
      </p>
      <ul className="mt-2.5 flex flex-wrap gap-x-3 gap-y-2">
        {values.map((value) => {
          const isActive = activeValue === value;
          const href = buildCollectionHref(activeFilters, {
            [paramKey]: value,
          });

          return (
            <li key={value}>
              <Link
                href={href}
                prefetch={true}
                onClick={onNavigate}
                aria-current={isActive ? "true" : undefined}
                className={`inline-block rounded-full px-3 py-1 font-mono text-xs transition-colors duration-200 ${
                  isActive
                    ? "border border-[#2B6CB0] bg-[#15181E] font-bold text-[#99CEFF] shadow-xs"
                    : "border border-foreground/15 bg-background text-foreground/75 hover:border-accent hover:text-accent"
                }`}
              >
                {formatFilterLabel(value)}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterSections({
  options,
  active,
  onNavigate,
}: CollectionFiltersProps & { onNavigate?: () => void }) {
  return (
    <div className="space-y-6">
      <FilterGroup
        label="Category"
        values={options.categories}
        activeValue={active.category}
        activeFilters={active}
        paramKey="category"
        onNavigate={onNavigate}
      />
      <FilterGroup
        label="Department"
        values={options.genders}
        activeValue={active.gender}
        activeFilters={active}
        paramKey="gender"
        onNavigate={onNavigate}
      />
      <FilterGroup
        label="Frame Shape"
        values={options.frameShapes}
        activeValue={active.frameShape}
        activeFilters={active}
        paramKey="frameShape"
        onNavigate={onNavigate}
      />
    </div>
  );
}

export function CollectionFilters({ options, active }: CollectionFiltersProps) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const filtersActive = hasActiveFilters(active);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      {/* Desktop filter row */}
      <div className="hidden border-b border-foreground/10 pb-6 md:block">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <FilterSections options={options} active={active} />
          {filtersActive ? (
            <Link
              href="/collection"
              prefetch={true}
              className="shrink-0 rounded-full bg-[#15181E] px-3.5 py-1.5 font-mono text-[10px] font-bold text-[#F4F2EC] uppercase transition hover:bg-accent"
            >
              Clear filters ✕
            </Link>
          ) : null}
        </div>
      </div>

      {/* Mobile filter trigger */}
      <div className="flex items-center justify-between gap-3 border-b border-foreground/10 pb-4 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex min-h-10 items-center gap-2 rounded-full border border-foreground/20 bg-background px-4 py-2 font-mono text-xs font-semibold text-foreground uppercase tracking-wider transition hover:border-accent hover:text-accent"
        >
          <span>⚡ Filter Archive</span>
          {filtersActive ? (
            <span className="h-2 w-2 rounded-full bg-[#2B6CB0]" />
          ) : null}
        </button>
        {filtersActive ? (
          <Link
            href="/collection"
            prefetch={true}
            className="font-mono text-xs text-accent font-bold uppercase tracking-wider hover:underline"
          >
            Clear All
          </Link>
        ) : null}
      </div>

      {/* Mobile slide-up panel */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Filter collection"
            className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-[#5AA2E6]/40 bg-[#F4F2EC] px-5 pb-8 pt-5 text-[#15181E] shadow-2xl"
          >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 border-b border-[#15181E]/15 pb-3">
              <p className="font-display text-xl font-bold text-[#15181E]">
                Filter Archive
              </p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-[#15181E]/20 bg-background px-3 py-1 font-mono text-xs font-bold text-[#15181E] hover:bg-[#15181E] hover:text-white"
              >
                ✕ Close
              </button>
            </div>
            <div className="mx-auto mt-6 w-full max-w-6xl">
              <FilterSections
                options={options}
                active={active}
                onNavigate={() => setOpen(false)}
              />
              {filtersActive ? (
                <Link
                  href="/collection"
                  prefetch={true}
                  onClick={() => setOpen(false)}
                  className="mt-6 inline-block rounded-full bg-[#15181E] px-5 py-2 font-mono text-xs font-bold text-[#F4F2EC] uppercase"
                >
                  Clear All Filters
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
