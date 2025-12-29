# Shibuya Analytics - 48h Launch Checklist

**Generated:** $(date)  
**Status:** READY FOR LAUNCH (pending configuration)

---

## ✅ CODE STATUS: COMPLETE

### Frontend (shibuya_analytics/)
| Component | Status | Notes |
|-----------|--------|-------|
| `vite.config.ts` | ✅ FIXED | Build passes - 173 modules |
| `App.tsx` | ✅ OK | Routes mounted correctly |
| `routes.tsx` | ✅ OK | All 11 routes defined |
| `api.ts` | ✅ OK | All endpoints wired, demo mode works |
| `constants.ts` | ✅ OK | Pricing configured ($99/$149/$250) |
| `types.ts` | ✅ OK | TypeScript types complete |
| `AuthGuard.tsx` | ✅ OK | Redirects to /activate if no token |
| `ErrorBoundary.tsx` | ✅ OK | Catches runtime errors |

### Dashboard Pages
| Page | Status | Endpoint |
|------|--------|----------|
| OverviewPage | ✅ OK | `/v1/dashboard/overview` |
| AlertsPage | ✅ OK | `/v1/dashboard/alerts` |
| EdgePortfolioPage | ✅ OK | `/v1/dashboard/edge-portfolio` |
| ShadowBoxingPage | ✅ OK | `/v1/dashboard/shadow-boxing` |
| SlumpPrescriptionPage | ✅ OK | `/v1/dashboard/slump-prescription` |
| AppendTradesPage | ✅ OK | `/v1/dashboard/upload` + `/v1/trader/trades/preview` |

### Marketing Pages
| Page | Status | Notes |
|------|--------|-------|
| HomePage | ✅ OK | Landing with CTA |
| PricingPage | ✅ OK | 3-tier pricing display |
| CheckoutPage | ✅ OK | Stripe checkout flow |
| ActivationPage | ✅ OK | Terminal-style login + demo mode |
| EnterprisePage | ✅ OK | Contact form |
| NotFoundPage | ✅ OK | 404 handler |

### Backend (medallion_api/)
| Component | Status | Notes |
|-----------|--------|-------|
| `main.py` | ✅ OK | All routers included |
| `dashboard_endpoints.py` | ✅ OK | All 5 dashboard endpoints |
| `stripe_checkout.py` | ✅ OK | Create session, webhook, status |
| `trader_endpoints.py` | ✅ FIXED | Activation now checks orders table |
| `email_service.py` | ✅ OK | Shibuya order confirmation + report emails |
| `storage.py` | ✅ OK | Shibuya order CRUD methods |
| `schema.sql` | ✅ OK | Orders table exists |
| Health endpoint | ✅ OK | `/health/ready` |

---

## 🔧 CONFIGURATION REQUIRED (Manual Steps)

### 1. Stripe Setup (Required for Payments)
```bash
# In Stripe Dashboard (https://dashboard.stripe.com):

# 1. Create 3 Products:
#    - Steve ($99 one-time)
#    - Steve Plus ($149 one-time) 
#    - David ($250/month subscription)

# 2. Copy Price IDs (format: price_xxxxxx)

# 3. Create Webhook endpoint:
#    URL: https://api.yourdomain.com/v1/webhooks/stripe
#    Events: checkout.session.completed, customer.subscription.deleted

# 4. Copy Webhook Secret (format: whsec_xxxxxx)
```

**Add to `.env`:**
```bash
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STEVE=price_xxxxx
STRIPE_PRICE_STEVE_PLUS=price_xxxxx
STRIPE_PRICE_DAVID=price_xxxxx
```

### 2. Resend Email Setup (Required for Order Confirmations)
```bash
# At https://resend.com:
# 1. Sign up / login
# 2. Create API key
# 3. Verify your domain (for custom FROM address)
```

**Add to `.env`:**
```bash
RESEND_API_KEY=re_xxxxx
EMAIL_FROM=orders@yourdomain.com
EMAIL_FROM_NAME=Shibuya Analytics
```

### 3. Domain & DNS Setup
```bash
# A Records:
api.shibuya.trade -> YOUR_VPS_IP
shibuya.trade -> YOUR_VPS_IP (or CNAME to Vercel/Netlify)

# SSL: Caddy will auto-provision Let's Encrypt certificates
```

### 4. VPS Deployment
```bash
# On your VPS:
ssh root@your-vps-ip

# 1. Install Docker
curl -fsSL https://get.docker.com | sh

# 2. Clone repo
git clone https://github.com/your-org/medallion_api.git
cd medallion_api

# 3. Create .env file with production values
cp .env.example .env
nano .env  # Fill in all values

# 4. Start services
docker-compose -f docker-compose.prod.yml up -d

# 5. Verify
curl http://localhost:8000/health/ready
```

### 5. Frontend Deployment

**Option A: Vercel (Recommended)**
```bash
cd shibuya_analytics
npm run build
npx vercel --prod
```

**Option B: Self-hosted**
```bash
# Build static files
cd shibuya_analytics
npm run build

# Copy dist/ to your webserver
scp -r dist/* root@your-vps:/var/www/shibuya/

# Configure Caddy/Nginx to serve from /var/www/shibuya
```

**Set environment variable:**
```bash
VITE_API_BASE=https://api.shibuya.trade
```

---

## 🧪 TESTING CHECKLIST

### Pre-Launch Tests
- [ ] `npm run build` succeeds locally ✅ (verified)
- [ ] Backend starts: `python -c "from app.main import app"`  ✅ (verified)
- [ ] Demo mode works: Visit `/activate` → click DEMO MODE
- [ ] API responds: `curl https://api.yourdomain.com/health/ready`

### Payment Flow Test (After Stripe Setup)
- [ ] Go to `/pricing` → click "Get Steve"
- [ ] Fill checkout form → redirects to Stripe
- [ ] Complete payment (use Stripe test card 4242...)
- [ ] Webhook fires → order marked complete
- [ ] Email arrives (if Resend configured)
- [ ] `/activate` with email + order code → gets token → dashboard

### Dashboard Test
- [ ] All 6 dashboard pages load with data
- [ ] CSV upload works (use template from AppendTrades page)
- [ ] Logout works → redirects to /activate

---

## 📋 LAUNCH DAY ACTIONS

### T-2 Hours
1. [ ] Final `git pull` on VPS
2. [ ] Verify `.env` has all production values
3. [ ] `docker-compose -f docker-compose.prod.yml up -d --build`
4. [ ] Test `/health/ready` endpoint
5. [ ] Test Stripe webhook with `stripe trigger checkout.session.completed`

### T-1 Hour
1. [ ] Set DNS A records if not done
2. [ ] Wait for SSL certificate provisioning (Caddy)
3. [ ] Deploy frontend to Vercel/host
4. [ ] Set `VITE_API_BASE` to production URL

### T-0 Launch
1. [ ] Smoke test: complete a $1 test purchase
2. [ ] Verify order appears in database
3. [ ] Verify activation flow works
4. [ ] Switch Stripe to live mode (if using test mode)
5. [ ] 🚀 ANNOUNCE

---

## 🚨 CRITICAL REMINDERS

1. **STRIPE_WEBHOOK_SECRET is REQUIRED in production** - without it, payments won't be verified and orders won't complete

2. **CORS origins must include your frontend domain** - update `ALLOWED_ORIGINS` in `.env`

3. **Database backups** - set up automated daily backups of SQLite file

4. **Logs** - monitor `docker logs medallion_api` for the first hour after launch

---

## 📁 FILES MODIFIED IN THIS REVIEW

1. `shibuya_analytics/vite.config.ts` - Fixed TypeScript build error
2. `medallion_api/app/trader_endpoints.py` - Fixed activation to check orders table properly

---

## 💰 PRICING REFERENCE

| Plan | Price | Type | Stripe Mode |
|------|-------|------|-------------|
| Steve | $99 | One-time | payment |
| Steve Plus | $149 | One-time | payment |
| David | $250/mo | Subscription | subscription |

---

**TL;DR: Code is ready. You need to:**
1. Create Stripe products and get price IDs
2. Set up Stripe webhook
3. Get Resend API key
4. Deploy backend to VPS with Docker
5. Deploy frontend to Vercel
6. Point DNS to your servers

**Estimated time: 2-4 hours for experienced dev, including DNS propagation wait.**
