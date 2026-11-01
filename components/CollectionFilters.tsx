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
      <p className="text-xs font-medium uppercase tracking-[0.12em] text-foreground/50">
        {label}
      </p>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
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
                className={`text-sm transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                  isActive
                    ? "text-accent underline decoration-accent underline-offset-4"
                    : "text-foreground/70 hover:text-accent"
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
    <div className="space-y-8">
      <FilterGroup
        label="Category"
        values={options.categories}
        activeValue={active.category}
        activeFilters={active}
        paramKey="category"
        onNavigate={onNavigate}
      />
      <FilterGroup
        label="Gender"
        values={options.genders}
        activeValue={active.gender}
        activeFilters={active}
        paramKey="gender"
        onNavigate={onNavigate}
      />
      <FilterGroup
        label="Frame shape"
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
      <div className="hidden border-b border-foreground/10 pb-8 md:block">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <FilterSections options={options} active={active} />
          {filtersActive ? (
            <Link
              href="/collection"
              prefetch={true}
              className="shrink-0 text-sm text-foreground/60 transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Clear filters
            </Link>
          ) : null}
        </div>
      </div>

      {/* Mobile filter trigger */}
      <div className="flex items-center justify-between gap-4 border-b border-foreground/10 pb-5 md:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls={panelId}
          className="inline-flex min-h-11 items-center border border-foreground/15 px-4 text-sm text-foreground transition-colors duration-200 hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Filter{filtersActive ? " · on" : ""}
        </button>
        {filtersActive ? (
          <Link
            href="/collection"
            prefetch={true}
            className="text-sm text-foreground/60 transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            Clear
          </Link>
        ) : null}
      </div>

      {/* Mobile slide-up panel */}
      {open ? (
        <div className="fixed inset-0 z-50 md:hidden" role="presentation">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setOpen(false)}
          />
          <div
            id={panelId}
            role="dialog"
            aria-modal="true"
            aria-label="Filter collection"
            className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto border-t border-foreground/10 bg-background px-4 pb-8 pt-4"
          >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4">
              <p className="font-display text-xl text-foreground">Filter</p>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setOpen(false)}
                className="min-h-11 px-2 text-sm text-foreground/70 transition-colors duration-200 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                Close
              </button>
            </div>
            <div className="mx-auto mt-8 w-full max-w-6xl">
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
                  className="mt-8 inline-block text-sm text-accent underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                >
                  Clear filters
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
