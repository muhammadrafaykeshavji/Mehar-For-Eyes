"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import { tryBuildWhatsAppLink } from "@/lib/whatsapp";

interface WhatsAppFloatProps {
  whatsappNumber?: string;
  shopName?: string;
}

interface CatalogItem {
  slug: string;
  name: string;
  brand: string;
  category: string;
  gender: string;
  frame_shape: string;
  material: string;
  color: string;
  price?: number | null;
  images?: { path: string }[];
}

interface ChatMessage {
  id: string;
  sender: "ai" | "user";
  text: string;
  recommendations?: {
    slug: string;
    name: string;
    shape: string;
    price: string;
    image: string;
  }[];
}

const QUICK_PROMPTS = [
  "Best frames for a Round face?",
  "Best frames for a Square face?",
  "Which lens for computer / Blue-Cut?",
  "Show me Sunglasses & Aviators",
  "How does Virtual Face Try-On work?",
];

const FALLBACK_CATALOG: CatalogItem[] = [
  {
    slug: "aether-aviator-24k-gold",
    name: "Aether Aviator 24K Gold",
    brand: "Mehar Atelier",
    category: "sunglasses",
    gender: "unisex",
    frame_shape: "aviator",
    material: "Japanese Beta-Titanium",
    color: "Champagne Gold",
    price: 6800,
    images: [{ path: "/images/products/aviator-gold.jpg" }],
  },
  {
    slug: "kyoto-round-havana-tortoise",
    name: "Kyoto Round Havana Tortoise",
    brand: "Mehar Studio",
    category: "eyeglasses",
    gender: "unisex",
    frame_shape: "round",
    material: "Mazzucchelli Acetate",
    color: "Amber Tortoise",
    price: 5200,
    images: [{ path: "/images/products/round-tortoise.jpg" }],
  },
  {
    slug: "architect-rectangle-obsidian",
    name: "Architect Rectangle Obsidian",
    brand: "Mehar Optical",
    category: "eyeglasses",
    gender: "men",
    frame_shape: "rectangle",
    material: "High-Density Acetate",
    color: "Obsidian Black",
    price: 4900,
    images: [{ path: "/images/products/rectangle-black.jpg" }],
  },
  {
    slug: "velours-cat-eye-bordeaux",
    name: "Velours Cat-Eye Bordeaux",
    brand: "Mehar Atelier",
    category: "eyeglasses",
    gender: "women",
    frame_shape: "cat-eye",
    material: "Italian Acetate",
    color: "Deep Burgundy",
    price: 5600,
    images: [{ path: "/images/products/cat-eye-burgundy.jpg" }],
  },
  {
    slug: "nomad-wayfarer-stealth-matte",
    name: "Nomad Wayfarer Stealth Matte",
    brand: "Mehar Sun",
    category: "sunglasses",
    gender: "unisex",
    frame_shape: "wayfarer",
    material: "Cellulose Acetate",
    color: "Matte Charcoal",
    price: 5900,
    images: [{ path: "/images/products/wayfarer-matte.jpg" }],
  },
  {
    slug: "lumiere-oval-sterling-silver",
    name: "Lumiere Oval Sterling Silver",
    brand: "Mehar Studio",
    category: "eyeglasses",
    gender: "unisex",
    frame_shape: "oval",
    material: "Surgical Stainless Steel",
    color: "Sterling Silver",
    price: 4600,
    images: [{ path: "/images/products/oval-silver.jpg" }],
  },
];

export default function WhatsAppFloat({
  whatsappNumber,
  shopName = "Mehar for Eyes",
}: WhatsAppFloatProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [catalog, setCatalog] = useState<CatalogItem[]>(FALLBACK_CATALOG);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: `Welcome to ${shopName} Optical Concierge! I can recommend frames for your face shape, explain prescription & Blue-Cut lenses, or help you try frames on your face. What are you looking for today?`,
    },
  ]);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const isProductDetail =
    pathname.startsWith("/collection/") && pathname !== "/collection";

  useEffect(() => {
    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"
    ).replace(/\/$/, "");
    fetch(`${apiBase}/api/products`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data && Array.isArray(data.items) && data.items.length > 0) {
          setCatalog(data.items);
        }
      })
      .catch(() => {
        // Keep fallback catalog
      });
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  if (pathname.startsWith("/admin")) return null;

  const whatsappHref = tryBuildWhatsAppLink(
    `Hi ${shopName} — I'd like help choosing frames or lenses.`,
    whatsappNumber,
  );

  function toCards(items: CatalogItem[]) {
    return items.slice(0, 2).map((item) => ({
      slug: item.slug,
      name: item.name,
      shape: item.frame_shape,
      price: item.price ? `PKR ${item.price.toLocaleString()}` : "Inquire",
      image: item.images?.[0]?.path || "/images/products/aviator-gold.jpg",
    }));
  }

  function generateOpticalReply(query: string): {
    text: string;
    recommendations?: ChatMessage["recommendations"];
  } {
    const q = query.toLowerCase();

    if (q.includes("round")) {
      const picks = catalog.filter((p) =>
        ["rectangle", "wayfarer", "cat-eye"].includes(p.frame_shape),
      );
      return {
        text: "For a Round face shape, angular frames like Rectangle, Wayfarer, or upswept Cat-Eye add crisp definition and lengthen your profile. Here are our top studio picks:",
        recommendations: toCards(picks.length ? picks : catalog),
      };
    }

    if (q.includes("square") || q.includes("angular")) {
      const picks = catalog.filter((p) =>
        ["round", "oval", "aviator"].includes(p.frame_shape),
      );
      return {
        text: "For a Square or angular jawline, curved rims like Round Havana Tortoise, Sterling Oval, or Teardrop Aviators soften strong angles beautifully:",
        recommendations: toCards(picks.length ? picks : catalog),
      };
    }

    if (q.includes("oval") || q.includes("heart")) {
      const picks = catalog.filter((p) =>
        ["aviator", "cat-eye", "wayfarer"].includes(p.frame_shape),
      );
      return {
        text: "Oval and Heart face shapes balance wonderfully with our Cat-Eye, Aviator, and sculpted Wayfarer silhouettes:",
        recommendations: toCards(picks.length ? picks : catalog),
      };
    }

    if (
      q.includes("lens") ||
      q.includes("blue") ||
      q.includes("computer") ||
      q.includes("screen") ||
      q.includes("power") ||
      q.includes("rx") ||
      q.includes("prescription")
    ) {
      return {
        text: "Our in-house optical lab mounts 4 primary lens grades:\n• Sapphire Blue-Cut AR (+Rs 2,500): Blocks 415–455nm digital screen glare.\n• Photochromic Transitions® (+Rs 4,500): Clear indoors, darkens in sunlight.\n• 1.67 Hi-Index Ultra-Thin (+Rs 5,500): Up to 40% thinner for strong powers.\n• Digital Progressive (+Rs 8,500): Distance + reading with zero visible line.\nYou can select any lens directly on the product page!",
      };
    }

    if (q.includes("sun") || q.includes("aviator") || q.includes("shade")) {
      const picks = catalog.filter(
        (p) => p.category === "sunglasses" || p.frame_shape === "aviator",
      );
      return {
        text: "Our sun collection features UV400 polarized lenses and can also be fitted with your custom prescription:",
        recommendations: toCards(picks.length ? picks : catalog),
      };
    }

    if (
      q.includes("try") ||
      q.includes("face") ||
      q.includes("camera") ||
      q.includes("mirror") ||
      q.includes("zoom")
    ) {
      return {
        text: "Every frame page includes our interactive '🪞 Try On Face' Virtual Mirror! Open any frame, click 'Try On Face', and you can use your Live Webcam, upload a selfie, or test lens coatings directly on the studio model. You can also use both + / − Step Zoom and the 2.6× Optical Magnifying Loupe!",
        recommendations: toCards(catalog.slice(0, 2)),
      };
    }

    if (q.includes("price") || q.includes("cost") || q.includes("cheap")) {
      return {
        text: "Our frames start from PKR 3,500 (Kids TR90 Flex) up to PKR 6,800 (24K Beta-Titanium Aviators), and custom Blue-Cut prescription lenses start at PKR 2,500. Here are two popular bestsellers:",
        recommendations: toCards(catalog.slice(1, 3)),
      };
    }

    return {
      text: "I can help you pick frames by face shape (Round, Square, Oval, Heart), compare Blue-Cut vs Photochromic lenses, or show our featured collection. Check out these flagship frames or ask me anything:",
      recommendations: toCards(catalog.slice(0, 2)),
    };
  }

  function sendQuery(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const reply = generateOpticalReply(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        id: `u-${prev.length + 1}`,
        sender: "user",
        text: trimmed,
      },
      {
        id: `a-${prev.length + 2}`,
        sender: "ai",
        text: reply.text,
        recommendations: reply.recommendations,
      },
    ]);
    setInput("");
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendQuery(input);
  }

  return (
    <div
      className={`fixed right-3 z-50 flex flex-col items-end gap-2.5 sm:right-5 ${
        isProductDetail ? "bottom-20 lg:bottom-5" : "bottom-3 sm:bottom-5"
      }`}
    >
      {open ? (
        <div className="flex h-[min(510px,calc(100dvh-5.5rem))] w-[calc(100vw-1.5rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-[#5AA2E6]/50 bg-[#F4F2EC] text-[#15181E] shadow-[0_28px_70px_rgba(15,18,24,0.4)]">
          {/* Chatbot Header */}
          <div className="flex items-center justify-between border-b border-white/10 bg-[#15181E] px-4 py-3 sm:py-3.5 text-[#F4F2EC]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-[#5AA2E6] bg-[#5AA2E6]/20 font-display text-xs sm:text-sm font-bold text-[#99CEFF] italic">
                AI
              </span>
              <div>
                <p className="font-display text-sm sm:text-base leading-none font-bold">
                  Mehar Optical AI Guide
                </p>
                <p className="mt-1 font-mono text-[8.5px] sm:text-[9px] tracking-[0.16em] text-[#82C3FF] uppercase">
                  ● ONLINE · FRAME &amp; RX STYLIST
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close AI Chatbot"
              className="rounded-full bg-white/10 px-2 py-0.5 sm:px-2.5 sm:py-1 font-mono text-xs text-white/80 hover:bg-white/20 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Messages Stream */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-[#F4F2EC] p-3 sm:p-4"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[88%] rounded-2xl px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                    msg.sender === "user"
                      ? "bg-[#15181E] text-[#F4F2EC]"
                      : "border border-[#15181E]/12 bg-[#DCE2EC] text-[#15181E]"
                  }`}
                >
                  {msg.text}
                </div>

                {/* Recommended Frame Cards inside Chat */}
                {msg.recommendations && msg.recommendations.length > 0 ? (
                  <div className="mt-2 grid w-full grid-cols-2 gap-2">
                    {msg.recommendations.map((rec) => (
                      <Link
                        key={rec.slug}
                        href={`/collection/${rec.slug}`}
                        onClick={() => setOpen(false)}
                        className="group overflow-hidden rounded-xl border border-[#15181E]/15 bg-white p-2 shadow-sm transition hover:border-[#2B6CB0]"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="h-16 sm:h-20 w-full rounded-lg object-cover"
                        />
                        <p className="mt-1 truncate font-display text-[11px] sm:text-xs font-bold text-[#15181E] group-hover:text-[#2B6CB0]">
                          {rec.name}
                        </p>
                        <div className="mt-0.5 flex items-center justify-between font-mono text-[9px]">
                          <span className="font-bold text-[#2B6CB0]">
                            {rec.price}
                          </span>
                          <span className="text-[#15181E]/60 uppercase">
                            Try →
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}

            {/* Quick Prompt Chips */}
            <div className="pt-1">
              <p className="mb-1.5 font-mono text-[8.5px] sm:text-[9px] font-bold tracking-wider text-[#15181E]/55 uppercase">
                SUGGESTED QUESTIONS:
              </p>
              <div className="flex flex-wrap gap-1">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => sendQuery(prompt)}
                    className="rounded-full border border-[#2B6CB0]/35 bg-[#D8ECFF]/75 px-2.5 py-0.5 sm:py-1 font-mono text-[9px] sm:text-[9.5px] font-semibold text-[#1E4E8C] transition hover:bg-[#5AA2E6] hover:text-[#15181E]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Input Form + Direct WhatsApp Handoff */}
          <div className="border-t border-[#15181E]/12 bg-[#DCE2EC] p-2.5 sm:p-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about face shape, lenses, prices…"
                className="flex-1 rounded-full border border-[#15181E]/20 bg-[#F4F2EC] px-3.5 py-1.5 sm:py-2 text-xs text-[#15181E] placeholder:text-[#15181E]/45 focus:border-[#2B6CB0] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-[#15181E] px-3.5 sm:px-4 py-1.5 sm:py-2 font-mono text-[9.5px] sm:text-[10px] font-bold tracking-wider text-[#99CEFF] uppercase transition hover:bg-[#2B6CB0] hover:text-white"
              >
                Send
              </button>
            </form>

            {whatsappHref ? (
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-full border border-[#15181E]/15 bg-[#F4F2EC] py-1.5 font-mono text-[9px] sm:text-[9.5px] font-bold tracking-wider text-[#15181E] uppercase transition hover:border-[#2B6CB0] hover:text-[#2B6CB0]"
              >
                <span>Or Chat Live with Optician on WhatsApp ↗</span>
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Floating Launcher Pill */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open Optical AI Stylist & Help Guide"
        className="group flex items-center gap-2 rounded-full border-2 border-[#5AA2E6] bg-[#15181E] px-3.5 py-2.5 sm:px-4 sm:py-3 text-[#F4F2EC] shadow-[0_14px_34px_rgba(21,24,30,0.35)] transition-all hover:-translate-y-0.5 hover:border-[#7EC0FF]"
      >
        <span className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-[#5AA2E6] font-mono text-[10px] sm:text-[11px] font-bold text-[#15181E]">
          AI
        </span>
        <div className="text-left">
          <span className="block font-mono text-[9.5px] sm:text-[10.5px] font-bold tracking-[0.12em] sm:tracking-[0.14em] text-[#F4F2EC] uppercase">
            {open ? "Close Guide" : "Optical AI Stylist"}
          </span>
          <span className="block font-mono text-[8px] sm:text-[8.5px] tracking-wider text-[#99CEFF] uppercase">
            Fit · Lenses · WhatsApp
          </span>
        </div>
      </button>
    </div>
  );
}
