package auth

import (
	"bytes"
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"

	"mehar/backend/internal/db/sqlcgen"
)

type fakeStore struct{ sessions map[string]bool }

func (f *fakeStore) CreateSession(_ context.Context, a sqlcgen.CreateSessionParams) (sqlcgen.AdminSession, error) {
	f.sessions[string(a.TokenHash)] = true
	return sqlcgen.AdminSession{}, nil
}
func (f *fakeStore) GetSessionByHash(_ context.Context, h []byte) (sqlcgen.AdminSession, error) {
	if f.sessions[string(h)] {
		return sqlcgen.AdminSession{}, nil
	}
	return sqlcgen.AdminSession{}, pgx.ErrNoRows
}
func (f *fakeStore) DeleteSessionByHash(_ context.Context, h []byte) error {
	delete(f.sessions, string(h))
	return nil
}

func TestPasswordRoundTrip(t *testing.T) {
	h, err := HashPassword("correct horse battery")
	if err != nil {
		t.Fatal(err)
	}
	if ok, _ := VerifyPassword("correct horse battery", h); !ok {
		t.Error("correct password rejected")
	}
	if ok, _ := VerifyPassword("wrong", h); ok {
		t.Error("wrong password accepted")
	}
	if _, err := VerifyPassword("x", "garbage"); err == nil {
		t.Error("garbage hash should error")
	}
}

func TestRateLimiter(t *testing.T) {
	l := NewRateLimiter(5, time.Minute)
	now := time.Now()
	l.now = func() time.Time { return now }
	for i := 0; i < 5; i++ {
		if !l.Allow("ip") {
			t.Fatalf("attempt %d blocked", i)
		}
	}
	if l.Allow("ip") {
		t.Error("6th attempt allowed")
	}
	if !l.Allow("other") {
		t.Error("other key blocked")
	}
	now = now.Add(2 * time.Minute)
	if !l.Allow("ip") {
		t.Error("not allowed after window")
	}
}

func TestLoginFlow(t *testing.T) {
	hash, _ := HashPassword("correct horse battery")
	store := &fakeStore{sessions: map[string]bool{}}
	svc := NewService(Config{
		AdminEmail: "a@b.com", AdminPasswordHash: hash,
		AllowOrigin: "http://localhost:3000", CookieSecure: true,
	}, store)

	mux := http.NewServeMux()
	mux.Handle("POST /login", svc.CheckOrigin(http.HandlerFunc(svc.Login)))
	mux.Handle("GET /me", svc.RequireSession(http.HandlerFunc(svc.Me)))

	do := func(method, path, body, origin string, cookie *http.Cookie) *httptest.ResponseRecorder {
		req := httptest.NewRequest(method, path, bytes.NewBufferString(body))
		if origin != "" {
			req.Header.Set("Origin", origin)
		}
		if cookie != nil {
			req.AddCookie(cookie)
		}
		rec := httptest.NewRecorder()
		mux.ServeHTTP(rec, req)
		return rec
	}
	good := `{"email":"a@b.com","password":"correct horse battery"}`
	origin := "http://localhost:3000"

	if c := do("POST", "/login", good, "http://evil.com", nil).Code; c != 403 {
		t.Errorf("bad origin: got %d", c)
	}
	if c := do("POST", "/login", good, "", nil).Code; c != 403 {
		t.Errorf("missing origin: got %d", c)
	}
	if c := do("POST", "/login", `{"email":"a@b.com","password":"nope"}`, origin, nil).Code; c != 401 {
		t.Errorf("bad password: got %d", c)
	}
	if c := do("GET", "/me", "", "", nil).Code; c != 401 {
		t.Errorf("no cookie: got %d", c)
	}

	rec := do("POST", "/login", good, origin, nil)
	if rec.Code != 200 {
		t.Fatalf("login: got %d", rec.Code)
	}
	cs := rec.Result().Cookies()
	if len(cs) != 1 || !cs[0].HttpOnly || !cs[0].Secure || cs[0].SameSite != http.SameSiteLaxMode {
		t.Fatalf("bad cookie flags: %+v", cs)
	}
	if c := do("GET", "/me", "", "", cs[0]).Code; c != 200 {
		t.Errorf("with session: got %d", c)
	}
	if c := do("GET", "/me", "", "", &http.Cookie{Name: CookieName, Value: "forged"}).Code; c != 401 {
		t.Errorf("forged: got %d", c)
	}
}

func TestLoginRateLimited(t *testing.T) {
	hash, _ := HashPassword("correct horse battery")
	svc := NewService(Config{AdminEmail: "a@b.com", AdminPasswordHash: hash, AllowOrigin: "o"},
		&fakeStore{sessions: map[string]bool{}})
	var last int
	for i := 0; i < 6; i++ {
		req := httptest.NewRequest("POST", "/login", bytes.NewBufferString(`{"email":"x","password":"y"}`))
		req.RemoteAddr = "1.2.3.4:5555"
		rec := httptest.NewRecorder()
		svc.Login(rec, req)
		last = rec.Code
	}
	if last != http.StatusTooManyRequests {
		t.Errorf("6th attempt: got %d, want 429", last)
	}
}

