# 🏗️ Architecture Overview

Chukfi CMS is designed as a modern, lightweight content management system with a focus on performance, developer experience, and zero external dependencies. This document provides a comprehensive overview of the system architecture, design decisions, and implementation details.

## 🎯 Design Philosophy

### Core Principles

#### **1. Zero Dependencies**

- **Pure Go backend** with no CGO requirements
- **SQLite database** with no server setup needed
- **Self-contained binaries** that run anywhere
- **No Docker** or containerization requirements

#### **2. Developer Experience First**

- **Hot reload** for both frontend and backend
- **5-minute setup** from clone to running
- **TypeScript throughout** for type safety
- **Modern tooling** with VS Code tasks

#### **3. Performance & Simplicity**

- **Monorepo structure** for easy development
- **Fast Go HTTP server** with minimal overhead
- **Efficient database queries** with pure SQLite
- **Static asset optimization** with Astro

#### **4. Production Ready**

- **JWT authentication** with secure token handling
- **Role-based permissions** with granular controls
- **Audit logging** and security features
- **Horizontal scaling** capabilities

## 🏗️ System Architecture

### High-Level Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   Frontend      │◄──►│   Backend API   │◄──►│   Database      │
│   (Astro +      │    │   (Go + chi)    │    │   (SQLite)      │
│   React)        │    │                 │    │                 │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
        ▼                        ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│  Static Assets  │    │   File System   │    │   Migrations    │
│  (CSS, JS,      │    │   (Media        │    │   (Schema       │
│   Images)       │    │   Storage)      │    │   Versioning)   │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Breakdown

#### **Frontend Layer (Astro + React)**

- **Admin Dashboard**: React components with Tailwind CSS
- **Static Generation**: Astro for optimal performance
- **Type Safety**: Full TypeScript integration
- **Hot Reload**: Development server with instant updates

#### **Backend Layer (Go + chi)**

- **HTTP API Server**: RESTful endpoints with chi router
- **Authentication**: JWT tokens with RBAC
- **Business Logic**: Collection and document management
- **Database Layer**: Pure Go SQLite integration

#### **Data Layer (SQLite)**

- **Pure Go Implementation**: modernc.org/sqlite (no CGO)
- **Schema Management**: Migration system
- **Performance**: Indexed queries and optimizations
- **File Storage**: Local filesystem for media

## 📁 Directory Structure

### Monorepo Organization

```
chukfi-cms/
├── frontend/                   # Astro + React admin dashboard
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── forms/          # Form components
│   │   │   ├── layout/         # Layout components
│   │   │   └── ui/             # UI primitives
│   │   ├── layouts/            # Astro layouts
│   │   ├── pages/              # Astro pages and routing
│   │   │   ├── admin/          # Admin dashboard pages
│   │   │   └── api/            # API routes (if needed)
│   │   ├── lib/                # Utility libraries
│   │   │   ├── api.ts          # API client
│   │   │   ├── auth.ts         # Authentication helpers
│   │   │   └── utils.ts        # Common utilities
│   │   ├── styles/             # Global CSS and Tailwind
│   │   └── types/              # TypeScript type definitions
│   ├── public/                 # Static assets
│   └── package.json            # Frontend dependencies
├── backend/                    # Go HTTP API server
│   ├── cmd/                    # Application entry points
│   │   ├── server/             # Main HTTP server
│   │   └── migrate/            # Migration utility
│   ├── internal/               # Private application code
│   │   ├── auth/               # Authentication & JWT
│   │   │   ├── auth.go         # Auth service
│   │   │   ├── jwt.go          # JWT token handling
│   │   │   └── middleware.go   # Auth middleware
│   │   ├── db/                 # Database layer
│   │   │   ├── db.go           # Database connection
│   │   │   ├── migrations.go   # Migration runner
│   │   │   └── queries.go      # SQL queries
│   │   ├── handlers/           # HTTP request handlers
│   │   │   ├── auth.go         # Auth endpoints
│   │   │   ├── collections.go  # Collection management
│   │   │   ├── documents.go    # Document CRUD
│   │   │   ├── media.go        # File uploads
│   │   │   └── users.go        # User management
│   │   ├── middleware/         # HTTP middleware
│   │   │   ├── auth.go         # Authentication
│   │   │   ├── cors.go         # CORS handling
│   │   │   ├── logging.go      # Request logging
│   │   │   └── rbac.go         # Permission checking
│   │   ├── models/             # Data models
│   │   │   ├── collection.go   # Collection schema
│   │   │   ├── document.go     # Document model
│   │   │   ├── media.go        # Media file model
│   │   │   └── user.go         # User model
│   │   └── services/           # Business logic
│   │       ├── collection.go   # Collection service
│   │       ├── document.go     # Document service
│   │       ├── media.go        # Media service
│   │       └── user.go         # User service
│   ├── migrations/             # SQL schema migrations
│   │   ├── 001_initial_schema.up.sql
│   │   ├── 001_initial_schema.down.sql
│   │   └── ...
│   ├── data/                   # SQLite database files
│   └── go.mod                  # Go dependencies
├── shared/                     # Shared code and types
│   └── types.ts                # TypeScript type definitions
├── docs/                       # Documentation
├── assets/                     # Brand assets and media
└── .vscode/                    # VS Code configuration
    └── tasks.json              # Development tasks
```

## 🔧 Backend Architecture

### Go HTTP Server Design

#### **Main Server (cmd/server/main.go)**

```go
func main() {
    // Load configuration
    config := loadConfig()

    // Initialize database
    db := initDatabase(config.DatabaseURL)

    // Run migrations
    runMigrations(db)

    // Initialize services
    authService := auth.NewService(config.JWTSecret)
    userService := users.NewService(db)
    collectionService := collections.NewService(db)

    // Initialize handlers
    authHandler := handlers.NewAuthHandler(authService, userService)
    userHandler := handlers.NewUserHandler(userService)
    collectionHandler := handlers.NewCollectionHandler(collectionService)

    // Setup router
    router := setupRouter(authHandler, userHandler, collectionHandler)

    // Start server
    server := &http.Server{
        Addr:    ":" + config.Port,
        Handler: router,
    }

    log.Printf("Server starting on port %s", config.Port)
    server.ListenAndServe()
}
```

#### **Router Setup (chi)**

```go
func setupRouter(
    authHandler *handlers.AuthHandler,
    userHandler *handlers.UserHandler,
    collectionHandler *handlers.CollectionHandler,
) http.Handler {
    r := chi.NewRouter()

    // Global middleware
    r.Use(middleware.Logger)
    r.Use(middleware.CORS)
    r.Use(middleware.Recoverer)
    r.Use(middleware.RequestID)

    // Health check (no auth required)
    r.Get("/health", healthCheck)

    // API routes
    r.Route("/api/v1", func(r chi.Router) {
        // Public auth routes
        r.Post("/auth/login", authHandler.Login)
        r.Post("/auth/refresh", authHandler.Refresh)

        // Protected routes (require authentication)
        r.Group(func(r chi.Router) {
            r.Use(middleware.RequireAuth)

            // Auth routes
            r.Post("/auth/logout", authHandler.Logout)
            r.Get("/auth/me", authHandler.Me)

            // User management (admin only)
            r.Route("/users", func(r chi.Router) {
                r.Use(middleware.RequirePermission("users.read"))
                r.Get("/", userHandler.List)
                r.Get("/{id}", userHandler.Get)

                r.Group(func(r chi.Router) {
                    r.Use(middleware.RequirePermission("users.write"))
                    r.Post("/", userHandler.Create)
                    r.Patch("/{id}", userHandler.Update)
                    r.Delete("/{id}", userHandler.Delete)
                })
            })

            // Collection management
            r.Route("/collections", func(r chi.Router) {
                r.Get("/", collectionHandler.List)
                r.Get("/{slug}", collectionHandler.Get)

                r.Group(func(r chi.Router) {
                    r.Use(middleware.RequirePermission("collections.write"))
                    r.Post("/", collectionHandler.Create)
                    r.Patch("/{slug}", collectionHandler.Update)
                    r.Delete("/{slug}", collectionHandler.Delete)
                })

                // Document routes
                r.Route("/{slug}/documents", func(r chi.Router) {
                    r.Get("/", collectionHandler.ListDocuments)
                    r.Get("/{id}", collectionHandler.GetDocument)
                    r.Post("/", collectionHandler.CreateDocument)
                    r.Patch("/{id}", collectionHandler.UpdateDocument)
                    r.Delete("/{id}", collectionHandler.DeleteDocument)
                })
            })
        })
    })

    return r
}
```

### Service Layer Pattern

#### **Collection Service Example**

```go
type CollectionService struct {
    db *sql.DB
}

func NewCollectionService(db *sql.DB) *CollectionService {
    return &CollectionService{db: db}
}

func (s *CollectionService) Create(collection *models.Collection) error {
    // Validate collection schema
    if err := s.validateSchema(collection); err != nil {
        return err
    }

    // Start transaction
    tx, err := s.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Insert collection
    query := `
        INSERT INTO collections (name, slug, description, schema, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `
    _, err = tx.Exec(query,
        collection.Name,
        collection.Slug,
        collection.Description,
        collection.Schema,
        time.Now(),
        time.Now(),
    )
    if err != nil {
        return err
    }

    // Create collection table
    if err := s.createCollectionTable(tx, collection); err != nil {
        return err
    }

    // Commit transaction
    return tx.Commit()
}

func (s *CollectionService) createCollectionTable(tx *sql.Tx, collection *models.Collection) error {
    tableName := fmt.Sprintf("collection_%s", collection.Slug)

    // Build CREATE TABLE statement based on field schema
    columns := []string{
        "id INTEGER PRIMARY KEY AUTOINCREMENT",
        "created_at DATETIME NOT NULL",
        "updated_at DATETIME NOT NULL",
    }

    for _, field := range collection.Fields {
        columnDef := s.fieldToColumnDefinition(field)
        columns = append(columns, columnDef)
    }

    query := fmt.Sprintf(
        "CREATE TABLE %s (%s)",
        tableName,
        strings.Join(columns, ", "),
    )

    _, err := tx.Exec(query)
    return err
}
```

### Database Layer

#### **SQLite Integration**

```go
import (
    "database/sql"
    _ "modernc.org/sqlite" // Pure Go SQLite driver
)

type DB struct {
    *sql.DB
    migrator *Migrator
}

func NewDB(databaseURL string) (*DB, error) {
    db, err := sql.Open("sqlite", databaseURL)
    if err != nil {
        return nil, err
    }

    // Configure SQLite for optimal performance
    pragmas := []string{
        "PRAGMA journal_mode=WAL",           // Write-Ahead Logging
        "PRAGMA synchronous=NORMAL",         // Balanced durability/performance
        "PRAGMA cache_size=1000",            // 1MB cache
        "PRAGMA foreign_keys=ON",            // Enable foreign key constraints
        "PRAGMA temp_store=MEMORY",          // Temporary tables in memory
    }

    for _, pragma := range pragmas {
        if _, err := db.Exec(pragma); err != nil {
            return nil, fmt.Errorf("failed to set pragma %s: %v", pragma, err)
        }
    }

    migrator := NewMigrator(db)

    return &DB{
        DB:       db,
        migrator: migrator,
    }, nil
}

func (db *DB) RunMigrations() error {
    return db.migrator.Up()
}
```

#### **Migration System**

```go
type Migration struct {
    Version int
    Name    string
    UpSQL   string
    DownSQL string
}

type Migrator struct {
    db         *sql.DB
    migrations []Migration
}

func (m *Migrator) Up() error {
    // Create migrations table
    if err := m.createMigrationsTable(); err != nil {
        return err
    }

    // Get current version
    currentVersion := m.getCurrentVersion()

    // Run pending migrations
    for _, migration := range m.migrations {
        if migration.Version > currentVersion {
            log.Printf("Running migration %d: %s", migration.Version, migration.Name)

            if err := m.runMigration(migration); err != nil {
                return fmt.Errorf("migration %d failed: %v", migration.Version, err)
            }
        }
    }

    return nil
}

func (m *Migrator) runMigration(migration Migration) error {
    tx, err := m.db.Begin()
    if err != nil {
        return err
    }
    defer tx.Rollback()

    // Execute migration SQL
    if _, err := tx.Exec(migration.UpSQL); err != nil {
        return err
    }

    // Record migration
    _, err = tx.Exec(
        "INSERT INTO migrations (version, name, applied_at) VALUES (?, ?, ?)",
        migration.Version,
        migration.Name,
        time.Now(),
    )
    if err != nil {
        return err
    }

    return tx.Commit()
}
```

## 🎨 Frontend Architecture

### Astro + React Integration

#### **Project Structure**

```typescript
// astro.config.mjs
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

export default defineConfig({
  integrations: [
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  server: {
    port: 4321,
    host: true,
  },
  build: {
    assets: "_astro",
  },
  vite: {
    define: {
      "import.meta.env.API_URL": JSON.stringify(
        process.env.API_URL || "http://localhost:8080"
      ),
    },
  },
});
```

#### **Layout System**

```typescript
// src/layouts/AdminLayout.astro
---
export interface Props {
  title: string;
}

const { title } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} - Chukfi CMS</title>
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  </head>
  <body class="bg-gray-50">
    <div class="min-h-screen flex">
      <!-- Sidebar Navigation -->
      <div class="w-64 bg-white shadow-sm">
        <SidebarNav client:load />
      </div>

      <!-- Main Content -->
      <div class="flex-1 flex flex-col">
        <!-- Top Navigation -->
        <header class="bg-white shadow-sm border-b">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-16">
              <div class="flex items-center">
                <h1 class="text-xl font-semibold text-gray-900">{title}</h1>
              </div>
              <UserMenu client:load />
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="flex-1 overflow-y-auto">
          <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <slot />
          </div>
        </main>
      </div>
    </div>
  </body>
</html>
```

#### **React Components**

```typescript
// src/components/SidebarNav.tsx
import React from "react";
import { useAuth } from "../lib/auth";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: HomeIcon,
  },
  {
    name: "Collections",
    href: "/admin/collections",
    icon: CollectionIcon,
    permission: "collections.read",
  },
  {
    name: "Media",
    href: "/admin/media",
    icon: PhotoIcon,
    permission: "media.read",
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: UsersIcon,
    permission: "users.read",
  },
];

export function SidebarNav() {
  const { user, hasPermission } = useAuth();

  const filteredNavigation = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <nav className="mt-8">
      <div className="px-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
```

### API Client Layer

#### **API Client Implementation**

```typescript
// src/lib/api.ts
class APIClient {
  private baseURL: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem("access_token");
    this.refreshToken = localStorage.getItem("refresh_token");
  }

  private saveTokensToStorage(tokens: {
    access_token: string;
    refresh_token?: string;
  }) {
    localStorage.setItem("access_token", tokens.access_token);
    if (tokens.refresh_token) {
      localStorage.setItem("refresh_token", tokens.refresh_token);
    }
    this.accessToken = tokens.access_token;
    if (tokens.refresh_token) {
      this.refreshToken = tokens.refresh_token;
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers = new Headers(options.headers);

    if (!headers.has("Content-Type") && options.body) {
      headers.set("Content-Type", "application/json");
    }

    if (this.accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${this.accessToken}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration
    if (response.status === 401 && this.refreshToken) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry original request
        headers.set("Authorization", `Bearer ${this.accessToken}`);
        return this.request(endpoint, { ...options, headers });
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(response.status, errorData.error || "Request failed");
    }

    return response.json();
  }

  private async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;

    try {
      const tokens = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: this.refreshToken }),
      }).then((res) => res.json());

      this.saveTokensToStorage(tokens);
      return true;
    } catch {
      // Refresh failed, clear tokens
      this.clearTokens();
      return false;
    }
  }

  async login(email: string, password: string) {
    const data = await this.request<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    this.saveTokensToStorage(data);
    return data.user;
  }

  async getCollections() {
    return this.request<CollectionsResponse>("/collections");
  }

  async getDocuments(collectionSlug: string, params?: DocumentQueryParams) {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    return this.request<DocumentsResponse>(
      `/collections/${collectionSlug}/documents${query}`
    );
  }

  // ... other methods
}

export const apiClient = new APIClient(import.meta.env.API_URL);
```

## 🔐 Security Architecture

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │   Backend   │    │  Database   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ POST /auth/login │                  │
       ├─────────────────►│                  │
       │  email/password  │                  │
       │                  │ Verify password  │
       │                  ├─────────────────►│
       │                  │                  │
       │                  │ User data        │
       │                  │◄─────────────────┤
       │ JWT tokens       │                  │
       │◄─────────────────┤                  │
       │                  │                  │
       │ API requests     │                  │
       ├─────────────────►│                  │
       │ + Bearer token   │ Verify JWT       │
       │                  │                  │
       │ Response data    │ Check permissions│
       │◄─────────────────┤                  │
       │                  │                  │
```

### JWT Token Structure

```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user123",
    "email": "user@example.com",
    "role": "editor",
    "permissions": ["collections.blog-posts.*", "media.upload"],
    "iat": 1640991600,
    "exp": 1640992500
  }
}
```

### Permission System

#### **RBAC Implementation**

```go
type Permission struct {
    Resource   string // "collections", "users", "media"
    Collection string // specific collection or "*"
    Action     string // "create", "read", "update", "delete", "*"
    Condition  string // "[author=self]", "[published=true]"
}

func (p Permission) String() string {
    perm := fmt.Sprintf("%s.%s.%s", p.Resource, p.Collection, p.Action)
    if p.Condition != "" {
        perm += p.Condition
    }
    return perm
}

func ParsePermission(permStr string) Permission {
    // Parse permission string like "collections.blog-posts.create[author=self]"
    // Implementation details...
}

func (p Permission) Matches(required Permission, context map[string]interface{}) bool {
    // Check if this permission satisfies the required permission
    // considering wildcards and conditions
    // Implementation details...
}
```

## 📊 Data Flow Architecture

### Document Creation Flow

```
Frontend                Backend                 Database
    │                      │                       │
    │ POST /documents       │                       │
    ├─────────────────────► │                       │
    │                      │ Validate JWT          │
    │                      │                       │
    │                      │ Check permissions     │
    │                      │                       │
    │                      │ Validate schema       │
    │                      │                       │
    │                      │ BEGIN transaction     │
    │                      ├─────────────────────► │
    │                      │                       │
    │                      │ INSERT document       │
    │                      ├─────────────────────► │
    │                      │                       │
    │                      │ UPDATE audit log      │
    │                      ├─────────────────────► │
    │                      │                       │
    │                      │ COMMIT transaction    │
    │                      ├─────────────────────► │
    │ Document created     │                       │
    │◄─────────────────────┤                       │
```

### Collection Schema Management

```go
type CollectionSchema struct {
    Fields []Field `json:"fields"`
}

type Field struct {
    Name        string                 `json:"name"`
    Type        string                 `json:"type"`
    Label       string                 `json:"label"`
    Required    bool                   `json:"required"`
    Unique      bool                   `json:"unique"`
    Default     interface{}            `json:"default,omitempty"`
    Validation  map[string]interface{} `json:"validation,omitempty"`
}

func (s *CollectionSchema) ValidateDocument(doc map[string]interface{}) error {
    for _, field := range s.Fields {
        value, exists := doc[field.Name]

        // Check required fields
        if field.Required && (!exists || value == nil) {
            return fmt.Errorf("field %s is required", field.Name)
        }

        // Validate field type
        if exists && value != nil {
            if err := s.validateFieldType(field, value); err != nil {
                return err
            }
        }

        // Apply field validation rules
        if err := s.validateFieldRules(field, value); err != nil {
            return err
        }
    }

    return nil
}
```

## 🚀 Performance Optimizations

### Database Optimizations

#### **SQLite Configuration**

```sql
-- Optimal SQLite settings for CMS workload
PRAGMA journal_mode=WAL;           -- Write-Ahead Logging for concurrent reads
PRAGMA synchronous=NORMAL;         -- Balance between safety and performance
PRAGMA cache_size=10000;           -- 10MB cache
PRAGMA temp_store=MEMORY;          -- Keep temporary data in memory
PRAGMA mmap_size=268435456;        -- Memory-mapped I/O (256MB)
PRAGMA foreign_keys=ON;            -- Enforce referential integrity
```

#### **Indexing Strategy**

```sql
-- Primary indexes for fast lookups
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_media_filename ON media(filename);

-- Compound indexes for common queries
CREATE INDEX idx_documents_collection_published
ON collection_documents(collection_id, published, created_at DESC);

-- Full-text search indexes
CREATE VIRTUAL TABLE documents_fts USING fts5(
    title, content,
    content='collection_documents',
    content_rowid='id'
);
```

### HTTP Server Optimizations

#### **Middleware Optimizations**

```go
func OptimizedMiddleware() func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            // Enable HTTP/2 Server Push for critical resources
            if pusher, ok := w.(http.Pusher); ok {
                pusher.Push("/static/css/admin.css", nil)
            }

            // Set optimal caching headers
            if strings.HasPrefix(r.URL.Path, "/static/") {
                w.Header().Set("Cache-Control", "public, max-age=31536000") // 1 year
            }

            // Enable gzip compression
            if strings.Contains(r.Header.Get("Accept-Encoding"), "gzip") {
                w.Header().Set("Content-Encoding", "gzip")
                gzw := gzip.NewWriter(w)
                defer gzw.Close()
                w = gzipResponseWriter{Writer: gzw, ResponseWriter: w}
            }

            next.ServeHTTP(w, r)
        })
    }
}
```

### Frontend Optimizations

#### **Astro Build Optimizations**

```javascript
// astro.config.mjs
export default defineConfig({
  build: {
    inlineStylesheets: "auto",
    assets: "_astro",
  },
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: ["@headlessui/react", "@heroicons/react"],
          },
        },
      },
    },
    ssr: {
      external: ["@astrojs/react"],
    },
  },
  compressHTML: true,
  scopedStyleStrategy: "class",
});
```

## 🔄 Development Workflow

### Hot Reload System

#### **Backend Hot Reload (Air)**

```yaml
# .air.toml
root = "backend"
tmp_dir = "tmp"

[build]
cmd = "go build -o ./tmp/main ./cmd/server"
bin = "./tmp/main"
full_bin = "./tmp/main"
include_ext = ["go", "sql"]
exclude_dir = ["tmp", "data"]
include_dir = []

[log]
time = true

[color]
main = "magenta"
watcher = "cyan"
build = "yellow"
runner = "green"
```

#### **Frontend Hot Reload (Astro)**

```json
{
  "scripts": {
    "dev": "astro dev --host 0.0.0.0 --port 4321",
    "build": "astro build",
    "preview": "astro preview"
  }
}
```

### VS Code Integration

#### **Development Tasks**

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Development Environment",
      "dependsOrder": "sequence",
      "dependsOn": [
        "Run Database Migrations",
        "Start Frontend Development",
        "Start Backend Development"
      ]
    },
    {
      "label": "Start Frontend Development",
      "type": "shell",
      "command": "npm run dev",
      "group": "build",
      "isBackground": true,
      "options": {
        "cwd": "${workspaceFolder}/frontend"
      },
      "problemMatcher": {
        "pattern": {
          "regexp": "."
        },
        "background": {
          "activeOnStart": true,
          "beginsPattern": "Local:",
          "endsPattern": "ready in"
        }
      }
    },
    {
      "label": "Start Backend Development",
      "type": "shell",
      "command": "air",
      "group": "build",
      "isBackground": true,
      "options": {
        "cwd": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

## 📈 Scaling Considerations

### Horizontal Scaling

#### **Load Balancer Setup**

```nginx
upstream chukfi_backend {
    server 127.0.0.1:8080;
    server 127.0.0.1:8081;
    server 127.0.0.1:8082;
}

server {
    listen 80;
    server_name cms.example.com;

    # Serve static frontend files
    location / {
        root /var/www/chukfi/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://chukfi_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Handle file uploads with increased limits
    location /api/v1/media {
        client_max_body_size 50M;
        proxy_pass http://chukfi_backend;
    }
}
```

### Database Scaling

#### **Read Replicas with SQLite**

```go
type DatabaseCluster struct {
    primary *sql.DB
    replicas []*sql.DB
    roundRobin int
}

func (dc *DatabaseCluster) Query(query string, args ...interface{}) (*sql.Rows, error) {
    // Use replica for read queries
    if isReadQuery(query) {
        replica := dc.getNextReplica()
        return replica.Query(query, args...)
    }

    // Use primary for write queries
    return dc.primary.Query(query, args...)
}

func (dc *DatabaseCluster) getNextReplica() *sql.DB {
    if len(dc.replicas) == 0 {
        return dc.primary
    }

    replica := dc.replicas[dc.roundRobin]
    dc.roundRobin = (dc.roundRobin + 1) % len(dc.replicas)
    return replica
}
```

## 🔍 Monitoring & Observability

### Metrics Collection

#### **Prometheus Metrics**

```go
var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests",
        },
        []string{"method", "endpoint", "status_code"},
    )

    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "http_request_duration_seconds",
            Help: "HTTP request duration in seconds",
        },
        []string{"method", "endpoint"},
    )

    databaseQueryDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name: "database_query_duration_seconds",
            Help: "Database query duration in seconds",
        },
        []string{"query_type"},
    )
)

func MetricsMiddleware() func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()

            recorder := &statusRecorder{ResponseWriter: w, status: 200}
            next.ServeHTTP(recorder, r)

            duration := time.Since(start).Seconds()

            httpRequestsTotal.WithLabelValues(
                r.Method,
                r.URL.Path,
                strconv.Itoa(recorder.status),
            ).Inc()

            httpRequestDuration.WithLabelValues(
                r.Method,
                r.URL.Path,
            ).Observe(duration)
        })
    }
}
```

### Logging Strategy

#### **Structured Logging**

```go
import (
    "github.com/sirupsen/logrus"
)

func setupLogging() *logrus.Logger {
    logger := logrus.New()
    logger.SetFormatter(&logrus.JSONFormatter{})

    if os.Getenv("ENVIRONMENT") == "development" {
        logger.SetLevel(logrus.DebugLevel)
        logger.SetFormatter(&logrus.TextFormatter{
            FullTimestamp: true,
        })
    } else {
        logger.SetLevel(logrus.InfoLevel)
    }

    return logger
}

func LoggingMiddleware(logger *logrus.Logger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            start := time.Now()

            recorder := &statusRecorder{ResponseWriter: w, status: 200}
            next.ServeHTTP(recorder, r)

            logger.WithFields(logrus.Fields{
                "method":         r.Method,
                "path":          r.URL.Path,
                "status":        recorder.status,
                "duration_ms":   time.Since(start).Milliseconds(),
                "remote_addr":   r.RemoteAddr,
                "user_agent":    r.UserAgent(),
                "request_id":    r.Header.Get("X-Request-ID"),
            }).Info("HTTP request completed")
        })
    }
}
```

## 🧪 Testing Strategy

### Backend Testing

#### **Unit Tests**

```go
func TestCollectionService_Create(t *testing.T) {
    // Setup test database
    db := setupTestDB(t)
    defer db.Close()

    service := NewCollectionService(db)

    collection := &models.Collection{
        Name:        "Test Collection",
        Slug:        "test-collection",
        Description: "A test collection",
        Fields: []models.Field{
            {
                Name:     "title",
                Type:     "text",
                Required: true,
            },
        },
    }

    // Test successful creation
    err := service.Create(collection)
    assert.NoError(t, err)

    // Verify collection exists
    retrieved, err := service.GetBySlug("test-collection")
    assert.NoError(t, err)
    assert.Equal(t, collection.Name, retrieved.Name)

    // Test duplicate slug error
    duplicate := *collection
    err = service.Create(&duplicate)
    assert.Error(t, err)
    assert.Contains(t, err.Error(), "already exists")
}
```

#### **Integration Tests**

```go
func TestCollectionAPI(t *testing.T) {
    // Setup test server
    server := setupTestServer(t)
    defer server.Close()

    client := &http.Client{}

    // Login and get token
    token := authenticateTestUser(t, client, server.URL)

    // Test creating collection
    collection := map[string]interface{}{
        "name": "Test Collection",
        "slug": "test-collection",
        "fields": []map[string]interface{}{
            {
                "name":     "title",
                "type":     "text",
                "required": true,
            },
        },
    }

    body, _ := json.Marshal(collection)
    req, _ := http.NewRequest("POST", server.URL+"/api/v1/collections", bytes.NewBuffer(body))
    req.Header.Set("Authorization", "Bearer "+token)
    req.Header.Set("Content-Type", "application/json")

    resp, err := client.Do(req)
    assert.NoError(t, err)
    assert.Equal(t, http.StatusCreated, resp.StatusCode)

    var created map[string]interface{}
    json.NewDecoder(resp.Body).Decode(&created)
    assert.Equal(t, "Test Collection", created["name"])
}
```

### Frontend Testing

#### **Component Tests**

```typescript
import { render, screen, fireEvent } from "@testing-library/react";
import { SidebarNav } from "../SidebarNav";
import { AuthProvider } from "../../lib/auth";

const mockUser = {
  id: "1",
  email: "test@example.com",
  role: "editor",
  permissions: ["collections.read", "media.read"],
};

function renderWithAuth(component: React.ReactElement) {
  return render(
    <AuthProvider
      value={{
        user: mockUser,
        hasPermission: (perm) => mockUser.permissions.includes(perm),
      }}
    >
      {component}
    </AuthProvider>
  );
}

test("shows navigation items based on permissions", () => {
  renderWithAuth(<SidebarNav />);

  // Should show items user has permissions for
  expect(screen.getByText("Collections")).toBeInTheDocument();
  expect(screen.getByText("Media")).toBeInTheDocument();

  // Should not show items user lacks permissions for
  expect(screen.queryByText("Users")).not.toBeInTheDocument();
});

test("handles navigation clicks", () => {
  renderWithAuth(<SidebarNav />);

  const collectionsLink = screen.getByText("Collections");
  fireEvent.click(collectionsLink);

  expect(window.location.pathname).toBe("/admin/collections");
});
```

## 🚀 Future Architecture Enhancements

### Planned Improvements

#### **Microservices Migration Path**

```
Current Monolith           Future Microservices
┌─────────────────┐       ┌─────────┐ ┌─────────┐ ┌─────────┐
│                 │       │  Auth   │ │Content  │ │ Media   │
│   Chukfi CMS    │  ───► │ Service │ │Service  │ │Service  │
│    (Go API)     │       │         │ │         │ │         │
│                 │       └─────────┘ └─────────┘ └─────────┘
└─────────────────┘              │         │         │
                                 └────────┬─────────┘
                                          │
                                    ┌─────────┐
                                    │  Event  │
                                    │ Service │
                                    └─────────┘
```

#### **Plugin System Architecture**

```go
type Plugin interface {
    Name() string
    Version() string
    Initialize(ctx context.Context, config map[string]interface{}) error
    RegisterRoutes(router chi.Router)
    RegisterHooks(hookManager *HookManager)
    Shutdown() error
}

type PluginManager struct {
    plugins   map[string]Plugin
    hooks     *HookManager
    router    chi.Router
}

func (pm *PluginManager) LoadPlugin(pluginPath string) error {
    // Load plugin from shared library or WebAssembly module
    // Register plugin routes and hooks
    // Initialize plugin with configuration
}
```

#### **Advanced Caching Layer**

```go
type CacheManager struct {
    local  cache.Cache        // In-memory cache
    redis  *redis.Client     // Distributed cache
    config CacheConfig
}

func (cm *CacheManager) Get(key string) (interface{}, error) {
    // Try local cache first
    if value, found := cm.local.Get(key); found {
        return value, nil
    }

    // Fall back to Redis
    if cm.redis != nil {
        value, err := cm.redis.Get(key).Result()
        if err == nil {
            cm.local.Set(key, value, cm.config.LocalTTL)
            return value, nil
        }
    }

    return nil, cache.ErrNotFound
}
```

This architecture provides a solid foundation for a modern, scalable CMS while maintaining the core principles of simplicity and zero dependencies. The modular design allows for future enhancements without compromising the current functionality.
