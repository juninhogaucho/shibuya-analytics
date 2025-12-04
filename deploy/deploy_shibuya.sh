#!/usr/bin/env bash
# ============================================================================
# SHIBUYA ANALYTICS - COMPLETE VPS DEPLOYMENT
# ============================================================================
# 
# This script deploys BOTH the backend API and frontend on the SAME VPS.
# 
# Architecture:
#   - Backend: Docker (FastAPI + PostgreSQL + Redis)
#   - Frontend: Static files served by Caddy
#   - SSL: Auto-provisioned by Caddy (Let's Encrypt)
#
# Prerequisites:
#   - Fresh Ubuntu 22.04 LTS VPS (2+ vCPU, 4GB+ RAM, 40GB+ SSD)
#   - Root access (ssh root@your-vps-ip)
#   - Domain DNS A records pointing to VPS IP:
#       - api.shibuya.trade → VPS_IP
#       - shibuya.trade → VPS_IP (or www.shibuya.trade)
#
# Usage:
#   # On your LOCAL machine, upload and run:
#   scp -r ./deploy root@YOUR_VPS_IP:/opt/shibuya-deploy/
#   ssh root@YOUR_VPS_IP "bash /opt/shibuya-deploy/deploy_shibuya.sh"
#
# ============================================================================

set -e  # Exit on any error

# ============================================
# CONFIGURATION - EDIT THESE VALUES
# ============================================

# Your domains (must have DNS A records pointing to this VPS)
API_DOMAIN="${API_DOMAIN:-api.shibuya.trade}"
FRONTEND_DOMAIN="${FRONTEND_DOMAIN:-shibuya.trade}"

# Git repositories
BACKEND_REPO="${BACKEND_REPO:-https://github.com/juninhogaucho/medallion.git}"
BACKEND_BRANCH="${BACKEND_BRANCH:-main}"

# Installation directories
BACKEND_DIR="/opt/shibuya-backend"
FRONTEND_DIR="/opt/shibuya-frontend"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ============================================
# HELPER FUNCTIONS
# ============================================

log_step() {
    echo -e "\n${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}▶ $1${NC}"
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

log_info() {
    echo -e "${GREEN}  ✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}  ⚠${NC} $1"
}

log_error() {
    echo -e "${RED}  ✗${NC} $1"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "This script must be run as root"
        exit 1
    fi
}

# ============================================
# BANNER
# ============================================

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║   ███████╗██╗  ██╗██╗██████╗ ██╗   ██╗██╗   ██╗ █████╗        ║"
echo "║   ██╔════╝██║  ██║██║██╔══██╗██║   ██║╚██╗ ██╔╝██╔══██╗       ║"
echo "║   ███████╗███████║██║██████╔╝██║   ██║ ╚████╔╝ ███████║       ║"
echo "║   ╚════██║██╔══██║██║██╔══██╗██║   ██║  ╚██╔╝  ██╔══██║       ║"
echo "║   ███████║██║  ██║██║██████╔╝╚██████╔╝   ██║   ██║  ██║       ║"
echo "║   ╚══════╝╚═╝  ╚═╝╚═╝╚═════╝  ╚═════╝    ╚═╝   ╚═╝  ╚═╝       ║"
echo "║                                                               ║"
echo "║              PRODUCTION DEPLOYMENT SCRIPT                     ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "Configuration:"
echo "  API Domain:      $API_DOMAIN"
echo "  Frontend Domain: $FRONTEND_DOMAIN"
echo "  Backend Dir:     $BACKEND_DIR"
echo "  Frontend Dir:    $FRONTEND_DIR"
echo ""

check_root

# ============================================
# STEP 1: SYSTEM UPDATES
# ============================================

log_step "Step 1/8: Updating system packages"

apt-get update -qq
apt-get upgrade -y -qq
apt-get install -y -qq \
    curl wget git unzip \
    apt-transport-https ca-certificates gnupg lsb-release \
    sqlite3

log_info "System packages updated"

# ============================================
# STEP 2: INSTALL DOCKER
# ============================================

log_step "Step 2/8: Installing Docker"

if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    systemctl enable docker
    systemctl start docker
    log_info "Docker installed"
else
    log_info "Docker already installed"
fi

# Install Docker Compose plugin
if ! docker compose version &> /dev/null; then
    apt-get install -y docker-compose-plugin
    log_info "Docker Compose plugin installed"
else
    log_info "Docker Compose already installed"
fi

# ============================================
# STEP 3: INSTALL CADDY
# ============================================

log_step "Step 3/8: Installing Caddy (SSL reverse proxy)"

if ! command -v caddy &> /dev/null; then
    apt install -y debian-keyring debian-archive-keyring apt-transport-https
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | \
        gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
    curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | \
        tee /etc/apt/sources.list.d/caddy-stable.list
    apt update -qq
    apt install -y caddy
    log_info "Caddy installed"
else
    log_info "Caddy already installed"
fi

# ============================================
# STEP 4: INSTALL NODE.JS (for frontend build)
# ============================================

log_step "Step 4/8: Installing Node.js 20.x"

if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    log_info "Node.js $(node -v) installed"
else
    log_info "Node.js $(node -v) already installed"
fi

# ============================================
# STEP 5: CLONE/UPDATE BACKEND
# ============================================

log_step "Step 5/8: Setting up backend"

if [ -d "$BACKEND_DIR" ]; then
    log_warn "Backend directory exists, pulling latest..."
    cd "$BACKEND_DIR"
    git fetch origin
    git reset --hard origin/$BACKEND_BRANCH
    log_info "Backend updated"
else
    git clone -b $BACKEND_BRANCH $BACKEND_REPO $BACKEND_DIR
    cd "$BACKEND_DIR"
    log_info "Backend cloned"
fi

# Create directories
mkdir -p "$BACKEND_DIR/data"
mkdir -p "$BACKEND_DIR/logs"
mkdir -p "$BACKEND_DIR/backups"
chmod 755 "$BACKEND_DIR/data" "$BACKEND_DIR/logs" "$BACKEND_DIR/backups"

# Generate secrets if .env doesn't exist
if [ ! -f "$BACKEND_DIR/.env" ]; then
    log_info "Generating production .env file..."
    
    # Generate secure passwords
    POSTGRES_PASSWORD=$(openssl rand -hex 16)
    REDIS_PASSWORD=$(openssl rand -hex 16)
    SECRET_KEY=$(openssl rand -hex 32)
    ADMIN_API_KEY=$(openssl rand -hex 32)
    
    cat > "$BACKEND_DIR/.env" <<EOF
# ============================================
# SHIBUYA BACKEND - PRODUCTION ENVIRONMENT
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# ============================================

# === ENVIRONMENT ===
ENVIRONMENT=production
DEV_MODE=false
DEBUG=false

# === DATABASE (PostgreSQL via Docker) ===
POSTGRES_USER=medallion
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
POSTGRES_DB=medallion
DATABASE_URL=postgresql://medallion:${POSTGRES_PASSWORD}@postgres:5432/medallion

# === REDIS ===
REDIS_PASSWORD=${REDIS_PASSWORD}

# === SECURITY ===
SECRET_KEY=${SECRET_KEY}
ADMIN_API_KEY=${ADMIN_API_KEY}
ALLOWED_ORIGINS=https://${FRONTEND_DOMAIN},https://www.${FRONTEND_DOMAIN}

# === STRIPE (fill in your values) ===
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PRICE_STEVE=price_xxxxx
STRIPE_PRICE_STEVE_PLUS=price_xxxxx
STRIPE_PRICE_DAVID=price_xxxxx

# === EMAIL (Resend) ===
# Your existing key:
RESEND_API_KEY=re_65z4GTcG_PaWPGKydUNxs7D9vHRMu7hkY
EMAIL_FROM=hello@shibuya.trade
EMAIL_FROM_NAME=Shibuya Analytics

# === LOGGING ===
LOG_DIR=/app/logs
LOG_LEVEL=INFO
EOF

    chmod 600 "$BACKEND_DIR/.env"
    log_info ".env file created with secure passwords"
    log_warn "⚠️  IMPORTANT: Edit .env to add your Stripe keys!"
else
    log_info ".env file already exists"
fi

# ============================================
# STEP 6: BUILD & START BACKEND
# ============================================

log_step "Step 6/8: Building and starting backend services"

cd "$BACKEND_DIR"

# Build and start with docker compose
docker compose -f docker-compose.prod.yml down 2>/dev/null || true
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

log_info "Docker containers starting..."

# Wait for services to be healthy
log_info "Waiting for services to be ready (up to 60 seconds)..."
for i in {1..12}; do
    if curl -sf http://localhost:8000/health > /dev/null 2>&1; then
        log_info "Backend API is healthy!"
        break
    fi
    if [ $i -eq 12 ]; then
        log_error "Backend failed to start. Check logs: docker compose logs api"
        exit 1
    fi
    sleep 5
done

# Run database migrations
log_info "Running database migrations..."
docker compose -f docker-compose.prod.yml exec -T api alembic upgrade head || log_warn "Migrations may have already run"

log_info "Backend is running!"

# ============================================
# STEP 7: BUILD FRONTEND
# ============================================

log_step "Step 7/8: Building frontend"

# Check if frontend is in same repo or separate
if [ -d "$BACKEND_DIR/../shibuya_analytics" ]; then
    FRONTEND_SRC="$BACKEND_DIR/../shibuya_analytics"
elif [ -d "/opt/shibuya-deploy/shibuya_analytics" ]; then
    FRONTEND_SRC="/opt/shibuya-deploy/shibuya_analytics"
else
    log_warn "Frontend source not found, looking for pre-built dist..."
    if [ -d "/opt/shibuya-deploy/dist" ]; then
        FRONTEND_SRC="/opt/shibuya-deploy"
    else
        log_error "Frontend not found. Please upload shibuya_analytics folder."
        exit 1
    fi
fi

# If we have source, build it
if [ -f "$FRONTEND_SRC/package.json" ]; then
    log_info "Building frontend from source..."
    cd "$FRONTEND_SRC"
    
    # Create production env
    echo "VITE_API_BASE=https://${API_DOMAIN}" > .env.production
    
    npm ci --silent
    npm run build
    
    # Copy dist to serving directory
    rm -rf "$FRONTEND_DIR"
    mkdir -p "$FRONTEND_DIR"
    cp -r dist/* "$FRONTEND_DIR/"
    log_info "Frontend built and copied to $FRONTEND_DIR"
else
    # Use pre-built dist
    rm -rf "$FRONTEND_DIR"
    mkdir -p "$FRONTEND_DIR"
    cp -r "$FRONTEND_SRC/dist/"* "$FRONTEND_DIR/"
    log_info "Pre-built frontend copied to $FRONTEND_DIR"
fi

# ============================================
# STEP 8: CONFIGURE CADDY
# ============================================

log_step "Step 8/8: Configuring Caddy (SSL + reverse proxy)"

cat > /etc/caddy/Caddyfile <<EOF
# ============================================
# SHIBUYA ANALYTICS - CADDY CONFIGURATION
# Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")
# ============================================

# Backend API
${API_DOMAIN} {
    reverse_proxy localhost:8000
    
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        -Server
    }
    
    log {
        output file /var/log/caddy/api.log {
            roll_size 50mb
            roll_keep 5
        }
    }
}

# Frontend (static files)
${FRONTEND_DOMAIN} {
    root * ${FRONTEND_DIR}
    file_server
    
    # SPA fallback - all routes go to index.html
    try_files {path} /index.html
    
    encode gzip
    
    header {
        Strict-Transport-Security "max-age=31536000; includeSubDomains"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        X-XSS-Protection "1; mode=block"
        -Server
    }
    
    # Cache static assets
    @static {
        path *.js *.css *.png *.jpg *.jpeg *.gif *.ico *.svg *.woff *.woff2
    }
    header @static Cache-Control "public, max-age=31536000, immutable"
    
    log {
        output file /var/log/caddy/frontend.log {
            roll_size 50mb
            roll_keep 5
        }
    }
}

# Redirect www to non-www
www.${FRONTEND_DOMAIN} {
    redir https://${FRONTEND_DOMAIN}{uri} permanent
}
EOF

# Create log directory
mkdir -p /var/log/caddy

# Restart Caddy to apply configuration
systemctl restart caddy
systemctl enable caddy

log_info "Caddy configured with auto-SSL"

# Verify DNS before SSL
log_info "Verifying DNS configuration..."
if host $API_DOMAIN > /dev/null 2>&1; then
    log_info "API domain DNS is configured"
else
    log_warn "DNS not yet propagated for $API_DOMAIN"
fi

if host $FRONTEND_DOMAIN > /dev/null 2>&1; then
    log_info "Frontend domain DNS is configured"
else
    log_warn "DNS not yet propagated for $FRONTEND_DOMAIN"
fi

# ============================================
# FIREWALL
# ============================================

log_info "Configuring firewall..."
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# ============================================
# DAILY BACKUPS
# ============================================

log_info "Setting up daily database backups..."
cat > /etc/cron.daily/shibuya-backup <<'EOF'
#!/bin/bash
BACKUP_DIR="/opt/shibuya-backend/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL from Docker
docker exec medallion_postgres pg_dump -U medallion medallion | gzip > "$BACKUP_DIR/db_$DATE.sql.gz"

# Keep only last 7 days
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +7 -delete

echo "$(date): Database backed up to db_$DATE.sql.gz" >> /var/log/shibuya-backup.log
EOF

chmod +x /etc/cron.daily/shibuya-backup
log_info "Daily backups configured"

# ============================================
# SUMMARY
# ============================================

echo -e "\n${GREEN}"
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                                                               ║"
echo "║              🎉 DEPLOYMENT COMPLETE! 🎉                        ║"
echo "║                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo "Your Shibuya Analytics is now running at:"
echo ""
echo "  Frontend:  https://${FRONTEND_DOMAIN}"
echo "  API:       https://${API_DOMAIN}"
echo "  API Docs:  https://${API_DOMAIN}/docs"
echo ""
echo "Quick checks:"
echo "  curl https://${API_DOMAIN}/health"
echo "  curl -I https://${FRONTEND_DOMAIN}"
echo ""
echo "View logs:"
echo "  docker compose -f /opt/shibuya-backend/docker-compose.prod.yml logs -f api"
echo "  tail -f /var/log/caddy/api.log"
echo "  tail -f /var/log/caddy/frontend.log"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT NEXT STEPS:${NC}"
echo ""
echo "1. Edit your Stripe keys in /opt/shibuya-backend/.env"
echo "   nano /opt/shibuya-backend/.env"
echo ""
echo "2. Then restart the API:"
echo "   cd /opt/shibuya-backend && docker compose -f docker-compose.prod.yml restart api"
echo ""
echo "3. Test the checkout flow with Stripe test mode first!"
echo ""
echo "Admin API Key (save this securely):"
grep "ADMIN_API_KEY" "$BACKEND_DIR/.env" | cut -d'=' -f2
echo ""
echo -e "${GREEN}🚀 You're ready to onboard your first customer!${NC}"
