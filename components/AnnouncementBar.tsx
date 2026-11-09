import type { SiteSettings } from "@/lib/settings-types";

export function AnnouncementBar({ settings }: { settings: SiteSettings }) {
  if (!settings.announcementEnabled || !settings.announcementText.trim()) {
    return null;
  }

  const items = [
    settings.announcementText,
    "BESPOKE IN-HOUSE LENS EDGING",
    "JAPANESE BETA-TITANIUM & MAZZUCCHELLI ACETATE",
    "1.67 SAPPHIRE AR & DIGITAL BLUE-CUT OPTICS",
    "DIRECT WHATSAPP RX CONSULTATION · LAHORE FLAGSHIP",
  ];

  return (
    <div className="relative z-40 overflow-hidden border-b border-[#5AA2E6]/30 bg-[#15181E] py-2.5 text-[#F4F2EC]">
      <div className="animate-marquee flex items-center gap-10 whitespace-nowrap font-mono text-[10.5px] font-medium tracking-[0.2em] uppercase">
        {[...items, ...items, ...items].map((text, idx) => (
          <span key={idx} className="inline-flex items-center gap-10">
            <span>{text}</span>
            <span className="text-[#7EC0FF]">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
