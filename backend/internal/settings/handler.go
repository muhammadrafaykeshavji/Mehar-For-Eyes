// Package settings implements the public and admin HTTP handlers for site-wide content, theme, and optical configuration.
package settings

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/url"
	"regexp"
	"strings"
	"time"
	"unicode/utf8"

	"github.com/jackc/pgx/v5"

	"mehar/backend/internal/db/sqlcgen"
)

type Store interface {
	GetSiteSettings(ctx context.Context) (sqlcgen.SiteSetting, error)
	UpsertSiteSettings(ctx context.Context, arg sqlcgen.UpsertSiteSettingsParams) (sqlcgen.SiteSetting, error)
}

type Service struct {
	store Store
}

func NewService(store Store) *Service {
	return &Service{store: store}
}

type LensOption struct {
	Title       string `json:"title"`
	Badge       string `json:"badge"`
	Description string `json:"description"`
	PriceHint   string `json:"priceHint"`
}

type Response struct {
	ShopName             string       `json:"shop_name"`
	Tagline              string       `json:"tagline"`
	MetaDescription      string       `json:"meta_description"`
	WhatsappNumber       string       `json:"whatsapp_number"`
	PhoneNumber          string       `json:"phone_number"`
	AddressStreet        string       `json:"address_street"`
	AddressCity          string       `json:"address_city"`
	AddressRegion        string       `json:"address_region"`
	AddressCountry       string       `json:"address_country"`
	OpeningHours         string       `json:"opening_hours"`
	MapEmbedUrl          string       `json:"map_embed_url"`
	MapCaption           string       `json:"map_caption"`
	HeroTitle            string       `json:"hero_title"`
	HeroSubtitle         string       `json:"hero_subtitle"`
	HeroPrimaryCta       string       `json:"hero_primary_cta"`
	HeroSecondaryCta     string       `json:"hero_secondary_cta"`
	FeaturedHeading      string       `json:"featured_heading"`
	FeaturedSubheading   string       `json:"featured_subheading"`
	CategoriesHeading    string       `json:"categories_heading"`
	CategoriesSubheading string       `json:"categories_subheading"`
	WhyHeading           string       `json:"why_heading"`
	WhyPoint1            string       `json:"why_point_1"`
	WhyPoint2            string       `json:"why_point_2"`
	WhyPoint3            string       `json:"why_point_3"`
	VisitHeading         string       `json:"visit_heading"`
	CollectionHeading    string       `json:"collection_heading"`
	CollectionSubtitle   string       `json:"collection_subtitle"`
	AboutHeading         string       `json:"about_heading"`
	AboutIntro           string       `json:"about_intro"`
	StoryHeading         string       `json:"story_heading"`
	StoryParagraph1      string       `json:"story_paragraph_1"`
	StoryParagraph2      string       `json:"story_paragraph_2"`
	OfferHeading         string       `json:"offer_heading"`
	OfferItems           []string     `json:"offer_items"`
	ThemePreset          string       `json:"theme_preset"`
	HeroLayout           string       `json:"hero_layout"`
	CardStyle            string       `json:"card_style"`
	AdminTheme           string       `json:"admin_theme"`
	BgColor              string       `json:"bg_color"`
	SurfaceColor         string       `json:"surface_color"`
	TextColor            string       `json:"text_color"`
	AccentColor          string       `json:"accent_color"`
	HeroImageUrl         string       `json:"hero_image_url"`
	HeroBadge            string       `json:"hero_badge"`
	AnnouncementEnabled  bool         `json:"announcement_enabled"`
	AnnouncementText     string       `json:"announcement_text"`
	ShowFaceShapeGuide   bool         `json:"show_face_shape_guide"`
	FaceShapeHeading     string       `json:"face_shape_heading"`
	FaceShapeSubtitle    string       `json:"face_shape_subtitle"`
	ShowLensGuide        bool         `json:"show_lens_guide"`
	LensGuideHeading     string       `json:"lens_guide_heading"`
	LensGuideSubtitle    string       `json:"lens_guide_subtitle"`
	LensOptions          []LensOption `json:"lens_options"`
	UpdatedAt            time.Time    `json:"updated_at"`
}

type Input struct {
	ShopName             string       `json:"shop_name"`
	Tagline              string       `json:"tagline"`
	MetaDescription      string       `json:"meta_description"`
	WhatsappNumber       string       `json:"whatsapp_number"`
	PhoneNumber          string       `json:"phone_number"`
	AddressStreet        string       `json:"address_street"`
	AddressCity          string       `json:"address_city"`
	AddressRegion        string       `json:"address_region"`
	AddressCountry       string       `json:"address_country"`
	OpeningHours         string       `json:"opening_hours"`
	MapEmbedUrl          string       `json:"map_embed_url"`
	MapCaption           string       `json:"map_caption"`
	HeroTitle            string       `json:"hero_title"`
	HeroSubtitle         string       `json:"hero_subtitle"`
	HeroPrimaryCta       string       `json:"hero_primary_cta"`
	HeroSecondaryCta     string       `json:"hero_secondary_cta"`
	FeaturedHeading      string       `json:"featured_heading"`
	FeaturedSubheading   string       `json:"featured_subheading"`
	CategoriesHeading    string       `json:"categories_heading"`
	CategoriesSubheading string       `json:"categories_subheading"`
	WhyHeading           string       `json:"why_heading"`
	WhyPoint1            string       `json:"why_point_1"`
	WhyPoint2            string       `json:"why_point_2"`
	WhyPoint3            string       `json:"why_point_3"`
	VisitHeading         string       `json:"visit_heading"`
	CollectionHeading    string       `json:"collection_heading"`
	CollectionSubtitle   string       `json:"collection_subtitle"`
	AboutHeading         string       `json:"about_heading"`
	AboutIntro           string       `json:"about_intro"`
	StoryHeading         string       `json:"story_heading"`
	StoryParagraph1      string       `json:"story_paragraph_1"`
	StoryParagraph2      string       `json:"story_paragraph_2"`
	OfferHeading         string       `json:"offer_heading"`
	OfferItems           []string     `json:"offer_items"`
	ThemePreset          string       `json:"theme_preset"`
	HeroLayout           string       `json:"hero_layout"`
	CardStyle            string       `json:"card_style"`
	AdminTheme           string       `json:"admin_theme"`
	BgColor              string       `json:"bg_color"`
	SurfaceColor         string       `json:"surface_color"`
	TextColor            string       `json:"text_color"`
	AccentColor          string       `json:"accent_color"`
	HeroImageUrl         string       `json:"hero_image_url"`
	HeroBadge            string       `json:"hero_badge"`
	AnnouncementEnabled  *bool        `json:"announcement_enabled"`
	AnnouncementText     string       `json:"announcement_text"`
	ShowFaceShapeGuide   *bool        `json:"show_face_shape_guide"`
	FaceShapeHeading     string       `json:"face_shape_heading"`
	FaceShapeSubtitle    string       `json:"face_shape_subtitle"`
	ShowLensGuide        *bool        `json:"show_lens_guide"`
	LensGuideHeading     string       `json:"lens_guide_heading"`
	LensGuideSubtitle    string       `json:"lens_guide_subtitle"`
	LensOptions          []LensOption `json:"lens_options"`
}

var (
	pkPhoneRe   = regexp.MustCompile(`^92\d{10}$`)
	iframeSrcRe = regexp.MustCompile(`(?i)src=["']([^"']+)["']`)
	nonDigitRe  = regexp.MustCompile(`\D+`)
	hexColorRe  = regexp.MustCompile(`^#[0-9a-fA-F]{6}$`)

	allowedThemePresets = map[string]bool{
		"modern_glass":      true,
		"dark_luxury":       true,
		"editorial_atelier": true,
		"emerald_bento":     true,
		"custom":            true,
	}
	allowedHeroLayouts = map[string]bool{
		"bento":     true,
		"cinematic": true,
		"split":     true,
	}
	allowedCardStyles = map[string]bool{
		"rounded": true,
		"sharp":   true,
		"glass":   true,
	}
	allowedAdminThemes = map[string]bool{
		"dark_slate": true,
		"light_saas": true,
	}
)

func DefaultLensOptions() []LensOption {
	return []LensOption{
		{
			Title:       "Blue-Cut Digital Protection",
			Badge:       "Most Popular",
			Description: "Filters high-energy screen glare and reduces eye strain during long computer or phone sessions.",
			PriceHint:   "From PKR 2,500",
		},
		{
			Title:       "Photochromic (Sun-Reactive)",
			Badge:       "Indoor + Outdoor",
			Description: "Crystal clear indoors and automatically darkens into UV-400 sunglasses in outdoor sunlight.",
			PriceHint:   "From PKR 4,500",
		},
		{
			Title:       "Hi-Index Ultra-Thin",
			Badge:       "High Prescription",
			Description: "Up to 40% thinner and lighter lenses so stronger prescriptions look sleek in any frame.",
			PriceHint:   "From PKR 5,500",
		},
		{
			Title:       "Progressive Multifocal",
			Badge:       "Distance + Reading",
			Description: "Seamless distance, intermediate, and near vision in one lens without visible bifocal lines.",
			PriceHint:   "From PKR 8,500",
		},
	}
}

func DefaultSettings() Response {
	return Response{
		ShopName:             "Mehar for Eyes",
		Tagline:              "Frames fitted in person. Orders over WhatsApp.",
		MetaDescription:      "Eyeglass frames, prescription lenses, sunglasses, and kids eyewear at Mehar for Eyes. Fitted in person or ordered over WhatsApp.",
		WhatsappNumber:       "923000000000",
		PhoneNumber:          "923000000000",
		AddressStreet:        "Main Commercial Area",
		AddressCity:          "Lahore",
		AddressRegion:        "Punjab",
		AddressCountry:       "PK",
		OpeningHours:         "Mon–Sat, 11:00 AM – 9:00 PM",
		MapEmbedUrl:          "",
		MapCaption:           "Visit our shop for in-person frame fitting and prescription lens consultation.",
		HeroTitle:            "Mehar for Eyes",
		HeroSubtitle:         "Frames fitted in the shop. Message us when you are ready to order.",
		HeroPrimaryCta:       "Browse collection",
		HeroSecondaryCta:     "Order on WhatsApp",
		FeaturedHeading:      "Featured frames",
		FeaturedSubheading:   "Four from the current shelf.",
		CategoriesHeading:    "Shop by category",
		CategoriesSubheading: "Jump straight to the shelf you need.",
		WhyHeading:           "Why Mehar for Eyes",
		WhyPoint1:            "Every frame is checked for bridge fit, temple length, and optical alignment before it leaves the counter.",
		WhyPoint2:            "Single-vision, blue-cut, photochromic, and progressive prescription lenses cut and mounted in-house.",
		WhyPoint3:            "Send your prescription or frame choice on WhatsApp for quick pricing, availability, and doorstep delivery.",
		VisitHeading:         "Visit us",
		CollectionHeading:    "Collection",
		CollectionSubtitle:   "Frames on the floor and ready to try. Filter by what you need, then message us on WhatsApp.",
		AboutHeading:         "About the shop",
		AboutIntro:           "Mehar for Eyes is an optical practice focused on well-fitted frames, accurate lens dispensing, and straightforward advice.",
		StoryHeading:         "Our story",
		StoryParagraph1:      "We built Mehar for Eyes around a simple principle: eyeglasses should fit comfortably all day and match your prescription without guesswork.",
		StoryParagraph2:      "Whether you visit our counter in person or message us on WhatsApp with your prescription, the same opticians handle frame selection, lens fitting, and aftercare adjustments.",
		OfferHeading:         "What we offer",
		OfferItems: []string{
			"Eyeglass frames: acetate, titanium, stainless steel, and rimless frames across everyday and statement shapes.",
			"Prescription lenses: single vision, bifocal, progressive, anti-reflective, and photochromic options.",
			"Sunglasses: UV-400 polarized and prescription-ready sun frames for men and women.",
			"Kids eyewear: flexible, impact-resistant frames sized for growing faces.",
		},
		ThemePreset:         "modern_glass",
		HeroLayout:          "bento",
		CardStyle:           "rounded",
		AdminTheme:          "dark_slate",
		BgColor:             "#FAF7F2",
		SurfaceColor:        "#FFFFFF",
		TextColor:           "#141413",
		AccentColor:         "#5A2E1F",
		HeroImageUrl:        "",
		HeroBadge:           "Precision Optics & In-Store Fitting",
		AnnouncementEnabled: true,
		AnnouncementText:    "Computerized Eye Testing In-Store  •  Prescription & Blue-Cut Lenses  •  Fast Order via WhatsApp",
		ShowFaceShapeGuide:  true,
		FaceShapeHeading:    "Find Frames for Your Face Shape",
		FaceShapeSubtitle:   "Choose your face profile to see which frame silhouettes balance your proportions best.",
		ShowLensGuide:       true,
		LensGuideHeading:    "Prescription Lenses & Optical Coatings",
		LensGuideSubtitle:   "Fitted in-house to your prescription or zero-power everyday protection.",
		LensOptions:         DefaultLensOptions(),
		UpdatedAt:           time.Now().UTC(),
	}
}

func NormalizePhone(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", nil
	}
	digits := nonDigitRe.ReplaceAllString(trimmed, "")
	if strings.HasPrefix(digits, "0092") && len(digits) == 14 {
		digits = digits[2:]
	} else if strings.HasPrefix(digits, "0") && len(digits) == 11 {
		digits = "92" + digits[1:]
	}
	if !pkPhoneRe.MatchString(digits) {
		return "", errors.New("must be a valid Pakistan number like 923001234567 or 03001234567")
	}
	return digits, nil
}

func NormalizeMapEmbedURL(raw string) (string, error) {
	trimmed := strings.TrimSpace(raw)
	if trimmed == "" {
		return "", nil
	}
	if matches := iframeSrcRe.FindStringSubmatch(trimmed); len(matches) == 2 {
		trimmed = strings.TrimSpace(matches[1])
	}
	parsed, err := url.Parse(trimmed)
	if err != nil || parsed.Scheme != "https" {
		return "", errors.New("map_embed_url must be an https:// Google Maps embed URL or iframe snippet")
	}
	host := strings.ToLower(parsed.Hostname())
	if host != "www.google.com" && host != "google.com" && host != "maps.google.com" {
		return "", errors.New("map_embed_url must be hosted on google.com")
	}
	if !strings.HasPrefix(parsed.Path, "/maps/embed") && !strings.HasPrefix(parsed.Path, "/maps") {
		return "", errors.New("map_embed_url path must start with /maps/embed")
	}
	return parsed.String(), nil
}

func checkRequiredText(val, field string, maxRunes int) (string, error) {
	s := strings.TrimSpace(val)
	if s == "" {
		return "", errors.New(field + " is required")
	}
	if utf8.RuneCountInString(s) > maxRunes {
		return "", errors.New(field + " is too long")
	}
	return s, nil
}

func checkOptionalText(val, field string, maxRunes int) (string, error) {
	s := strings.TrimSpace(val)
	if utf8.RuneCountInString(s) > maxRunes {
		return "", errors.New(field + " is too long")
	}
	return s, nil
}

func normalizeHexColor(val, fallback string) (string, error) {
	s := strings.TrimSpace(val)
	if s == "" {
		return fallback, nil
	}
	if !hexColorRe.MatchString(s) {
		return "", errors.New("invalid hex color " + s + " (expected #RRGGBB)")
	}
	return strings.ToUpper(s), nil
}

func (in *Input) NormalizeAndValidate() (sqlcgen.UpsertSiteSettingsParams, error) {
	var out sqlcgen.UpsertSiteSettingsParams
	var err error
	def := DefaultSettings()

	if out.ShopName, err = checkRequiredText(in.ShopName, "shop_name", 100); err != nil {
		return out, err
	}
	if out.Tagline, err = checkRequiredText(in.Tagline, "tagline", 240); err != nil {
		return out, err
	}
	if out.MetaDescription, err = checkRequiredText(in.MetaDescription, "meta_description", 320); err != nil {
		return out, err
	}

	if out.WhatsappNumber, err = NormalizePhone(in.WhatsappNumber); err != nil {
		return out, errors.New("whatsapp_number: " + err.Error())
	}
	if out.PhoneNumber, err = NormalizePhone(in.PhoneNumber); err != nil {
		return out, errors.New("phone_number: " + err.Error())
	}
	if out.PhoneNumber == "" {
		out.PhoneNumber = out.WhatsappNumber
	}

	if out.AddressStreet, err = checkRequiredText(in.AddressStreet, "address_street", 200); err != nil {
		return out, err
	}
	if out.AddressCity, err = checkRequiredText(in.AddressCity, "address_city", 100); err != nil {
		return out, err
	}
	if out.AddressRegion, err = checkRequiredText(in.AddressRegion, "address_region", 100); err != nil {
		return out, err
	}
	country := strings.ToUpper(strings.TrimSpace(in.AddressCountry))
	if country == "" {
		country = "PK"
	}
	if utf8.RuneCountInString(country) > 10 {
		return out, errors.New("address_country is too long")
	}
	out.AddressCountry = country

	if out.OpeningHours, err = checkRequiredText(in.OpeningHours, "opening_hours", 160); err != nil {
		return out, err
	}
	if out.MapEmbedUrl, err = NormalizeMapEmbedURL(in.MapEmbedUrl); err != nil {
		return out, err
	}
	if out.MapCaption, err = checkOptionalText(in.MapCaption, "map_caption", 300); err != nil {
		return out, err
	}

	if out.HeroTitle, err = checkRequiredText(in.HeroTitle, "hero_title", 120); err != nil {
		return out, err
	}
	if out.HeroSubtitle, err = checkRequiredText(in.HeroSubtitle, "hero_subtitle", 300); err != nil {
		return out, err
	}
	if out.HeroPrimaryCta, err = checkRequiredText(in.HeroPrimaryCta, "hero_primary_cta", 60); err != nil {
		return out, err
	}
	if out.HeroSecondaryCta, err = checkRequiredText(in.HeroSecondaryCta, "hero_secondary_cta", 60); err != nil {
		return out, err
	}

	if out.FeaturedHeading, err = checkRequiredText(in.FeaturedHeading, "featured_heading", 120); err != nil {
		return out, err
	}
	if out.FeaturedSubheading, err = checkRequiredText(in.FeaturedSubheading, "featured_subheading", 240); err != nil {
		return out, err
	}
	if out.CategoriesHeading, err = checkRequiredText(in.CategoriesHeading, "categories_heading", 120); err != nil {
		return out, err
	}
	if out.CategoriesSubheading, err = checkRequiredText(in.CategoriesSubheading, "categories_subheading", 240); err != nil {
		return out, err
	}

	if out.WhyHeading, err = checkRequiredText(in.WhyHeading, "why_heading", 120); err != nil {
		return out, err
	}
	if out.WhyPoint1, err = checkRequiredText(in.WhyPoint1, "why_point_1", 400); err != nil {
		return out, err
	}
	if out.WhyPoint2, err = checkRequiredText(in.WhyPoint2, "why_point_2", 400); err != nil {
		return out, err
	}
	if out.WhyPoint3, err = checkRequiredText(in.WhyPoint3, "why_point_3", 400); err != nil {
		return out, err
	}

	if out.VisitHeading, err = checkRequiredText(in.VisitHeading, "visit_heading", 120); err != nil {
		return out, err
	}
	if out.CollectionHeading, err = checkRequiredText(in.CollectionHeading, "collection_heading", 120); err != nil {
		return out, err
	}
	if out.CollectionSubtitle, err = checkRequiredText(in.CollectionSubtitle, "collection_subtitle", 320); err != nil {
		return out, err
	}

	if out.AboutHeading, err = checkRequiredText(in.AboutHeading, "about_heading", 120); err != nil {
		return out, err
	}
	if out.AboutIntro, err = checkRequiredText(in.AboutIntro, "about_intro", 600); err != nil {
		return out, err
	}
	if out.StoryHeading, err = checkRequiredText(in.StoryHeading, "story_heading", 120); err != nil {
		return out, err
	}
	if out.StoryParagraph1, err = checkRequiredText(in.StoryParagraph1, "story_paragraph_1", 1200); err != nil {
		return out, err
	}
	if out.StoryParagraph2, err = checkRequiredText(in.StoryParagraph2, "story_paragraph_2", 1200); err != nil {
		return out, err
	}
	if out.OfferHeading, err = checkRequiredText(in.OfferHeading, "offer_heading", 120); err != nil {
		return out, err
	}

	items := make([]string, 0, len(in.OfferItems))
	for _, rawItem := range in.OfferItems {
		cleaned := strings.TrimSpace(rawItem)
		if cleaned == "" {
			continue
		}
		if utf8.RuneCountInString(cleaned) > 400 {
			return out, errors.New("each offer_items entry must be 400 characters or fewer")
		}
		items = append(items, cleaned)
	}
	if len(items) == 0 {
		return out, errors.New("at least one offer item is required")
	}
	if len(items) > 12 {
		return out, errors.New("at most 12 offer items are allowed")
	}
	out.OfferItems = items

	// Theme & Layout fields (with defaults when omitted)
	preset := strings.TrimSpace(in.ThemePreset)
	if preset == "" {
		preset = def.ThemePreset
	}
	if !allowedThemePresets[preset] {
		return out, errors.New("invalid theme_preset")
	}
	out.ThemePreset = preset

	heroLayout := strings.TrimSpace(in.HeroLayout)
	if heroLayout == "" {
		heroLayout = def.HeroLayout
	}
	if !allowedHeroLayouts[heroLayout] {
		return out, errors.New("invalid hero_layout")
	}
	out.HeroLayout = heroLayout

	cardStyle := strings.TrimSpace(in.CardStyle)
	if cardStyle == "" {
		cardStyle = def.CardStyle
	}
	if !allowedCardStyles[cardStyle] {
		return out, errors.New("invalid card_style")
	}
	out.CardStyle = cardStyle

	adminTheme := strings.TrimSpace(in.AdminTheme)
	if adminTheme == "" {
		adminTheme = def.AdminTheme
	}
	if !allowedAdminThemes[adminTheme] {
		return out, errors.New("invalid admin_theme")
	}
	out.AdminTheme = adminTheme

	if out.BgColor, err = normalizeHexColor(in.BgColor, def.BgColor); err != nil {
		return out, err
	}
	if out.SurfaceColor, err = normalizeHexColor(in.SurfaceColor, def.SurfaceColor); err != nil {
		return out, err
	}
	if out.TextColor, err = normalizeHexColor(in.TextColor, def.TextColor); err != nil {
		return out, err
	}
	if out.AccentColor, err = normalizeHexColor(in.AccentColor, def.AccentColor); err != nil {
		return out, err
	}

	heroImg := strings.TrimSpace(in.HeroImageUrl)
	if heroImg != "" && !strings.HasPrefix(heroImg, "/uploads/") && !strings.HasPrefix(heroImg, "/placeholders/") {
		return out, errors.New("hero_image_url must be a local /uploads/ or /placeholders/ path")
	}
	out.HeroImageUrl = heroImg

	badge := strings.TrimSpace(in.HeroBadge)
	if badge == "" {
		badge = def.HeroBadge
	}
	if utf8.RuneCountInString(badge) > 120 {
		return out, errors.New("hero_badge is too long")
	}
	out.HeroBadge = badge

	out.AnnouncementEnabled = true
	if in.AnnouncementEnabled != nil {
		out.AnnouncementEnabled = *in.AnnouncementEnabled
	}
	annText := strings.TrimSpace(in.AnnouncementText)
	if annText == "" {
		annText = def.AnnouncementText
	}
	if utf8.RuneCountInString(annText) > 280 {
		return out, errors.New("announcement_text is too long")
	}
	out.AnnouncementText = annText

	out.ShowFaceShapeGuide = true
	if in.ShowFaceShapeGuide != nil {
		out.ShowFaceShapeGuide = *in.ShowFaceShapeGuide
	}
	fsHeading := strings.TrimSpace(in.FaceShapeHeading)
	if fsHeading == "" {
		fsHeading = def.FaceShapeHeading
	}
	if utf8.RuneCountInString(fsHeading) > 140 {
		return out, errors.New("face_shape_heading is too long")
	}
	out.FaceShapeHeading = fsHeading

	fsSub := strings.TrimSpace(in.FaceShapeSubtitle)
	if fsSub == "" {
		fsSub = def.FaceShapeSubtitle
	}
	if utf8.RuneCountInString(fsSub) > 300 {
		return out, errors.New("face_shape_subtitle is too long")
	}
	out.FaceShapeSubtitle = fsSub

	out.ShowLensGuide = true
	if in.ShowLensGuide != nil {
		out.ShowLensGuide = *in.ShowLensGuide
	}
	lgHeading := strings.TrimSpace(in.LensGuideHeading)
	if lgHeading == "" {
		lgHeading = def.LensGuideHeading
	}
	if utf8.RuneCountInString(lgHeading) > 140 {
		return out, errors.New("lens_guide_heading is too long")
	}
	out.LensGuideHeading = lgHeading

	lgSub := strings.TrimSpace(in.LensGuideSubtitle)
	if lgSub == "" {
		lgSub = def.LensGuideSubtitle
	}
	if utf8.RuneCountInString(lgSub) > 300 {
		return out, errors.New("lens_guide_subtitle is too long")
	}
	out.LensGuideSubtitle = lgSub

	lensOpts := in.LensOptions
	if len(lensOpts) == 0 {
		lensOpts = def.LensOptions
	}
	if len(lensOpts) > 8 {
		return out, errors.New("at most 8 lens_options are allowed")
	}
	cleanedLens := make([]LensOption, 0, len(lensOpts))
	for _, opt := range lensOpts {
		title := strings.TrimSpace(opt.Title)
		desc := strings.TrimSpace(opt.Description)
		if title == "" || desc == "" {
			continue
		}
		if utf8.RuneCountInString(title) > 100 || utf8.RuneCountInString(desc) > 320 {
			return out, errors.New("lens option title or description is too long")
		}
		cleanedLens = append(cleanedLens, LensOption{
			Title:       title,
			Badge:       strings.TrimSpace(opt.Badge),
			Description: desc,
			PriceHint:   strings.TrimSpace(opt.PriceHint),
		})
	}
	if len(cleanedLens) == 0 {
		cleanedLens = def.LensOptions
	}
	lensBytes, err := json.Marshal(cleanedLens)
	if err != nil {
		return out, errors.New("failed to encode lens_options")
	}
	out.LensOptionsJson = string(lensBytes)

	return out, nil
}

func toResponse(row sqlcgen.SiteSetting) Response {
	items := row.OfferItems
	if items == nil {
		items = []string{}
	}
	var lensOpts []LensOption
	if row.LensOptionsJson != "" {
		_ = json.Unmarshal([]byte(row.LensOptionsJson), &lensOpts)
	}
	if len(lensOpts) == 0 {
		lensOpts = DefaultLensOptions()
	}

	return Response{
		ShopName:             row.ShopName,
		Tagline:              row.Tagline,
		MetaDescription:      row.MetaDescription,
		WhatsappNumber:       row.WhatsappNumber,
		PhoneNumber:          row.PhoneNumber,
		AddressStreet:        row.AddressStreet,
		AddressCity:          row.AddressCity,
		AddressRegion:        row.AddressRegion,
		AddressCountry:       row.AddressCountry,
		OpeningHours:         row.OpeningHours,
		MapEmbedUrl:          row.MapEmbedUrl,
		MapCaption:           row.MapCaption,
		HeroTitle:            row.HeroTitle,
		HeroSubtitle:         row.HeroSubtitle,
		HeroPrimaryCta:       row.HeroPrimaryCta,
		HeroSecondaryCta:     row.HeroSecondaryCta,
		FeaturedHeading:      row.FeaturedHeading,
		FeaturedSubheading:   row.FeaturedSubheading,
		CategoriesHeading:    row.CategoriesHeading,
		CategoriesSubheading: row.CategoriesSubheading,
		WhyHeading:           row.WhyHeading,
		WhyPoint1:            row.WhyPoint1,
		WhyPoint2:            row.WhyPoint2,
		WhyPoint3:            row.WhyPoint3,
		VisitHeading:         row.VisitHeading,
		CollectionHeading:    row.CollectionHeading,
		CollectionSubtitle:   row.CollectionSubtitle,
		AboutHeading:         row.AboutHeading,
		AboutIntro:           row.AboutIntro,
		StoryHeading:         row.StoryHeading,
		StoryParagraph1:      row.StoryParagraph1,
		StoryParagraph2:      row.StoryParagraph2,
		OfferHeading:         row.OfferHeading,
		OfferItems:           items,
		ThemePreset:          row.ThemePreset,
		HeroLayout:           row.HeroLayout,
		CardStyle:            row.CardStyle,
		AdminTheme:           row.AdminTheme,
		BgColor:              row.BgColor,
		SurfaceColor:         row.SurfaceColor,
		TextColor:            row.TextColor,
		AccentColor:          row.AccentColor,
		HeroImageUrl:         row.HeroImageUrl,
		HeroBadge:            row.HeroBadge,
		AnnouncementEnabled:  row.AnnouncementEnabled,
		AnnouncementText:     row.AnnouncementText,
		ShowFaceShapeGuide:   row.ShowFaceShapeGuide,
		FaceShapeHeading:     row.FaceShapeHeading,
		FaceShapeSubtitle:    row.FaceShapeSubtitle,
		ShowLensGuide:        row.ShowLensGuide,
		LensGuideHeading:     row.LensGuideHeading,
		LensGuideSubtitle:    row.LensGuideSubtitle,
		LensOptions:          lensOpts,
		UpdatedAt:            row.UpdatedAt.Time.UTC(),
	}
}

// Get handles GET /api/settings (public) and GET /api/admin/settings.
func (s *Service) Get(w http.ResponseWriter, r *http.Request) {
	row, err := s.store.GetSiteSettings(r.Context())
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeJSON(w, http.StatusOK, DefaultSettings())
			return
		}
		writeError(w, http.StatusInternalServerError, "failed to load site settings")
		return
	}
	writeJSON(w, http.StatusOK, toResponse(row))
}

// Update handles PUT /api/admin/settings.
func (s *Service) Update(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 256<<10)
	var in Input
	dec := json.NewDecoder(r.Body)
	dec.DisallowUnknownFields()
	if err := dec.Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid JSON body")
		return
	}

	params, err := in.NormalizeAndValidate()
	if err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	row, err := s.store.UpsertSiteSettings(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save site settings")
		return
	}
	writeJSON(w, http.StatusOK, toResponse(row))
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
