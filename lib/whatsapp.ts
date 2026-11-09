/**
 * Build a WhatsApp click-to-chat link.
 * Number must be digits only in Pakistan format:
 * 92XXXXXXXXXX (no + and no leading 0).
 */
export function buildWhatsAppLink(
  message: string,
  overrideNumber?: string,
): string {
  const number = (
    overrideNumber ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    ""
  ).trim();

  if (!number) {
    throw new Error(
      "WhatsApp number is not set. Configure it in /admin/settings or .env.local.",
    );
  }

  if (!/^92\d{10}$/.test(number)) {
    throw new Error(
      "WhatsApp number must look like 92XXXXXXXXXX (no + or leading 0).",
    );
  }

  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/** Shop phone for tel: links. Uses overrideNumber, NEXT_PUBLIC_PHONE_NUMBER, else the WhatsApp number. */
export function getShopTelHref(overrideNumber?: string): string | null {
  const raw = (
    overrideNumber ??
    process.env.NEXT_PUBLIC_PHONE_NUMBER ??
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ??
    ""
  ).trim();

  if (!raw || !/^92\d{10}$/.test(raw)) {
    return null;
  }

  return `tel:+${raw}`;
}

export function tryBuildWhatsAppLink(
  message: string,
  overrideNumber?: string,
): string | null {
  try {
    return buildWhatsAppLink(message, overrideNumber);
  } catch {
    return null;
  }
}
