<div align="center">
  <img src="./assets/branding/logo.jpg" alt="Chukfi CMS Logo" width="200" height="200" />
  
  # Chukfi CMS
  
  **Chukfi** is the Choctaw word for **rabbit**, a symbol of speed, agility, and quick thinking.<br>
  Chukfi CMS embraces those qualities by providing a fast, modern, open-source CMS built with<br>
  **Astro**, **React**, and **Go**.
</div>

- ⚡ Fast Go backend
- 🐇 Agile Astro + React admin dashboard
- 🛡 Role-based access control
- 📚 Collection-based schema system (Payload-style)
- 📦 Media uploads and libraries
- 🌱 Open-source and community-driven

Chukfi CMS is built to run — fast, simple, and clever.

<div align="center">

[![Release](https://img.shields.io/github/v/release/Native-Consulting-Services/chukfi-cms?include_prereleases&style=flat-square)](https://github.com/Native-Consulting-Services/chukfi-cms/releases)
[![CI](https://img.shields.io/github/actions/workflow/status/Native-Consulting-Services/chukfi-cms/ci.yml?branch=main&style=flat-square)](https://github.com/Native-Consulting-Services/chukfi-cms/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Use this template](https://img.shields.io/badge/Use%20this-Template-blue?style=flat-square)](https://github.com/Native-Consulting-Services/chukfi-cms/generate)
[![Contributors](https://img.shields.io/github/contributors/Native-Consulting-Services/chukfi-cms?style=flat-square)](https://github.com/Native-Consulting-Services/chukfi-cms/graphs/contributors)

</div>

> **🚀 Template Repository**: Use this template to create your own CMS! Click "Use this template" above to get started.

> **✅ Ready for Development**: Chukfi CMS is fully functional with zero external dependencies. Complete project structure, authentication, database schema, and admin UI are ready. **5-minute setup** from clone to running!

An open-source, self-hosted content management system built as a monorepo with Astro frontend and Go backend.

## 📸 Screenshots

<div align="center">
  
  *Screenshots coming soon - Admin dashboard, collection management, and media library interfaces*
  
  <!-- Uncomment when screenshots are ready:
  <img src="./assets/screenshots/admin-dashboard.png" alt="Admin Dashboard" width="800" />
  <br><br>
  <img src="./assets/screenshots/collection-editor.png" alt="Collection Editor" width="800" />
  -->
  
</div>

## ✨ Key Advantages

✅ **Zero External Dependencies** - No Docker, PostgreSQL, or C compilers needed  
✅ **5-Minute Setup** - From git clone to running CMS in minutes  
✅ **Pure Go/JavaScript** - No complex build chains or CGO compilation  
✅ **Cross-Platform** - Works identically on Windows, macOS, and Linux  
✅ **Hot Reload** - Frontend auto-refreshes on file changes  
✅ **Self-Contained** - Everything runs locally with SQLite database

## Architecture

- **Frontend**: Astro + React + Tailwind CSS for admin dashboard
- **Backend**: Go HTTP API with Pure SQLite (modernc.org/sqlite)
- **Database**: Zero-configuration SQLite with automatic schema
- **Shared**: Common types and schemas

## Features

- 🏗️ Collection-based content management
- 👥 Role-based access control (RBAC)
- 📝 Draft/published states with versioning
- 🖼️ Media library with file uploads
- 🔒 JWT authentication with refresh tokens
- ⚡ Lifecycle hooks for CRUD operations
- 🎨 Modern admin dashboard UI

## 🚀 Fresh Installation Guide

### Prerequisites (One-time setup)

- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org)
- **Go 1.21+** - Download from [golang.org/dl](https://golang.org/dl)
- **Git** - For cloning the repository

### Installation Steps (5 minutes)

#### 1. **Clone Repository**

```bash
# Option A: Use GitHub template (recommended)
# Click "Use this template" button above, then clone your new repo

# Option B: Clone directly (for contributing)
git clone https://github.com/Native-Consulting-Services/chukfi-cms.git
cd chukfi-cms
```

#### 2. **Install Dependencies**

```bash
# Frontend dependencies
cd frontend
npm install
cd ..

# Backend dependencies
cd backend
go mod tidy
cd ..
```

#### 3. **Configure Environment**

```bash
# Copy environment template
cp .env.example backend/.env

# Edit if needed (optional - defaults work fine)
# nano backend/.env
```

#### 4. **Initialize Database**

```bash
cd backend
mkdir -p data
go run cmd/migrate/main.go up
cd ..
```

#### 5. **Start Development Environment**

**Option A: VS Code Tasks (Recommended)**

1. Open project in VS Code
2. `Ctrl+Shift+P` → "Tasks: Run Task"
3. Select "Start Development Environment"

**Option B: Manual (Two Terminals)**

```bash
# Terminal 1: Frontend
cd frontend
npm run dev

# Terminal 2: Backend
cd backend
go run cmd/server/main.go
```

### Verify Installation

- **Frontend**: http://localhost:4321 ✅
- **Admin Dashboard**: http://localhost:4321/admin ✅
- **Backend Health**: http://localhost:8080/health ✅
- **Default Login**: admin@chukfi.com / admin123

## Quick Start

### Prerequisites

- Go 1.21+
- Node.js 18+

### Development Setup

1. **Clone and setup**:

   ```bash
   git clone https://github.com/your-org/chukfi-cms
   cd chukfi-cms
   ```

2. **Install dependencies**:

   ```bash
   # Frontend
   cd frontend && npm install && cd ..

   # Backend
   cd backend && go mod tidy && cd ..
   ```

3. **Start the development environment**:

   ```bash
   # Terminal 1: Start frontend
   cd frontend && npm run dev

   # Terminal 2: Start backend
   cd backend
   go run cmd/migrate/main.go up
   go run cmd/server/main.go
   ```

   Or use the provided VS Code tasks to start both services automatically.

#### Access the Application

- **Admin Dashboard**: http://localhost:4321/admin
- **Frontend**: http://localhost:4321
- **Backend API**: http://localhost:8080
- **Health Check**: http://localhost:8080/health

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Database (Pure Go SQLite - zero configuration required)
DATABASE_URL=sqlite://./data/chukfi.db
DB_DRIVER=sqlite

# Server Configuration
PORT=8080
HOST=localhost
ENVIRONMENT=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
```

### Database Configuration

**Pure Go SQLite** (Default - No additional setup required):

- Uses `modernc.org/sqlite` - pure Go implementation
- **Automatically creates** `./backend/data/chukfi.db`
- **Zero configuration** - No database server setup needed
- **No C compiler or CGO** required!
- **Schema auto-applied** - Complete CMS tables created
- **Default admin user** - admin@chukfi.com / admin123
- Perfect for development and small-to-medium production use

## 🎯 What Happens Behind the Scenes

### **Database Setup**

- **Pure SQLite** - No external database server needed
- **Automatic Creation** - `./backend/data/chukfi.db` file created
- **Schema Migration** - Complete CMS schema applied
- **Default Admin** - User created automatically

### **Development Servers**

- **Frontend**: Astro dev server with hot reload
- **Backend**: Go HTTP server with pure SQLite
- **No CGO/Docker** - Zero complex dependencies

### **File Structure Created**

```
chukfi-cms/
├── frontend/node_modules/     # Frontend packages
├── backend/data/              # SQLite database
│   └── chukfi.db             # Auto-created database
├── backend/bin/              # Compiled binaries (optional)
└── .env files                # Environment config
```

## Project Structure

```
chukfi-cms/
├── assets/                # Brand & marketing assets
│   ├── branding/          # Logos, brand guide, favicon
│   ├── screenshots/       # Product screenshots
│   └── social/            # Social media assets
├── frontend/              # Astro + React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── layouts/       # Astro layouts
│   │   ├── pages/         # Astro pages & routes
│   │   └── styles/        # Global styles
│   ├── public/            # Static assets
│   └── package.json
├── backend/               # Go HTTP API
│   ├── cmd/server/        # Application entry point
│   ├── internal/          # Private application code
│   │   ├── auth/          # Authentication & JWT
│   │   ├── db/            # Database & migrations
│   │   ├── handlers/      # HTTP handlers
│   │   ├── middleware/    # HTTP middleware
│   │   └── models/        # Data models
│   ├── migrations/        # SQL migrations
│   └── go.mod
├── shared/                # Shared types & schemas
├── .vscode/tasks.json    # VS Code development tasks
└── README.md
```

## API Documentation

The API follows RESTful conventions under `/api/v1`:

### Authentication

- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user

### Users & Roles

- `GET /api/v1/users` - List users
- `POST /api/v1/users` - Create user
- `GET /api/v1/users/:id` - Get user
- `PATCH /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user
- `GET /api/v1/roles` - List roles
- `POST /api/v1/roles` - Create role

### Collections

- `GET /api/v1/collections` - List collections
- `POST /api/v1/collections` - Create collection
- `GET /api/v1/collections/:slug` - Get collection
- `PATCH /api/v1/collections/:slug` - Update collection
- `DELETE /api/v1/collections/:slug` - Delete collection

### Documents

- `GET /api/v1/collections/:slug/documents` - List documents
- `POST /api/v1/collections/:slug/documents` - Create document
- `GET /api/v1/collections/:slug/documents/:id` - Get document
- `PATCH /api/v1/collections/:slug/documents/:id` - Update document
- `DELETE /api/v1/collections/:slug/documents/:id` - Delete document

### Media

- `GET /api/v1/media` - List media files
- `POST /api/v1/media` - Upload media file
- `DELETE /api/v1/media/:id` - Delete media file

## ⚡ Daily Development Workflow

### **Start Development**

```bash
# Quick start (VS Code)
Ctrl+Shift+P → "Start Development Environment"

# OR Manual
cd frontend && npm run dev &
cd backend && go run cmd/server/main.go
```

### **Common Commands**

```bash
# Database operations
cd backend
go run cmd/migrate/main.go up      # Apply migrations
go run cmd/migrate/main.go down    # Rollback
rm -f data/chukfi.db              # Reset database

# Build for production
cd frontend && npm run build      # Build frontend
cd backend && go build cmd/server # Build backend
```

## 🐛 Troubleshooting

### **Port Already in Use**

```bash
# Check what's using port 8080
netstat -ano | findstr :8080

# Start on different port
cd backend && PORT=8081 go run cmd/server/main.go
```

### **Database Issues**

```bash
# Recreate database
cd backend
rm -f data/chukfi.db
go run cmd/migrate/main.go up
```

### **Frontend Issues**

```bash
# Clear node modules
cd frontend
rm -rf node_modules
npm install
```

## Development

### Commands

#### Using VS Code Tasks (Recommended)

The project includes VS Code tasks for common operations:

- **Ctrl+Shift+P** → "Tasks: Run Task"
  - **Start Development Environment** - Starts frontend and backend
  - **Start Frontend Development** - Astro dev server with hot reload
  - **Start Backend Development** - Go server with automatic rebuilds
  - **Run Database Migrations** - Apply SQLite migrations

#### Manual Commands

```bash
# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run preview      # Preview production build

# Backend
cd backend
go run cmd/server/main.go           # Development server
go build -o bin/server cmd/server/main.go  # Production build
go run cmd/migrate/main.go up       # Run migrations
go run cmd/migrate/main.go down     # Rollback migrations
```

### Adding New Collections

1. Create a collection via the admin UI or API
2. Define the field schema (text, textarea, number, boolean, select, relationship)
3. Collections automatically get full CRUD API endpoints
4. Frontend forms are generated based on the schema

### Extending with Custom Fields

Custom field types can be added by:

1. Extending the schema validation in `backend/internal/models/collection.go`
2. Adding UI components in `frontend/src/components/form/`
3. Updating the form builder in `frontend/src/components/FormBuilder.tsx`

## Deployment

### Production Deployment

1. Build frontend: `cd frontend && npm run build`
2. Build backend: `cd backend && go build -o bin/server cmd/server/main.go`
3. Set production environment variables
4. Run migrations: `./bin/server migrate`
5. Start server: `./bin/server`

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Quick Contributing Steps

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Community

- 🐛 [Report bugs](https://github.com/Native-Consulting-Services/chukfi-cms/issues/new?template=bug_report.md)
- 💡 [Request features](https://github.com/Native-Consulting-Services/chukfi-cms/issues/new?template=feature_request.md)
- ❓ [Ask questions](https://github.com/Native-Consulting-Services/chukfi-cms/issues/new?template=question.md)
- 📖 [View documentation](https://github.com/Native-Consulting-Services/chukfi-cms/blob/main/DEVELOPMENT.md)

## 📦 Releases

### Download Latest Release

Visit the [Releases page](https://github.com/Native-Consulting-Services/chukfi-cms/releases) for:

- 📁 **Source code** archives
- 🔧 **Pre-compiled binaries** for Linux, Windows, macOS
- 📋 **Release notes** with changelogs
- 🚀 **Migration guides** for updates

### Supported Platforms

- **Linux**: AMD64, ARM64
- **Windows**: AMD64
- **macOS**: AMD64 (Intel), ARM64 (Apple Silicon)

### Release Schedule

- 🎯 **Major releases** (v1.0, v2.0): New features, breaking changes
- 🔧 **Minor releases** (v1.1, v1.2): New features, backwards compatible
- 🐛 **Patch releases** (v1.0.1, v1.0.2): Bug fixes only

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Roadmap

- [ ] Advanced field types (rich text, date/time, file references)
- [ ] Multi-language content support
- [ ] Advanced permissions & workflows
- [ ] Plugin/extension system
- [ ] REST API documentation with OpenAPI
- [ ] GraphQL API support
- [ ] Advanced search & filtering
- [ ] Audit logs & version history
- [ ] Email notifications & webhooks
- [ ] Cloud storage integrations (S3, CloudFlare R2)
