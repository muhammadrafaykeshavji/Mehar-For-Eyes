const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export const siteConfig = {
  name: "Mehar for Eyes",
  description: "TODO — One or two sentences about the shop, its location and what it sells.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  whatsappNumber,
  phone: whatsappNumber ? "+" + whatsappNumber : "",
  address: {
    street: "TODO — Street address",
    locality: "TODO — City",
    region: "TODO — Province",
    country: "PK",
  },
  hours: "TODO — Day–Day, 00:00–00:00",
};

