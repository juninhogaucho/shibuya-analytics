# 🚀 Shibuya Launch Checklist: From Now to First Customer

> **Reality Check:** You're closer than the old doc suggested. This is the actual minimal-viable path.

---

## ⚡ Current Status (What's Already Done)

### ✅ Backend (medallion_api)
- [x] **Orders table** - Already in `schema.sql` with proper indexes
- [x] **Order storage** - `checkout_endpoints.py` uses DB, not in-memory (`create_order_record()`)
- [x] **Stripe integration** - `stripe_checkout.py` is fully implemented with webhooks
- [x] **Email service** - Resend integration works, graceful fallback if key missing
- [x] **Database migrations** - Alembic configured for PostgreSQL
- [x] **Docker compose** - Production config with Postgres + Redis
- [x] **Rate limiting** - SlowAPI on checkout endpoints (5/min)
- [x] **Webhook idempotency** - `processed_webhooks` table prevents duplicates
- [x] **Mobile-responsive frontend** - Hamburger menu, grid stacking fixed

### ✅ Frontend (shibuya_analytics)
- [x] **Checkout page** - Wired to Stripe via `createCheckoutSession`
- [x] **Activation page** - Email + order code flow
- [x] **Demo mode** - Works for testing without payment
- [x] **Auth recovery** - "Lost key?" support link added
- [x] **Mobile nav** - Slide-out drawer implemented

---

## 🔴 CRITICAL: What You Actually Need Before Launch

### 1. Stripe Account Setup (30 min)
```bash
# You need these from Stripe Dashboard:
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Create Products/Prices in Stripe Dashboard:
# - Steve ($99 one-time)
# - Steve+ ($149 one-time)  
# - David ($250/month subscription)

# Then set Price IDs:
STRIPE_PRICE_STEVE=price_...
STRIPE_PRICE_STEVE_PLUS=price_...
STRIPE_PRICE_DAVID=price_...
```

**Action:** Go to https://dashboard.stripe.com → Products → Create 3 products with prices.

### 2. Resend Email Setup (15 min)
```bash
# From https://resend.com/api-keys
RESEND_API_KEY=re_...
EMAIL_FROM=hello@yourdomain.com
```

**Action:** 
1. Create Resend account
2. Verify your domain (add DNS records they provide)
3. Generate API key

### 3. Domain & DNS (15 min)
You need to decide your domain structure:
```
Option A: Single domain
- shibuya.trade → Frontend (Vercel)
- shibuya.trade/api → Backend (proxied)

Option B: Subdomains (recommended)
- shibuya.trade → Frontend (Vercel)
- api.shibuya.trade → Backend (VPS)
```

**DNS Records needed:**
```
A     api     → YOUR_VPS_IP
CNAME @       → cname.vercel-dns.com (if using Vercel)
```

### 4. VPS for Backend (30 min)
**Minimum specs:** 2 vCPU, 4GB RAM, 40GB SSD

**Recommended providers:**
- Hetzner (€4.51/mo) - Best value
- DigitalOcean ($24/mo) 
- Vultr ($24/mo)

---

## 📋 Step-by-Step Launch Tutorial

### Phase 1: External Services (1 hour)

#### Step 1.1: Stripe Setup
1. Go to https://dashboard.stripe.com
2. Create account / verify business
3. Go to **Products** → Create product:
   - **Steve** ($99, one-time payment)
   - **Steve+** ($149, one-time payment)
   - **David** ($250, recurring monthly)
4. Copy each product's **Price ID** (starts with `price_`)
5. Go to **Developers** → **API Keys** → Copy `sk_live_` and `pk_live_`
6. Go to **Developers** → **Webhooks** → Add endpoint:
   - URL: `https://api.yourdomain.com/v1/webhooks/stripe`
   - Events: `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.deleted`
   - Copy the webhook signing secret (`whsec_`)

#### Step 1.2: Resend Setup
1. Go to https://resend.com
2. Create account
3. **Domains** → Add your domain
4. Add DNS records (SPF, DKIM, DMARC)
5. **API Keys** → Create key → Copy it

#### Step 1.3: VPS Setup
1. Spin up Ubuntu 22.04 VPS
2. SSH in and run:
```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker

# Install Docker Compose
sudo apt install docker-compose-plugin

# Create app directory
sudo mkdir -p /opt/medallion
sudo chown $USER:$USER /opt/medallion
```

---

### Phase 2: Backend Deployment (45 min)

#### Step 2.1: Upload Code
```bash
# Option A: Git clone
cd /opt/medallion
git clone https://github.com/yourusername/medallion-api.git .

# Option B: SCP upload from local
scp -r ./medallion_api/* user@server:/opt/medallion/
```

#### Step 2.2: Create Production Environment
```bash
cd /opt/medallion
nano .env
```

Paste this (fill in your values):
```bash
# === ENVIRONMENT ===
ENVIRONMENT=production
DEV_MODE=false
DEBUG=false

# === DATABASE (PostgreSQL via Docker) ===
DATABASE_URL=postgresql://medallion:CHANGE_THIS_PASSWORD@db:5432/medallion_prod
POSTGRES_PASSWORD=CHANGE_THIS_PASSWORD

# === REDIS ===
REDIS_URL=redis://:CHANGE_THIS_REDIS_PW@redis:6379/0
REDIS_PASSWORD=CHANGE_THIS_REDIS_PW

# === STRIPE ===
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STEVE=price_xxxxx
STRIPE_PRICE_STEVE_PLUS=price_xxxxx
STRIPE_PRICE_DAVID=price_xxxxx

# === EMAIL ===
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=hello@yourdomain.com
EMAIL_FROM_NAME=Shibuya Analytics

# === SECURITY ===
ADMIN_API_KEY=$(openssl rand -hex 32)
ALLOWED_ORIGINS=https://shibuya.trade,https://www.shibuya.trade
SECRET_KEY=$(openssl rand -hex 32)

# === LOGGING ===
LOG_DIR=/app/logs
LOG_LEVEL=INFO
```

#### Step 2.3: Create Data Directories
```bash
mkdir -p /opt/medallion/data
mkdir -p /opt/medallion/logs
mkdir -p /opt/medallion/backups
chmod 755 /opt/medallion/data /opt/medallion/logs /opt/medallion/backups
```

#### Step 2.4: Launch Backend
```bash
cd /opt/medallion
docker compose -f docker-compose.prod.yml up -d --build

# Check it's running
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

#### Step 2.5: Run Database Migrations
```bash
docker compose -f docker-compose.prod.yml exec api alembic upgrade head
```

#### Step 2.6: Verify Health
```bash
curl http://localhost:8000/health
# Should return: {"status":"ok",...}
```

---

### Phase 3: SSL & Reverse Proxy (20 min)

#### Step 3.1: Install Caddy (auto-SSL)
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

#### Step 3.2: Configure Caddy
```bash
sudo nano /etc/caddy/Caddyfile
```

Paste:
```
api.yourdomain.com {
    reverse_proxy localhost:8000
    
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        -Server
    }
}
```

#### Step 3.3: Start Caddy
```bash
sudo systemctl enable caddy
sudo systemctl start caddy
sudo systemctl status caddy
```

#### Step 3.4: Verify HTTPS
```bash
curl https://api.yourdomain.com/health
```

---

### Phase 4: Frontend Deployment (15 min)

#### Step 4.1: Create Production Env
```bash
# In shibuya_analytics folder locally:
echo "VITE_API_BASE=https://api.yourdomain.com" > .env.production
```

#### Step 4.2: Deploy to Vercel
```bash
npm i -g vercel
cd shibuya_analytics
vercel --prod
```

Follow prompts. When asked about environment variables, add:
- `VITE_API_BASE` = `https://api.yourdomain.com`

#### Step 4.3: Configure Domain
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add `shibuya.trade` (or your domain)
3. Update DNS to point to Vercel

---

### Phase 5: End-to-End Testing (30 min)

#### Test 1: Homepage
```bash
curl -I https://shibuya.trade
# Should return 200 OK
```

#### Test 2: API Health
```bash
curl https://api.yourdomain.com/health
# Should return {"status":"ok"}
```

#### Test 3: Demo Mode
1. Go to https://shibuya.trade/activate
2. Click "DEMO MODE"
3. Verify dashboard loads with sample data

#### Test 4: Checkout Flow (use Stripe test mode first!)
1. Go to /pricing
2. Select a plan
3. Complete checkout with test card: `4242 4242 4242 4242`
4. Verify you land on /activate with success message
5. Check your email for activation

#### Test 5: Activation
1. Use email + order code from checkout
2. Verify dashboard loads with your actual data

---

## 🔒 Security Checklist (Before Promoting)

- [ ] **DEV_MODE=false** in production .env
- [ ] **Stripe webhook signature** verification enabled (`STRIPE_WEBHOOK_SECRET` set)
- [ ] **ALLOWED_ORIGINS** set to production domains only
- [ ] **SSH key auth only** (no password login)
- [ ] **Firewall** - only 22, 80, 443 open
- [ ] **ADMIN_API_KEY** is 32+ random characters

---

## 📊 Monitoring Setup (Post-Launch)

### Uptime Monitoring
1. Create account at uptimerobot.com (free)
2. Add monitor for `https://api.yourdomain.com/health`
3. Set alert email

### Log Access
```bash
# View live logs
docker compose -f docker-compose.prod.yml logs -f api

# View last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100 api
```

---

## 💰 First Customer Checklist

Once everything is live:

1. [ ] Buy something yourself (real card, real money) - be your first customer
2. [ ] Verify the full flow: purchase → email → activation → dashboard
3. [ ] Test CSV upload with your own trading data
4. [ ] Check alerts are appearing
5. [ ] Test edge portfolio page
6. [ ] Test slump prescription page
7. [ ] Test shadow boxing page
8. [ ] Verify mobile experience on real phone

---

## 🆘 Quick Troubleshooting

### "API returns 502"
```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs api
docker compose -f docker-compose.prod.yml restart api
```

### "Database connection error"
```bash
docker compose -f docker-compose.prod.yml logs db
docker compose -f docker-compose.prod.yml restart db
# Wait 10 seconds, then restart api
docker compose -f docker-compose.prod.yml restart api
```

### "Stripe webhooks not working"
1. Check webhook URL in Stripe Dashboard is correct
2. Check `STRIPE_WEBHOOK_SECRET` matches
3. Check Stripe Dashboard → Webhooks → Event logs

### "Emails not sending"
```bash
docker compose -f docker-compose.prod.yml exec api python -c "
import os
print('RESEND_API_KEY set:', bool(os.getenv('RESEND_API_KEY')))
"
```

---

## 📅 Estimated Timeline

| Phase | Duration | What |
|-------|----------|------|
| External Services | 1 hour | Stripe, Resend, VPS |
| Backend Deploy | 45 min | Docker, env, migrations |
| SSL/Proxy | 20 min | Caddy setup |
| Frontend Deploy | 15 min | Vercel |
| Testing | 30 min | E2E verification |
| **Total** | **~3 hours** | From now to live |

---

## ✅ You're Ready When...

- [ ] https://api.yourdomain.com/health returns `{"status":"ok"}`
- [ ] https://shibuya.trade loads without errors
- [ ] Demo mode works on dashboard
- [ ] Test purchase completes (Stripe test mode)
- [ ] Activation email received
- [ ] Dashboard loads after activation
- [ ] Mobile view works properly

**Then flip Stripe to live mode and start promoting! 🚀**
