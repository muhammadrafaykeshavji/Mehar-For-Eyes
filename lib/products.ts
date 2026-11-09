import { cacheLife, cacheTag } from "next/cache";

export type ProductImageItem = {
  id: string;
  path: string;
  thumbPath?: string;
  alt: string;
  position: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  frameShape: string;
  material: string;
  color: string;
  price?: number;
  images: string[];
  imageItems?: ProductImageItem[];
  description: string;
  inStock: boolean;
  featured: boolean;
  sortOrder?: number;
};

export type ProductFilters = {
  category?: string;
  gender?: string;
  brand?: string;
  frameShape?: string;
  material?: string;
  color?: string;
  inStock?: boolean;
  featured?: boolean;
  q?: string;
};

export type ProductFilterOptions = {
  categories: string[];
  genders: string[];
  frameShapes: string[];
};

const DEFAULT_CATEGORIES = ["eyeglasses", "sunglasses"];
const DEFAULT_GENDERS = ["kids", "men", "unisex", "women"];
const DEFAULT_FRAME_SHAPES = [
  "aviator",
  "cat-eye",
  "oval",
  "rectangle",
  "round",
  "wayfarer",
];

function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function matchesClientSideExtras(
  product: Product,
  filters: ProductFilters,
): boolean {
  if (filters.brand && product.brand !== filters.brand) return false;
  if (filters.material && product.material !== filters.material) return false;
  if (filters.color && product.color !== filters.color) return false;
  return true;
}

/**
 * Fetches products from the Go API server-side with 60s revalidation.
 */
export async function getProducts(
  filters: ProductFilters = {},
): Promise<Product[]> {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("products");

  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.gender) params.set("gender", filters.gender);
  if (filters.frameShape) params.set("frame_shape", filters.frameShape);
  if (typeof filters.featured === "boolean") {
    params.set("featured", String(filters.featured));
  }
  if (typeof filters.inStock === "boolean") {
    params.set("in_stock", String(filters.inStock));
  }
  if (filters.q) params.set("q", filters.q);
  params.set("limit", "100");

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/api/products?${params.toString()}`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: Product[] };
    const list = Array.isArray(data.products) ? data.products : [];
    return list.filter((p) => matchesClientSideExtras(p, filters));
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("products", `product-${slug}`);

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/api/products/${encodeURIComponent(slug)}`,
    );
    if (!res.ok) return null;
    return (await res.json()) as Product;
  } catch {
    return null;
  }
}

export async function getFeatured(): Promise<Product[]> {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("products");

  return getProducts({ featured: true });
}

export async function getRelated(slug: string): Promise<Product[]> {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("products", `product-${slug}`);

  try {
    const res = await fetch(
      `${getApiBaseUrl()}/api/products/${encodeURIComponent(slug)}/related`,
    );
    if (!res.ok) return [];
    const data = (await res.json()) as { products?: Product[] };
    return Array.isArray(data.products) ? data.products.slice(0, 4) : [];
  } catch {
    return [];
  }
}

export async function getFilterOptions(): Promise<ProductFilterOptions> {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("products");

  const all = await getProducts({});
  if (all.length === 0) {
    return {
      categories: DEFAULT_CATEGORIES,
      genders: DEFAULT_GENDERS,
      frameShapes: DEFAULT_FRAME_SHAPES,
    };
  }

  return {
    categories: uniqueSorted([
      ...DEFAULT_CATEGORIES,
      ...all.map((p) => p.category),
    ]),
    genders: uniqueSorted([...DEFAULT_GENDERS, ...all.map((p) => p.gender)]),
    frameShapes: uniqueSorted([
      ...DEFAULT_FRAME_SHAPES,
      ...all.map((p) => p.frameShape),
    ]),
  };
}
