package products

import (
	"fmt"
	"strings"
	"unicode"
)

var (
	AllowedCategories = map[string]bool{
		"sunglasses": true,
		"eyeglasses": true,
	}
	AllowedGenders = map[string]bool{
		"men":    true,
		"women":  true,
		"unisex": true,
		"kids":   true,
	}
	AllowedFrameShapes = map[string]bool{
		"":          true,
		"aviator":   true,
		"wayfarer":  true,
		"round":     true,
		"oval":      true,
		"rectangle": true,
		"cat-eye":   true,
		"square":    true,
		"geometric": true,
	}
)

// Slugify converts a product name into a URL-safe lowercase slug.
func Slugify(s string) string {
	var b strings.Builder
	prevDash := false
	for _, r := range strings.ToLower(strings.TrimSpace(s)) {
		switch {
		case (r >= 'a' && r <= 'z') || (r >= '0' && r <= '9'):
			b.WriteRune(r)
			prevDash = false
		case unicode.IsLetter(r) || unicode.IsDigit(r):
			b.WriteRune(r)
			prevDash = false
		default:
			if b.Len() > 0 && !prevDash {
				b.WriteByte('-')
				prevDash = true
			}
		}
	}
	res := strings.Trim(b.String(), "-")
	if len(res) > 80 {
		res = strings.TrimRight(res[:80], "-")
	}
	return res
}

// UniqueSlug returns base, or base-2, base-3, ... until exists(candidate) returns false.
func UniqueSlug(base string, exists func(slug string) (bool, error)) (string, error) {
	base = Slugify(base)
	if base == "" {
		base = "product"
	}
	candidate := base
	for i := 2; i <= 1000; i++ {
		taken, err := exists(candidate)
		if err != nil {
			return "", err
		}
		if !taken {
			return candidate, nil
		}
		candidate = fmt.Sprintf("%s-%d", base, i)
	}
	return "", fmt.Errorf("products: could not generate unique slug for %q", base)
}

type Input struct {
	Name        string `json:"name"`
	Brand       string `json:"brand"`
	Category    string `json:"category"`
	Gender      string `json:"gender"`
	FrameShape  string `json:"frameShape"`
	Material    string `json:"material"`
	Color       string `json:"color"`
	Price       *int32 `json:"price"`
	Description string `json:"description"`
	InStock     *bool  `json:"inStock"`
	Featured    *bool  `json:"featured"`
	SortOrder   *int32 `json:"sortOrder"`
}

func (in *Input) NormalizeAndValidate() error {
	in.Name = strings.TrimSpace(in.Name)
	in.Brand = strings.TrimSpace(in.Brand)
	in.Category = strings.ToLower(strings.TrimSpace(in.Category))
	in.Gender = strings.ToLower(strings.TrimSpace(in.Gender))
	if in.Gender == "" {
		in.Gender = "unisex"
	}
	in.FrameShape = strings.ToLower(strings.TrimSpace(in.FrameShape))
	in.Material = strings.TrimSpace(in.Material)
	in.Color = strings.TrimSpace(in.Color)
	in.Description = strings.TrimSpace(in.Description)

	switch {
	case in.Name == "":
		return fmt.Errorf("name is required")
	case len(in.Name) > 200:
		return fmt.Errorf("name must be 200 characters or fewer")
	case len(in.Brand) > 100:
		return fmt.Errorf("brand must be 100 characters or fewer")
	case !AllowedCategories[in.Category]:
		return fmt.Errorf("category must be one of: sunglasses, eyeglasses")
	case !AllowedGenders[in.Gender]:
		return fmt.Errorf("gender must be one of: men, women, unisex, kids")
	case !AllowedFrameShapes[in.FrameShape]:
		return fmt.Errorf("frameShape is not valid")
	case len(in.Material) > 100:
		return fmt.Errorf("material must be 100 characters or fewer")
	case len(in.Color) > 100:
		return fmt.Errorf("color must be 100 characters or fewer")
	case len(in.Description) > 4000:
		return fmt.Errorf("description must be 4000 characters or fewer")
	case in.Price != nil && *in.Price < 0:
		return fmt.Errorf("price must be zero or positive")
	}
	return nil
}

