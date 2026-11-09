// Package images handles image validation, decoding, resizing, WebP re-encoding, and upload endpoints.
package images

import (
	"bytes"
	"errors"
	"fmt"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"net/http"

	"github.com/HugoSmits86/nativewebp"
	"golang.org/x/image/draw"
	_ "golang.org/x/image/webp"
)

const (
	MaxFileSize       = 5 << 20 // 5 MiB per file
	MaxImagesPerProd  = 8
	MaxFullDimension  = 1600
	MaxThumbDimension = 600
	MaxSourcePixels   = 10000 // guard against decompression bombs
)

var (
	ErrUnsupportedType = errors.New("unsupported image format; only JPEG, PNG, and WebP are allowed")
	ErrTooLarge        = errors.New("file exceeds 5MB limit")
	ErrCorruptImage    = errors.New("invalid or corrupt image data")
	ErrDimensions      = errors.New("image dimensions are invalid or too large")
)

var allowedMIME = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
}

type ProcessedImage struct {
	Full  []byte
	Thumb []byte
}

// Process sniffs the real content type, decodes the image (stripping EXIF and
// any embedded metadata), resizes to max 1600px (and 600px thumbnail), and
// re-encodes both as WebP.
func Process(raw []byte) (ProcessedImage, error) {
	if len(raw) == 0 {
		return ProcessedImage{}, ErrCorruptImage
	}
	if len(raw) > MaxFileSize {
		return ProcessedImage{}, ErrTooLarge
	}

	mime := http.DetectContentType(raw)
	if !allowedMIME[mime] {
		return ProcessedImage{}, ErrUnsupportedType
	}

	cfg, _, err := image.DecodeConfig(bytes.NewReader(raw))
	if err != nil {
		return ProcessedImage{}, fmt.Errorf("%w: %v", ErrCorruptImage, err)
	}
	if cfg.Width <= 0 || cfg.Height <= 0 || cfg.Width > MaxSourcePixels || cfg.Height > MaxSourcePixels {
		return ProcessedImage{}, ErrDimensions
	}

	src, _, err := image.Decode(bytes.NewReader(raw))
	if err != nil {
		return ProcessedImage{}, fmt.Errorf("%w: %v", ErrCorruptImage, err)
	}

	fullImg := resizeFit(src, MaxFullDimension)
	thumbImg := resizeFit(src, MaxThumbDimension)

	var fullBuf, thumbBuf bytes.Buffer
	if err := nativewebp.Encode(&fullBuf, fullImg, nil); err != nil {
		return ProcessedImage{}, fmt.Errorf("webp encode full: %w", err)
	}
	if err := nativewebp.Encode(&thumbBuf, thumbImg, nil); err != nil {
		return ProcessedImage{}, fmt.Errorf("webp encode thumb: %w", err)
	}

	return ProcessedImage{
		Full:  fullBuf.Bytes(),
		Thumb: thumbBuf.Bytes(),
	}, nil
}

// resizeFit scales src down so its longest edge is at most maxEdge, preserving
// aspect ratio. Images already smaller than maxEdge are copied into a fresh
// RGBA canvas so no metadata or sub-image state survives.
func resizeFit(src image.Image, maxEdge int) *image.NRGBA {
	b := src.Bounds()
	w, h := b.Dx(), b.Dy()
	newW, newH := w, h
	if w > maxEdge || h > maxEdge {
		if w >= h {
			newW = maxEdge
			newH = max(1, (h*maxEdge+w/2)/w)
		} else {
			newH = maxEdge
			newW = max(1, (w*maxEdge+h/2)/h)
		}
	}
	dst := image.NewNRGBA(image.Rect(0, 0, newW, newH))
	if newW == w && newH == h {
		draw.Draw(dst, dst.Bounds(), src, b.Min, draw.Src)
	} else {
		draw.CatmullRom.Scale(dst, dst.Bounds(), src, b, draw.Over, nil)
	}
	return dst
}

