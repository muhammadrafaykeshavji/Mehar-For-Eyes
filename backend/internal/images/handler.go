package images

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"mehar/backend/internal/db/sqlcgen"
)

type Store interface {
	GetProduct(ctx context.Context, id uuid.UUID) (sqlcgen.Product, error)
	ListProductImages(ctx context.Context, productID uuid.UUID) ([]sqlcgen.ProductImage, error)
	AddProductImage(ctx context.Context, arg sqlcgen.AddProductImageParams) (sqlcgen.ProductImage, error)
	DeleteProductImage(ctx context.Context, arg sqlcgen.DeleteProductImageParams) (sqlcgen.ProductImage, error)
	UpdateProductImagePosition(ctx context.Context, arg sqlcgen.UpdateProductImagePositionParams) (int64, error)
	CountProductImages(ctx context.Context, productID uuid.UUID) (int32, error)
}

type Service struct {
	store     Store
	uploadDir string
}

func NewService(store Store, uploadDir string) *Service {
	return &Service{
		store:     store,
		uploadDir: filepath.Clean(uploadDir),
	}
}

type ImageDTO struct {
	ID        uuid.UUID `json:"id"`
	ProductID uuid.UUID `json:"productId"`
	Path      string    `json:"path"`
	ThumbPath string    `json:"thumbPath"`
	Alt       string    `json:"alt"`
	Position  int32     `json:"position"`
}

func toDTO(img sqlcgen.ProductImage) ImageDTO {
	return ImageDTO{
		ID:        img.ID,
		ProductID: img.ProductID,
		Path:      img.Path,
		ThumbPath: thumbURLPath(img.Path),
		Alt:       img.Alt,
		Position:  img.Position,
	}
}

func thumbURLPath(p string) string {
	if strings.HasSuffix(p, ".webp") {
		return strings.TrimSuffix(p, ".webp") + "_thumb.webp"
	}
	return p
}

// Upload handles POST /api/admin/products/{id}/images (multipart/form-data).
// Accepts up to 8 files ("images" or "files" form field), max 5MB each, max 8 total per product.
func (s *Service) Upload(w http.ResponseWriter, r *http.Request) {
	productID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	prod, err := s.store.GetProduct(r.Context(), productID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "product not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	existingCount, err := s.store.CountProductImages(r.Context(), productID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	// Hard cap total request body: 8 * 5MB + 1MB multipart overhead.
	maxBody := int64(MaxImagesPerProd*MaxFileSize + (1 << 20))
	r.Body = http.MaxBytesReader(w, r.Body, maxBody)

	if err := r.ParseMultipartForm(10 << 20); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			writeError(w, http.StatusRequestEntityTooLarge, "upload payload exceeds maximum allowed size")
			return
		}
		writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}
	defer func() {
		if r.MultipartForm != nil {
			_ = r.MultipartForm.RemoveAll()
		}
	}()

	headers := r.MultipartForm.File["images"]
	if len(headers) == 0 {
		headers = r.MultipartForm.File["files"]
	}
	if len(headers) == 0 {
		writeError(w, http.StatusBadRequest, "no image files provided")
		return
	}
	if len(headers) > MaxImagesPerProd {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("at most %d images can be uploaded at once", MaxImagesPerProd))
		return
	}
	if int(existingCount)+len(headers) > MaxImagesPerProd {
		writeError(w, http.StatusBadRequest, fmt.Sprintf("product already has %d images; maximum is %d", existingCount, MaxImagesPerProd))
		return
	}

	alts := r.MultipartForm.Value["alt"]

	// Determine starting position from current images.
	existingImgs, err := s.store.ListProductImages(r.Context(), productID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	var nextPos int32
	for _, img := range existingImgs {
		if img.Position >= nextPos {
			nextPos = img.Position + 1
		}
	}

	type prepared struct {
		fileID uuid.UUID
		alt    string
		proc   ProcessedImage
	}
	items := make([]prepared, 0, len(headers))

	// Validate and process every file in memory before touching disk or DB.
	for i, fh := range headers {
		if fh.Size > MaxFileSize {
			writeError(w, http.StatusRequestEntityTooLarge, fmt.Sprintf("file %q exceeds 5MB limit", fh.Filename))
			return
		}
		f, err := fh.Open()
		if err != nil {
			writeError(w, http.StatusBadRequest, "failed to read uploaded file")
			return
		}
		raw, readErr := io.ReadAll(io.LimitReader(f, MaxFileSize+1))
		_ = f.Close()
		if readErr != nil {
			writeError(w, http.StatusBadRequest, "failed to read uploaded file")
			return
		}
		proc, err := Process(raw)
		if err != nil {
			status := http.StatusBadRequest
			if errors.Is(err, ErrTooLarge) {
				status = http.StatusRequestEntityTooLarge
			}
			writeError(w, status, err.Error())
			return
		}

		alt := strings.TrimSpace(prod.Name)
		if i < len(alts) && strings.TrimSpace(alts[i]) != "" {
			alt = strings.TrimSpace(alts[i])
		}
		if len(alt) > 200 {
			alt = alt[:200]
		}
		items = append(items, prepared{
			fileID: uuid.New(),
			alt:    alt,
			proc:   proc,
		})
	}

	prodDir := filepath.Join(s.uploadDir, "products", productID.String())
	if err := os.MkdirAll(prodDir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create upload directory")
		return
	}

	created := make([]ImageDTO, 0, len(items))
	var writtenFiles []string
	cleanup := func() {
		for _, p := range writtenFiles {
			_ = os.Remove(p)
		}
	}

	for i, item := range items {
		fullName := item.fileID.String() + ".webp"
		thumbName := item.fileID.String() + "_thumb.webp"
		fullDisk := filepath.Join(prodDir, fullName)
		thumbDisk := filepath.Join(prodDir, thumbName)

		if err := os.WriteFile(fullDisk, item.proc.Full, 0o644); err != nil {
			cleanup()
			writeError(w, http.StatusInternalServerError, "failed to save image")
			return
		}
		writtenFiles = append(writtenFiles, fullDisk)

		if err := os.WriteFile(thumbDisk, item.proc.Thumb, 0o644); err != nil {
			cleanup()
			writeError(w, http.StatusInternalServerError, "failed to save thumbnail")
			return
		}
		writtenFiles = append(writtenFiles, thumbDisk)

		urlPath := "/uploads/products/" + productID.String() + "/" + fullName
		row, err := s.store.AddProductImage(r.Context(), sqlcgen.AddProductImageParams{
			ProductID: productID,
			Path:      urlPath,
			Alt:       item.alt,
			Position:  nextPos + int32(i),
		})
		if err != nil {
			cleanup()
			writeError(w, http.StatusInternalServerError, "failed to record image")
			return
		}
		created = append(created, toDTO(row))
	}

	writeJSON(w, http.StatusCreated, map[string]any{"images": created})
}

type reorderRequest struct {
	ImageIDs []uuid.UUID `json:"imageIds"`
}

// Reorder handles PUT /api/admin/products/{id}/images.
// Body: {"imageIds": ["uuid1", "uuid2", ...]} in the desired display order.
func (s *Service) Reorder(w http.ResponseWriter, r *http.Request) {
	productID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 8192)
	var req reorderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	existing, err := s.store.ListProductImages(r.Context(), productID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	if len(req.ImageIDs) != len(existing) {
		writeError(w, http.StatusBadRequest, "imageIds must include all images of the product")
		return
	}
	known := make(map[uuid.UUID]bool, len(existing))
	for _, img := range existing {
		known[img.ID] = true
	}
	seen := make(map[uuid.UUID]bool, len(req.ImageIDs))
	for _, id := range req.ImageIDs {
		if !known[id] || seen[id] {
			writeError(w, http.StatusBadRequest, "invalid or duplicate image id in reorder list")
			return
		}
		seen[id] = true
	}

	for i, id := range req.ImageIDs {
		if _, err := s.store.UpdateProductImagePosition(r.Context(), sqlcgen.UpdateProductImagePositionParams{
			ID:        id,
			ProductID: productID,
			Position:  int32(i),
		}); err != nil {
			writeError(w, http.StatusInternalServerError, "failed to reorder images")
			return
		}
	}

	updated, err := s.store.ListProductImages(r.Context(), productID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	out := make([]ImageDTO, len(updated))
	for i, img := range updated {
		out[i] = toDTO(img)
	}
	writeJSON(w, http.StatusOK, map[string]any{"images": out})
}

// Delete handles DELETE /api/admin/products/{id}/images/{imageId}.
func (s *Service) Delete(w http.ResponseWriter, r *http.Request) {
	productID, err := uuid.Parse(chi.URLParam(r, "id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid product id")
		return
	}
	imageID, err := uuid.Parse(chi.URLParam(r, "imageId"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid image id")
		return
	}

	deleted, err := s.store.DeleteProductImage(r.Context(), sqlcgen.DeleteProductImageParams{
		ID:        imageID,
		ProductID: productID,
	})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			writeError(w, http.StatusNotFound, "image not found")
			return
		}
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	s.removeDiskFiles(deleted.Path)
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// RemoveProductDir removes /data/uploads/products/{productID} when a product is deleted.
func (s *Service) RemoveProductDir(productID uuid.UUID) {
	dir := filepath.Join(s.uploadDir, "products", productID.String())
	if rel, err := filepath.Rel(s.uploadDir, dir); err == nil && !strings.HasPrefix(rel, "..") {
		_ = os.RemoveAll(dir)
	}
}

// UploadHeroBanner handles POST /api/admin/site-assets/hero (multipart/form-data).
// Accepts a single image ("image", "file", or "images"), processes it into WebP, and saves to /uploads/site/hero-<uuid>.webp.
func (s *Service) UploadHeroBanner(w http.ResponseWriter, r *http.Request) {
	maxBody := int64(MaxFileSize + (1 << 20))
	r.Body = http.MaxBytesReader(w, r.Body, maxBody)

	if err := r.ParseMultipartForm(6 << 20); err != nil {
		var maxErr *http.MaxBytesError
		if errors.As(err, &maxErr) {
			writeError(w, http.StatusRequestEntityTooLarge, "upload payload exceeds maximum allowed size")
			return
		}
		writeError(w, http.StatusBadRequest, "invalid multipart form")
		return
	}
	defer func() {
		if r.MultipartForm != nil {
			_ = r.MultipartForm.RemoveAll()
		}
	}()

	headers := r.MultipartForm.File["image"]
	if len(headers) == 0 {
		headers = r.MultipartForm.File["file"]
	}
	if len(headers) == 0 {
		headers = r.MultipartForm.File["images"]
	}
	if len(headers) == 0 {
		writeError(w, http.StatusBadRequest, "no image file provided")
		return
	}

	fh := headers[0]
	if fh.Size > MaxFileSize {
		writeError(w, http.StatusRequestEntityTooLarge, "file exceeds 5MB limit")
		return
	}

	f, err := fh.Open()
	if err != nil {
		writeError(w, http.StatusBadRequest, "failed to read uploaded file")
		return
	}
	raw, readErr := io.ReadAll(io.LimitReader(f, MaxFileSize+1))
	_ = f.Close()
	if readErr != nil {
		writeError(w, http.StatusBadRequest, "failed to read uploaded file")
		return
	}

	proc, err := Process(raw)
	if err != nil {
		status := http.StatusBadRequest
		if errors.Is(err, ErrTooLarge) {
			status = http.StatusRequestEntityTooLarge
		}
		writeError(w, status, err.Error())
		return
	}

	siteDir := filepath.Join(s.uploadDir, "site")
	if err := os.MkdirAll(siteDir, 0o755); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to create upload directory")
		return
	}

	fileName := "hero-" + uuid.New().String() + ".webp"
	diskPath := filepath.Join(siteDir, fileName)
	if err := os.WriteFile(diskPath, proc.Full, 0o644); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to save hero image")
		return
	}

	urlPath := "/uploads/site/" + fileName
	writeJSON(w, http.StatusCreated, map[string]string{"url": urlPath})
}

func (s *Service) removeDiskFiles(urlPath string) {
	rel := strings.TrimPrefix(urlPath, "/uploads/")
	if rel == urlPath || rel == "" {
		return
	}
	fullDisk := filepath.Join(s.uploadDir, filepath.FromSlash(rel))
	if r, err := filepath.Rel(s.uploadDir, fullDisk); err != nil || strings.HasPrefix(r, "..") {
		return
	}
	_ = os.Remove(fullDisk)
	if strings.HasSuffix(fullDisk, ".webp") {
		_ = os.Remove(strings.TrimSuffix(fullDisk, ".webp") + "_thumb.webp")
	}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

