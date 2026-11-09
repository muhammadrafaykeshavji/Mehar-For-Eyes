package images

import (
	"bytes"
	"context"
	"encoding/json"
	"image"
	"image/color"
	"image/jpeg"
	"image/png"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"mehar/backend/internal/db/sqlcgen"
)

func makeJPEG(w, h int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	for y := 0; y < h; y++ {
		for x := 0; x < w; x++ {
			img.Set(x, y, color.RGBA{R: 120, G: 80, B: 40, A: 255})
		}
	}
	var buf bytes.Buffer
	_ = jpeg.Encode(&buf, img, &jpeg.Options{Quality: 85})
	return buf.Bytes()
}

func makePNG(w, h int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, w, h))
	var buf bytes.Buffer
	_ = png.Encode(&buf, img)
	return buf.Bytes()
}

func TestProcessResizesAndEncodesWebP(t *testing.T) {
	raw := makeJPEG(2400, 1200)
	out, err := Process(raw)
	if err != nil {
		t.Fatalf("Process failed: %v", err)
	}
	if http.DetectContentType(out.Full) != "image/webp" {
		t.Errorf("full MIME = %s, want image/webp", http.DetectContentType(out.Full))
	}
	if http.DetectContentType(out.Thumb) != "image/webp" {
		t.Errorf("thumb MIME = %s, want image/webp", http.DetectContentType(out.Thumb))
	}

	fullCfg, _, err := image.DecodeConfig(bytes.NewReader(out.Full))
	if err != nil {
		t.Fatalf("decode full webp: %v", err)
	}
	if fullCfg.Width != 1600 || fullCfg.Height != 800 {
		t.Errorf("full size = %dx%d, want 1600x800", fullCfg.Width, fullCfg.Height)
	}

	thumbCfg, _, err := image.DecodeConfig(bytes.NewReader(out.Thumb))
	if err != nil {
		t.Fatalf("decode thumb webp: %v", err)
	}
	if thumbCfg.Width != 600 || thumbCfg.Height != 300 {
		t.Errorf("thumb size = %dx%d, want 600x300", thumbCfg.Width, thumbCfg.Height)
	}
}

func TestProcessRejectsDisguisedAndOversizedFiles(t *testing.T) {
	if _, err := Process([]byte("<html><script>alert(1)</script></html>")); err == nil {
		t.Error("expected HTML disguised as image to fail")
	}
	// Fake JPEG magic bytes followed by garbage.
	if _, err := Process([]byte{0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 'J', 'F', 'I', 'F', 0, 1, 2, 3}); err == nil {
		t.Error("expected corrupt JPEG to fail")
	}
	oversized := make([]byte, MaxFileSize+10)
	if _, err := Process(oversized); err != ErrTooLarge {
		t.Errorf("expected ErrTooLarge, got %v", err)
	}
}

type fakeImageStore struct {
	prod   sqlcgen.Product
	images []sqlcgen.ProductImage
}

func (f *fakeImageStore) GetProduct(_ context.Context, id uuid.UUID) (sqlcgen.Product, error) {
	if id != f.prod.ID {
		return sqlcgen.Product{}, pgx.ErrNoRows
	}
	return f.prod, nil
}
func (f *fakeImageStore) ListProductImages(_ context.Context, _ uuid.UUID) ([]sqlcgen.ProductImage, error) {
	return append([]sqlcgen.ProductImage(nil), f.images...), nil
}
func (f *fakeImageStore) AddProductImage(_ context.Context, arg sqlcgen.AddProductImageParams) (sqlcgen.ProductImage, error) {
	row := sqlcgen.ProductImage{
		ID:        uuid.New(),
		ProductID: arg.ProductID,
		Path:      arg.Path,
		Alt:       arg.Alt,
		Position:  arg.Position,
	}
	f.images = append(f.images, row)
	return row, nil
}
func (f *fakeImageStore) DeleteProductImage(_ context.Context, arg sqlcgen.DeleteProductImageParams) (sqlcgen.ProductImage, error) {
	for i, img := range f.images {
		if img.ID == arg.ID && img.ProductID == arg.ProductID {
			f.images = append(f.images[:i], f.images[i+1:]...)
			return img, nil
		}
	}
	return sqlcgen.ProductImage{}, pgx.ErrNoRows
}
func (f *fakeImageStore) UpdateProductImagePosition(_ context.Context, arg sqlcgen.UpdateProductImagePositionParams) (int64, error) {
	for i := range f.images {
		if f.images[i].ID == arg.ID && f.images[i].ProductID == arg.ProductID {
			f.images[i].Position = arg.Position
			return 1, nil
		}
	}
	return 0, nil
}
func (f *fakeImageStore) CountProductImages(_ context.Context, _ uuid.UUID) (int32, error) {
	return int32(len(f.images)), nil
}

func TestUploadReorderDeleteFlow(t *testing.T) {
	tmp := t.TempDir()
	prodID := uuid.New()
	store := &fakeImageStore{
		prod: sqlcgen.Product{ID: prodID, Name: "Aviator Gold"},
	}
	svc := NewService(store, tmp)

	r := chi.NewRouter()
	r.Post("/api/admin/products/{id}/images", svc.Upload)
	r.Put("/api/admin/products/{id}/images", svc.Reorder)
	r.Delete("/api/admin/products/{id}/images/{imageId}", svc.Delete)

	// Upload 2 images
	var body bytes.Buffer
	mw := multipart.NewWriter(&body)
	fw1, _ := mw.CreateFormFile("images", "one.png")
	_, _ = fw1.Write(makePNG(400, 300))
	fw2, _ := mw.CreateFormFile("images", "two.jpg")
	_, _ = fw2.Write(makeJPEG(800, 600))
	_ = mw.Close()

	req := httptest.NewRequest("POST", "/api/admin/products/"+prodID.String()+"/images", &body)
	req.Header.Set("Content-Type", mw.FormDataContentType())
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	if rec.Code != http.StatusCreated {
		t.Fatalf("upload: got %d: %s", rec.Code, rec.Body.String())
	}

	var uploaded struct {
		Images []ImageDTO `json:"images"`
	}
	_ = json.Unmarshal(rec.Body.Bytes(), &uploaded)
	if len(uploaded.Images) != 2 {
		t.Fatalf("expected 2 images, got %d", len(uploaded.Images))
	}

	// Verify both full and _thumb files exist on disk
	prodDir := filepath.Join(tmp, "products", prodID.String())
	entries, _ := os.ReadDir(prodDir)
	if len(entries) != 4 {
		t.Fatalf("expected 4 files on disk (2 full + 2 thumb), got %d", len(entries))
	}

	// Reorder: swap positions
	reorderBody, _ := json.Marshal(map[string]any{
		"imageIds": []uuid.UUID{uploaded.Images[1].ID, uploaded.Images[0].ID},
	})
	reqReorder := httptest.NewRequest("PUT", "/api/admin/products/"+prodID.String()+"/images", bytes.NewReader(reorderBody))
	recReorder := httptest.NewRecorder()
	r.ServeHTTP(recReorder, reqReorder)
	if recReorder.Code != http.StatusOK {
		t.Fatalf("reorder: got %d: %s", recReorder.Code, recReorder.Body.String())
	}

	// Delete first image and verify its files are removed from disk
	reqDel := httptest.NewRequest("DELETE", "/api/admin/products/"+prodID.String()+"/images/"+uploaded.Images[0].ID.String(), nil)
	recDel := httptest.NewRecorder()
	r.ServeHTTP(recDel, reqDel)
	if recDel.Code != http.StatusOK {
		t.Fatalf("delete: got %d: %s", recDel.Code, recDel.Body.String())
	}
	entriesAfter, _ := os.ReadDir(prodDir)
	if len(entriesAfter) != 2 {
		t.Fatalf("expected 2 files remaining on disk, got %d", len(entriesAfter))
	}
}

