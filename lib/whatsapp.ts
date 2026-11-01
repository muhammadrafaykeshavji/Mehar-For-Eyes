/**
 * Build a WhatsApp click-to-chat link.
 * NEXT_PUBLIC_WHATSAPP_NUMBER must be digits only in Pakistan format:
 * 92XXXXXXXXXX (no + and no leading 0).
 */
export function buildWhatsAppLink(message: string): string {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!number) {
    throw new Error(
      "NEXT_PUBLIC_WHATSAPP_NUMBER is not set. Copy .env.example to .env.local and add the shop number.",
    );
  }

  if (!/^92\d{10}$/.test(number)) {
    throw new Error(
      "NEXT_PUBLIC_WHATSAPP_NUMBER must look like 92XXXXXXXXXX (no + or leading 0).",
    );
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Shop phone for tel: links. Uses NEXT_PUBLIC_PHONE_NUMBER, else the WhatsApp number. */
export function getShopTelHref(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_PHONE_NUMBER ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  if (!raw || !/^92\d{10}$/.test(raw)) {
    return null;
  }

  return `tel:+${raw}`;
}

export function tryBuildWhatsAppLink(message: string): string | null {
  try {
    return buildWhatsAppLink(message);
  } catch {
    return null;
  }
}
