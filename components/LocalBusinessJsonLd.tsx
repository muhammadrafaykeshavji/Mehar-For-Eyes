import { cacheLife, cacheTag } from "next/cache";
import { getSiteSettings } from "@/lib/settings";
import { siteConfig } from "@/lib/site";

export default async function LocalBusinessJsonLd() {
  "use cache";
  cacheLife({ revalidate: 60, stale: 60, expire: 3600 });
  cacheTag("settings");

  const settings = await getSiteSettings();
  const phone = settings.phoneNumber
    ? `+${settings.phoneNumber}`
    : siteConfig.phone;

  const data = {
    "@context": "https://schema.org",
    "@type": "Optician",
    name: settings.shopName,
    description: settings.metaDescription,
    url: siteConfig.url,
    telephone: phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.addressStreet,
      addressLocality: settings.addressCity,
      addressRegion: settings.addressRegion,
      addressCountry: settings.addressCountry,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
