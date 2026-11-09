// Package config loads service configuration from environment variables.
package config

import (
	"errors"
	"os"
	"strings"
	"time"
)

type Config struct {
	Addr              string
	DatabaseURL       string
	UploadDir         string
	AllowOrigin       string
	AdminEmail        string
	AdminPasswordHash string
	CookieSecure      bool
	TrustProxy        bool
	ReadTimeout       time.Duration
	WriteTimeout      time.Duration
}

func Load() (Config, error) {
	c := Config{
		Addr:              getenv("API_ADDR", ":8080"),
		DatabaseURL:       os.Getenv("DATABASE_URL"),
		UploadDir:         getenv("UPLOAD_DIR", "/data/uploads"),
		AllowOrigin:       strings.TrimRight(getenv("ALLOW_ORIGIN", "http://localhost:3000"), "/"),
		AdminEmail:        os.Getenv("ADMIN_EMAIL"),
		AdminPasswordHash: os.Getenv("ADMIN_PASSWORD_HASH"),
		CookieSecure:      getenv("COOKIE_SECURE", "true") != "false",
		TrustProxy:        getenv("TRUST_PROXY", "false") == "true",
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
	}
	switch {
	case c.DatabaseURL == "":
		return Config{}, errors.New("config: DATABASE_URL is required")
	case c.AdminEmail == "":
		return Config{}, errors.New("config: ADMIN_EMAIL is required")
	case !strings.HasPrefix(c.AdminPasswordHash, "$argon2id$"):
		return Config{}, errors.New("config: ADMIN_PASSWORD_HASH must be an argon2id hash (run: go run ./cmd/hashpw)")
	}
	return c, nil
}

func getenv(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}
