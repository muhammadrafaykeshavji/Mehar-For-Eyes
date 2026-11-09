package main

import (
	"context"
	"errors"
	"log/slog"
	nethttp "net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"mehar/backend/internal/auth"
	"mehar/backend/internal/config"
	"mehar/backend/internal/db"
	"mehar/backend/internal/db/sqlcgen"
	apihttp "mehar/backend/internal/http"
	"mehar/backend/internal/images"
	"mehar/backend/internal/products"
	"mehar/backend/internal/settings"
)

func main() {
	log := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(log); err != nil {
		log.Error("fatal", "err", err)
		os.Exit(1)
	}
}

// purgeSessions deletes expired admin sessions hourly until ctx is done.
func purgeSessions(ctx context.Context, q *sqlcgen.Queries) {
	t := time.NewTicker(time.Hour)
	defer t.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-t.C:
			_ = q.DeleteExpiredSessions(ctx)
		}
	}
}

func run(log *slog.Logger) error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	if err := db.Migrate(cfg.DatabaseURL); err != nil {
		return err
	}
	pool, err := db.Connect(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	queries := sqlcgen.New(pool)
	go purgeSessions(ctx, queries)

	authSvc := auth.NewService(auth.Config{
		AdminEmail:        cfg.AdminEmail,
		AdminPasswordHash: cfg.AdminPasswordHash,
		AllowOrigin:       cfg.AllowOrigin,
		CookieSecure:      cfg.CookieSecure,
		TrustProxy:        cfg.TrustProxy,
	}, queries)

	imgSvc := images.NewService(queries, cfg.UploadDir)
	prodSvc := products.NewService(queries, imgSvc.RemoveProductDir)
	settingsSvc := settings.NewService(queries)

	srv := &nethttp.Server{
		Addr:         cfg.Addr,
		Handler:      apihttp.NewRouter(pool, authSvc, prodSvc, imgSvc, settingsSvc, cfg.UploadDir),
		ReadTimeout:  cfg.ReadTimeout,
		WriteTimeout: cfg.WriteTimeout,
	}

	errCh := make(chan error, 1)
	go func() {
		log.Info("listening", "addr", cfg.Addr)
		errCh <- srv.ListenAndServe()
	}()

	select {
	case err := <-errCh:
		if !errors.Is(err, nethttp.ErrServerClosed) {
			return err
		}
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	}
	return nil
}
