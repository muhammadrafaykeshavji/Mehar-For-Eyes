import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/products";
import { siteConfig } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getProducts({});
  const now = new Date();
  const staticPages = ["", "/collection", "/about"].map((path) => ({
    url: siteConfig.url + path,
    lastModified: now,
  }));
  const productPages = products.map((p) => ({
    url: siteConfig.url + "/collection/" + p.slug,
    lastModified: now,
  }));
  return [...staticPages, ...productPages];
}

