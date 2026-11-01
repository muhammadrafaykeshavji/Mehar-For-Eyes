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
  description: string;
  inStock: boolean;
  featured: boolean;
};

/**
 * TODO: Replace every product below with real Mehar for Eyes inventory.
 * Image files should live under /public/placeholders until real product photos are ready.
 */
export const products: Product[] = [
  {
    id: "todo-1",
    slug: "todo-aviator-gold",
    name: "TODO — Aviator Gold",
    brand: "TODO Brand",
    category: "sunglasses",
    gender: "unisex",
    frameShape: "aviator",
    material: "metal",
    color: "gold",
    price: undefined,
    images: [
      "/placeholders/todo-aviator-gold.svg",
      "/placeholders/todo-wayfarer-matte.svg",
    ],
    description:
      "TODO: Replace with the real frame description, lens options, and fit notes.",
    inStock: true,
    featured: true,
  },
  {
    id: "todo-2",
    slug: "todo-round-tortoise",
    name: "TODO — Round Tortoise",
    brand: "TODO Brand",
    category: "eyeglasses",
    gender: "unisex",
    frameShape: "round",
    material: "acetate",
    color: "tortoise",
    price: undefined,
    images: [
      "/placeholders/todo-round-tortoise.svg",
      "/placeholders/todo-oval-silver.svg",
    ],
    description:
      "TODO: Replace with the real frame description, lens options, and fit notes.",
    inStock: true,
    featured: true,
  },
  {
    id: "todo-3",
    slug: "todo-rectangle-black",
    name: "TODO — Rectangle Black",
    brand: "TODO Brand",
    category: "eyeglasses",
    gender: "men",
    frameShape: "rectangle",
    material: "acetate",
    color: "black",
    price: undefined,
    images: ["/placeholders/todo-rectangle-black.svg"],
    description:
      "TODO: Replace with the real frame description, lens options, and fit notes.",
    inStock: true,
    featured: true,
  },
  {
    id: "todo-4",
    slug: "todo-cat-eye-burgundy",
    name: "TODO — Cat-Eye Burgundy",
    brand: "TODO Brand",
    category: "eyeglasses",
    gender: "women",
    frameShape: "cat-eye",
    material: "acetate",
    color: "burgundy",
    price: undefined,
    images: ["/placeholders/todo-cat-eye-burgundy.svg"],
    description:
      "TODO: Replace with the real frame description, lens options, and fit notes.",
    inStock: true,
    featured: true,
  },
  {
    id: "todo-5",
    slug: "todo-wayfarer-matte",
    name: "TODO — Wayfarer Matte",
    brand: "TODO Brand",
    category: "sunglasses",
    gender: "unisex",
    frameShape: "wayfarer",
    material: "acetate",
    color: "matte black",
    price: undefined,
    images: ["/placeholders/todo-wayfarer-matte.svg"],
    description:
      "TODO: Replace with the real frame description, lens options, and fit notes.",
    inStock: false,
    featured: false,
  },
  {
    id: "todo-6",
    slug: "todo-kids-oval-silver",
    name: "TODO — Kids Oval Silver",
    brand: "TODO Brand",
    category: "eyeglasses",
    gender: "kids",
    frameShape: "oval",
    material: "metal",
    color: "silver",
    price: undefined,
    images: ["/placeholders/todo-oval-silver.svg"],
    description:
      "TODO: Replace with the real frame description, lens options, and fit notes.",
    inStock: true,
    featured: false,
  },
];
