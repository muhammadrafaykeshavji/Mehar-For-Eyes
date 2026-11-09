package settings

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgtype"

	"mehar/backend/internal/db/sqlcgen"
)

type fakeStore struct {
	row sqlcgen.SiteSetting
}

func (f *fakeStore) GetSiteSettings(_ context.Context) (sqlcgen.SiteSetting, error) {
	return f.row, nil
}

func (f *fakeStore) UpsertSiteSettings(_ context.Context, arg sqlcgen.UpsertSiteSettingsParams) (sqlcgen.SiteSetting, error) {
	f.row = sqlcgen.SiteSetting{
		ID:                   1,
		ShopName:             arg.ShopName,
		Tagline:              arg.Tagline,
		MetaDescription:      arg.MetaDescription,
		WhatsappNumber:       arg.WhatsappNumber,
		PhoneNumber:          arg.PhoneNumber,
		AddressStreet:        arg.AddressStreet,
		AddressCity:          arg.AddressCity,
		AddressRegion:        arg.AddressRegion,
		AddressCountry:       arg.AddressCountry,
		OpeningHours:         arg.OpeningHours,
		MapEmbedUrl:          arg.MapEmbedUrl,
		MapCaption:           arg.MapCaption,
		HeroTitle:            arg.HeroTitle,
		HeroSubtitle:         arg.HeroSubtitle,
		HeroPrimaryCta:       arg.HeroPrimaryCta,
		HeroSecondaryCta:     arg.HeroSecondaryCta,
		FeaturedHeading:      arg.FeaturedHeading,
		FeaturedSubheading:   arg.FeaturedSubheading,
		CategoriesHeading:    arg.CategoriesHeading,
		CategoriesSubheading: arg.CategoriesSubheading,
		WhyHeading:           arg.WhyHeading,
		WhyPoint1:            arg.WhyPoint1,
		WhyPoint2:            arg.WhyPoint2,
		WhyPoint3:            arg.WhyPoint3,
		VisitHeading:         arg.VisitHeading,
		CollectionHeading:    arg.CollectionHeading,
		CollectionSubtitle:   arg.CollectionSubtitle,
		AboutHeading:         arg.AboutHeading,
		AboutIntro:           arg.AboutIntro,
		StoryHeading:         arg.StoryHeading,
		StoryParagraph1:      arg.StoryParagraph1,
		StoryParagraph2:      arg.StoryParagraph2,
		OfferHeading:         arg.OfferHeading,
		OfferItems:           arg.OfferItems,
		ThemePreset:          arg.ThemePreset,
		HeroLayout:           arg.HeroLayout,
		CardStyle:            arg.CardStyle,
		AdminTheme:           arg.AdminTheme,
		BgColor:              arg.BgColor,
		SurfaceColor:         arg.SurfaceColor,
		TextColor:            arg.TextColor,
		AccentColor:          arg.AccentColor,
		HeroImageUrl:         arg.HeroImageUrl,
		HeroBadge:            arg.HeroBadge,
		AnnouncementEnabled:  arg.AnnouncementEnabled,
		AnnouncementText:     arg.AnnouncementText,
		ShowFaceShapeGuide:   arg.ShowFaceShapeGuide,
		FaceShapeHeading:     arg.FaceShapeHeading,
		FaceShapeSubtitle:    arg.FaceShapeSubtitle,
		ShowLensGuide:        arg.ShowLensGuide,
		LensGuideHeading:     arg.LensGuideHeading,
		LensGuideSubtitle:    arg.LensGuideSubtitle,
		LensOptionsJson:      arg.LensOptionsJson,
		UpdatedAt:            pgtype.Timestamptz{Time: time.Now().UTC(), Valid: true},
	}
	return f.row, nil
}

func TestNormalizePhone(t *testing.T) {
	cases := []struct {
		in      string
		want    string
		wantErr bool
	}{
		{"923001234567", "923001234567", false},
		{"+92 300 1234567", "923001234567", false},
		{"0300-1234567", "923001234567", false},
		{"00923001234567", "923001234567", false},
		{"", "", false},
		{"12345", "", true},
	}
	for _, tc := range cases {
		got, err := NormalizePhone(tc.in)
		if (err != nil) != tc.wantErr {
			t.Fatalf("NormalizePhone(%q) err=%v, wantErr=%v", tc.in, err, tc.wantErr)
		}
		if got != tc.want {
			t.Fatalf("NormalizePhone(%q)=%q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestNormalizeMapEmbedURL(t *testing.T) {
	url, err := NormalizeMapEmbedURL(`<iframe src="https://www.google.com/maps/embed?pb=!1m18" width="600"></iframe>`)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if url != "https://www.google.com/maps/embed?pb=!1m18" {
		t.Fatalf("got %q", url)
	}

	if _, err := NormalizeMapEmbedURL("https://evil.example.com/embed"); err == nil {
		t.Fatal("expected error for untrusted host")
	}
}

func TestUpdateAndGetSettings(t *testing.T) {
	store := &fakeStore{}
	svc := NewService(store)

	def := DefaultSettings()
	in := Input{
		ShopName:             "Mehar Opticals",
		Tagline:              def.Tagline,
		MetaDescription:      def.MetaDescription,
		WhatsappNumber:       "0321-7654321",
		PhoneNumber:          "",
		AddressStreet:        "MM Alam Road",
		AddressCity:          "Lahore",
		AddressRegion:        "Punjab",
		AddressCountry:       "PK",
		OpeningHours:         "Mon–Sat, 10:30 AM – 9:30 PM",
		MapEmbedUrl:          "https://www.google.com/maps/embed?pb=!1m14",
		MapCaption:           def.MapCaption,
		HeroTitle:            "Mehar Opticals",
		HeroSubtitle:         def.HeroSubtitle,
		HeroPrimaryCta:       def.HeroPrimaryCta,
		HeroSecondaryCta:     def.HeroSecondaryCta,
		FeaturedHeading:      def.FeaturedHeading,
		FeaturedSubheading:   def.FeaturedSubheading,
		CategoriesHeading:    def.CategoriesHeading,
		CategoriesSubheading: def.CategoriesSubheading,
		WhyHeading:           def.WhyHeading,
		WhyPoint1:            def.WhyPoint1,
		WhyPoint2:            def.WhyPoint2,
		WhyPoint3:            def.WhyPoint3,
		VisitHeading:         def.VisitHeading,
		CollectionHeading:    def.CollectionHeading,
		CollectionSubtitle:   def.CollectionSubtitle,
		AboutHeading:         def.AboutHeading,
		AboutIntro:           def.AboutIntro,
		StoryHeading:         def.StoryHeading,
		StoryParagraph1:      def.StoryParagraph1,
		StoryParagraph2:      def.StoryParagraph2,
		OfferHeading:         def.OfferHeading,
		OfferItems:           def.OfferItems,
		ThemePreset:          "dark_luxury",
		HeroLayout:           "cinematic",
		CardStyle:            "glass",
		AdminTheme:           "dark_slate",
		BgColor:              "#0B0D11",
		SurfaceColor:         "#141820",
		TextColor:            "#F5F2EB",
		AccentColor:          "#C9A46A",
	}

	body, _ := json.Marshal(in)
	req := httptest.NewRequest(http.MethodPut, "/api/admin/settings", bytes.NewReader(body))
	rec := httptest.NewRecorder()
	svc.Update(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d: %s", rec.Code, rec.Body.String())
	}

	var out Response
	if err := json.Unmarshal(rec.Body.Bytes(), &out); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if out.WhatsappNumber != "923217654321" || out.ThemePreset != "dark_luxury" || out.HeroLayout != "cinematic" {
		t.Fatalf("unexpected output: %+v", out)
	}
}
