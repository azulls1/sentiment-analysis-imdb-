# Deployment Guide

Step-by-step instructions for deploying the IMDb Sentiment Analysis application in different environments.

---

## Table of Contents

1. [Local Development Setup](#local-development-setup)
2. [Docker Compose Deployment](#docker-compose-deployment)
3. [Cloud Deployment Options](#cloud-deployment-options)
4. [Environment Configuration Checklist](#environment-configuration-checklist)
5. [SSL/HTTPS Setup](#sslhttps-setup)
6. [DNS Configuration](#dns-configuration)

---

## Local Development Setup

### Prerequisites

- Python 3.10+ (3.12 recommended)
- Node.js 18+ (20 recommended)
- Angular CLI: `npm install -g @angular/cli`
- Git

### Backend

```bash
# 1. Clone the repository
git clone <repo-url>
cd "Actividad 2"

# 2. Create Python virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/macOS
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env with your credentials (see Environment Configuration Checklist below)

# 5. (Optional) Train ML models from scratch
python -m backend.scripts.train_and_save

# 6. Start backend
python -m uvicorn backend.main:app --reload --port 8000
```

Backend is now available at `http://localhost:8000`. Swagger docs at `http://localhost:8000/docs`.

### Frontend

```bash
# In a separate terminal
cd frontend

# 1. Install dependencies
npm ci

# 2. Start development server
ng serve
```

Frontend is now available at `http://localhost:4200`.

---

## Docker Compose Deployment

### Prerequisites

- Docker Engine 20+
- Docker Compose v2+

### Steps

```bash
# 1. Configure environment
cp .env.example .env
# Edit .env with production values

# 2. Build and start services
docker compose up --build -d

# 3. Verify services are healthy
docker compose ps
curl http://localhost:8000/api/health
curl http://localhost:80

# 4. View logs
docker compose logs -f
```

### Services

| Service | Port | URL |
|---------|------|-----|
| Frontend (nginx) | 80 | `http://localhost` |
| Backend (FastAPI) | 8000 | `http://localhost:8000` |
| Swagger Docs | 8000 | `http://localhost:8000/docs` |

### Management Commands

```bash
# Stop services
docker compose down

# Restart backend only
docker compose restart backend

# Rebuild after code changes
docker compose up --build -d

# View resource usage
docker stats

# Prune old images
docker image prune -f
```

---

## Cloud Deployment Options

### Option A: AWS EC2

**Recommended instance**: `t3.medium` (2 vCPU, 4 GB RAM)

```bash
# 1. Launch EC2 instance with Ubuntu 22.04
# 2. SSH into the instance
ssh -i key.pem ubuntu@<public-ip>

# 3. Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu
# Log out and back in

# 4. Install Docker Compose
sudo apt-get install docker-compose-plugin

# 5. Clone and deploy
git clone <repo-url>
cd "Actividad 2"
cp .env.example .env
# Edit .env with production values
docker compose up --build -d

# 6. Configure Security Group:
# - Port 80 (HTTP) from 0.0.0.0/0
# - Port 443 (HTTPS) from 0.0.0.0/0
# - Port 22 (SSH) from your IP only
# - Do NOT expose port 8000 publicly
```

**Cost estimate**: ~$30/month (t3.medium, on-demand, us-east-1)

### Option B: DigitalOcean Droplet

**Recommended droplet**: Basic, 2 vCPU, 4 GB RAM

```bash
# 1. Create droplet with Docker marketplace image
# 2. SSH into droplet
ssh root@<droplet-ip>

# 3. Clone and deploy (Docker is pre-installed)
git clone <repo-url>
cd "Actividad 2"
cp .env.example .env
docker compose up --build -d

# 4. Configure firewall via DO dashboard:
# - Allow HTTP (80), HTTPS (443), SSH (22)
```

**Cost estimate**: ~$24/month

### Option C: Railway

Railway provides zero-config Docker deployments.

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login and initialize
railway login
railway init

# 3. Set environment variables
railway variables set SUPABASE_URL=...
railway variables set SUPABASE_ANON_KEY=...

# 4. Deploy
railway up
```

**Cost estimate**: ~$5-20/month depending on usage (includes free tier)

### Option D: Manual VPS (Any Provider)

Requirements:
- Ubuntu 22.04+ or Debian 12+
- 2+ vCPU, 4+ GB RAM
- 20+ GB disk
- Docker and Docker Compose installed

Follow the Docker Compose deployment steps above.

---

## Environment Configuration Checklist

Before deploying, verify all required environment variables are set:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://yourdomain.com` |

### Optional (Recommended for Production)

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | API key for protected endpoints | _(none, auth disabled)_ |
| `SUPABASE_URL` | Supabase project URL | _(empty, local fallback)_ |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | _(empty, local fallback)_ |
| `SUPABASE_SERVICE_KEY` | Supabase service role key | _(empty)_ |
| `SENTRY_DSN` | Sentry error tracking DSN | _(none, disabled)_ |
| `APP_ENV` | Environment name | `development` |
| `RATE_LIMIT_REQUESTS` | Max requests per window per IP | `200` |
| `RATE_LIMIT_WINDOW` | Rate limit window in seconds | `60` |
| `REQUEST_TIMEOUT` | Request timeout in seconds | `30` |
| `RANDOM_SEED` | ML reproducibility seed | `42` |

### Production Checklist

- [ ] `CORS_ORIGINS` set to your actual domain (not `localhost`)
- [ ] `API_KEY` set for protected endpoints
- [ ] `APP_ENV` set to `production`
- [ ] Supabase credentials configured (or confirm local fallback is acceptable)
- [ ] `SENTRY_DSN` configured for error tracking
- [ ] Firewall configured (only ports 80/443 exposed)
- [ ] SSL/HTTPS configured (see below)
- [ ] Docker resource limits verified in `docker-compose.yml`
- [ ] Log rotation confirmed (json-file driver with 10m max, 3 files)

---

## SSL/HTTPS Setup

### Option A: Certbot with Let's Encrypt (Recommended)

```bash
# 1. Install certbot
sudo apt-get install certbot

# 2. Stop nginx temporarily (if running on port 80)
docker compose stop frontend

# 3. Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# 4. Certificates are stored at:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem

# 5. Mount certificates in docker-compose.yml:
# Add under frontend service:
#   volumes:
#     - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/ssl:ro

# 6. Update nginx.conf:
# Uncomment the SSL lines:
#   listen 443 ssl http2;
#   ssl_certificate /etc/nginx/ssl/fullchain.pem;
#   ssl_certificate_key /etc/nginx/ssl/privkey.pem;

# 7. Restart
docker compose up -d

# 8. Auto-renewal (add to crontab)
echo "0 3 * * * certbot renew --quiet && docker compose restart frontend" | sudo crontab -
```

### Option B: Cloudflare (Simplest)

1. Add your domain to Cloudflare.
2. Set SSL mode to "Full" or "Full (Strict)".
3. Cloudflare handles SSL termination at the edge.
4. Your server can continue to serve HTTP on port 80.

### Option C: Reverse Proxy (Traefik/Caddy)

For automated HTTPS with Docker, consider using [Caddy](https://caddyserver.com/) or [Traefik](https://traefik.io/) as a reverse proxy in front of the application. Both support automatic Let's Encrypt certificate provisioning.

---

## DNS Configuration

### A Record Setup

Point your domain to your server's public IP:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` or `imdb-sentiment` | `<server-public-ip>` | 300 |

### With Cloudflare

1. Add an A record pointing to your server IP.
2. Enable the orange cloud (proxy) for DDoS protection and SSL.
3. Set SSL mode to "Full".

### Verify DNS

```bash
# Check DNS resolution
dig yourdomain.com +short
nslookup yourdomain.com

# Test HTTP connectivity
curl -v https://yourdomain.com/api/health
```

### Update CORS

After DNS is configured, update `CORS_ORIGINS` in `.env`:

```
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

Also update `server_name` in `frontend/nginx.conf`:

```nginx
server_name yourdomain.com;
```
