-- name: CreateSession :one
INSERT INTO admin_sessions (token_hash, expires_at) VALUES ($1, $2)
RETURNING *;

-- name: GetSessionByHash :one
SELECT * FROM admin_sessions WHERE token_hash = $1 AND expires_at > now();

-- name: DeleteSessionByHash :exec
DELETE FROM admin_sessions WHERE token_hash = $1;

-- name: DeleteExpiredSessions :exec
DELETE FROM admin_sessions WHERE expires_at <= now();

