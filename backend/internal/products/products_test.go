package products

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"mehar/backend/internal/db/sqlcgen"
)

func TestSlugify(t *testing.T) {
	cases := []struct {
		in   string
		want string
	}{
		{"Aviator Gold", "aviator-gold"},
		{"  TODO — Round Tortoise!! ", "todo-round-tortoise"},
		{"Cat-Eye   2026", "cat-eye-2026"},
		{"---", ""},
	}
	for _, tc := range cases {
		if got := Slugify(tc.in); got != tc.want {
			t.Errorf("Slugify(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestUniqueSlug(t *testing.T) {
	taken := map[string]bool{
		"aviator-gold":   true,
		"aviator-gold-2": true,
	}
	got, err := UniqueSlug("Aviator Gold", func(s string) (bool, error) {
		return taken[s], nil
	})
	if err != nil {
		t.Fatal(err)
	}
	if got != "aviator-gold-3" {
		t.Errorf("got %q, want aviator-gold-3", got)
	}
}

func TestValidation(t *testing.T) {
	valid := func() Input {
		return Input{
			Name:       "Classic Aviator",
			Brand:      "Mehar",
			Category:   "sunglasses",
			Gender:     "unisex",
			FrameShape: "aviator",
		}
	}

	in := valid()
	if err := in.NormalizeAndValidate(); err != nil {
		t.Fatalf("expected valid, got: %v", err)
	}

	badName := valid()
	badName.Name = "   "
	if err := badName.NormalizeAndValidate(); err == nil {
		t.Error("expected empty name to fail")
	}

	badCat := valid()
	badCat.Category = "shoes"
	if err := badCat.NormalizeAndValidate(); err == nil {
		t.Error("expected invalid category to fail")
	}

	badGender := valid()
	badGender.Gender = "everyone"
	if err := badGender.NormalizeAndValidate(); err == nil {
		t.Error("expected invalid gender to fail")
	}

	badShape := valid()
	badShape.FrameShape = "triangle"
	if err := badShape.NormalizeAndValidate(); err == nil {
		t.Error("expected invalid frameShape to fail")
	}

	negPrice := valid()
	p := int32(-100)
	negPrice.Price = &p
	if err := negPrice.NormalizeAndValidate(); err == nil {
		t.Error("expected negative price to fail")
	}
}

type fakeStore struct {
	byID   map[uuid.UUID]sqlcgen.Product
	bySlug map[string]uuid.UUID
}

func newFakeStore() *fakeStore {
	return &fakeStore{
		byID:   map[uuid.UUID]sqlcgen.Product{},
		bySlug: map[string]uuid.UUID{},
	}
}

func (f *fakeStore) ListProducts(_ context.Context, _ sqlcgen.ListProductsParams) ([]sqlcgen.Product, error) {
	out := make([]sqlcgen.Product, 0, len(f.byID))
	for _, p := range f.byID {
		out = append(out, p)
	}
	return out, nil
}
func (f *fakeStore) GetProductBySlug(_ context.Context, slug string) (sqlcgen.Product, error) {
	id, ok := f.bySlug[slug]
	if !ok {
		return sqlcgen.Product{}, pgx.ErrNoRows
	}
	return f.byID[id], nil
}
func (f *fakeStore) GetProduct(_ context.Context, id uuid.UUID) (sqlcgen.Product, error) {
	p, ok := f.byID[id]
	if !ok {
		return sqlcgen.Product{}, pgx.ErrNoRows
	}
	return p, nil
}
func (f *fakeStore) SlugExists(_ context.Context, arg sqlcgen.SlugExistsParams) (bool, error) {
	id, ok := f.bySlug[arg.Slug]
	if !ok {
		return false, nil
	}
	if arg.ExcludeID.Valid && id == arg.ExcludeID.UUID {
		return false, nil
	}
	return true, nil
}
func (f *fakeStore) ListRelatedProducts(_ context.Context, _ sqlcgen.ListRelatedProductsParams) ([]sqlcgen.Product, error) {
	return nil, nil
}
func (f *fakeStore) CreateProduct(_ context.Context, arg sqlcgen.CreateProductParams) (sqlcgen.Product, error) {
	p := sqlcgen.Product{
		ID:          uuid.New(),
		Slug:        arg.Slug,
		Name:        arg.Name,
		Brand:       arg.Brand,
		Category:    arg.Category,
		Gender:      arg.Gender,
		FrameShape:  arg.FrameShape,
		Material:    arg.Material,
		Color:       arg.Color,
		Price:       arg.Price,
		Description: arg.Description,
		InStock:     arg.InStock,
		Featured:    arg.Featured,
		SortOrder:   arg.SortOrder,
	}
	f.byID[p.ID] = p
	f.bySlug[p.Slug] = p.ID
	return p, nil
}
func (f *fakeStore) UpdateProduct(_ context.Context, arg sqlcgen.UpdateProductParams) (sqlcgen.Product, error) {
	old, ok := f.byID[arg.ID]
	if !ok {
		return sqlcgen.Product{}, pgx.ErrNoRows
	}
	delete(f.bySlug, old.Slug)
	p := sqlcgen.Product{
		ID:          arg.ID,
		Slug:        arg.Slug,
		Name:        arg.Name,
		Brand:       arg.Brand,
		Category:    arg.Category,
		Gender:      arg.Gender,
		FrameShape:  arg.FrameShape,
		Material:    arg.Material,
		Color:       arg.Color,
		Price:       arg.Price,
		Description: arg.Description,
		InStock:     arg.InStock,
		Featured:    arg.Featured,
		SortOrder:   arg.SortOrder,
	}
	f.byID[p.ID] = p
	f.bySlug[p.Slug] = p.ID
	return p, nil
}
func (f *fakeStore) UpdateProductStock(_ context.Context, arg sqlcgen.UpdateProductStockParams) (sqlcgen.Product, error) {
	p, ok := f.byID[arg.ID]
	if !ok {
		return sqlcgen.Product{}, pgx.ErrNoRows
	}
	p.InStock = arg.InStock
	f.byID[p.ID] = p
	return p, nil
}
func (f *fakeStore) UpdateProductFeatured(_ context.Context, arg sqlcgen.UpdateProductFeaturedParams) (sqlcgen.Product, error) {
	p, ok := f.byID[arg.ID]
	if !ok {
		return sqlcgen.Product{}, pgx.ErrNoRows
	}
	p.Featured = arg.Featured
	f.byID[p.ID] = p
	return p, nil
}
func (f *fakeStore) DeleteProduct(_ context.Context, id uuid.UUID) (int64, error) {
	p, ok := f.byID[id]
	if !ok {
		return 0, nil
	}
	delete(f.bySlug, p.Slug)
	delete(f.byID, id)
	return 1, nil
}
func (f *fakeStore) ListProductImages(_ context.Context, _ uuid.UUID) ([]sqlcgen.ProductImage, error) {
	return nil, nil
}
func (f *fakeStore) ListImagesByProductIDs(_ context.Context, _ []uuid.UUID) ([]sqlcgen.ProductImage, error) {
	return nil, nil
}
func (f *fakeStore) AddProductImage(_ context.Context, arg sqlcgen.AddProductImageParams) (sqlcgen.ProductImage, error) {
	return sqlcgen.ProductImage{
		ID:        uuid.New(),
		ProductID: arg.ProductID,
		Path:      arg.Path,
		Alt:       arg.Alt,
		Position:  arg.Position,
	}, nil
}

func TestHandlersEndToEnd(t *testing.T) {
	svc := NewService(newFakeStore())
	r := chi.NewRouter()
	r.Get("/api/products", svc.List)
	r.Get("/api/products/{slug}", svc.GetBySlug)
	r.Post("/api/admin/products", svc.Create)
	r.Patch("/api/admin/products/{id}/stock", svc.PatchStock)
	r.Delete("/api/admin/products/{id}", svc.Delete)

	body := `{"name":"Aviator Gold","category":"sunglasses","gender":"unisex","frameShape":"aviator"}`
	req := httptest.NewRequest("POST", "/api/admin/products", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("create 1: got %d: %s", rec.Code, rec.Body.String())
	}
	var p1 ProductDTO
	_ = json.Unmarshal(rec.Body.Bytes(), &p1)
	if p1.Slug != "aviator-gold" {
		t.Errorf("slug 1 = %q", p1.Slug)
	}

	// Second with same name gets -2 slug.
	req2 := httptest.NewRequest("POST", "/api/admin/products", bytes.NewBufferString(body))
	rec2 := httptest.NewRecorder()
	r.ServeHTTP(rec2, req2)
	var p2 ProductDTO
	_ = json.Unmarshal(rec2.Body.Bytes(), &p2)
	if p2.Slug != "aviator-gold-2" {
		t.Errorf("slug 2 = %q, want aviator-gold-2", p2.Slug)
	}

	// Toggle stock off.
	reqPatch := httptest.NewRequest("PATCH", "/api/admin/products/"+p1.ID.String()+"/stock", bytes.NewBufferString(`{"inStock":false}`))
	recPatch := httptest.NewRecorder()
	r.ServeHTTP(recPatch, reqPatch)
	if recPatch.Code != http.StatusOK {
		t.Fatalf("patch stock: got %d", recPatch.Code)
	}
}

