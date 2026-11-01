import { products, type Product } from "@/data/products";

export type ProductFilters = {
  category?: string;
  gender?: string;
  brand?: string;
  frameShape?: string;
  material?: string;
  color?: string;
  inStock?: boolean;
  featured?: boolean;
};

export type ProductFilterOptions = {
  categories: string[];
  genders: string[];
  frameShapes: string[];
};

function matchesFilters(product: Product, filters: ProductFilters = {}): boolean {
  if (filters.category && product.category !== filters.category) return false;
  if (filters.gender && product.gender !== filters.gender) return false;
  if (filters.brand && product.brand !== filters.brand) return false;
  if (filters.frameShape && product.frameShape !== filters.frameShape) return false;
  if (filters.material && product.material !== filters.material) return false;
  if (filters.color && product.color !== filters.color) return false;
  if (typeof filters.inStock === "boolean" && product.inStock !== filters.inStock) {
    return false;
  }
  if (typeof filters.featured === "boolean" && product.featured !== filters.featured) {
    return false;
  }
  return true;
}

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

/**
 * Product access layer. Reads from /data/products.ts for now.
 * Swap the body to call the Go API later without changing components.
 */
export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  "use cache";
  return products.filter((product) => matchesFilters(product, filters));
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  "use cache";
  return products.find((product) => product.slug === slug) ?? null;
}

export async function getFeatured(): Promise<Product[]> {
  "use cache";
  return products.filter((product) => product.featured);
}

export async function getRelated(slug: string): Promise<Product[]> {
  "use cache";
  const current = products.find((product) => product.slug === slug);
  if (!current) return [];

  return products
    .filter(
      (product) =>
        product.slug !== slug &&
        (product.category === current.category ||
          product.brand === current.brand ||
          product.frameShape === current.frameShape),
    )
    .slice(0, 4);
}

export async function getFilterOptions(): Promise<ProductFilterOptions> {
  "use cache";
  return {
    categories: uniqueSorted(products.map((product) => product.category)),
    genders: uniqueSorted(products.map((product) => product.gender)),
    frameShapes: uniqueSorted(products.map((product) => product.frameShape)),
  };
}
