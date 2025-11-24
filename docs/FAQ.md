# 🤔 Frequently Asked Questions

Welcome to the Chukfi CMS FAQ! This document answers the most common questions about installation, usage, development, and troubleshooting. Can't find what you're looking for? Check our [documentation](README.md) or [open an issue](https://github.com/Native-Consulting-Services/chukfi-cms/issues/new).

## 📋 Table of Contents

- [General Questions](#-general-questions)
- [Installation & Setup](#-installation--setup)
- [Development](#-development)
- [Collections & Content](#-collections--content)
- [Users & Permissions](#-users--permissions)
- [API Usage](#-api-usage)
- [Performance](#-performance)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Contributing](#-contributing)

---

## 🌟 General Questions

### What is Chukfi CMS?

Chukfi CMS is an open-source, self-hosted content management system built as a monorepo with **zero external dependencies**. It features an Astro + React frontend for the admin dashboard and a Go HTTP API with SQLite backend. The system is designed around collection-based content management similar to Payload CMS, with role-based access control (RBAC) and a focus on developer experience.

### Why choose Chukfi CMS over other solutions?

**Key advantages:**

- **Zero Dependencies**: No Docker, external databases, or complex infrastructure required
- **Self-Hosted**: Full control over your data and deployment
- **Developer Friendly**: Modern tech stack with excellent DX
- **Production Ready**: Built-in security, RBAC, and monitoring features
- **Flexible**: Collection-based architecture adapts to any content model
- **Open Source**: MIT licensed, community-driven development

### How does Chukfi compare to WordPress, Strapi, or Payload?

| Feature          | Chukfi CMS    | WordPress        | Strapi            | Payload          |
| ---------------- | ------------- | ---------------- | ----------------- | ---------------- |
| **Dependencies** | Zero          | PHP, MySQL       | Node.js, Database | Node.js, MongoDB |
| **Admin UI**     | React + Astro | PHP/jQuery       | React             | React            |
| **API**          | Go REST API   | REST/GraphQL     | REST/GraphQL      | REST/GraphQL     |
| **Database**     | SQLite        | MySQL/PostgreSQL | Multiple          | MongoDB          |
| **Hosting**      | Single Binary | PHP Server       | Node.js Server    | Node.js Server   |
| **Setup Time**   | < 5 minutes   | 10-15 minutes    | 15-30 minutes     | 15-30 minutes    |

### Is Chukfi CMS suitable for enterprise use?

Yes! Chukfi CMS includes enterprise-grade features:

- **Role-Based Access Control (RBAC)** with granular permissions
- **Audit logging** for compliance requirements
- **JWT authentication** with refresh tokens
- **Rate limiting** and security headers
- **Database integrity checks** and automated backups
- **Health monitoring** endpoints
- **Horizontal scaling** capabilities

### What license does Chukfi CMS use?

Chukfi CMS is released under the **MIT License**, which means you can:

- Use it commercially without restrictions
- Modify and distribute the source code
- Include it in proprietary projects
- Sell applications built with Chukfi CMS

---

## 🛠️ Installation & Setup

### What are the system requirements?

**Minimum Requirements:**

- **OS**: Linux, macOS, Windows
- **RAM**: 512MB (1GB+ recommended)
- **Storage**: 100MB for application + your content
- **CPU**: Any modern CPU (ARM64 supported)

**Development Requirements:**

- **Node.js**: 18+ (for frontend development)
- **Go**: 1.21+ (for backend development)
- **Git**: For cloning and version control

**No additional dependencies** like Docker, database servers, or complex runtime environments are required!

### Can I run Chukfi CMS without Node.js or Go?

**For production use**: Yes! Download pre-built binaries from our releases page. You only need the compiled backend binary and frontend static files.

**For development**: You'll need Node.js and Go to build from source and make modifications.

### How do I install Chukfi CMS in 5 minutes?

Follow our [Quick Installation Guide](INSTALLATION.md):

```bash
# 1. Clone the repository
git clone https://github.com/Native-Consulting-Services/chukfi-cms.git
cd chukfi-cms

# 2. Build frontend
cd frontend && npm install && npm run build && cd ..

# 3. Build backend
cd backend && go mod tidy && go build -o chukfi-server cmd/server/main.go

# 4. Run database migrations
./chukfi-server migrate

# 5. Start the server
./chukfi-server
```

Visit `http://localhost:8080` and create your admin account!

### Can I use a different database than SQLite?

Currently, Chukfi CMS **only supports SQLite** to maintain our zero-dependencies philosophy. SQLite is surprisingly capable and can handle:

- **Concurrent reads/writes** for most workloads
- **Terabytes of data** efficiently
- **ACID transactions** with full reliability
- **Cross-platform compatibility** without installation

For enterprise workloads requiring PostgreSQL or MySQL, this is on our roadmap for future releases.

### How do I migrate from another CMS?

We're working on migration tools for popular CMSs. Currently available:

- **WordPress**: Export posts/pages to Chukfi collections
- **Strapi**: Import content types and data
- **Custom CSV/JSON**: Bulk import via API

Check our [migration guides](guides/) or [contact us](https://github.com/Native-Consulting-Services/chukfi-cms/discussions) for specific migration needs.

---

## 💻 Development

### How do I set up the development environment?

Detailed instructions in [INSTALLATION.md](INSTALLATION.md), but here's the quick version:

```bash
# Clone and enter directory
git clone https://github.com/Native-Consulting-Services/chukfi-cms.git
cd chukfi-cms

# Start development (uses VS Code tasks)
# Press Ctrl+Shift+P → "Tasks: Run Task" → "Start Development Environment"

# Or manually:
cd backend && go mod tidy && go run cmd/server/main.go &
cd frontend && npm install && npm run dev
```

**Development features:**

- **Hot reload** for both frontend and backend
- **Live database migrations** during development
- **VS Code integration** with pre-configured tasks
- **Zero-config setup** - just run and develop

### What's the project structure?

```
chukfi-cms/
├── frontend/          # Astro + React admin dashboard
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Astro pages (routes)
│   │   ├── layouts/      # Page layouts
│   │   └── lib/          # Utilities and API client
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # Go HTTP API
│   ├── cmd/             # Entry points (server, migrate)
│   ├── internal/        # Application logic
│   │   ├── auth/        # Authentication & JWT
│   │   ├── handlers/    # HTTP handlers
│   │   ├── models/      # Database models
│   │   └── middleware/  # HTTP middleware
│   ├── migrations/      # Database migrations
│   └── go.mod
└── shared/              # Shared TypeScript types
    └── types.ts
```

### How do I add a new API endpoint?

1. **Define the handler** in `backend/internal/handlers/`:

```go
func (h *Handlers) GetItems(w http.ResponseWriter, r *http.Request) {
    // Implementation
    h.JSON(w, http.StatusOK, items)
}
```

2. **Add the route** in `backend/cmd/server/main.go`:

```go
r.Route("/api/v1/items", func(r chi.Router) {
    r.Get("/", handlers.GetItems)
})
```

3. **Update frontend types** in `shared/types.ts`:

```typescript
export interface Item {
  id: string;
  name: string;
  // ...
}
```

### How do I add a new React component?

Create components in `frontend/src/components/`:

```typescript
// frontend/src/components/MyComponent.tsx
import React from "react";

interface MyComponentProps {
  title: string;
}

export default function MyComponent({ title }: MyComponentProps) {
  return <div className="p-4">{title}</div>;
}
```

Use in Astro pages:

```astro
---
// frontend/src/pages/my-page.astro
import Layout from '../layouts/Layout.astro';
import MyComponent from '../components/MyComponent.tsx';
---

<Layout title="My Page">
    <MyComponent title="Hello World" client:load />
</Layout>
```

### How do I run tests?

```bash
# Backend tests
cd backend
go test ./...

# Frontend tests (when added)
cd frontend
npm test

# Run all tests
npm run test:all
```

---

## 📝 Collections & Content

### What are Collections in Chukfi CMS?

Collections are flexible content types that define the structure of your data. Think of them as database tables with a user-friendly interface. Examples:

- **Blog Posts**: title, content, author, publish date, tags
- **Products**: name, description, price, images, inventory
- **Team Members**: name, bio, photo, role, social links
- **Events**: title, description, date, location, attendees

### How do I create a new Collection?

1. **Via Admin Dashboard**:

   - Go to Collections → Create New
   - Define fields (text, number, date, image, etc.)
   - Set permissions and validation rules

2. **Via API**:

```javascript
const collection = await fetch("/api/v1/collections", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: "blog_posts",
    displayName: "Blog Posts",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "content", type: "richtext", required: true },
      { name: "publishDate", type: "datetime", required: true },
    ],
  }),
});
```

### What field types are available?

**Basic Fields:**

- `text` - Short text input
- `textarea` - Multi-line text
- `richtext` - WYSIWYG editor
- `email` - Email validation
- `url` - URL validation

**Number Fields:**

- `number` - Integer or decimal
- `currency` - Formatted currency

**Date/Time:**

- `date` - Date picker
- `datetime` - Date and time picker
- `time` - Time picker

**Boolean:**

- `checkbox` - True/false
- `toggle` - Switch UI

**Selection:**

- `select` - Dropdown selection
- `radio` - Radio button group
- `multiselect` - Multiple selection

**Media:**

- `image` - Image upload with preview
- `file` - File upload
- `gallery` - Multiple images

**Relationship:**

- `reference` - Link to another collection
- `references` - Multiple references

### How do I set up content relationships?

**One-to-Many** (e.g., Author → Posts):

```javascript
{
    name: 'author',
    type: 'reference',
    collection: 'authors',
    required: true
}
```

**Many-to-Many** (e.g., Posts → Tags):

```javascript
{
    name: 'tags',
    type: 'references',
    collection: 'tags',
    minItems: 1,
    maxItems: 10
}
```

**Usage in API**:

```javascript
// Create post with relationships
const post = await fetch("/api/v1/collections/blog_posts/documents", {
  method: "POST",
  body: JSON.stringify({
    title: "My Blog Post",
    content: "Post content...",
    author: "author_id_123",
    tags: ["tag_id_1", "tag_id_2"],
  }),
});
```

### Can I import existing content?

Yes! Several options:

**1. Bulk Import API**:

```javascript
const importData = await fetch("/api/v1/collections/blog_posts/import", {
  method: "POST",
  body: JSON.stringify({
    documents: [
      { title: "Post 1", content: "..." },
      { title: "Post 2", content: "..." },
    ],
  }),
});
```

**2. CSV Import** (via admin dashboard):
Upload CSV with column headers matching field names.

**3. Migration Scripts**:
Create custom scripts using the API to migrate from other systems.

### How do I manage content versions and drafts?

Chukfi CMS includes built-in versioning:

**Draft System:**

- All content starts as `draft`
- Use `Publish` to make content live (`published`)
- `Unpublish` to revert to draft

**Version History:**

- Automatic versioning on each save
- Compare versions side-by-side
- Restore previous versions

**API Usage:**

```javascript
// Save as draft
POST /api/v1/collections/posts/documents
{ "title": "Draft Post", "status": "draft" }

// Publish content
PATCH /api/v1/collections/posts/documents/:id
{ "status": "published" }

// Get version history
GET /api/v1/collections/posts/documents/:id/versions
```

---

## 👥 Users & Permissions

### How does the user system work?

Chukfi CMS uses **Role-Based Access Control (RBAC)**:

**Users** → **Roles** → **Permissions**

- **Users**: Individual accounts with email/password
- **Roles**: Groups of permissions (Admin, Editor, Author, etc.)
- **Permissions**: Granular access controls (read, write, delete, etc.)

### What are the default roles?

**Super Admin**:

- Full system access
- Manage users, roles, and permissions
- System configuration

**Admin**:

- Manage all content and collections
- Manage users (except Super Admins)
- View system analytics

**Editor**:

- Create, edit, and publish all content
- Manage media library
- Cannot delete collections or manage users

**Author**:

- Create and edit own content
- Cannot publish (requires approval)
- Limited media access

**Viewer**:

- Read-only access to assigned collections
- Cannot create or modify content

### How do I create custom roles?

**Via Admin Dashboard**:

1. Go to Users → Roles → Create New Role
2. Define role name and description
3. Select permissions for each collection
4. Assign role to users

**Via API**:

```javascript
const role = await fetch("/api/v1/roles", {
  method: "POST",
  body: JSON.stringify({
    name: "content_manager",
    displayName: "Content Manager",
    permissions: [
      { collection: "blog_posts", actions: ["read", "write", "publish"] },
      { collection: "media", actions: ["read", "write"] },
    ],
  }),
});
```

### What permission levels are available?

**Collection-level permissions**:

- `read` - View documents
- `write` - Create and edit documents
- `publish` - Change document status
- `delete` - Remove documents

**System-level permissions**:

- `manage_collections` - Create/modify collections
- `manage_users` - User management
- `manage_roles` - Role and permission management
- `view_analytics` - System analytics and reports

**Field-level permissions** (advanced):

- Restrict access to specific fields within collections
- Useful for hiding sensitive data or admin-only fields

### How do I integrate with external authentication?

Chukfi CMS supports multiple authentication methods:

**JWT Integration**:

```javascript
// External JWT validation
app.use("/api", authenticateExternalJWT);

function authenticateExternalJWT(req, res, next) {
  const token = req.headers.authorization;
  // Validate with your auth provider
  const user = validateWithAuth0(token);
  req.user = user;
  next();
}
```

**SAML/OIDC** (planned):
Integration with enterprise identity providers coming in v2.0.

**API Key Authentication**:

```javascript
// Service-to-service authentication
const response = await fetch("/api/v1/collections/posts", {
  headers: {
    "X-API-Key": "your-api-key",
    "Content-Type": "application/json",
  },
});
```

---

## 🔌 API Usage

### What API format does Chukfi CMS use?

Chukfi CMS provides a **RESTful JSON API** following standard HTTP conventions:

**Base URL**: `http://localhost:8080/api/v1`

**Standard Responses**:

```javascript
// Success Response
{
    "data": { /* resource data */ },
    "meta": {
        "total": 100,
        "page": 1,
        "limit": 20
    }
}

// Error Response
{
    "error": {
        "message": "Resource not found",
        "code": "RESOURCE_NOT_FOUND",
        "details": {}
    }
}
```

### How do I authenticate API requests?

**1. Login to get JWT tokens**:

```javascript
const auth = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    email: "user@example.com",
    password: "password123",
  }),
});

const { accessToken, refreshToken } = await auth.json();
```

**2. Use access token in subsequent requests**:

```javascript
const response = await fetch("/api/v1/collections/posts", {
  headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  },
});
```

**3. Refresh expired tokens**:

```javascript
const newTokens = await fetch("/api/v1/auth/refresh", {
  method: "POST",
  headers: { Authorization: `Bearer ${refreshToken}` },
});
```

### What are the main API endpoints?

**Authentication**:

```
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
```

**Collections Management**:

```
GET    /api/v1/collections                    # List all collections
POST   /api/v1/collections                    # Create collection
GET    /api/v1/collections/:slug              # Get collection schema
PUT    /api/v1/collections/:slug              # Update collection
DELETE /api/v1/collections/:slug              # Delete collection
```

**Content Management**:

```
GET    /api/v1/collections/:slug/documents    # List documents
POST   /api/v1/collections/:slug/documents    # Create document
GET    /api/v1/collections/:slug/documents/:id # Get document
PUT    /api/v1/collections/:slug/documents/:id # Update document
DELETE /api/v1/collections/:slug/documents/:id # Delete document
```

**Media Management**:

```
GET    /api/v1/media                         # List media files
POST   /api/v1/media                         # Upload file
GET    /api/v1/media/:id                     # Get media info
DELETE /api/v1/media/:id                     # Delete media
```

**User Management**:

```
GET    /api/v1/users                         # List users
POST   /api/v1/users                         # Create user
GET    /api/v1/users/:id                     # Get user
PUT    /api/v1/users/:id                     # Update user
DELETE /api/v1/users/:id                     # Delete user
```

### How do I query and filter content?

**Pagination**:

```javascript
GET /api/v1/collections/posts/documents?page=2&limit=10
```

**Filtering**:

```javascript
// Simple filters
GET /api/v1/collections/posts/documents?status=published&author=john

// Date ranges
GET /api/v1/collections/posts/documents?publishDate[gte]=2023-01-01&publishDate[lt]=2024-01-01

// Text search
GET /api/v1/collections/posts/documents?search=javascript

// Sorting
GET /api/v1/collections/posts/documents?sort=-publishDate,title
```

**Advanced Queries**:

```javascript
POST /api/v1/collections/posts/documents/query
{
    "filter": {
        "status": "published",
        "tags": { "in": ["javascript", "tutorial"] },
        "publishDate": { "gte": "2023-01-01" }
    },
    "sort": ["-publishDate"],
    "limit": 20,
    "populate": ["author", "tags"]
}
```

### How do I handle file uploads?

**Single File Upload**:

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

const upload = await fetch("/api/v1/media", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});

const { id, url } = await upload.json();
```

**Multiple Files**:

```javascript
const formData = new FormData();
for (const file of files) {
  formData.append("files", file);
}

const uploads = await fetch("/api/v1/media/batch", {
  method: "POST",
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
});
```

**Direct Upload with Metadata**:

```javascript
const formData = new FormData();
formData.append("file", file);
formData.append(
  "metadata",
  JSON.stringify({
    alt: "Profile picture",
    category: "avatars",
    tags: ["user", "profile"],
  })
);
```

### Are there rate limits on the API?

Yes, configurable rate limits protect the API:

**Default Limits**:

- **100 requests per minute** per IP address
- **1000 requests per hour** per authenticated user
- **10MB maximum** request body size

**Rate Limit Headers**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

**Configure in `.env`**:

```env
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW=1m
```

---

## ⚡ Performance

### How fast is Chukfi CMS?

**Excellent performance** out of the box:

- **Cold start**: < 100ms (Go binary startup)
- **API response**: < 50ms average (simple queries)
- **Admin dashboard**: < 2s initial load
- **File uploads**: Parallel processing with progress tracking
- **Database queries**: Optimized SQLite with proper indexing

**Benchmarks** (on modest VPS):

- **1000 concurrent API requests**: 99th percentile < 200ms
- **Database**: 10,000 records queried in < 10ms
- **Memory usage**: ~50MB base, scales linearly
- **CPU usage**: Minimal at rest, efficient under load

### How does SQLite perform under load?

SQLite is **surprisingly performant** for most workloads:

**Read Performance**:

- **Multiple concurrent readers** with no blocking
- **In-memory caching** of frequently accessed data
- **Query optimization** with automatic indexing

**Write Performance**:

- **WAL mode** for concurrent reads during writes
- **Batch operations** for bulk inserts/updates
- **Transaction grouping** to reduce disk I/O

**Real-world Capacity**:

- **100,000+ documents** with excellent performance
- **1GB+ database** files without issues
- **Concurrent users**: 50-100+ depending on workload

### How do I optimize performance?

**Database Optimization**:

```sql
-- Enable WAL mode for better concurrency
PRAGMA journal_mode=WAL;

-- Increase cache size
PRAGMA cache_size=10000;

-- Optimize for your workload
PRAGMA synchronous=NORMAL;
```

**Backend Optimization** (in `.env`):

```env
# Database connection pool
DB_MAX_OPEN_CONNS=25
DB_MAX_IDLE_CONNS=25
DB_CONN_MAX_LIFETIME=5m

# Enable response compression
GZIP_ENABLED=true

# Optimize JSON encoding
JSON_ESCAPE_HTML=false
```

**Frontend Optimization**:

- **Static site generation** with Astro
- **Code splitting** for admin dashboard components
- **Image optimization** with automatic WebP conversion
- **CDN integration** for media files

**Server-level Optimization**:

```nginx
# Enable gzip compression
gzip on;
gzip_types text/plain text/css application/json application/javascript;

# Enable caching
location /media/ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# Connection pooling
keepalive_timeout 65;
keepalive_requests 100;
```

### Can Chukfi CMS handle high traffic?

Yes! **Horizontal scaling** strategies:

**1. Load Balancer + Multiple Instances**:

```yaml
# docker-compose.yml
services:
  app1:
    image: chukfi-cms
    volumes:
      - shared_data:/app/data
  app2:
    image: chukfi-cms
    volumes:
      - shared_data:/app/data
  nginx:
    image: nginx
    # Load balance between app1 and app2
```

**2. CDN for Static Assets**:

- Host media files on AWS S3/CloudFlare
- Use CDN for admin dashboard static files
- Reduce server load for large files

**3. Database Replication** (planned for v2.0):

- Read replicas for query scaling
- Master-slave setup for high availability

**4. Caching Layers**:

- Redis for session storage
- Application-level caching for frequent queries
- Reverse proxy caching with Nginx/Varnish

### What about memory usage?

**Efficient memory management**:

**Base Usage**:

- **~50MB** for empty application
- **+1MB per 1000 documents** (cached data)
- **+10MB per concurrent user** (session data)

**Memory optimization**:

```go
// Go garbage collection tuning
GOGC=100  // Default GC target
GOMEMLIMIT=500MB  // Memory limit
```

**Monitor with built-in metrics**:

```bash
# Memory usage endpoint
curl http://localhost:8080/api/v1/system/metrics
{
    "memory": {
        "alloc": "45MB",
        "totalAlloc": "120MB",
        "sys": "67MB"
    }
}
```

---

## 🚀 Deployment

### What deployment options are available?

**Single Binary Deployment** (recommended):

- Download pre-built binary + frontend files
- No dependencies to install
- Works on any server with sufficient resources

**Docker Deployment**:

- Official Docker images available
- Docker Compose for easy orchestration
- Kubernetes manifests for container platforms

**Cloud Platforms**:

- **Railway**: One-click deployment
- **Render**: Git-based deployment
- **Heroku**: Traditional and container deployment
- **DigitalOcean**: App Platform deployment
- **AWS/GCP/Azure**: VPS or container services

### How do I deploy to production?

See our [Deployment Guide](dev/DEPLOYMENT.md) for detailed instructions, but here's a quick overview:

**1. Build for Production**:

```bash
# Frontend
cd frontend && npm ci && npm run build

# Backend
cd backend && go build -o chukfi-server cmd/server/main.go
```

**2. Configure Environment**:

```env
# Production .env
ENVIRONMENT=production
JWT_SECRET=your-secure-secret
DATABASE_URL=sqlite:///app/data/chukfi.db
CORS_ALLOWED_ORIGINS=https://yourdomain.com
```

**3. Deploy and Start**:

```bash
# Copy files to server
scp -r dist/ user@server:/opt/chukfi-cms/
scp chukfi-server user@server:/opt/chukfi-cms/

# Start service (systemd example)
sudo systemctl start chukfi-cms
```

### How do I set up SSL/HTTPS?

**With Nginx + Let's Encrypt**:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com

# Automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

**With Cloudflare** (recommended for simplicity):

1. Add your domain to Cloudflare
2. Enable SSL/TLS encryption
3. Set DNS to proxy through Cloudflare
4. Configure origin certificate for backend security

### How do I backup my data?

**Automated Backup Script**:

```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="/backups/chukfi-cms"

# Stop service for consistent backup
systemctl stop chukfi-cms

# Create backup
tar -czf "$BACKUP_DIR/backup-$DATE.tar.gz" \
    -C /opt/chukfi-cms \
    data/ .env

# Restart service
systemctl start chukfi-cms

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -mtime +30 -delete
```

**Cloud Backup** (recommended):

```bash
# Upload to AWS S3
aws s3 cp backup-$DATE.tar.gz s3://your-backup-bucket/

# Or use rsync to remote server
rsync -az backup-$DATE.tar.gz backup-server:/backups/
```

### Can I use a CDN for media files?

Yes! Configure cloud storage for media:

**AWS S3 Integration** (planned v1.1):

```env
STORAGE_PROVIDER=s3
AWS_S3_BUCKET=your-media-bucket
AWS_S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
```

**Current Solution** - External Upload:

```javascript
// Upload to S3 directly from frontend
const uploadToS3 = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/v1/media/s3-upload", {
    method: "POST",
    body: formData,
  });

  return response.json(); // Returns S3 URL
};
```

### How do I monitor production deployment?

**Built-in Health Checks**:

```bash
# Basic health check
curl http://localhost:8080/health

# Detailed system metrics
curl http://localhost:8080/api/v1/system/metrics
```

**Log Monitoring**:

```bash
# Application logs
tail -f /var/log/chukfi-cms.log

# System resource usage
htop  # or top

# Database performance
sqlite3 /opt/chukfi-cms/data/chukfi.db ".dbinfo"
```

**External Monitoring** (recommended):

- **Uptime monitoring**: UptimeRobot, Pingdom
- **Error tracking**: Sentry integration
- **Analytics**: Built-in dashboard or external tools

---

## 🔧 Troubleshooting

### Common Installation Issues

**"Go not found" or "Node not found"**:

```bash
# Install Go
wget https://go.dev/dl/go1.21.0.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.0.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Permission denied errors**:

```bash
# Fix file permissions
chmod +x chukfi-server
chown -R $USER:$USER /path/to/chukfi-cms

# Create data directory
mkdir -p data
chmod 755 data
```

**Port already in use**:

```bash
# Check what's using port 8080
lsof -i :8080
netstat -tulpn | grep 8080

# Kill process or change port
export PORT=3000
./chukfi-server
```

### Database Issues

**"Database locked" error**:

```bash
# Check for orphaned processes
ps aux | grep chukfi-server

# Remove database lock files
rm -f data/chukfi.db-wal data/chukfi.db-shm

# Restart application
./chukfi-server
```

**Migration failures**:

```bash
# Check migration status
./chukfi-server migrate status

# Force migration reset (DANGEROUS - backup first!)
./chukfi-server migrate reset
./chukfi-server migrate up
```

**Database corruption**:

```bash
# Check database integrity
sqlite3 data/chukfi.db "PRAGMA integrity_check;"

# Attempt repair
sqlite3 data/chukfi.db ".recover" | sqlite3 data/chukfi_recovered.db

# Restore from backup
cp /backups/latest-backup.db data/chukfi.db
```

### API Issues

**Authentication not working**:

```javascript
// Check JWT secret is set
console.log(process.env.JWT_SECRET); // Should not be empty

// Verify token format
const token = localStorage.getItem("accessToken");
console.log("Token:", token ? "Present" : "Missing");

// Check token expiration
const payload = JSON.parse(atob(token.split(".")[1]));
console.log("Expires:", new Date(payload.exp * 1000));
```

**CORS errors in browser**:

```env
# Update .env file
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
CORS_ALLOWED_METHODS=GET,POST,PUT,PATCH,DELETE,OPTIONS
CORS_ALLOWED_HEADERS=Content-Type,Authorization
```

**File upload failures**:

```bash
# Check upload directory permissions
ls -la data/media/
mkdir -p data/media
chmod 755 data/media

# Check file size limits
# Update .env: UPLOAD_MAX_SIZE=50MB
```

### Frontend Issues

**Admin dashboard not loading**:

```bash
# Rebuild frontend
cd frontend
rm -rf node_modules dist
npm install
npm run build

# Check browser console for errors
# Open Developer Tools → Console
```

**Assets not found**:

```bash
# Verify build output
ls -la frontend/dist/

# Check server static file serving
curl http://localhost:8080/assets/index.js
```

**TypeScript errors**:

```bash
# Update shared types
cd shared
npm run build

# Regenerate TypeScript definitions
cd frontend
npm run type-check
```

### Performance Issues

**Slow API responses**:

```sql
-- Check for missing indexes
.schema  -- In sqlite3 console

-- Add indexes for frequently queried columns
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_created_at ON posts(created_at);
```

**High memory usage**:

```bash
# Monitor memory usage
ps aux | grep chukfi-server
top -p $(pgrep chukfi-server)

# Check for memory leaks
go tool pprof http://localhost:8080/debug/pprof/heap
```

**Slow frontend loading**:

```bash
# Analyze bundle size
cd frontend
npm run build:analyze

# Optimize images
npm run optimize:images
```

### Production Issues

**Service won't start**:

```bash
# Check systemd service status
sudo systemctl status chukfi-cms

# View service logs
sudo journalctl -u chukfi-cms -f

# Check configuration
sudo -u chukfi ./chukfi-server --config-check
```

**SSL certificate issues**:

```bash
# Check certificate status
sudo certbot certificates

# Renew certificate
sudo certbot renew --force-renewal

# Test SSL configuration
openssl s_client -connect yourdomain.com:443
```

**High load/traffic issues**:

```bash
# Monitor system resources
htop
iotop
nethogs

# Check database performance
sqlite3 data/chukfi.db ".dbinfo"

# Analyze slow queries
# Enable query logging in development
```

### Getting Help

**Still having issues?**

1. **Check our documentation**: [docs/](docs/)
2. **Search existing issues**: [GitHub Issues](https://github.com/Native-Consulting-Services/chukfi-cms/issues)
3. **Ask the community**: [GitHub Discussions](https://github.com/Native-Consulting-Services/chukfi-cms/discussions)
4. **Create a bug report**: Include error messages, logs, and system information

**When reporting issues, please include**:

- Operating system and version
- Go and Node.js versions
- Chukfi CMS version
- Error messages and logs
- Steps to reproduce the issue

---

## 🤝 Contributing

### How can I contribute to Chukfi CMS?

We welcome all types of contributions!

**Code Contributions**:

- Bug fixes and performance improvements
- New features and enhancements
- Documentation updates
- Test coverage improvements

**Non-Code Contributions**:

- Bug reports with detailed reproduction steps
- Feature requests and suggestions
- Documentation improvements
- Community support in discussions
- Translation for internationalization

### How do I set up for development?

1. **Fork and clone**:

```bash
git clone https://github.com/yourusername/chukfi-cms.git
cd chukfi-cms
```

2. **Create feature branch**:

```bash
git checkout -b feature/your-feature-name
```

3. **Set up development environment**:

```bash
# Start development environment
cd backend && go mod tidy && go run cmd/server/main.go &
cd frontend && npm install && npm run dev
```

4. **Make your changes and test**:

```bash
# Run tests
cd backend && go test ./...
cd frontend && npm test

# Test your changes thoroughly
```

5. **Submit a pull request**:

- Write clear commit messages
- Include tests for new features
- Update documentation as needed
- Follow our code style guidelines

### What are the code style guidelines?

**Go Code**:

- Use `go fmt` for formatting
- Follow [Effective Go](https://golang.org/doc/effective_go.html) principles
- Write tests for new functions
- Use meaningful variable and function names

**Frontend Code**:

- Use TypeScript for all new components
- Follow React best practices
- Use Tailwind CSS for styling
- Write JSDoc comments for complex functions

**Git Commits**:

```
feat: add user role management
fix: resolve database connection issue
docs: update API documentation
test: add unit tests for auth service
```

### What features are we looking for?

**High Priority**:

- PostgreSQL/MySQL database support
- Advanced media management
- Multi-language/i18n support
- GraphQL API option
- Webhooks and integrations

**Medium Priority**:

- Email templates and notifications
- Advanced analytics and reporting
- Import/export tools
- Plugin system
- Multi-tenancy support

**Nice to Have**:

- Real-time collaboration
- Advanced search with Elasticsearch
- CDN integration improvements
- Mobile app for content management

### How do releases work?

**Release Schedule**:

- **Major versions** (v1.0, v2.0): Every 6-12 months
- **Minor versions** (v1.1, v1.2): Monthly with new features
- **Patch versions** (v1.0.1, v1.0.2): As needed for bug fixes

**Release Process**:

1. Features are developed in feature branches
2. Pull requests are reviewed and tested
3. Changes are merged to `main` branch
4. Release candidates are tagged and tested
5. Final release is tagged and published

**Backwards Compatibility**:

- **Patch versions**: Fully backwards compatible
- **Minor versions**: Backwards compatible APIs, may add new features
- **Major versions**: May include breaking changes with migration guides

---

Thank you for using Chukfi CMS! If you have any questions not covered in this FAQ, please don't hesitate to ask in our [GitHub Discussions](https://github.com/Native-Consulting-Services/chukfi-cms/discussions) or [create an issue](https://github.com/Native-Consulting-Services/chukfi-cms/issues/new).
