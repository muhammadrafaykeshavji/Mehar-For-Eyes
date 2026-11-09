export type ThemePresetId =
  | "modern_glass"
  | "dark_luxury"
  | "editorial_atelier"
  | "emerald_bento"
  | "custom";

export type HeroLayoutId = "bento" | "cinematic" | "split";
export type CardStyleId = "rounded" | "sharp" | "glass";
export type AdminThemeId = "dark_slate" | "light_saas";
export type BgPrintId =
  | "toile"
  | "editorial"
  | "terrazzo"
  | "astrolabe"
  | "shibori"
  | "none";

export interface LensOption {
  title: string;
  badge: string;
  description: string;
  priceHint: string;
}

export interface SiteSettings {
  shopName: string;
  tagline: string;
  metaDescription: string;
  whatsappNumber: string;
  phoneNumber: string;
  addressStreet: string;
  addressCity: string;
  addressRegion: string;
  addressCountry: string;
  openingHours: string;
  mapEmbedUrl: string;
  mapCaption: string;
  heroTitle: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  featuredHeading: string;
  featuredSubheading: string;
  categoriesHeading: string;
  categoriesSubheading: string;
  whyHeading: string;
  whyPoint1: string;
  whyPoint2: string;
  whyPoint3: string;
  visitHeading: string;
  collectionHeading: string;
  collectionSubtitle: string;
  aboutHeading: string;
  aboutIntro: string;
  storyHeading: string;
  storyParagraph1: string;
  storyParagraph2: string;
  offerHeading: string;
  offerItems: string[];
  themePreset: ThemePresetId;
  heroLayout: HeroLayoutId;
  cardStyle: CardStyleId;
  adminTheme: AdminThemeId;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  heroImageUrl: string;
  heroBadge: string;
  bgPrint: BgPrintId;
  printIntensity: number;
  announcementEnabled: boolean;
  announcementText: string;
  showFaceShapeGuide: boolean;
  faceShapeHeading: string;
  faceShapeSubtitle: string;
  showLensGuide: boolean;
  lensGuideHeading: string;
  lensGuideSubtitle: string;
  lensOptions: LensOption[];
  updatedAt?: string;
}

export interface ApiLensOptionPayload {
  title: string;
  badge: string;
  description: string;
  price_hint: string;
}

export interface ApiSiteSettingsPayload {
  shop_name: string;
  tagline: string;
  meta_description: string;
  whatsapp_number: string;
  phone_number: string;
  address_street: string;
  address_city: string;
  address_region: string;
  address_country: string;
  opening_hours: string;
  map_embed_url: string;
  map_caption: string;
  hero_title: string;
  hero_subtitle: string;
  hero_primary_cta: string;
  hero_secondary_cta: string;
  featured_heading: string;
  featured_subheading: string;
  categories_heading: string;
  categories_subheading: string;
  why_heading: string;
  why_point_1: string;
  why_point_2: string;
  why_point_3: string;
  visit_heading: string;
  collection_heading: string;
  collection_subtitle: string;
  about_heading: string;
  about_intro: string;
  story_heading: string;
  story_paragraph_1: string;
  story_paragraph_2: string;
  offer_heading: string;
  offer_items: string[];
  theme_preset?: string;
  hero_layout?: string;
  card_style?: string;
  admin_theme?: string;
  bg_color?: string;
  surface_color?: string;
  text_color?: string;
  accent_color?: string;
  hero_image_url?: string;
  hero_badge?: string;
  announcement_enabled?: boolean;
  announcement_text?: string;
  show_face_shape_guide?: boolean;
  face_shape_heading?: string;
  face_shape_subtitle?: string;
  show_lens_guide?: boolean;
  lens_guide_heading?: string;
  lens_guide_subtitle?: string;
  lens_options?: ApiLensOptionPayload[];
  updated_at?: string;
}

export interface ThemePresetDefinition {
  id: Exclude<ThemePresetId, "custom">;
  name: string;
  vibe: string;
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  cardStyle: CardStyleId;
  heroLayout: HeroLayoutId;
}

export const THEME_PRESETS: ThemePresetDefinition[] = [
  {
    id: "modern_glass",
    name: "Glacier & Charcoal Atelier",
    vibe: "Warm cotton off-white (#F4F2EC), cool slate grey, obsidian charcoal & glacier light blue",
    bgColor: "#F4F2EC",
    surfaceColor: "#DFE4EC",
    textColor: "#15181E",
    accentColor: "#2B6CB0",
    cardStyle: "rounded",
    heroLayout: "bento",
  },
  {
    id: "dark_luxury",
    name: "Noir & 24K Champagne",
    vibe: "Gentle Monster & Jacques Marie Mage inspired obsidian & brushed gold",
    bgColor: "#0E0D0B",
    surfaceColor: "#171512",
    textColor: "#F4EFE6",
    accentColor: "#C89D54",
    cardStyle: "glass",
    heroLayout: "bento",
  },
  {
    id: "editorial_atelier",
    name: "Atelier Travertine",
    vibe: "Warm gallery stone, architectural hairlines & Cognac Tortoise",
    bgColor: "#F4EFE6",
    surfaceColor: "#E8E0D2",
    textColor: "#141210",
    accentColor: "#8C4A27",
    cardStyle: "sharp",
    heroLayout: "split",
  },
  {
    id: "emerald_bento",
    name: "Botanical Heritage",
    vibe: "Deep British Racing Green, warm parchment & antique brass",
    bgColor: "#0D1914",
    surfaceColor: "#14261E",
    textColor: "#F2EFE9",
    accentColor: "#D4AF37",
    cardStyle: "rounded",
    heroLayout: "cinematic",
  },
];

const envWhatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "923000000000";

export const defaultLensOptions: LensOption[] = [
  {
    title: "Single-Vision & Digital Blue-Cut",
    badge: "Most Popular",
    description:
      "Crystal-clear distance or reading lenses with blue-light filtering and anti-glare coating for 8+ hour screen comfort.",
    priceHint: "From Rs. 2,500",
  },
  {
    title: "Photochromic (Transitions® Style)",
    badge: "Indoor + Outdoor",
    description:
      "Intelligently darkens in outdoor UV sunlight within seconds and returns to 100% clear indoors.",
    priceHint: "From Rs. 4,500",
  },
  {
    title: "Progressive No-Line Multifocal",
    badge: "All-in-One",
    description:
      "Seamless distance, intermediate dashboard, and near reading vision in one lens with zero visible dividing lines.",
    priceHint: "From Rs. 8,500",
  },
  {
    title: "Hi-Index Ultra-Thin (1.67 / 1.74)",
    badge: "High Power",
    description:
      "Up to 45% thinner and lighter lenses for stronger prescriptions so your eyes never look magnified.",
    priceHint: "From Rs. 6,000",
  },
];

export const defaultSiteSettings: SiteSettings = {
  shopName: "Mehar for Eyes",
  tagline: "Precision Prescription Optics & Hand-Picked Frames",
  metaDescription:
    "Eyeglass frames, prescription lenses, sunglasses, and kids eyewear at Mehar for Eyes. Fitted in person or ordered over WhatsApp.",
  whatsappNumber: envWhatsapp,
  phoneNumber: envWhatsapp,
  addressStreet: "Main Commercial Area",
  addressCity: "Lahore",
  addressRegion: "Punjab",
  addressCountry: "PK",
  openingHours: "Mon–Sat, 11:00 AM – 9:00 PM",
  mapEmbedUrl: "",
  mapCaption:
    "Visit our shop for in-person frame fitting and prescription lens consultation.",
  heroTitle: "Eyewear crafted for clarity & character.",
  heroSubtitle:
    "Try hand-finished acetate, titanium, and sun frames in our studio — or send us your prescription on WhatsApp for custom lens fitting and doorstep delivery.",
  heroPrimaryCta: "Explore Collection",
  heroSecondaryCta: "Send Rx on WhatsApp",
  featuredHeading: "Curated Studio Edit",
  featuredSubheading:
    "Signature frames from our current shelf — ready for prescription or sun lenses.",
  categoriesHeading: "Browse by Department",
  categoriesSubheading:
    "Engineered for all-day bridge comfort across every silhouette.",
  whyHeading: "The Mehar Optical Standard",
  whyPoint1:
    "Every frame is checked for bridge fit, temple balance, and pupillary alignment before it leaves our studio.",
  whyPoint2:
    "Single-vision, digital blue-cut, photochromic, and progressive lenses digitally edged and mounted in-house.",
  whyPoint3:
    "Message your prescription or frame choice on WhatsApp for instant lens recommendations and same-day dispatch.",
  visitHeading: "Visit Our Optical Studio",
  collectionHeading: "The Frame Collection",
  collectionSubtitle:
    "Frames on the floor and ready to try. Filter by shape, material, or department, then message us on WhatsApp.",
  aboutHeading: "About Mehar for Eyes",
  aboutIntro:
    "Mehar for Eyes is an optical studio focused on well-fitted frames, accurate lens dispensing, and straightforward clinical advice.",
  storyHeading: "Our Philosophy",
  storyParagraph1:
    "We built Mehar for Eyes around a simple principle: eyeglasses should fit comfortably all day and match your prescription without guesswork.",
  storyParagraph2:
    "Whether you visit our counter in person or message us on WhatsApp with your prescription, the same opticians handle frame selection, lens fitting, and aftercare adjustments.",
  offerHeading: "What We Offer",
  offerItems: [
    "Eyeglass frames: acetate, titanium, stainless steel, and rimless frames across everyday and statement shapes.",
    "Prescription lenses: single vision, bifocal, progressive, anti-reflective, and photochromic options.",
    "Sunglasses: UV-400 polarized and prescription-ready sun frames for men and women.",
    "Kids eyewear: flexible, impact-resistant frames sized for growing faces.",
  ],
  themePreset: "modern_glass",
  heroLayout: "bento",
  cardStyle: "rounded",
  adminTheme: "dark_slate",
  bgColor: "#F4F2EC",
  surfaceColor: "#DFE4EC",
  textColor: "#15181E",
  accentColor: "#2B6CB0",
  heroImageUrl: "/images/editorial/hero-campaign.jpg",
  heroBadge: "HAUTE OPTIQUE // LAHORE ATELIER",
  bgPrint: "toile",
  printIntensity: 1.05,
  announcementEnabled: true,
  announcementText:
    "Free Anti-Glare & UV400 Coating on all Prescription Orders · Send your Rx on WhatsApp for Same-Day Fitting",
  showFaceShapeGuide: true,
  faceShapeHeading: "Find Frames for Your Face Shape",
  faceShapeSubtitle:
    "Select your face shape below to see which frame geometries balance your features best.",
  showLensGuide: true,
  lensGuideHeading: "Custom Prescription Lenses & Coatings",
  lensGuideSubtitle:
    "Every frame can be fitted with zero-power blue-cut or your exact prescription in our optical lab.",
  lensOptions: defaultLensOptions,
};

export function resolveActiveThemeColors(s: SiteSettings): {
  bgColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  radiusCard: string;
  radiusBtn: string;
} {
  const preset = THEME_PRESETS.find((p) => p.id === s.themePreset);
  const bgColor =
    s.themePreset === "custom"
      ? s.bgColor
      : (preset?.bgColor ?? s.bgColor ?? "#F8FAFC");
  const surfaceColor =
    s.themePreset === "custom"
      ? s.surfaceColor
      : (preset?.surfaceColor ?? s.surfaceColor ?? "#EEF2F6");
  const textColor =
    s.themePreset === "custom"
      ? s.textColor
      : (preset?.textColor ?? s.textColor ?? "#0F172A");
  const accentColor =
    s.themePreset === "custom"
      ? s.accentColor
      : (preset?.accentColor ?? s.accentColor ?? "#2563EB");

  let radiusCard = "1.25rem";
  let radiusBtn = "9999px";
  if (s.cardStyle === "sharp") {
    radiusCard = "0px";
    radiusBtn = "0px";
  } else if (s.cardStyle === "glass") {
    radiusCard = "1.5rem";
    radiusBtn = "0.75rem";
  }

  return {
    bgColor,
    surfaceColor,
    textColor,
    accentColor,
    radiusCard,
    radiusBtn,
  };
}

export function mapApiToSiteSettings(raw: ApiSiteSettingsPayload): SiteSettings {
  const lensOpts: LensOption[] =
    Array.isArray(raw.lens_options) && raw.lens_options.length > 0
      ? raw.lens_options.map((o) => ({
          title: o.title || "",
          badge: o.badge || "",
          description: o.description || "",
          priceHint: o.price_hint || "",
        }))
      : defaultLensOptions;

  const rawBadge = raw.hero_badge ?? defaultSiteSettings.heroBadge;
  const hasV2PrintTag = rawBadge.includes("||");
  const [cleanBadgePart, printMetaPart] = rawBadge.split("||");
  let parsedPrint: BgPrintId = defaultSiteSettings.bgPrint;
  let parsedIntensity: number = defaultSiteSettings.printIntensity;

  if (printMetaPart) {
    const [pId, pInt] = printMetaPart.split(":");
    if (
      pId === "toile" ||
      pId === "editorial" ||
      pId === "terrazzo" ||
      pId === "astrolabe" ||
      pId === "shibori" ||
      pId === "none"
    ) {
      parsedPrint = pId;
    }
    const num = parseFloat(pInt ?? "");
    if (!Number.isNaN(num) && num >= 0.2 && num <= 2.0) {
      parsedIntensity = num;
    }
  }

  return {
    shopName: raw.shop_name || defaultSiteSettings.shopName,
    tagline: raw.tagline || defaultSiteSettings.tagline,
    metaDescription: raw.meta_description || defaultSiteSettings.metaDescription,
    whatsappNumber: raw.whatsapp_number || defaultSiteSettings.whatsappNumber,
    phoneNumber: raw.phone_number || defaultSiteSettings.phoneNumber,
    addressStreet: raw.address_street || defaultSiteSettings.addressStreet,
    addressCity: raw.address_city || defaultSiteSettings.addressCity,
    addressRegion: raw.address_region || defaultSiteSettings.addressRegion,
    addressCountry: raw.address_country || defaultSiteSettings.addressCountry,
    openingHours: raw.opening_hours || defaultSiteSettings.openingHours,
    mapEmbedUrl: raw.map_embed_url ?? "",
    mapCaption: raw.map_caption ?? defaultSiteSettings.mapCaption,
    heroTitle: raw.hero_title || defaultSiteSettings.heroTitle,
    heroSubtitle: raw.hero_subtitle || defaultSiteSettings.heroSubtitle,
    heroPrimaryCta: raw.hero_primary_cta || defaultSiteSettings.heroPrimaryCta,
    heroSecondaryCta:
      raw.hero_secondary_cta || defaultSiteSettings.heroSecondaryCta,
    featuredHeading: raw.featured_heading || defaultSiteSettings.featuredHeading,
    featuredSubheading:
      raw.featured_subheading || defaultSiteSettings.featuredSubheading,
    categoriesHeading:
      raw.categories_heading || defaultSiteSettings.categoriesHeading,
    categoriesSubheading:
      raw.categories_subheading || defaultSiteSettings.categoriesSubheading,
    whyHeading: raw.why_heading || defaultSiteSettings.whyHeading,
    whyPoint1: raw.why_point_1 || defaultSiteSettings.whyPoint1,
    whyPoint2: raw.why_point_2 || defaultSiteSettings.whyPoint2,
    whyPoint3: raw.why_point_3 || defaultSiteSettings.whyPoint3,
    visitHeading: raw.visit_heading || defaultSiteSettings.visitHeading,
    collectionHeading:
      raw.collection_heading || defaultSiteSettings.collectionHeading,
    collectionSubtitle:
      raw.collection_subtitle || defaultSiteSettings.collectionSubtitle,
    aboutHeading: raw.about_heading || defaultSiteSettings.aboutHeading,
    aboutIntro: raw.about_intro || defaultSiteSettings.aboutIntro,
    storyHeading: raw.story_heading || defaultSiteSettings.storyHeading,
    storyParagraph1:
      raw.story_paragraph_1 || defaultSiteSettings.storyParagraph1,
    storyParagraph2:
      raw.story_paragraph_2 || defaultSiteSettings.storyParagraph2,
    offerHeading: raw.offer_heading || defaultSiteSettings.offerHeading,
    offerItems:
      Array.isArray(raw.offer_items) && raw.offer_items.length > 0
        ? raw.offer_items
        : defaultSiteSettings.offerItems,
    themePreset: hasV2PrintTag
      ? (raw.theme_preset as ThemePresetId) || defaultSiteSettings.themePreset
      : "modern_glass",
    heroLayout:
      (raw.hero_layout as HeroLayoutId) || defaultSiteSettings.heroLayout,
    cardStyle: hasV2PrintTag
      ? (raw.card_style as CardStyleId) || defaultSiteSettings.cardStyle
      : "rounded",
    adminTheme:
      (raw.admin_theme as AdminThemeId) || defaultSiteSettings.adminTheme,
    bgColor: hasV2PrintTag
      ? raw.bg_color || defaultSiteSettings.bgColor
      : defaultSiteSettings.bgColor,
    surfaceColor: hasV2PrintTag
      ? raw.surface_color || defaultSiteSettings.surfaceColor
      : defaultSiteSettings.surfaceColor,
    textColor: hasV2PrintTag
      ? raw.text_color || defaultSiteSettings.textColor
      : defaultSiteSettings.textColor,
    accentColor: hasV2PrintTag
      ? raw.accent_color || defaultSiteSettings.accentColor
      : defaultSiteSettings.accentColor,
    heroImageUrl: raw.hero_image_url || defaultSiteSettings.heroImageUrl,
    heroBadge: (cleanBadgePart || defaultSiteSettings.heroBadge).trim(),
    bgPrint: parsedPrint,
    printIntensity: parsedIntensity,
    announcementEnabled:
      raw.announcement_enabled ?? defaultSiteSettings.announcementEnabled,
    announcementText:
      raw.announcement_text ?? defaultSiteSettings.announcementText,
    showFaceShapeGuide:
      raw.show_face_shape_guide ?? defaultSiteSettings.showFaceShapeGuide,
    faceShapeHeading:
      raw.face_shape_heading || defaultSiteSettings.faceShapeHeading,
    faceShapeSubtitle:
      raw.face_shape_subtitle || defaultSiteSettings.faceShapeSubtitle,
    showLensGuide: raw.show_lens_guide ?? defaultSiteSettings.showLensGuide,
    lensGuideHeading:
      raw.lens_guide_heading || defaultSiteSettings.lensGuideHeading,
    lensGuideSubtitle:
      raw.lens_guide_subtitle || defaultSiteSettings.lensGuideSubtitle,
    lensOptions: lensOpts,
    updatedAt: raw.updated_at,
  };
}

export function mapSiteSettingsToApi(s: SiteSettings): ApiSiteSettingsPayload {
  const cleanBadge = (s.heroBadge || defaultSiteSettings.heroBadge)
    .replace(/\|\|.*$/, "")
    .trim()
    .slice(0, 95);
  const encodedBadge = `${cleanBadge}||${s.bgPrint || "toile"}:${(
    s.printIntensity ?? 1.05
  ).toFixed(2)}`;

  // Go backend validates hero_image_url to be empty or start with /uploads/ or /placeholders/
  const safeHeroImageUrl =
    s.heroImageUrl.startsWith("/uploads/") ||
    s.heroImageUrl.startsWith("/placeholders/")
      ? s.heroImageUrl
      : "";

  return {
    shop_name: s.shopName,
    tagline: s.tagline,
    meta_description: s.metaDescription,
    whatsapp_number: s.whatsappNumber,
    phone_number: s.phoneNumber,
    address_street: s.addressStreet,
    address_city: s.addressCity,
    address_region: s.addressRegion,
    address_country: s.addressCountry,
    opening_hours: s.openingHours,
    map_embed_url: s.mapEmbedUrl,
    map_caption: s.mapCaption,
    hero_title: s.heroTitle,
    hero_subtitle: s.heroSubtitle,
    hero_primary_cta: s.heroPrimaryCta,
    hero_secondary_cta: s.heroSecondaryCta,
    featured_heading: s.featuredHeading,
    featured_subheading: s.featuredSubheading,
    categories_heading: s.categoriesHeading,
    categories_subheading: s.categoriesSubheading,
    why_heading: s.whyHeading,
    why_point_1: s.whyPoint1,
    why_point_2: s.whyPoint2,
    why_point_3: s.whyPoint3,
    visit_heading: s.visitHeading,
    collection_heading: s.collectionHeading,
    collection_subtitle: s.collectionSubtitle,
    about_heading: s.aboutHeading,
    about_intro: s.aboutIntro,
    story_heading: s.storyHeading,
    story_paragraph_1: s.storyParagraph1,
    story_paragraph_2: s.storyParagraph2,
    offer_heading: s.offerHeading,
    offer_items: s.offerItems,
    theme_preset: s.themePreset,
    hero_layout: s.heroLayout,
    card_style: s.cardStyle,
    admin_theme: s.adminTheme,
    bg_color: s.bgColor,
    surface_color: s.surfaceColor,
    text_color: s.textColor,
    accent_color: s.accentColor,
    hero_image_url: safeHeroImageUrl,
    hero_badge: encodedBadge,
    announcement_enabled: s.announcementEnabled,
    announcement_text: s.announcementText,
    show_face_shape_guide: s.showFaceShapeGuide,
    face_shape_heading: s.faceShapeHeading,
    face_shape_subtitle: s.faceShapeSubtitle,
    show_lens_guide: s.showLensGuide,
    lens_guide_heading: s.lensGuideHeading,
    lens_guide_subtitle: s.lensGuideSubtitle,
    lens_options: s.lensOptions.map((o) => ({
      title: o.title,
      badge: o.badge,
      description: o.description,
      price_hint: o.priceHint,
    })),
  };
}
