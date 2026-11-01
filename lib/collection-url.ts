import type { ProductFilters } from "@/lib/products";

export type CollectionSearchParams = {
  category?: string | string[];
  gender?: string | string[];
  frameShape?: string | string[];
  [key: string]: string | string[] | undefined;
};

const GENDER_AS_CATEGORY = new Set(["men", "women", "kids", "unisex"]);

function first(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value || undefined;
}

/**
 * Map URL search params to ProductFilters.
 * Home tiles may use ?category=men|women|kids — those map to gender.
 */
export function filtersFromSearchParams(
  searchParams: CollectionSearchParams,
): ProductFilters {
  let category = first(searchParams.category);
  let gender = first(searchParams.gender);
  const frameShape = first(searchParams.frameShape);

  if (category && GENDER_AS_CATEGORY.has(category) && !gender) {
    gender = category;
    category = undefined;
  }

  return {
    ...(category ? { category } : {}),
    ...(gender ? { gender } : {}),
    ...(frameShape ? { frameShape } : {}),
  };
}

export function hasActiveFilters(filters: ProductFilters): boolean {
  return Boolean(filters.category || filters.gender || filters.frameShape);
}

export function buildCollectionHref(
  filters: ProductFilters,
  patch: Partial<ProductFilters> = {},
): string {
  const next: ProductFilters = { ...filters, ...patch };

  for (const key of Object.keys(patch) as (keyof ProductFilters)[]) {
    const value = patch[key];
    if (value === undefined || value === "" || value === filters[key]) {
      delete next[key];
    }
  }

  const params = new URLSearchParams();
  if (next.category) params.set("category", String(next.category));
  if (next.gender) params.set("gender", String(next.gender));
  if (next.frameShape) params.set("frameShape", String(next.frameShape));

  const query = params.toString();
  return query ? `/collection?${query}` : "/collection";
}

export function formatFilterLabel(value: string): string {
  return value
    .split(/[-_\s]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
