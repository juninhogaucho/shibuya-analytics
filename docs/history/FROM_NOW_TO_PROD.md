# FROM NOW TO PRODUCTION: Complete Deployment Guide

> ⚠️ **SEE ALSO:** [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) - The streamlined 3-hour launch tutorial.
> This document is the comprehensive reference. The checklist is your step-by-step guide.

> **Goal:** Deploy Shibuya Analytics (frontend) + Medallion API (backend) to production.  
> **Last Updated:** 2025-12-02  
> **Status:** COMPREHENSIVE REFERENCE (Use LAUNCH_CHECKLIST.md for quick start)  

---

## Table of Contents

1. [Pre-Deployment Inventory](#1-pre-deployment-inventory)
2. [Critical Code Changes Required](#2-critical-code-changes-required)
3. [Environment Variables Master List](#3-environment-variables-master-list)
4. [Domain & DNS Setup](#4-domain--dns-setup)
5. [SSL/TLS Configuration](#5-ssltls-configuration)
6. [Backend Deployment (Medallion API)](#6-backend-deployment-medallion-api)
7. [Frontend Deployment (Shibuya Analytics)](#7-frontend-deployment-shibuya-analytics)
8. [Database Setup & Migrations](#8-database-setup--migrations)
9. [Payment Integration (BitHide)](#9-payment-integration-bithide)
10. [Email Service (Resend)](#10-email-service-resend)
11. [Authentication & API Keys](#11-authentication--api-keys)
12. [Testing Checklist](#12-testing-checklist)
13. [Monitoring & Logging](#13-monitoring--logging)
14. [Security Hardening](#14-security-hardening)
15. [Performance Optimization](#15-performance-optimization)
16. [Backup & Recovery](#16-backup--recovery)
17. [Post-Launch Verification](#17-post-launch-verification)
18. [Rollback Procedures](#18-rollback-procedures)
19. [Ongoing Maintenance](#19-ongoing-maintenance)
20. [Quick Reference Commands](#20-quick-reference-commands)

---

## 1. Pre-Deployment Inventory

### 1.1 Project Structure Overview

```
FRONTEND: shibuya_analytics/
├── React 19.2 + TypeScript 5.9 + Vite 7.2
├── TanStack Query 5.90 for data fetching
├── react-router-dom 7.9 for routing
├── Zustand 5.0 for state management
├── Axios 1.13 for HTTP requests
└── babel-plugin-react-compiler for optimization

BACKEND: medallion_api/
├── FastAPI 0.100 + Python 3.11
├── SQLite (dev) → PostgreSQL 15 (prod)
├── Redis 7 for caching
├── Gunicorn 21.2 + Uvicorn workers
├── Docker + docker-compose for deployment
└── Alembic for database migrations
```

### 1.2 External Services Required

| Service | Purpose | Sign Up URL | Required Credentials |
|---------|---------|-------------|---------------------|
| **BitHide** | Crypto payments | bithide.io | `BITHIDE_API_KEY`, `BITHIDE_WEBHOOK_SECRET` |
| **Resend** | Transactional email | resend.com | `RESEND_API_KEY` |
| **Domain Registrar** | DNS management | Cloudflare/Namecheap/etc | DNS access |
| **VPS Provider** | Server hosting | DigitalOcean/Hetzner/Vultr | SSH access |
| **Container Registry** (optional) | Docker images | Docker Hub/GHCR | Registry credentials |

### 1.3 Files That Need Production Values

```
BACKEND:
├── .env                           # Create from .env.example
├── medallion_config.json          # Update endpoints
├── docker-compose.prod.yml        # Already configured
├── alembic.ini                    # Set DATABASE_URL
└── Caddyfile (or nginx.conf)      # Create for reverse proxy

FRONTEND:
├── .env.production                # Create with VITE_API_BASE
└── src/lib/constants.ts           # Verify API_BASE_URL fallback
```

### 1.4 Minimum Server Requirements

```
CPU: 2 cores (4 recommended for analytics workloads)
RAM: 4 GB minimum (8 GB recommended)
Storage: 40 GB SSD minimum
OS: Ubuntu 22.04 LTS or Debian 12
Ports: 80, 443, 22 (SSH)
```

---

## 2. Critical Code Changes Required

### 2.1 ~~CRITICAL: Orders Storage (Currently In-Memory!)~~ ✅ RESOLVED

**Status:** The orders table exists in `schema.sql` and `checkout_endpoints.py` uses database storage via `create_order_record()`, `get_order()`, and `update_order_status()`. No action needed.

### 2.2 ~~Frontend Checkout Page Improvements~~ ✅ RESOLVED

**Status:** `CheckoutPage.tsx` is wired to Stripe via `createCheckoutSession()` API call. The checkout flow is complete.

### 2.3 Disable DEV_MODE in Production

**File:** `medallion_api/app/auth.py`

```python
# Current (Line ~15):
DEV_MODE = os.getenv("DEV_MODE", "false").lower() == "true"

# Ensure .env has:
DEV_MODE=false
```

### 2.4 Update CORS Origins

**File:** Backend `.env`

```bash
# Current:
ALLOWED_ORIGINS=http://localhost:3000

# Production:
ALLOWED_ORIGINS=https://shibuya.trade,https://www.shibuya.trade,https://app.shibuya.trade
```

### 2.5 Update API Base URL Default

**File:** `shibuya_analytics/src/lib/constants.ts`

```typescript
// Line 1:
export const API_BASE_URL = import.meta.env.VITE_API_BASE || 'https://api.medallion.studio'

// Verify this matches your production API domain
```

---

## 3. Environment Variables Master List

### 3.1 Backend Environment Variables (.env)

Create `medallion_api/.env` from `.env.example`:

```bash
# ============================================
# MEDALLION API - PRODUCTION CONFIGURATION
# ============================================

# === CORE SETTINGS ===
ENVIRONMENT=production
DEV_MODE=false
DEBUG=false

# === DATABASE ===
# SQLite (development):
# DATABASE_PATH=/app/data/medallion.db

# PostgreSQL (production - recommended):
DATABASE_URL=postgresql://medallion_user:STRONG_PASSWORD_HERE@db:5432/medallion_prod

# Redis
REDIS_URL=redis://:REDIS_PASSWORD_HERE@redis:6379/0

# === API KEYS ===
# Admin key for super-admin access (generate with: openssl rand -hex 32)
ADMIN_API_KEY=your_64_char_hex_string_here

# Legacy prop firm keys (if using multi-tenant prop features)
API_KEY_FUNDERPRO=prop_firm_key_here
API_KEY_TRADINGPIT=prop_firm_key_here

# === PAYMENT (BitHide) ===
BITHIDE_API_KEY=your_bithide_api_key
BITHIDE_WEBHOOK_SECRET=your_bithide_webhook_secret
BITHIDE_CALLBACK_URL=https://api.yourdomain.com/v1/webhooks/bithide

# === EMAIL (Resend) ===
RESEND_API_KEY=re_your_resend_api_key
EMAIL_FROM=hello@yourdomain.com
EMAIL_FROM_NAME=Shibuya Analytics

# === SECURITY ===
# CORS - comma-separated production domains
ALLOWED_ORIGINS=https://shibuya.trade,https://www.shibuya.trade,https://app.shibuya.trade

# Rate limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=60

# === LOGGING ===
LOG_DIR=/app/logs
LOG_LEVEL=INFO

# === REPLICATION (if using trade copying) ===
REPL_RUN_INTERVAL=60
REPL_LOOKBACK_SECONDS=300

# === APPLICATION ===
MEDALLION_CONFIG=/app/medallion_config.json
```

### 3.2 Frontend Environment Variables

Create `shibuya_analytics/.env.production`:

```bash
# Shibuya Analytics Frontend - Production
VITE_API_BASE=https://api.yourdomain.com

# Optional: Analytics (if using)
# VITE_GA_TRACKING_ID=G-XXXXXXXXXX
# VITE_POSTHOG_KEY=phc_xxxxx
```

### 3.3 Docker Compose Environment

Already configured in `docker-compose.prod.yml` but verify these values:

```yaml
# PostgreSQL
POSTGRES_USER: medallion
POSTGRES_PASSWORD: CHANGE_THIS_PASSWORD
POSTGRES_DB: medallion_prod

# Redis
REDIS_PASSWORD: CHANGE_THIS_PASSWORD

# API Service
ALLOWED_ORIGINS: https://shibuya.trade
DATABASE_URL: postgresql://medallion:PASSWORD@db:5432/medallion_prod
REDIS_URL: redis://:PASSWORD@redis:6379/0
```

---

## 4. Domain & DNS Setup

### 4.1 Required Domains

| Purpose | Subdomain | Example | Points To |
|---------|-----------|---------|-----------|
| Marketing/App | `@` or `www` | shibuya.trade | Frontend (Vercel/VPS) |
| Dashboard | `app` | app.shibuya.trade | Frontend (Vercel/VPS) |
| API | `api` | api.shibuya.trade | Backend VPS |

### 4.2 DNS Records

```
# If using Vercel for frontend:
Type: CNAME
Name: @ (or www)
Value: cname.vercel-dns.com

# If using VPS for both:
Type: A
Name: @
Value: YOUR_VPS_IP

Type: A
Name: app
Value: YOUR_VPS_IP

Type: A  
Name: api
Value: YOUR_VPS_IP

# Optional: Email DNS for Resend
Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com -all

Type: DKIM (Resend will provide)
Type: DMARC (optional but recommended)
```

### 4.3 DNS Verification Commands

```bash
# Verify A records
dig A shibuya.trade +short
dig A api.shibuya.trade +short
dig A app.shibuya.trade +short

# Verify CNAME (if using)
dig CNAME www.shibuya.trade +short

# Verify propagation
nslookup api.shibuya.trade
```

---

## 5. SSL/TLS Configuration

### 5.1 Option A: Caddy (Recommended - Auto SSL)

**Install Caddy:**
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

**Create `/etc/caddy/Caddyfile`:**
```
api.shibuya.trade {
    reverse_proxy localhost:8000
    
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        Referrer-Policy "strict-origin-when-cross-origin"
        -Server
    }
    
    log {
        output file /var/log/caddy/api-access.log
        format json
    }
}

# If hosting frontend on same server:
app.shibuya.trade {
    root * /var/www/shibuya/dist
    file_server
    try_files {path} /index.html
    
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        Cache-Control "public, max-age=31536000, immutable" {
            path *.js *.css *.woff2 *.png *.jpg *.svg
        }
    }
}
```

**Start Caddy:**
```bash
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

### 5.2 Option B: Nginx + Certbot

**Install:**
```bash
sudo apt install nginx certbot python3-certbot-nginx
```

**Create `/etc/nginx/sites-available/shibuya-api`:**
```nginx
upstream api_backend {
    server 127.0.0.1:8000;
    keepalive 32;
}

server {
    listen 80;
    server_name api.shibuya.trade;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://$server_name$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name api.shibuya.trade;
    
    ssl_certificate /etc/letsencrypt/live/api.shibuya.trade/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.shibuya.trade/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    
    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    location / {
        proxy_pass http://api_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300;
        proxy_connect_timeout 300;
        proxy_send_timeout 300;
    }
}
```

**Enable and get SSL:**
```bash
sudo ln -s /etc/nginx/sites-available/shibuya-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api.shibuya.trade
```

---

## 6. Backend Deployment (Medallion API)

### 6.1 Server Preparation

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create application directory
sudo mkdir -p /opt/medallion
sudo chown $USER:$USER /opt/medallion
```

### 6.2 Clone Repository

```bash
cd /opt/medallion
git clone https://github.com/yourusername/medallion-api.git .
# OR upload files via SFTP/SCP
```

### 6.3 Create Production Environment File

```bash
# Copy and edit
cp .env.example .env
nano .env

# Set all production values (see Section 3)
```

### 6.4 Create Data Directories

```bash
mkdir -p /opt/medallion/data
mkdir -p /opt/medallion/logs
mkdir -p /opt/medallion/backups
chmod 755 /opt/medallion/data
chmod 755 /opt/medallion/logs
chmod 755 /opt/medallion/backups
```

### 6.5 Build and Start Services

```bash
# Using production compose file
cd /opt/medallion
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

### 6.6 Verify Health

```bash
# Local health check
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","version":"1.0.0","timestamp":"2025-..."}

# External (after SSL setup)
curl https://api.yourdomain.com/health
```

### 6.7 Initialize Database

If using PostgreSQL (new deployment):
```bash
# Run migrations
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# OR initialize from schema.sql
docker compose -f docker-compose.prod.yml exec db psql -U medallion -d medallion_prod -f /app/schema.sql
```

### 6.8 Create Admin User

```bash
docker compose -f docker-compose.prod.yml exec api python scripts/create_user.py \
    --email admin@yourdomain.com \
    --role super_admin \
    --tier Enterprise
```

### 6.9 Systemd Service (Auto-restart)

Create `/etc/systemd/system/medallion.service`:
```ini
[Unit]
Description=Medallion API
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/medallion
ExecStart=/usr/bin/docker compose -f docker-compose.prod.yml up -d
ExecStop=/usr/bin/docker compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable medallion
sudo systemctl start medallion
```

---

## 7. Frontend Deployment (Shibuya Analytics)

### 7.1 Option A: Vercel (Recommended for Simplicity)

**Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

**Step 2: Configure Project**

Create `shibuya_analytics/vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Step 3: Set Environment Variables in Vercel Dashboard**
```
VITE_API_BASE = https://api.yourdomain.com
```

**Step 4: Deploy**
```bash
cd shibuya_analytics
vercel --prod
```

**Step 5: Configure Custom Domain**
- Go to Vercel Dashboard → Project → Settings → Domains
- Add `shibuya.trade` and `app.shibuya.trade`
- Update DNS to point to Vercel

### 7.2 Option B: Netlify

Create `shibuya_analytics/netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

Deploy:
```bash
npm i -g netlify-cli
cd shibuya_analytics
netlify deploy --prod
```

### 7.3 Option C: Self-Hosted on VPS

**Build locally:**
```bash
cd shibuya_analytics
npm ci
npm run build
# Creates dist/ folder
```

**Upload to server:**
```bash
scp -r dist/* user@server:/var/www/shibuya/
```

**Configure Caddy (see Section 5.1) or Nginx:**
```nginx
server {
    listen 443 ssl http2;
    server_name shibuya.trade app.shibuya.trade;
    
    root /var/www/shibuya;
    index index.html;
    
    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Static assets caching
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

---

## 8. Database Setup & Migrations

### 8.1 PostgreSQL Setup (Production)

The `docker-compose.prod.yml` already includes PostgreSQL. Verify configuration:

```yaml
services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: medallion
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: medallion_prod
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./scripts/init-postgres.sql:/docker-entrypoint-initdb.d/init.sql
```

### 8.2 Run Alembic Migrations

```bash
# Inside container
docker compose -f docker-compose.prod.yml exec api alembic upgrade head

# Check current version
docker compose -f docker-compose.prod.yml exec api alembic current

# Create new migration (if needed)
docker compose -f docker-compose.prod.yml exec api alembic revision --autogenerate -m "add_orders_table"
```

### 8.3 Verify Schema

```bash
docker compose -f docker-compose.prod.yml exec db psql -U medallion -d medallion_prod -c "\dt"

# Expected tables:
# trades, customers, api_keys, customer_uploads, challenge_accounts, 
# progression_snapshots, prop_firms, prop_challenges, orders, etc.
```

### 8.4 Seed Initial Data

```bash
# Create Shibuya prop firm setup
docker compose -f docker-compose.prod.yml exec api python scripts/setup_shibuya.py
```

---

## 9. Payment Integration (Stripe)

> **Note:** The codebase was migrated from BitHide (crypto) to Stripe (cards). Stripe is fully implemented.

### 9.1 Stripe Account Setup

1. Create account at stripe.com
2. Complete identity verification
3. Create Products and Prices in Dashboard
4. Configure webhook endpoint

### 9.2 Backend Configuration

**Environment Variables:**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STEVE=price_xxxxx
STRIPE_PRICE_STEVE_PLUS=price_xxxxx
STRIPE_PRICE_DAVID=price_xxxxx
```

**The integration is implemented in `medallion_api/app/stripe_checkout.py`:**
- `POST /v1/checkout/create-session` - Creates Stripe Checkout session
- `POST /v1/webhooks/stripe` - Handles payment confirmations
- `GET /v1/checkout/session/{session_id}` - Checks payment status
- Rate limiting: 5 requests/minute per IP on create-session

### 9.3 Webhook Endpoint

Already implemented at `/v1/webhooks/stripe`:
- Receives `checkout.session.completed` events
- Updates order status
- Creates customer account with API key
- Triggers welcome email

### 9.4 Configure Stripe Dashboard

In Stripe Dashboard:
1. Go to Developers → Webhooks
2. Add endpoint URL: `https://api.yourdomain.com/v1/webhooks/stripe`
3. Select events: 
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.deleted`
4. Copy webhook signing secret to your `.env`

### 9.5 Test Payment Flow

```bash
# The frontend handles this via CheckoutPage.tsx
# Test with Stripe test card: 4242 4242 4242 4242
```

---

## 10. Email Service (Resend)

### 10.1 Resend Account Setup

1. Create account at resend.com
2. Verify your domain
3. Generate API key
4. Configure DNS (SPF, DKIM, DMARC)

### 10.2 Domain Verification

Add these DNS records:

```
# SPF
Type: TXT
Name: @
Value: v=spf1 include:spf.resend.com -all

# DKIM (Resend provides specific values)
Type: TXT
Name: resend._domainkey
Value: (provided by Resend)

# DMARC (optional but recommended)
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### 10.3 Backend Configuration

```bash
RESEND_API_KEY=re_xxxxxxxxx
EMAIL_FROM=hello@yourdomain.com
EMAIL_FROM_NAME=Shibuya Analytics
```

### 10.4 Test Email Sending

```bash
docker compose -f docker-compose.prod.yml exec api python -c "
from app.email_service import send_email
result = send_email('test@example.com', 'Test Subject', '<p>Test body</p>')
print('Email sent:', result)
"
```

### 10.5 Available Email Templates

The email service (`email_service.py`) includes:
- `send_welcome_email()` - New account credentials
- `send_shibuya_order_confirmation()` - Order placed
- `send_shibuya_report_delivered()` - Report ready
- `send_freeze_email()` - Account frozen (prop firm)
- `send_passed_email()` - Challenge passed
- `send_high_bds_warning_email()` - Trading psychology alert
- `send_payout_approval_email()` - Payout ready

---

## 11. Authentication & API Keys

### 11.1 Generate Admin API Key

```bash
# Generate secure key
openssl rand -hex 32

# Add to .env
ADMIN_API_KEY=generated_64_char_hex_key
```

### 11.2 User Authentication Flow

1. User purchases via checkout
2. Payment confirmed → Order activated
3. Customer created in database with API key
4. User receives email with activation code
5. User enters email + order code on /activate page
6. Frontend stores API key in localStorage
7. All subsequent requests include `X-API-Key` header

### 11.3 API Key Storage

API keys are stored in the `api_keys` table:
```sql
CREATE TABLE api_keys (
    id TEXT PRIMARY KEY,
    customer_id TEXT REFERENCES customers(customer_id),
    key_hash TEXT NOT NULL,  -- SHA256 of the actual key
    name TEXT,
    created_at TEXT,
    last_used_at TEXT,
    expires_at TEXT,
    is_active INTEGER DEFAULT 1
);
```

### 11.4 Demo Mode

For development/testing, set `DEV_MODE=true` to enable demo users:
- `shibuya_demo_mode` - Regular trader
- `shibuya_admin_demo` - Prop admin
- `shibuya_super_admin_demo` - Super admin

**⚠️ CRITICAL: Never enable DEV_MODE in production!**

---

## 12. Testing Checklist

### 12.1 Backend Health Checks

```bash
# Health endpoint
curl https://api.yourdomain.com/health
# Expected: {"status":"ok",...}

# API docs
curl https://api.yourdomain.com/docs
# Expected: Swagger UI HTML
```

### 12.2 Frontend Smoke Tests

```bash
# Homepage loads
curl -I https://shibuya.trade
# Expected: 200 OK

# Assets load
curl -I https://shibuya.trade/assets/index-xxx.js
# Expected: 200 OK, Cache-Control header

# SPA routing works
curl -I https://shibuya.trade/pricing
# Expected: 200 OK (served by index.html)
```

### 12.3 API Endpoint Tests

```bash
# Dashboard overview (requires auth)
curl https://api.yourdomain.com/v1/dashboard/overview \
  -H "X-API-Key: test_api_key"

# Create checkout order
curl -X POST https://api.yourdomain.com/v1/checkout/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","plan_id":"steve"}'
```

### 12.4 Integration Tests

Run the existing test suite:
```bash
docker compose -f docker-compose.prod.yml exec api python -m pytest tests/ -v
```

### 12.5 Manual Testing Checklist

- [ ] Homepage loads correctly (/, light/dark mode)
- [ ] Pricing page shows all 3 tiers
- [ ] Checkout flow works (BitHide payment)
- [ ] Activation page accepts credentials
- [ ] Demo mode works (click "Demo Mode")
- [ ] Dashboard pages load with data
- [ ] CSV upload works (try sample file)
- [ ] Alerts display correctly
- [ ] Edge Portfolio shows strategy status
- [ ] Slump Prescription displays rules
- [ ] Shadow Boxing shows prop simulations
- [ ] Mobile responsive works
- [ ] Light mode colors are readable

---

## 13. Monitoring & Logging

### 13.1 Application Logs

```bash
# View API logs
docker compose -f docker-compose.prod.yml logs -f api

# View all logs
docker compose -f docker-compose.prod.yml logs -f

# Log files location
/opt/medallion/logs/
├── medallion.log       # Main application log
├── error.log           # Error-only log
├── access.log          # Request access log
└── audit.log           # Security audit log
```

### 13.2 Log Rotation

Create `/etc/logrotate.d/medallion`:
```
/opt/medallion/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
    postrotate
        docker kill --signal=USR1 $(docker ps -q --filter name=medallion-api) 2>/dev/null || true
    endscript
}
```

### 13.3 Uptime Monitoring

**Option A: UptimeRobot (Free)**
1. Create account at uptimerobot.com
2. Add monitor for `https://api.yourdomain.com/health`
3. Set check interval: 5 minutes
4. Configure email/Slack alerts

**Option B: Healthchecks.io**
For cron job monitoring (backups, replication)

### 13.4 Error Tracking (Optional)

**Sentry Integration:**
```bash
# Add to requirements.txt
sentry-sdk[fastapi]

# Add to main.py
import sentry_sdk
sentry_sdk.init(dsn="your_sentry_dsn", traces_sample_rate=0.1)
```

---

## 14. Security Hardening

### 14.1 SSH Security

```bash
# Edit /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
AllowUsers youruser

# Restart SSH
sudo systemctl restart sshd
```

### 14.2 Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP (redirect to HTTPS)
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable
sudo ufw status
```

### 14.3 Fail2ban

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Create /etc/fail2ban/jail.local
[sshd]
enabled = true
port = 22
maxretry = 3
bantime = 3600
```

### 14.4 Docker Security

```bash
# Don't run containers as root (already configured in Dockerfile)
USER meduser

# Read-only root filesystem (where possible)
# Configured in docker-compose.prod.yml
```

### 14.5 API Security (Already Implemented)

- Rate limiting (FastAPI SlowAPI)
- CORS restrictions
- Input validation (Pydantic)
- SQL injection prevention (parameterized queries)
- XSS prevention (React auto-escaping)
- CSRF not needed (API-only backend)
- Security headers (Caddy/Nginx)

### 14.6 Secret Management

Never commit secrets to git. Options:
1. Use `.env` files (current approach)
2. Docker secrets (for Swarm)
3. HashiCorp Vault (enterprise)
4. AWS Secrets Manager / GCP Secret Manager

---

## 15. Performance Optimization

### 15.1 Backend Optimization

**Already configured in docker-compose.prod.yml:**
```yaml
api:
  command: gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
  # 4 workers for concurrency
```

**Redis caching:**
```python
# Already used for session caching
# Add query result caching if needed
```

### 15.2 Frontend Optimization

**Build optimizations (already in vite.config.ts):**
- React Compiler (babel-plugin-react-compiler)
- Code splitting (automatic with Vite)
- Asset minification
- Gzip compression

**Verify build size:**
```bash
cd shibuya_analytics
npm run build
# Check dist/ folder sizes
```

### 15.3 Database Optimization

**Add indexes (already in schema.sql):**
```sql
CREATE INDEX idx_trades_customer ON trades(customer_id);
CREATE INDEX idx_trades_date ON trades(trade_date);
-- etc.
```

**Query optimization:**
- Use pagination for large result sets
- Avoid SELECT * - specify columns
- Add composite indexes for common queries

### 15.4 CDN Setup (Optional)

**Cloudflare:**
1. Add domain to Cloudflare
2. Enable caching rules for static assets
3. Enable minification
4. Enable Brotli compression

---

## 16. Backup & Recovery

### 16.1 Automatic Database Backups

Already configured in `docker-compose.prod.yml`:
```yaml
backup:
  image: postgres:15-alpine
  environment:
    PGHOST: db
    PGUSER: medallion
    PGPASSWORD: ${POSTGRES_PASSWORD}
    PGDATABASE: medallion_prod
  volumes:
    - ./backups:/backups
  command: |
    sh -c 'while true; do
      pg_dump -Fc > /backups/medallion_$(date +%Y%m%d_%H%M%S).dump
      find /backups -name "*.dump" -mtime +7 -delete
      sleep 86400
    done'
```

### 16.2 Manual Backup Commands

```bash
# PostgreSQL backup
docker compose -f docker-compose.prod.yml exec db pg_dump -U medallion medallion_prod > backup.sql

# Redis backup (if persistence enabled)
docker compose -f docker-compose.prod.yml exec redis redis-cli BGSAVE

# Full application backup
tar -czvf medallion_backup_$(date +%Y%m%d).tar.gz \
  /opt/medallion/.env \
  /opt/medallion/data \
  /opt/medallion/logs \
  /opt/medallion/backups
```

### 16.3 Off-site Backup

```bash
# Copy to another server
scp /opt/medallion/backups/*.dump backup-server:/backups/medallion/

# Or use rclone for cloud storage (S3, B2, etc.)
rclone copy /opt/medallion/backups remote:medallion-backups
```

### 16.4 Restore Procedure

```bash
# Stop services
docker compose -f docker-compose.prod.yml down

# Restore database
docker compose -f docker-compose.prod.yml up -d db
docker compose -f docker-compose.prod.yml exec db \
  pg_restore -U medallion -d medallion_prod < /backups/medallion_20250115.dump

# Restart all services
docker compose -f docker-compose.prod.yml up -d
```

---

## 17. Post-Launch Verification

### 17.1 Immediate Checks (First 5 Minutes)

- [ ] API health endpoint returns 200
- [ ] Frontend homepage loads
- [ ] SSL certificate is valid
- [ ] No console errors in browser
- [ ] Demo mode works

### 17.2 Functional Checks (First Hour)

- [ ] Complete a test purchase (use small amount)
- [ ] Verify payment webhook received
- [ ] Check order appears in database
- [ ] Verify activation email sent
- [ ] Complete activation flow
- [ ] Access dashboard with new account
- [ ] Upload a test CSV file
- [ ] Verify report generated

### 17.3 Monitoring Checks

- [ ] UptimeRobot alert received for test
- [ ] Logs are being written
- [ ] No error spikes in logs
- [ ] Database connections stable

### 17.4 Performance Checks

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] No memory leaks in containers
- [ ] Disk space adequate

---

## 18. Rollback Procedures

### 18.1 Rollback Frontend

**Vercel:**
- Go to Deployments → Click previous deployment → Promote to Production

**Self-hosted:**
```bash
# Keep previous build
mv /var/www/shibuya /var/www/shibuya.new
mv /var/www/shibuya.old /var/www/shibuya
sudo systemctl reload nginx
```

### 18.2 Rollback Backend

```bash
cd /opt/medallion

# Revert to previous commit
git log --oneline -10  # Find previous working commit
git checkout <commit_hash>

# Rebuild and restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### 18.3 Rollback Database

```bash
# Restore from backup
docker compose -f docker-compose.prod.yml exec db \
  pg_restore -U medallion -d medallion_prod --clean < /backups/medallion_YYYYMMDD.dump

# Or rollback Alembic migration
docker compose -f docker-compose.prod.yml exec api alembic downgrade -1
```

### 18.4 Emergency Shutdown

```bash
# Stop everything
docker compose -f docker-compose.prod.yml down

# Show maintenance page (Caddy)
echo "respond 'Maintenance in progress. Back soon.' 503" > /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

---

## 19. Ongoing Maintenance

### 19.1 Daily Tasks

- Check UptimeRobot dashboard
- Review error logs
- Verify backup completed

### 19.2 Weekly Tasks

- Review disk space usage
- Check container resource usage
- Review security alerts
- Apply minor updates

### 19.3 Monthly Tasks

- Apply security patches
- Review and rotate logs
- Test backup restoration
- Update dependencies (minor versions)
- Review analytics/usage patterns

### 19.4 Quarterly Tasks

- Full security audit
- Performance review
- Cost optimization
- Dependency major version updates
- Disaster recovery test

---

## 20. Quick Reference Commands

### Server Management

```bash
# SSH to server
ssh user@api.yourdomain.com

# Check disk space
df -h

# Check memory
free -h

# Check running processes
htop
```

### Docker Commands

```bash
# View running containers
docker ps

# View logs
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f db --tail=100

# Restart service
docker compose -f docker-compose.prod.yml restart api

# Full restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Exec into container
docker compose -f docker-compose.prod.yml exec api bash
docker compose -f docker-compose.prod.yml exec db psql -U medallion medallion_prod

# View resource usage
docker stats
```

### Database Commands

```bash
# Access PostgreSQL
docker compose -f docker-compose.prod.yml exec db psql -U medallion medallion_prod

# Common queries
SELECT COUNT(*) FROM customers;
SELECT COUNT(*) FROM orders WHERE status='paid';
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;
```

### Frontend Commands

```bash
# Build locally
cd shibuya_analytics
npm run build

# Preview build
npm run preview

# Deploy to Vercel
vercel --prod
```

### SSL Commands

```bash
# Check certificate expiry
echo | openssl s_client -servername api.yourdomain.com -connect api.yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates

# Force certificate renewal (Certbot)
sudo certbot renew --force-renewal

# Check Caddy certificates
sudo caddy validate --config /etc/caddy/Caddyfile
```

---

## Appendix A: Complete File Checklist

### Files to Create/Modify Before Launch

**Backend (medallion_api/):**
- [ ] `.env` - Create from `.env.example` with production values
- [ ] `schema.sql` - Add `orders` table if not present
- [ ] `app/checkout_endpoints.py` - Migrate from in-memory to DB storage

**Frontend (shibuya_analytics/):**
- [ ] `.env.production` - Create with `VITE_API_BASE`
- [ ] `vercel.json` - Create if deploying to Vercel

**Server:**
- [ ] `/etc/caddy/Caddyfile` - Create for reverse proxy
- [ ] `/etc/systemd/system/medallion.service` - Create for auto-start
- [ ] `/etc/logrotate.d/medallion` - Create for log rotation

---

## Appendix B: Pricing Configuration

Current pricing in `shibuya_analytics/src/lib/constants.ts`:

```typescript
export const PRICING = {
  steve: {
    id: 'steve',
    name: 'Steve',
    price: 99,
    type: 'subscription',
    description: 'Monthly performance analytics and coaching',
    perks: [
      'Weekly Margin of Safety reports',
      'Edge Intelligence portfolio',
      'BQL state monitoring',
      'Email alerts',
    ],
  },
  stevePlus: {
    id: 'steve-plus',
    name: 'Steve+',
    price: 149,
    type: 'subscription',
    featured: true,
    description: 'Everything in Steve plus premium features',
    perks: [
      'Everything in Steve',
      'Prop firm Shadow Boxing',
      'Slump prescription engine',
      'Priority support',
    ],
  },
  david: {
    id: 'david',
    name: 'David',
    price: 250,
    type: 'subscription',
    description: 'Full transformation package',
    perks: [
      'Everything in Steve+',
      '1:1 monthly call',
      'Custom rule engine',
      'Lifetime loyalty rewards',
    ],
  },
}
```

---

## Appendix C: API Endpoints Reference

### Public Endpoints (No Auth)
- `GET /health` - Health check
- `GET /docs` - Swagger UI
- `POST /v1/checkout/create` - Create order
- `GET /v1/checkout/status/:order_id` - Check order status
- `POST /v1/webhooks/bithide` - BitHide payment webhook
- `POST /v1/trader/activations/verify` - Verify activation code

### Authenticated Endpoints (X-API-Key)
- `GET /v1/dashboard/overview` - Main dashboard data
- `GET /v1/dashboard/alerts` - Alert history
- `GET /v1/dashboard/edge-portfolio` - Edge strategy status
- `GET /v1/dashboard/slump-prescription` - Slump rules
- `GET /v1/dashboard/shadow-boxing` - Prop firm simulations
- `POST /v1/dashboard/upload` - Upload trades CSV
- `GET /v1/dashboard/trade-paste-memory` - Upload diff

### Admin Endpoints (X-API-Key + role)
- `GET /v1/admin/customers` - List customers
- `GET /v1/admin/orders` - List orders
- `POST /v1/admin/customers/:id/suspend` - Suspend customer

---

## Appendix D: Troubleshooting

### Common Issues

**1. API returns 502 Bad Gateway**
```bash
# Check if container is running
docker ps
# Check logs
docker compose -f docker-compose.prod.yml logs api
# Restart
docker compose -f docker-compose.prod.yml restart api
```

**2. Database connection errors**
```bash
# Check database container
docker compose -f docker-compose.prod.yml logs db
# Check connection
docker compose -f docker-compose.prod.yml exec api python -c "
from app.storage import TradeStorage
s = TradeStorage()
print('Connected!')
"
```

**3. CORS errors in browser**
```bash
# Verify ALLOWED_ORIGINS in .env matches your frontend domain
# Include https:// prefix
ALLOWED_ORIGINS=https://shibuya.trade,https://app.shibuya.trade
```

**4. SSL certificate not working**
```bash
# Check Caddy status
sudo systemctl status caddy
sudo journalctl -u caddy -n 50

# Verify DNS
dig api.yourdomain.com +short
```

**5. Emails not sending**
```bash
# Verify Resend key
docker compose -f docker-compose.prod.yml exec api python -c "
import os
print('RESEND_API_KEY set:', bool(os.getenv('RESEND_API_KEY')))
"

# Check domain verification at resend.com dashboard
```

**6. Payments not processing**
```bash
# Check BitHide configuration
docker compose -f docker-compose.prod.yml exec api python -c "
import os
print('BITHIDE_API_KEY set:', bool(os.getenv('BITHIDE_API_KEY')))
"

# Check webhook logs
grep "bithide" /opt/medallion/logs/medallion.log
```

---

## Final Checklist Before Go-Live

### Critical (Must Complete)

- [x] **Orders table added to database** ✅ Already in schema.sql
- [x] **Orders storage migrated from memory to DB** ✅ checkout_endpoints.py uses DB
- [ ] **STRIPE_SECRET_KEY configured**
- [ ] **STRIPE_WEBHOOK_SECRET configured**
- [ ] **STRIPE_PRICE_* IDs configured**
- [ ] **RESEND_API_KEY configured**
- [ ] **ADMIN_API_KEY generated** (openssl rand -hex 32)
- [ ] **DEV_MODE=false in production**
- [ ] **ALLOWED_ORIGINS set to production domains**
- [ ] **SSL certificates working** (Caddy does this automatically)
- [ ] **DNS pointing to correct servers**
- [ ] **Health endpoint returning 200**
- [ ] **Test payment completed successfully** (Stripe test mode)
- [ ] **Backup system running** (docker-compose.prod.yml has backup service)

### Important (Complete Before Announcing)

- [ ] Uptime monitoring configured
- [ ] Error tracking configured
- [ ] Log rotation configured
- [ ] Firewall rules set
- [ ] SSH hardened
- [ ] All endpoints tested
- [ ] Mobile responsive verified
- [ ] Light mode tested

### Nice to Have (First Week)

- [ ] CDN configured
- [ ] Analytics added
- [ ] Additional email templates customized
- [ ] Documentation reviewed
- [ ] Support workflow established

---

**Document Complete. Good luck with launch! 🚀**
