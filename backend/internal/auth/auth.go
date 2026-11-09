package auth

import (
	"context"
	"crypto/rand"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net"
	"net/http"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"mehar/backend/internal/db/sqlcgen"
)

const (
	CookieName      = "admin_session"
	SessionDuration = 7 * 24 * time.Hour
)

// Store is the subset of sqlc queries the auth layer needs.
type Store interface {
	CreateSession(ctx context.Context, arg sqlcgen.CreateSessionParams) (sqlcgen.AdminSession, error)
	GetSessionByHash(ctx context.Context, tokenHash []byte) (sqlcgen.AdminSession, error)
	DeleteSessionByHash(ctx context.Context, tokenHash []byte) error
}

type Config struct {
	AdminEmail        string
	AdminPasswordHash string
	AllowOrigin       string // exact origin allowed to make mutating requests
	CookieSecure      bool
	TrustProxy        bool // read client IP from the rightmost X-Forwarded-For entry
}

type Service struct {
	cfg     Config
	store   Store
	limiter *RateLimiter
}

func NewService(cfg Config, store Store) *Service {
	return &Service{cfg: cfg, store: store, limiter: NewRateLimiter(5, 15*time.Minute)}
}

func (s *Service) AllowedOrigin() string {
	return s.cfg.AllowOrigin
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (s *Service) Login(w http.ResponseWriter, r *http.Request) {
	if !s.limiter.Allow(s.clientIP(r)) {
		w.Header().Set("Retry-After", "900")
		writeError(w, http.StatusTooManyRequests, "too many login attempts, try again later")
		return
	}

	r.Body = http.MaxBytesReader(w, r.Body, 4096)
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Always run both checks so timing does not reveal which one failed.
	emailOK := subtle.ConstantTimeCompare(
		[]byte(strings.ToLower(strings.TrimSpace(req.Email))),
		[]byte(strings.ToLower(s.cfg.AdminEmail))) == 1
	passOK, _ := VerifyPassword(req.Password, s.cfg.AdminPasswordHash)
	if !emailOK || !passOK {
		writeError(w, http.StatusUnauthorized, "invalid email or password")
		return
	}

	raw := make([]byte, 32)
	if _, err := rand.Read(raw); err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}
	token := base64.RawURLEncoding.EncodeToString(raw)
	hash := hashToken(token)
	expires := time.Now().Add(SessionDuration)

	if _, err := s.store.CreateSession(r.Context(), sqlcgen.CreateSessionParams{
		TokenHash: hash,
		ExpiresAt: pgtype.Timestamptz{Time: expires, Valid: true},
	}); err != nil {
		writeError(w, http.StatusInternalServerError, "internal error")
		return
	}

	http.SetCookie(w, s.cookie(token, expires))
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

func (s *Service) Logout(w http.ResponseWriter, r *http.Request) {
	if c, err := r.Cookie(CookieName); err == nil {
		_ = s.store.DeleteSessionByHash(r.Context(), hashToken(c.Value))
	}
	http.SetCookie(w, s.cookie("", time.Unix(0, 0)))
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

// Me is a session probe for the frontend.
func (s *Service) Me(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"email": s.cfg.AdminEmail})
}

// RequireSession rejects requests without a valid, unexpired session cookie.
func (s *Service) RequireSession(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		c, err := r.Cookie(CookieName)
		if err != nil || c.Value == "" {
			writeError(w, http.StatusUnauthorized, "unauthorized")
			return
		}
		if _, err := s.store.GetSessionByHash(r.Context(), hashToken(c.Value)); err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				writeError(w, http.StatusUnauthorized, "unauthorized")
				return
			}
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// CheckOrigin is CSRF protection: mutating requests must carry an Origin
// header equal to the configured frontend origin.
func (s *Service) CheckOrigin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
		default:
			if subtle.ConstantTimeCompare([]byte(r.Header.Get("Origin")), []byte(s.cfg.AllowOrigin)) != 1 {
				writeError(w, http.StatusForbidden, "forbidden origin")
				return
			}
		}
		next.ServeHTTP(w, r)
	})
}

func (s *Service) cookie(value string, expires time.Time) *http.Cookie {
	c := &http.Cookie{
		Name:     CookieName,
		Value:    value,
		Path:     "/",
		Expires:  expires,
		HttpOnly: true,
		Secure:   s.cfg.CookieSecure,
		SameSite: http.SameSiteLaxMode,
	}
	if value == "" {
		c.MaxAge = -1
	}
	return c
}

func (s *Service) clientIP(r *http.Request) string {
	if s.cfg.TrustProxy {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			return strings.TrimSpace(parts[len(parts)-1])
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func hashToken(token string) []byte {
	sum := sha256.Sum256([]byte(token))
	return sum[:]
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

