// Package products implements the public and admin product HTTP handlers.
package products

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"mehar/backend/internal/db/sqlcgen"
)

type Store interface {
	ListProducts(ctx context.Context, arg sqlcgen.ListProductsParams) ([]sqlcgen.Product, error)
	GetProductBySlug(ctx context.Context, slug string) (sqlcgen.Product, error)
	GetProduct(ctx context.Context, id uuid.UUID) (sqlcgen.Product, error)
	SlugExists(ctx context.Context, arg sqlcgen.SlugExistsParams) (bool, error)
	ListRelatedProducts(ctx context.Context, arg sqlcgen.ListRelatedProductsParams) ([]sqlcgen.Product, error)
	CreateProduct(ctx context.Context, arg sqlcgen.CreateProductParams) (sqlcgen.Product, error)
	UpdateProduct(ctx context.Context, arg sqlcgen.UpdateProductParams) (sqlcgen.Product, error)
	UpdateProductStock(ctx context.Context, arg sqlcgen.UpdateProductStockParams) (sqlcgen.Product, error)
	UpdateProductFeatured(ctx context.Context, arg sqlcgen.UpdateProductFeaturedParams) (sqlcgen.Product, error)
	DeleteProduct(ctx context.Context, id uuid.UUID) (int64, error)
	ListProductImages(ctx context.Context, productID uuid.UUID) ([]sqlcgen.ProductImage, error)
	ListImagesByProductIDs(ctx context.Context, productIds []uuid.UUID) ([]sqlcgen.ProductImage, error)
	AddProductImage(ctx context.Context, arg sqlcgen.AddProductImageParams) (sqlcgen.ProductImage, error)
}

type Service struct {
	store     Store
	onDeleted func(productID uuid.UUID)
}

func NewService(store Store, onDeleted ...func(productID uuid.UUID)) *Service {
	var fn func(uuid.UUID)
	if len(onDeleted) > 0 {
		fn = onDeleted[0]
	}
	return &Service{store: store, onDeleted: fn}
}

type ImageDTO struct {
	ID        uuid.UUID `json:"id"`
	Path      string    `json:"path"`
	ThumbPath string    `json:"thumbPath"`
	Alt       string    `json:"alt"`
	Position  int32     `json:"position"`
}

type ProductDTO struct {
	ID          uuid.UUID  `json:"id"`
	Slug        string     `json:"slug"`
	Name        string     `json:"name"`
	Brand       string     `json:"brand"`
	Category    string     `json:"category"`
	Gender      string     `json:"gender"`
	FrameShape  string     `json:"frameShape"`
	Material    string     `json:"material"`
	Color       string     `json:"color"`
	Price       *int32     `json:"price,omitempty"`
	Images      []string   `json:"images"`
	ImageItems  []ImageDTO `json:"imageItems"`
	Description string     `json:"description"`
	InStock     bool       `json:"inStock"`
	Featured    bool       `json:"featured"`
	SortOrder   int32      `json:"sortOrder"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}

func toDTO(p sqlcgen.Product, imgs []sqlcgen.ProductImage) ProductDTO {
	var price *int32
	if p.Price.Valid {
		v := p.Price.Int32
		price = &v
	}
	paths := make([]string, 0, len(imgs))
	items := make([]ImageDTO, 0, len(imgs))
	for _, img := range imgs {
		paths = append(paths, img.Path)
		thumb := img.Path
		if strings.HasSuffix(thumb, ".webp") {
			thumb = strings.TrimSuffix(thumb, ".webp") + "_thumb.webp"
		}
		items = append(items, ImageDTO{
			ID:        img.ID,
			Path:      img.Path,
			ThumbPath: thumb,
			Alt:       img.Alt,
			Position:  img.Position,
		})
	}
	return ProductDTO{
		ID:          p.ID,
		Slug:        p.Slug,
		Name:        p.Name,
		Brand:       p.Brand,
		Category:    p.Category,
		Gender:      p.Gender,
		FrameShape:  p.FrameShape,
		Material:    p.Material,
		Color:       p.Color,
		Price:       price,
		Images:      paths,
		ImageItems:  items,
		Description: p.Description,
		InStock:     p.InStock,
		Featured:    p.Featured,
		SortOrder:   p.SortOrder,
		CreatedAt:   p.CreatedAt.Time,
		UpdatedAt:   p.UpdatedAt.Time,
	}
}

func (s *Service) attachImages(ctx context.Context, list []sqlcgen.Product) ([]ProductDTO, error) {
	if len(list) == 0 {
		return []ProductDTO{}, nil
	}
	ids := make([]uuid.UUID, len(list))
	for i, p := range list {
		ids[i] = p.ID
	}
	imgs, err := s.store.ListImagesByProductIDs(ctx, ids)
	if err != nil {
		return nil, err
	}
	byProduct := make(map[uuid.UUID][]sqlcgen.ProductImage, len(list))
	for _, img := range imgs {
		byProduct[img.ProductID] = append(byProduct[img.ProductID], img)
	}
	out := make([]ProductDTO, len(list))
	for i, p := range list {
		out[i] = toDTO(p, byProduct[p.ID])
	}
	return out, nil
}

// List handles GET /api/products.
func (s *Service) List(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	var params sqlcgen.ListProductsParams

	if v := strings.ToLower(strings.TrimSpace(q.Get("category"))); v != "" {
		params.Category = pgtype.Text{String: v, Valid: true}
	}
	if v := strings.ToLower(strings.TrimSpace(q.Get("gender"))); v != "" {
		params.Gender = pgtype.Text{String: v, Valid: true}
	}
	shape := strings.ToLower(strings.TrimSpace(q.Get("frame_shape")))
	if shape == "" {
		shape = strings.ToLower(strings.TrimSpace(q.Get("frameShape")))
	}
	if shape != "" {
		params.FrameShape = pgtype.Text{String: shape, Valid: true}
	}
	if v := strings.TrimSpace(q.Get("featured")); v != "" {
		b, err := strconv.ParseBool(v)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid featured parameter")
			return
		}
		params.Featured = pgtype.Bool{Bool: b, Valid: true}
	}
	inStockRaw := strings.TrimSpace(q.Get("in_stock"))
	if inStockRaw == "" {
		inStockRaw = strings.TrimSpace(q.Get("inStock"))
	}
	if inStockRaw != "" {
		b, err := strconv.ParseBool(inStockRaw)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid in_stock parameter")
			return
		}
		params.InStock = pgtype.Bool{Bool: b, Valid: true}
	}
	if v := strings.TrimSpace(q.Get("q")); v != "" {
		params.Q = pgtype.Text{String: v, Valid: true}
	}

	limit := int32(48)
	if v := strings.TrimSpace(q.Get("limit")); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 1 || n > 100 {
			writeError(w, http.StatusBadRequest, "limit must be between 1 and 100")
			return
		}
		limit = int32(n)
	}
	offset := int32(0)
	if v := strings.TrimSpace(q.Get("offset")); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 0 {
			writeError(w, http.StatusBadRequest, "offset must be 0 or greater")
			return
		}
		offset = int32(n)
	} else if v := strings.TrimSpace(q.Get("page")); v != "" {
		n, err := strconv.Atoi(v)
		if err != nil || n < 1 {
			writeError(w, http.StatusBadRequest, "page must be 1 or greater")
			return
		}
		offset = int32(n-1) * limit
	}
	params.Lim = limit
	params.Off = offset

	rows, err := s.store.ListProducts(r.Context(), params)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	dtos, err := s.attachImages(r.Context(), rows)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"products": dtos,
		"limit":    limit,
		"offset":   offset,
	})
}

// GetBySlug handles GET /api/products/{slug}.
func (s *Service) GetBySlug(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	p, err := s.store.GetProductBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	imgs, err := s.store.ListProductImages(r.Context(), p.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, toDTO(p, imgs))
}

// GetByID handles GET /api/admin/products/{id}.
func (s *Service) GetByID(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}
	p, err := s.store.GetProduct(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	imgs, err := s.store.ListProductImages(r.Context(), p.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, toDTO(p, imgs))
}

// Related handles GET /api/products/{slug}/related.
func (s *Service) Related(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	p, err := s.store.GetProductBySlug(r.Context(), slug)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	rows, err := s.store.ListRelatedProducts(r.Context(), sqlcgen.ListRelatedProductsParams{
		Slug:       p.Slug,
		Category:   p.Category,
		Brand:      p.Brand,
		FrameShape: p.FrameShape,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	dtos, err := s.attachImages(r.Context(), rows)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"products": dtos})
}

// Create handles POST /api/admin/products.
func (s *Service) Create(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, 32*1024)
	var in Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := in.NormalizeAndValidate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	slug, err := UniqueSlug(in.Name, func(cand string) (bool, error) {
		return s.store.SlugExists(r.Context(), sqlcgen.SlugExistsParams{Slug: cand})
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	inStock := true
	if in.InStock != nil {
		inStock = *in.InStock
	}
	featured := false
	if in.Featured != nil {
		featured = *in.Featured
	}
	var sortOrder int32
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}
	var price pgtype.Int4
	if in.Price != nil {
		price = pgtype.Int4{Int32: *in.Price, Valid: true}
	}

	p, err := s.store.CreateProduct(r.Context(), sqlcgen.CreateProductParams{
		Slug:        slug,
		Name:        in.Name,
		Brand:       in.Brand,
		Category:    in.Category,
		Gender:      in.Gender,
		FrameShape:  in.FrameShape,
		Material:    in.Material,
		Color:       in.Color,
		Price:       price,
		Description: in.Description,
		InStock:     inStock,
		Featured:    featured,
		SortOrder:   sortOrder,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusCreated, toDTO(p, nil))
}

// Update handles PUT /api/admin/products/{id}.
func (s *Service) Update(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}
	existing, err := s.store.GetProduct(r.Context(), id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 32*1024)
	var in Input
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}
	if err := in.NormalizeAndValidate(); err != nil {
		writeError(w, http.StatusBadRequest, err.Error())
		return
	}

	slug := existing.Slug
	if !strings.EqualFold(existing.Name, in.Name) {
		slug, err = UniqueSlug(in.Name, func(cand string) (bool, error) {
			return s.store.SlugExists(r.Context(), sqlcgen.SlugExistsParams{
				Slug:      cand,
				ExcludeID: uuid.NullUUID{UUID: id, Valid: true},
			})
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
	}

	inStock := existing.InStock
	if in.InStock != nil {
		inStock = *in.InStock
	}
	featured := existing.Featured
	if in.Featured != nil {
		featured = *in.Featured
	}
	sortOrder := existing.SortOrder
	if in.SortOrder != nil {
		sortOrder = *in.SortOrder
	}
	var price pgtype.Int4
	if in.Price != nil {
		price = pgtype.Int4{Int32: *in.Price, Valid: true}
	}

	p, err := s.store.UpdateProduct(r.Context(), sqlcgen.UpdateProductParams{
		ID:          id,
		Slug:        slug,
		Name:        in.Name,
		Brand:       in.Brand,
		Category:    in.Category,
		Gender:      in.Gender,
		FrameShape:  in.FrameShape,
		Material:    in.Material,
		Color:       in.Color,
		Price:       price,
		Description: in.Description,
		InStock:     inStock,
		Featured:    featured,
		SortOrder:   sortOrder,
	})
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	imgs, err := s.store.ListProductImages(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	writeJSON(w, http.StatusOK, toDTO(p, imgs))
}

// Delete handles DELETE /api/admin/products/{id}.
func (s *Service) Delete(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}
	n, err := s.store.DeleteProduct(r.Context(), id)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if n == 0 {
		writeError(w, http.StatusNotFound, "product not found")
		return
	}
	if s.onDeleted != nil {
		s.onDeleted(id)
	}
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

type stockPatch struct {
	InStock *bool `json:"inStock"`
}

// PatchStock handles PATCH /api/admin/products/{id}/stock.
func (s *Service) PatchStock(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1024)
	var body stockPatch
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.InStock == nil {
		writeError(w, http.StatusBadRequest, "inStock boolean is required")
		return
	}
	p, err := s.store.UpdateProductStock(r.Context(), sqlcgen.UpdateProductStockParams{
		ID:      id,
		InStock: *body.InStock,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	imgs, _ := s.store.ListProductImages(r.Context(), id)
	writeJSON(w, http.StatusOK, toDTO(p, imgs))
}

type featuredPatch struct {
	Featured *bool `json:"featured"`
}

// PatchFeatured handles PATCH /api/admin/products/{id}/featured.
func (s *Service) PatchFeatured(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1024)
	var body featuredPatch
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Featured == nil {
		writeError(w, http.StatusBadRequest, "featured boolean is required")
		return
	}
	p, err := s.store.UpdateProductFeatured(r.Context(), sqlcgen.UpdateProductFeaturedParams{
		ID:       id,
		Featured: *body.Featured,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	imgs, _ := s.store.ListProductImages(r.Context(), id)
	writeJSON(w, http.StatusOK, toDTO(p, imgs))
}

// SeedSampleCatalog handles POST /api/admin/products/seed.
// Seeds 8 realistic sample optical and sunglass frames if they don't already exist.
func (s *Service) SeedSampleCatalog(w http.ResponseWriter, r *http.Request) {
	type sampleItem struct {
		Slug        string
		Name        string
		Brand       string
		Category    string
		Gender      string
		FrameShape  string
		Material    string
		Color       string
		Price       int32
		Description string
		Featured    bool
		SortOrder   int32
		ImagePath   string
	}

	samples := []sampleItem{
		{
			Slug:        "aether-aviator-24k-gold",
			Name:        "Aether Aviator 24K Gold",
			Brand:       "Mehar Atelier",
			Category:    "sunglasses",
			Gender:      "unisex",
			FrameShape:  "aviator",
			Material:    "Japanese Beta-Titanium",
			Color:       "Brushed Champagne Gold / G15 Green Lens",
			Price:       6800,
			Description: "Featherweight beta-titanium double-bridge aviator with polarized UV400 green mineral glass lenses and adjustable silicone nose pads.",
			Featured:    true,
			SortOrder:   1,
			ImagePath:   "/images/products/aviator-gold.jpg",
		},
		{
			Slug:        "kyoto-round-havana-tortoise",
			Name:        "Kyoto Round Havana Tortoise",
			Brand:       "Mehar Studio",
			Category:    "eyeglasses",
			Gender:      "unisex",
			FrameShape:  "round",
			Material:    "Mazzucchelli Acetate",
			Color:       "Warm Amber Tortoiseshell",
			Price:       5200,
			Description: "Hand-polished Italian tortoise acetate with a keyhole bridge and 5-barrel German hinges. Ideal for single-vision, blue-cut, or progressive lenses.",
			Featured:    true,
			SortOrder:   2,
			ImagePath:   "/images/products/round-tortoise.jpg",
		},
		{
			Slug:        "architect-rectangle-obsidian",
			Name:        "Architect Rectangle Obsidian",
			Brand:       "Mehar Optical",
			Category:    "eyeglasses",
			Gender:      "men",
			FrameShape:  "rectangle",
			Material:    "High-Density Acetate & Steel Core",
			Color:       "Obsidian Matte Black",
			Price:       4900,
			Description: "Crisp architectural rectangular silhouette engineered for all-day prescription wear. Balances round and oval face shapes with clean horizontal lines.",
			Featured:    true,
			SortOrder:   3,
			ImagePath:   "/images/products/rectangle-black.jpg",
		},
		{
			Slug:        "velours-cat-eye-bordeaux",
			Name:        "Velours Cat-Eye Bordeaux",
			Brand:       "Mehar Atelier",
			Category:    "eyeglasses",
			Gender:      "women",
			FrameShape:  "cat-eye",
			Material:    "Sculpted Italian Acetate",
			Color:       "Deep Burgundy & Rose Gold Pins",
			Price:       5600,
			Description: "Subtle upswept cat-eye frame in rich burgundy acetate that lifts the cheekbones while accommodating high-index and progressive prescriptions.",
			Featured:    true,
			SortOrder:   4,
			ImagePath:   "/images/products/cat-eye-burgundy.jpg",
		},
		{
			Slug:        "nomad-wayfarer-stealth-matte",
			Name:        "Nomad Wayfarer Stealth Matte",
			Brand:       "Mehar Sun",
			Category:    "sunglasses",
			Gender:      "unisex",
			FrameShape:  "wayfarer",
			Material:    "Cellulose Acetate",
			Color:       "Matte Charcoal / Smoke Polarized",
			Price:       5900,
			Description: "Iconic wayfarer proportions with anti-glare polarized smoke lenses. Can also be fitted with custom prescription sun or Transitions photochromic lenses.",
			Featured:    true,
			SortOrder:   5,
			ImagePath:   "/images/products/wayfarer-matte.jpg",
		},
		{
			Slug:        "lumiere-oval-sterling-silver",
			Name:        "Lumiere Oval Sterling Silver",
			Brand:       "Mehar Studio",
			Category:    "eyeglasses",
			Gender:      "unisex",
			FrameShape:  "oval",
			Material:    "Surgical Stainless Steel",
			Color:       "Polished Sterling Silver",
			Price:       4600,
			Description: "Minimalist ultra-thin oval wire frame weighing under 14 grams. Softens angular jawlines and pairs effortlessly with blue-light filtering lenses.",
			Featured:    true,
			SortOrder:   6,
			ImagePath:   "/images/products/oval-silver.jpg",
		},
		{
			Slug:        "solaris-aviator-optical-gold",
			Name:        "Solaris Navigator Optical",
			Brand:       "Mehar Optical",
			Category:    "eyeglasses",
			Gender:      "men",
			FrameShape:  "aviator",
			Material:    "Titanium Alloy",
			Color:       "Satin Gold",
			Price:       6200,
			Description: "Contemporary double-bar navigator designed specifically for clear prescription and photochromic lenses.",
			Featured:    false,
			SortOrder:   7,
			ImagePath:   "/images/products/aviator-gold.jpg",
		},
		{
			Slug:        "mini-explorer-flex-junior",
			Name:        "Mini Explorer Flex Junior",
			Brand:       "Mehar Kids",
			Category:    "eyeglasses",
			Gender:      "kids",
			FrameShape:  "round",
			Material:    "TR90 Flexible Polymer",
			Color:       "Tortoise & Warm Caramel",
			Price:       3500,
			Description: "Impact-resistant, bendable TR90 frame built for active kids, paired with scratch-guarded polycarbonate prescription lenses.",
			Featured:    false,
			SortOrder:   8,
			ImagePath:   "/images/products/round-tortoise.jpg",
		},
	}

	var createdCount int
	for _, item := range samples {
		exists, err := s.store.SlugExists(r.Context(), sqlcgen.SlugExistsParams{Slug: item.Slug})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to check existing products")
			return
		}
		if exists {
			continue
		}

		p, err := s.store.CreateProduct(r.Context(), sqlcgen.CreateProductParams{
			Slug:        item.Slug,
			Name:        item.Name,
			Brand:       item.Brand,
			Category:    item.Category,
			Gender:      item.Gender,
			FrameShape:  item.FrameShape,
			Material:    item.Material,
			Color:       item.Color,
			Price:       pgtype.Int4{Int32: item.Price, Valid: true},
			Description: item.Description,
			InStock:     true,
			Featured:    item.Featured,
			SortOrder:   item.SortOrder,
		})
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to seed sample product")
			return
		}

		_, _ = s.store.AddProductImage(r.Context(), sqlcgen.AddProductImageParams{
			ProductID: p.ID,
			Path:      item.ImagePath,
			Alt:       item.Name + " — " + item.Color,
			Position:  0,
		})
		createdCount++
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"created": createdCount,
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

