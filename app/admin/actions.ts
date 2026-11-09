"use server";

import { revalidatePath, revalidateTag } from "next/cache";

export async function revalidateCatalog(slug?: string) {
  revalidateTag("products", "max");
  revalidateTag("settings", "max");
  revalidatePath("/", "layout");
  revalidatePath("/");
  revalidatePath("/collection");
  revalidatePath("/about");
  if (slug) {
    revalidatePath(`/collection/${slug}`);
  }
}

export async function revalidateSettings() {
  await revalidateCatalog();
}
