// Package http wires the HTTP router and middleware.
package http

import (
	"context"
	"encoding/json"
	nethttp "net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"mehar/backend/internal/auth"
	"mehar/backend/internal/images"
	"mehar/backend/internal/products"
	"mehar/backend/internal/settings"
)

type Pinger interface {
	Ping(ctx context.Context) error
}

func NewRouter(
	db Pinger,
	authSvc *auth.Service,
	prodSvc *products.Service,
	imgSvc *images.Service,
	settingsSvc *settings.Service,
	uploadDir string,
) nethttp.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(25 * time.Second))
	r.Use(corsMiddleware(authSvc.AllowedOrigin()))

	r.Get("/healthz", func(w nethttp.ResponseWriter, req *nethttp.Request) {
		ctx, cancel := context.WithTimeout(req.Context(), 2*time.Second)
		defer cancel()
		if err := db.Ping(ctx); err != nil {
			writeJSON(w, nethttp.StatusServiceUnavailable, map[string]string{"status": "db unavailable"})
			return
		}
		writeJSON(w, nethttp.StatusOK, map[string]string{"status": "ok"})
	})

	// Serve uploaded images at /uploads/* (with directory listing disabled).
	if uploadDir != "" {
		fs := nethttp.StripPrefix("/uploads/", noDirListing(nethttp.FileServer(nethttp.Dir(uploadDir))))
		r.Get("/uploads/*", func(w nethttp.ResponseWriter, req *nethttp.Request) {
			w.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
			w.Header().Set("X-Content-Type-Options", "nosniff")
			fs.ServeHTTP(w, req)
		})
	}

	// Public site settings route
	r.Get("/api/settings", settingsSvc.Get)

	// Public product routes
	r.Route("/api/products", func(r chi.Router) {
		r.Get("/", prodSvc.List)
		r.Get("/{slug}", prodSvc.GetBySlug)
		r.Get("/{slug}/related", prodSvc.Related)
	})

	// Admin routes
	r.Route("/api/admin", func(r chi.Router) {
		r.Use(authSvc.CheckOrigin)
		r.Post("/login", authSvc.Login)
		r.Post("/logout", authSvc.Logout)

		// Everything registered here requires a valid session.
		r.Group(func(r chi.Router) {
			r.Use(authSvc.RequireSession)
			r.Get("/me", authSvc.Me)

			r.Get("/settings", settingsSvc.Get)
			r.Put("/settings", settingsSvc.Update)
			r.Post("/site-assets/hero", imgSvc.UploadHeroBanner)

			r.Post("/products/seed", prodSvc.SeedSampleCatalog)
			r.Get("/products/{id}", prodSvc.GetByID)
			r.Post("/products", prodSvc.Create)
			r.Put("/products/{id}", prodSvc.Update)
			r.Delete("/products/{id}", prodSvc.Delete)
			r.Patch("/products/{id}/stock", prodSvc.PatchStock)
			r.Patch("/products/{id}/featured", prodSvc.PatchFeatured)

			r.Post("/products/{id}/images", imgSvc.Upload)
			r.Put("/products/{id}/images", imgSvc.Reorder)
			r.Delete("/products/{id}/images/{imageId}", imgSvc.Delete)
		})
	})
	return r
}

func corsMiddleware(allowOrigin string) func(nethttp.Handler) nethttp.Handler {
	return func(next nethttp.Handler) nethttp.Handler {
		return nethttp.HandlerFunc(func(w nethttp.ResponseWriter, r *nethttp.Request) {
			if allowOrigin != "" && r.Header.Get("Origin") == allowOrigin {
				w.Header().Set("Access-Control-Allow-Origin", allowOrigin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
				w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
				w.Header().Set("Vary", "Origin")
			}
			if r.Method == nethttp.MethodOptions {
				w.WriteHeader(nethttp.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func noDirListing(next nethttp.Handler) nethttp.Handler {
	return nethttp.HandlerFunc(func(w nethttp.ResponseWriter, r *nethttp.Request) {
		if strings.HasSuffix(r.URL.Path, "/") || r.URL.Path == "" {
			nethttp.NotFound(w, r)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func writeJSON(w nethttp.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
