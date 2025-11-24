# 🚀 Deployment Guide

This guide covers deploying Chukfi CMS to production environments, from simple VPS deployments to container orchestration and cloud platforms. Chukfi CMS is designed to be deployment-friendly with minimal dependencies and flexible configuration options.

## 🎯 Deployment Overview

### Deployment Characteristics

#### **Self-Contained**

- **Single binary** for backend (no runtime dependencies)
- **Static files** for frontend (serve with any web server)
- **SQLite database** (no external database server required)
- **Local file storage** (or configurable cloud storage)

#### **Zero Dependencies**

- **No Docker required** (though Docker is supported)
- **No database server** to install or configure
- **No external services** required for basic functionality
- **Works on any platform** with Go and Node.js build tools

#### **Production Ready**

- **JWT authentication** with secure defaults
- **RBAC permissions** for multi-user environments
- **Audit logging** for compliance requirements
- **Health checks** and monitoring endpoints

## 🏗️ Build Process

### Production Build

#### **1. Build Frontend**

```bash
# Install dependencies
cd frontend
npm ci

# Build for production
npm run build

# Output: frontend/dist/
```

#### **2. Build Backend**

```bash
# Install dependencies
cd backend
go mod download

# Build for current platform
go build -o chukfi-server cmd/server/main.go

# Build for specific platforms
GOOS=linux GOARCH=amd64 go build -o chukfi-server-linux-amd64 cmd/server/main.go
GOOS=windows GOARCH=amd64 go build -o chukfi-server-windows-amd64.exe cmd/server/main.go
GOOS=darwin GOARCH=amd64 go build -o chukfi-server-darwin-amd64 cmd/server/main.go
GOOS=darwin GOARCH=arm64 go build -o chukfi-server-darwin-arm64 cmd/server/main.go
```

#### **3. Prepare Deployment Package**

```bash
#!/bin/bash
# build-release.sh

set -e

VERSION=${1:-"latest"}
BUILD_DIR="build"
RELEASE_DIR="$BUILD_DIR/chukfi-cms-$VERSION"

echo "Building Chukfi CMS $VERSION..."

# Clean and create build directory
rm -rf $BUILD_DIR
mkdir -p $RELEASE_DIR

# Build frontend
echo "Building frontend..."
cd frontend
npm ci
npm run build
cd ..

# Copy frontend build
cp -r frontend/dist $RELEASE_DIR/public

# Build backend for multiple platforms
echo "Building backend..."
cd backend

# Linux AMD64
GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o ../$RELEASE_DIR/chukfi-server-linux-amd64 cmd/server/main.go

# Linux ARM64
GOOS=linux GOARCH=arm64 go build -ldflags="-w -s" -o ../$RELEASE_DIR/chukfi-server-linux-arm64 cmd/server/main.go

# Windows AMD64
GOOS=windows GOARCH=amd64 go build -ldflags="-w -s" -o ../$RELEASE_DIR/chukfi-server-windows-amd64.exe cmd/server/main.go

# macOS AMD64
GOOS=darwin GOARCH=amd64 go build -ldflags="-w -s" -o ../$RELEASE_DIR/chukfi-server-darwin-amd64 cmd/server/main.go

# macOS ARM64 (Apple Silicon)
GOOS=darwin GOARCH=arm64 go build -ldflags="-w -s" -o ../$RELEASE_DIR/chukfi-server-darwin-arm64 cmd/server/main.go

cd ..

# Copy configuration and documentation
cp backend/.env.example $RELEASE_DIR/.env.example
cp -r backend/migrations $RELEASE_DIR/migrations
cp README.md $RELEASE_DIR/
cp LICENSE $RELEASE_DIR/
cp docs/INSTALLATION.md $RELEASE_DIR/INSTALLATION.md

# Create deployment scripts
cat > $RELEASE_DIR/start.sh << 'EOF'
#!/bin/bash
# Detect platform and start appropriate binary
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [[ $(uname -m) == "aarch64" ]]; then
        ./chukfi-server-linux-arm64
    else
        ./chukfi-server-linux-amd64
    fi
elif [[ "$OSTYPE" == "darwin"* ]]; then
    if [[ $(uname -m) == "arm64" ]]; then
        ./chukfi-server-darwin-arm64
    else
        ./chukfi-server-darwin-amd64
    fi
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    ./chukfi-server-windows-amd64.exe
else
    echo "Unsupported platform: $OSTYPE"
    exit 1
fi
EOF

chmod +x $RELEASE_DIR/start.sh

# Create systemd service file
cat > $RELEASE_DIR/chukfi-cms.service << 'EOF'
[Unit]
Description=Chukfi CMS Server
After=network.target

[Service]
Type=simple
User=chukfi
WorkingDirectory=/opt/chukfi-cms
ExecStart=/opt/chukfi-cms/start.sh
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

# Security settings
NoNewPrivileges=yes
PrivateTmp=yes
PrivateDevices=yes
ProtectHome=yes
ProtectSystem=strict
ReadWritePaths=/opt/chukfi-cms/data

[Install]
WantedBy=multi-user.target
EOF

# Create archive
cd $BUILD_DIR
tar -czf chukfi-cms-$VERSION.tar.gz chukfi-cms-$VERSION/

echo "Build complete: $BUILD_DIR/chukfi-cms-$VERSION.tar.gz"
```

## 🖥️ VPS/Server Deployment

### Manual Deployment

#### **1. Server Setup**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx sqlite3 certbot python3-certbot-nginx

# Create user for Chukfi CMS
sudo useradd -r -s /bin/false -d /opt/chukfi-cms chukfi
sudo mkdir -p /opt/chukfi-cms
sudo chown chukfi:chukfi /opt/chukfi-cms
```

#### **2. Deploy Application**

```bash
# Upload and extract release package
scp chukfi-cms-v1.0.0.tar.gz user@server:/tmp/
ssh user@server

# Extract to application directory
cd /tmp
tar -xzf chukfi-cms-v1.0.0.tar.gz
sudo mv chukfi-cms-v1.0.0/* /opt/chukfi-cms/
sudo chown -R chukfi:chukfi /opt/chukfi-cms
sudo chmod +x /opt/chukfi-cms/start.sh
sudo chmod +x /opt/chukfi-cms/chukfi-server-*
```

#### **3. Configure Environment**

```bash
# Create production environment file
sudo -u chukfi cp /opt/chukfi-cms/.env.example /opt/chukfi-cms/.env
sudo -u chukfi nano /opt/chukfi-cms/.env
```

**Production .env configuration:**

```env
# Database Configuration
DATABASE_URL=sqlite:///opt/chukfi-cms/data/chukfi.db
DB_DRIVER=sqlite

# Server Configuration
PORT=8080
HOST=127.0.0.1
ENVIRONMENT=production

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-change-this-NOW
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# File Upload Configuration
UPLOAD_MAX_SIZE=50MB
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=json

# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

#### **4. Initialize Database**

```bash
# Create data directory
sudo -u chukfi mkdir -p /opt/chukfi-cms/data

# Run database migrations
cd /opt/chukfi-cms
sudo -u chukfi ./chukfi-server-linux-amd64 migrate
```

#### **5. Setup Systemd Service**

```bash
# Install systemd service
sudo cp /opt/chukfi-cms/chukfi-cms.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable chukfi-cms
sudo systemctl start chukfi-cms

# Check service status
sudo systemctl status chukfi-cms
```

#### **6. Configure Nginx**

```nginx
# /etc/nginx/sites-available/chukfi-cms
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_trusted_certificate /etc/letsencrypt/live/yourdomain.com/chain.pem;

    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-RSA-AES128-SHA256:ECDHE-RSA-AES256-SHA384:ECDHE-RSA-AES128-SHA:ECDHE-RSA-AES256-SHA:DHE-RSA-AES128-SHA256:DHE-RSA-AES256-SHA256:DHE-RSA-AES128-SHA:DHE-RSA-AES256-SHA;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    # Root directory for static files
    root /opt/chukfi-cms/public;
    index index.html;

    # Admin dashboard and static files
    location / {
        try_files $uri $uri/ /index.html;

        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API endpoints
    location /api/ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:8080;
        access_log off;
    }

    # Media uploads with larger body size limit
    location /api/v1/media {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Increase upload limits
        client_max_body_size 50M;
        client_body_timeout 120s;
        proxy_read_timeout 120s;
    }

    # Media files serving
    location /media/ {
        alias /opt/chukfi-cms/data/media/;
        expires 1y;
        add_header Cache-Control "public";

        # Security: Don't execute uploaded files
        location ~* \.(php|pl|py|jsp|asp|sh|cgi)$ {
            deny all;
        }
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
    }

    location ~ /data/ {
        deny all;
    }
}
```

```bash
# Enable site and reload nginx
sudo ln -s /etc/nginx/sites-available/chukfi-cms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh - Automated deployment script

set -e

SERVER="user@yourdomain.com"
APP_DIR="/opt/chukfi-cms"
SERVICE_NAME="chukfi-cms"
BACKUP_DIR="/opt/backups/chukfi-cms"

# Configuration
VERSION=$1
if [ -z "$VERSION" ]; then
    echo "Usage: $0 <version>"
    echo "Example: $0 v1.0.1"
    exit 1
fi

echo "🚀 Deploying Chukfi CMS $VERSION to production..."

# Step 1: Build release locally
echo "📦 Building release package..."
./build-release.sh $VERSION

# Step 2: Create backup on server
echo "💾 Creating backup..."
ssh $SERVER "sudo mkdir -p $BACKUP_DIR"
ssh $SERVER "sudo systemctl stop $SERVICE_NAME"
ssh $SERVER "sudo tar -czf $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz -C $APP_DIR ."

# Step 3: Upload new version
echo "📤 Uploading new version..."
scp build/chukfi-cms-$VERSION.tar.gz $SERVER:/tmp/

# Step 4: Deploy on server
echo "🔄 Deploying on server..."
ssh $SERVER << EOF
    cd /tmp
    tar -xzf chukfi-cms-$VERSION.tar.gz

    # Backup current .env
    sudo cp $APP_DIR/.env /tmp/.env.backup

    # Deploy new files
    sudo rm -rf $APP_DIR/*
    sudo mv chukfi-cms-$VERSION/* $APP_DIR/

    # Restore .env
    sudo mv /tmp/.env.backup $APP_DIR/.env

    # Set permissions
    sudo chown -R chukfi:chukfi $APP_DIR
    sudo chmod +x $APP_DIR/start.sh
    sudo chmod +x $APP_DIR/chukfi-server-*

    # Run migrations
    cd $APP_DIR
    sudo -u chukfi ./chukfi-server-linux-amd64 migrate

    # Restart service
    sudo systemctl start $SERVICE_NAME
    sudo systemctl status $SERVICE_NAME

    # Cleanup
    rm -f /tmp/chukfi-cms-$VERSION.tar.gz
    rm -rf /tmp/chukfi-cms-$VERSION
EOF

# Step 5: Health check
echo "🏥 Running health check..."
sleep 5
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://yourdomain.com/health)

if [ "$HEALTH_CHECK" = "200" ]; then
    echo "✅ Deployment successful! Health check passed."
else
    echo "❌ Deployment may have failed. Health check returned: $HEALTH_CHECK"
    exit 1
fi

echo "🎉 Chukfi CMS $VERSION deployed successfully!"
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Build stage for frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Build stage for backend
FROM golang:1.21-alpine AS backend-builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app/backend
COPY backend/go.* ./
RUN go mod download

COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o chukfi-server cmd/server/main.go

# Production stage
FROM alpine:3.18

# Install runtime dependencies
RUN apk add --no-cache ca-certificates tzdata

# Create app user
RUN adduser -D -s /bin/sh chukfi

# Create app directory
WORKDIR /app

# Copy built artifacts
COPY --from=frontend-builder /app/frontend/dist ./public
COPY --from=backend-builder /app/backend/chukfi-server ./
COPY --from=backend-builder /app/backend/migrations ./migrations

# Create data directory
RUN mkdir -p data && chown chukfi:chukfi data

# Switch to app user
USER chukfi

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Start application
CMD ["./chukfi-server"]
```

### Docker Compose

```yaml
# docker-compose.yml
version: "3.8"

services:
  chukfi-cms:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=sqlite:///app/data/chukfi.db
      - DB_DRIVER=sqlite
      - PORT=8080
      - HOST=0.0.0.0
      - ENVIRONMENT=production
      - JWT_SECRET=${JWT_SECRET}
      - JWT_ACCESS_EXPIRY=15m
      - JWT_REFRESH_EXPIRY=7d
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS:-*}
      - LOG_LEVEL=info
      - LOG_FORMAT=json
    volumes:
      - chukfi_data:/app/data
    restart: unless-stopped
    healthcheck:
      test:
        [
          "CMD",
          "wget",
          "--no-verbose",
          "--tries=1",
          "--spider",
          "http://localhost:8080/health",
        ]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/ssl:ro
      - chukfi_data:/app/data:ro # For media files
    depends_on:
      - chukfi-cms
    restart: unless-stopped

volumes:
  chukfi_data:
    driver: local
```

### Nginx Configuration for Docker

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';
    access_log /var/log/nginx/access.log main;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    upstream chukfi_backend {
        server chukfi-cms:8080;
    }

    server {
        listen 80;
        server_name _;

        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # API endpoints
        location /api/ {
            proxy_pass http://chukfi_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Health check
        location /health {
            proxy_pass http://chukfi_backend;
            access_log off;
        }

        # Media files
        location /media/ {
            alias /app/data/media/;
            expires 1y;
            add_header Cache-Control "public";
        }

        # Static files - serve from backend for now
        location / {
            proxy_pass http://chukfi_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Docker Deployment Commands

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f chukfi-cms

# Run migrations
docker-compose exec chukfi-cms ./chukfi-server migrate

# Create admin user
docker-compose exec chukfi-cms ./chukfi-server create-admin admin@example.com admin123

# Backup database
docker-compose exec chukfi-cms cp /app/data/chukfi.db /app/data/backup-$(date +%Y%m%d).db

# Scale horizontally
docker-compose up -d --scale chukfi-cms=3

# Update to new version
docker-compose pull
docker-compose up -d
```

## ☁️ Cloud Platform Deployments

### Railway Deployment

#### **railway.json**

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### **Nixpacks Configuration**

```toml
# nixpacks.toml
[phases.setup]
nixPkgs = ["nodejs", "go"]

[phases.build]
cmds = [
    "cd frontend && npm ci && npm run build && cd ..",
    "cd backend && go mod tidy && go build -o chukfi-server cmd/server/main.go"
]

[start]
cmd = "./backend/chukfi-server"
```

#### **Environment Variables**

```env
# Railway Environment Variables
PORT=8080
DATABASE_URL=sqlite:///app/data/chukfi.db
DB_DRIVER=sqlite
ENVIRONMENT=production
JWT_SECRET=your-railway-jwt-secret
CORS_ALLOWED_ORIGINS=https://your-app.railway.app
```

### Render Deployment

#### **render.yaml**

```yaml
services:
  - type: web
    name: chukfi-cms
    env: go
    region: oregon
    plan: starter
    buildCommand: |
      cd frontend && npm ci && npm run build && cd .. &&
      cd backend && go mod tidy && go build -o chukfi-server cmd/server/main.go
    startCommand: ./backend/chukfi-server
    healthCheckPath: /health
    envVars:
      - key: DATABASE_URL
        value: sqlite:///app/data/chukfi.db
      - key: DB_DRIVER
        value: sqlite
      - key: ENVIRONMENT
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: PORT
        value: 8080
    disk:
      name: chukfi-data
      mountPath: /app/data
      sizeGB: 1
```

### Heroku Deployment

#### **Procfile**

```
web: ./backend/chukfi-server
release: ./backend/chukfi-server migrate
```

#### **heroku.yml** (Container Deployment)

```yaml
build:
  docker:
    web: Dockerfile
release:
  image: web
  command:
    - ./chukfi-server migrate
run:
  web: ./chukfi-server
```

#### **Deployment Commands**

```bash
# Login to Heroku
heroku login

# Create app
heroku create your-chukfi-cms-app

# Set environment variables
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
heroku config:set ENVIRONMENT=production
heroku config:set DATABASE_URL=sqlite:///app/data/chukfi.db

# Deploy
git push heroku main

# Run migrations
heroku run ./backend/chukfi-server migrate

# View logs
heroku logs --tail
```

### DigitalOcean App Platform

#### **.do/app.yaml**

```yaml
name: chukfi-cms
services:
  - name: web
    source_dir: /
    github:
      repo: your-username/chukfi-cms
      branch: main
    run_command: ./backend/chukfi-server
    environment_slug: go
    instance_count: 1
    instance_size_slug: basic-xxs
    build_command: |
      cd frontend && npm ci && npm run build && cd .. &&
      cd backend && go mod tidy && go build -o chukfi-server cmd/server/main.go
    health_check:
      http_path: /health
    http_port: 8080
    routes:
      - path: /
    envs:
      - key: DATABASE_URL
        value: sqlite:///app/data/chukfi.db
      - key: DB_DRIVER
        value: sqlite
      - key: ENVIRONMENT
        value: production
      - key: JWT_SECRET
        value: your-jwt-secret
      - key: PORT
        value: "8080"
```

## 🔧 Production Configuration

### Environment Variables Reference

```env
# Database Configuration
DATABASE_URL=sqlite:///path/to/database.db  # SQLite database file path
DB_DRIVER=sqlite                           # Database driver (currently only sqlite)

# Server Configuration
PORT=8080                                  # HTTP server port
HOST=127.0.0.1                           # Bind address (0.0.0.0 for Docker)
ENVIRONMENT=production                     # Environment mode (development|production)

# Security Configuration
JWT_SECRET=your-super-secure-secret        # JWT signing secret (change this!)
JWT_ACCESS_EXPIRY=15m                     # Access token expiry time
JWT_REFRESH_EXPIRY=7d                     # Refresh token expiry time

# CORS Configuration
CORS_ALLOWED_ORIGINS=https://yourdomain.com # Comma-separated allowed origins
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization
CORS_ALLOW_CREDENTIALS=true               # Allow credentials in CORS requests

# File Upload Configuration
UPLOAD_MAX_SIZE=50MB                      # Maximum file upload size
UPLOAD_ALLOWED_TYPES=image/*,application/pdf,text/plain # Allowed MIME types
UPLOAD_PATH=./data/media                  # Upload directory path

# Rate Limiting
RATE_LIMIT_ENABLED=true                   # Enable rate limiting
RATE_LIMIT_REQUESTS=100                   # Requests per window
RATE_LIMIT_WINDOW=1m                      # Rate limit window duration

# Logging Configuration
LOG_LEVEL=info                            # Log level (debug|info|warn|error)
LOG_FORMAT=json                           # Log format (json|text)
LOG_FILE=/var/log/chukfi-cms.log         # Log file path (optional)

# Security Headers
SECURITY_HEADERS_ENABLED=true             # Enable security headers
HSTS_MAX_AGE=31536000                     # HSTS max age in seconds
CSP_POLICY=default-src 'self'             # Content Security Policy

# Database Pool Configuration
DB_MAX_OPEN_CONNS=25                      # Maximum open database connections
DB_MAX_IDLE_CONNS=25                      # Maximum idle database connections
DB_CONN_MAX_LIFETIME=5m                   # Connection maximum lifetime

# Session Configuration
SESSION_TIMEOUT=24h                       # User session timeout
REMEMBER_ME_DURATION=30d                  # "Remember me" duration
```

### Security Hardening

#### **1. JWT Security**

```env
# Generate a strong JWT secret
JWT_SECRET=$(openssl rand -base64 64)

# Use short access token expiry
JWT_ACCESS_EXPIRY=15m

# Reasonable refresh token expiry
JWT_REFRESH_EXPIRY=7d
```

#### **2. File Upload Security**

```env
# Restrict file types
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain

# Limit file size
UPLOAD_MAX_SIZE=10MB

# Use secure upload path
UPLOAD_PATH=/var/lib/chukfi-cms/media
```

#### **3. Database Security**

```bash
# Set proper file permissions for SQLite database
chmod 640 /path/to/chukfi.db
chown chukfi:chukfi /path/to/chukfi.db

# Secure the data directory
chmod 750 /path/to/data/directory
chown chukfi:chukfi /path/to/data/directory
```

#### **4. System Security**

```bash
# Create dedicated user
sudo useradd -r -s /bin/false -d /opt/chukfi-cms chukfi

# Set proper file permissions
sudo chown -R chukfi:chukfi /opt/chukfi-cms
sudo chmod 755 /opt/chukfi-cms
sudo chmod 640 /opt/chukfi-cms/.env
sudo chmod +x /opt/chukfi-cms/chukfi-server-*

# Configure firewall
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw deny 8080/tcp    # Block direct backend access
sudo ufw enable
```

## 📊 Monitoring & Maintenance

### Health Checks

#### **HTTP Health Check**

```bash
# Basic health check
curl -f http://localhost:8080/health

# Detailed health check with timeout
curl -f --max-time 5 http://localhost:8080/health || echo "Health check failed"

# Health check script for monitoring
#!/bin/bash
# health-check.sh
HEALTH_URL="https://yourdomain.com/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 $HEALTH_URL)

if [ "$RESPONSE" = "200" ]; then
    echo "OK - Service is healthy"
    exit 0
else
    echo "CRITICAL - Service health check failed (HTTP $RESPONSE)"
    exit 2
fi
```

#### **Database Health Check**

```bash
# Check database file and permissions
#!/bin/bash
DB_PATH="/opt/chukfi-cms/data/chukfi.db"

if [ ! -f "$DB_PATH" ]; then
    echo "ERROR: Database file not found at $DB_PATH"
    exit 1
fi

if [ ! -r "$DB_PATH" ]; then
    echo "ERROR: Cannot read database file at $DB_PATH"
    exit 1
fi

# Check database integrity
sqlite3 "$DB_PATH" "PRAGMA integrity_check;" | grep -q "ok"
if [ $? -eq 0 ]; then
    echo "OK - Database integrity check passed"
else
    echo "ERROR - Database integrity check failed"
    exit 1
fi
```

### Backup Strategy

#### **Automated Backup Script**

```bash
#!/bin/bash
# backup.sh - Automated backup script

set -e

BACKUP_DIR="/var/backups/chukfi-cms"
APP_DIR="/opt/chukfi-cms"
DATE=$(date +%Y%m%d-%H%M%S)
RETENTION_DAYS=30

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# Stop service for consistent backup
systemctl stop chukfi-cms

# Create backup archive
tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" \
    -C "$APP_DIR" \
    data/ \
    .env \
    --exclude="data/logs/*" \
    --exclude="data/tmp/*"

# Restart service
systemctl start chukfi-cms

# Verify service is running
sleep 5
if ! systemctl is-active --quiet chukfi-cms; then
    echo "ERROR: Service failed to start after backup"
    exit 1
fi

# Clean up old backups
find "$BACKUP_DIR" -name "backup-*.tar.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed successfully: backup-$DATE.tar.gz"

# Optional: Upload to cloud storage
# aws s3 cp "$BACKUP_DIR/backup-$DATE.tar.gz" s3://your-backup-bucket/chukfi-cms/
```

#### **Cron Job for Automated Backups**

```bash
# Add to crontab: sudo crontab -e
# Daily backup at 2:00 AM
0 2 * * * /opt/chukfi-cms/scripts/backup.sh

# Weekly backup at 3:00 AM on Sunday
0 3 * * 0 /opt/chukfi-cms/scripts/backup.sh
```

### Log Management

#### **Logrotate Configuration**

```bash
# /etc/logrotate.d/chukfi-cms
/var/log/chukfi-cms/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0644 chukfi chukfi
    postrotate
        systemctl reload chukfi-cms
    endscript
}
```

#### **Log Monitoring with rsyslog**

```bash
# /etc/rsyslog.d/49-chukfi-cms.conf
if $programname == 'chukfi-cms' then /var/log/chukfi-cms/app.log
& stop
```

### Performance Monitoring

#### **System Resource Monitoring**

```bash
#!/bin/bash
# monitor.sh - Simple resource monitoring

APP_NAME="chukfi-cms"
PID=$(pgrep -f "$APP_NAME" | head -1)

if [ -z "$PID" ]; then
    echo "ERROR: $APP_NAME process not found"
    exit 1
fi

# CPU and Memory usage
CPU=$(ps -p "$PID" -o %cpu= | tr -d ' ')
MEM=$(ps -p "$PID" -o %mem= | tr -d ' ')
RSS=$(ps -p "$PID" -o rss= | tr -d ' ')

echo "CPU: ${CPU}% | Memory: ${MEM}% (${RSS}KB)"

# Database size
DB_SIZE=$(du -h /opt/chukfi-cms/data/chukfi.db 2>/dev/null | cut -f1)
echo "Database size: $DB_SIZE"

# Disk usage
DISK_USAGE=$(df -h /opt/chukfi-cms | awk 'NR==2 {print $5}')
echo "Disk usage: $DISK_USAGE"

# Network connections
CONNECTIONS=$(netstat -an | grep :8080 | wc -l)
echo "Active connections: $CONNECTIONS"
```

### Update Procedure

#### **Safe Update Process**

```bash
#!/bin/bash
# update.sh - Safe update procedure

set -e

NEW_VERSION="$1"
if [ -z "$NEW_VERSION" ]; then
    echo "Usage: $0 <version>"
    exit 1
fi

echo "🔄 Starting update to version $NEW_VERSION"

# 1. Pre-update checks
echo "🔍 Running pre-update checks..."
systemctl is-active --quiet chukfi-cms || { echo "Service is not running"; exit 1; }
curl -f http://localhost:8080/health > /dev/null || { echo "Health check failed"; exit 1; }

# 2. Create backup
echo "💾 Creating backup..."
./backup.sh

# 3. Download new version
echo "⬇️ Downloading version $NEW_VERSION..."
wget -O "/tmp/chukfi-cms-$NEW_VERSION.tar.gz" \
    "https://github.com/Native-Consulting-Services/chukfi-cms/releases/download/$NEW_VERSION/chukfi-cms-$NEW_VERSION.tar.gz"

# 4. Stop service
echo "⏹️ Stopping service..."
systemctl stop chukfi-cms

# 5. Deploy new version
echo "🚀 Deploying new version..."
cd /tmp
tar -xzf "chukfi-cms-$NEW_VERSION.tar.gz"

# Backup current .env
cp /opt/chukfi-cms/.env /tmp/.env.backup

# Replace files
rm -rf /opt/chukfi-cms/*
mv "chukfi-cms-$NEW_VERSION"/* /opt/chukfi-cms/

# Restore .env
mv /tmp/.env.backup /opt/chukfi-cms/.env

# Set permissions
chown -R chukfi:chukfi /opt/chukfi-cms
chmod +x /opt/chukfi-cms/start.sh
chmod +x /opt/chukfi-cms/chukfi-server-*

# 6. Run migrations
echo "🗃️ Running database migrations..."
cd /opt/chukfi-cms
sudo -u chukfi ./chukfi-server-linux-amd64 migrate

# 7. Start service
echo "▶️ Starting service..."
systemctl start chukfi-cms

# 8. Post-update checks
echo "🔍 Running post-update checks..."
sleep 10
systemctl is-active --quiet chukfi-cms || { echo "Service failed to start"; exit 1; }
curl -f http://localhost:8080/health > /dev/null || { echo "Health check failed"; exit 1; }

# 9. Cleanup
rm -f "/tmp/chukfi-cms-$NEW_VERSION.tar.gz"
rm -rf "/tmp/chukfi-cms-$NEW_VERSION"

echo "✅ Update to version $NEW_VERSION completed successfully!"
```

This deployment guide provides comprehensive coverage of production deployment scenarios, from simple VPS setups to cloud platforms and container orchestration. The emphasis is on security, reliability, and maintainability while preserving Chukfi CMS's core principle of minimal dependencies.
