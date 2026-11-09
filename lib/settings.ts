import { cacheLife, cacheTag } from "next/cache";
import {
  defaultSiteSettings,
  mapApiToSiteSettings,
  type ApiSiteSettingsPayload,
  type SiteSettings,
} from "@/lib/settings-types";

export type { ApiSiteSettingsPayload, SiteSettings } from "@/lib/settings-types";

function getApiBaseUrl(): string {
  return (
    process.env.API_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8080"
  ).replace(/\/$/, "");
}

export async function getSiteSettings(): Promise<SiteSettings> {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("settings");

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/settings`);
    if (!res.ok) {
      return defaultSiteSettings;
    }
    const raw = (await res.json()) as ApiSiteSettingsPayload;
    return mapApiToSiteSettings(raw);
  } catch {
    return defaultSiteSettings;
  }
}
