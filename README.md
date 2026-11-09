# Mehar for Eyes

Optical showcase website and mobile-first admin dashboard for **Mehar for Eyes** (Pakistan). Customers browse frames by category, gender, and frame shape and inquire directly over WhatsApp.

## Architecture

- **Frontend (`/`)**: Next.js 16 (App Router, TypeScript, Tailwind CSS v4). Public catalog pages fetch from the Go API server-side with 60-second revalidation; `/admin/*` pages manage products and photos using session cookies.
- **Backend (`/backend`)**: Go 1.26 service (`chi`, `pgx/v5`, `sqlc`, `golang-migrate`, Argon2id single-admin auth, magic-byte verified & re-encoded WebP image processing).
- **Database**: PostgreSQL 17.
- **Reverse Proxy (`/Caddyfile`)**: Caddy 2 with automatic HTTPS, security headers, static serving for `/uploads/*` with immutable cache headers, and reverse proxying for `/api/*` and Next.js.

---

## 1. Local Development

### Step 1: Configure & start the Go API + Postgres
1. Generate an Argon2id hash for your admin password:
   ```bash
   cd backend
   go run ./cmd/hashpw "ChangeMe123!"
   ```
2. Copy `backend/.env.example` to `backend/.env` and set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (in `backend/.env` for Docker Compose, escape every `$` in the hash as `$$`).
3. Start Postgres and the Go API:
   ```bash
   cd backend
   docker compose up --build
   ```
   Verify health at `http://localhost:8080/healthz` (`{"status":"ok"}`).

### Step 2: Start the Next.js frontend
In a second terminal from the repository root:
```bash
cp .env.example .env.local
npm install
npm run dev
```
- **Public site**: `http://localhost:3000`
- **Admin login**: `http://localhost:3000/admin/login`
- **Admin catalog**: `http://localhost:3000/admin`

---

## 2. Production Deployment (VPS + Docker Compose + Caddy)

### Step 1: Prepare the server
On an Ubuntu/Debian VPS with Docker and Docker Compose plugin installed, clone the repository to `/opt/mehar-for-eyes`:
```bash
sudo mkdir -p /opt/mehar-for-eyes
sudo chown "$(whoami):$(whoami)" /opt/mehar-for-eyes
git clone <YOUR_REPO_URL> /opt/mehar-for-eyes
cd /opt/mehar-for-eyes
```

### Step 2: Create `.env.prod`
```bash
cp .env.prod.example .env.prod
nano .env.prod
```
Fill in:
- `DOMAIN` (e.g. `meharforeyes.com`)
- `ACME_EMAIL` (your email for Let's Encrypt TLS certificates)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` (e.g. `923001234567`, digits only, no `+`)
- `POSTGRES_PASSWORD` (generate with `openssl rand -hex 24`)
- `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` (escape each `$` as `$$` for Docker Compose)

### Step 3: Build and start production containers
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```
- Only Caddy exposes ports `80` and `443` publicly.
- PostgreSQL (`5432`), Go API (`8080`), and Next.js (`3000`) run on the internal Docker network only and are never exposed to the public internet.

### Cloudflare Configuration (if using Cloudflare DNS/Proxy)
- Set SSL/TLS mode to **Full (strict)**.
- **Cache Rule 1**: Path starts with `/uploads/` → **Eligible for cache**, Edge TTL `1 year`.
- **Cache Rule 2**: Path starts with `/api/admin/` or `/admin` → **Bypass cache**.

---

## 3. Nightly Backups & Restore

### Schedule nightly backups via Cron
`scripts/backup.sh` runs `pg_dump` (gzipped and verified), syncs `/data/uploads` via `rsync` to a second directory (plus an optional remote `OFFSITE_RSYNC_TARGET`), and prunes dumps older than 14 days.

```bash
sudo mkdir -p /var/backups/mehar-for-eyes
sudo chown "$(whoami):$(whoami)" /var/backups/mehar-for-eyes
chmod +x /opt/mehar-for-eyes/scripts/backup.sh /opt/mehar-for-eyes/scripts/restore.sh
```

Run a manual backup test right away:
```bash
APP_DIR=/opt/mehar-for-eyes BACKUP_DIR=/var/backups/mehar-for-eyes /opt/mehar-for-eyes/scripts/backup.sh
```

Add the nightly cron job (`crontab -e`):
```cron
15 3 * * * APP_DIR=/opt/mehar-for-eyes BACKUP_DIR=/var/backups/mehar-for-eyes /opt/mehar-for-eyes/scripts/backup.sh >> /var/log/mehar-backup.log 2>&1
```

### Restore from backup (and test your backup)
To restore both the PostgreSQL database and `/data/uploads` from a backup:
```bash
/opt/mehar-for-eyes/scripts/restore.sh \
  /var/backups/mehar-for-eyes/db/mehar-db-YYYYMMDD-HHMMSS.sql.gz \
  /var/backups/mehar-for-eyes/uploads
```

---

## 4. GitHub Actions Auto-Deploy over SSH

`.github/workflows/deploy.yml` runs Go tests, `go vet`, ESLint, and TypeScript checks on every push to `main`, then connects to your VPS over SSH and runs `docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build`.

In your GitHub repository, go to **Settings → Secrets and variables → Actions** and add:
- `SSH_HOST`: Your VPS IP address or hostname
- `SSH_USER`: SSH username on the VPS (e.g. `ubuntu` or `deploy`)
- `SSH_PRIVATE_KEY`: Private SSH key authorized in `~/.ssh/authorized_keys` on the VPS
- `SSH_PORT`: SSH port (optional, defaults to `22`)
- `DEPLOY_PATH`: Path to the repo on the VPS (optional, defaults to `/opt/mehar-for-eyes`)
