# Shibuya Analytics Deployment

This folder contains scripts to deploy Shibuya Analytics (frontend + backend) to a single VPS.

## What Gets Deployed

```
VPS Server
├── Caddy (SSL + reverse proxy)
│   ├── shibuya.trade → Static frontend files
│   └── api.shibuya.trade → Docker backend
│
├── /opt/shibuya-backend/
│   ├── Docker containers:
│   │   ├── api (FastAPI)
│   │   ├── postgres (PostgreSQL 15)
│   │   ├── redis (Redis 7)
│   │   └── backup (daily DB backups)
│   └── .env (your secrets)
│
└── /opt/shibuya-frontend/
    └── dist/ (built React app)
```

## Prerequisites

### VPS Requirements
- Ubuntu 22.04 LTS
- 2+ vCPU, 4GB+ RAM, 40GB+ SSD
- Recommended: Hetzner (€4.51/mo), DigitalOcean ($24/mo), Vultr

### DNS Configuration
Point these A records to your VPS IP:
```
A    shibuya.trade       → YOUR_VPS_IP
A    api.shibuya.trade   → YOUR_VPS_IP
A    www.shibuya.trade   → YOUR_VPS_IP  (optional)
```

### Required API Keys (before deploying)
- **Stripe**: `sk_live_xxx`, `pk_live_xxx`, `whsec_xxx`
- **Resend**: Already configured (`re_65z4GTcG_...`)

## Deployment Steps

### Option 1: Windows (Recommended)

Double-click or run in cmd:
```batch
deploy\deploy_to_vps.bat YOUR_VPS_IP
```

This will:
1. Build the frontend
2. Package backend + frontend
3. Upload to VPS
4. Optionally run the deployment script

### Option 2: Manual

1. Build frontend locally:
   ```bash
   cd shibuya_analytics
   npm run build
   ```

2. Copy files to VPS:
   ```bash
   scp -r shibuya_analytics/dist root@VPS_IP:/opt/shibuya-deploy/
   scp -r medallion_api root@VPS_IP:/opt/shibuya-deploy/
   scp deploy/deploy_shibuya.sh root@VPS_IP:/opt/shibuya-deploy/
   ```

3. SSH and run:
   ```bash
   ssh root@VPS_IP
   bash /opt/shibuya-deploy/deploy_shibuya.sh
   ```

## Post-Deployment

### 1. Configure Stripe Keys

```bash
ssh root@YOUR_VPS_IP
nano /opt/shibuya-backend/.env
```

Update these values:
```
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STEVE=price_xxxxx
STRIPE_PRICE_STEVE_PLUS=price_xxxxx
STRIPE_PRICE_DAVID=price_xxxxx
```

Then restart:
```bash
cd /opt/shibuya-backend
docker compose -f docker-compose.prod.yml restart api
```

### 2. Add Stripe Webhook

In Stripe Dashboard → Developers → Webhooks:
- URL: `https://api.shibuya.trade/v1/webhooks/stripe`
- Events: `checkout.session.completed`, `checkout.session.expired`, `customer.subscription.deleted`

### 3. Verify Everything Works

```bash
# Check API health
curl https://api.shibuya.trade/health

# Check frontend loads
curl -I https://shibuya.trade

# Check container status
docker ps

# View API logs
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml logs -f api
```

## Useful Commands

```bash
# View logs
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml logs -f api
tail -f /var/log/caddy/api.log
tail -f /var/log/caddy/frontend.log

# Restart services
cd /opt/shibuya-backend
docker compose -f docker-compose.prod.yml restart api

# Restart everything
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d

# Restart Caddy (SSL/proxy)
systemctl restart caddy

# Database backup (runs daily automatically)
/etc/cron.daily/shibuya-backup

# Check backups
ls -la /opt/shibuya-backend/backups/
```

## Troubleshooting

### "502 Bad Gateway"
```bash
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml logs api
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml restart api
```

### "SSL certificate error"
Caddy auto-provisions SSL. If DNS isn't ready, wait 5-10 min and:
```bash
systemctl restart caddy
```

### Database connection issues
```bash
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml logs postgres
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml restart postgres
# Wait 10 seconds
docker compose -f /opt/shibuya-backend/docker-compose.prod.yml restart api
```

---

## ⚠️ This is for SHIBUYA only

For deploying customer prop firms (Decrypt, etc.), use the separate scripts:
- `medallion_api/scripts/deploy-new-prop.sh` - Creates new prop firm instance
- `medallion_api/scripts/deploy-new-prop.bat` - Windows wrapper

**DO NOT mix Shibuya deployment with prop firm deployments.**
