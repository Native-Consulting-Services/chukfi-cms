# 🔌 REST API Reference

Chukfi CMS provides a comprehensive RESTful API for managing all aspects of your content management system. This guide covers authentication, endpoints, request/response formats, and error handling.

## 📋 API Overview

### Base URL

```
http://localhost:8080/api/v1
```

### API Principles

- **RESTful design** with standard HTTP methods
- **JSON-only** request and response bodies
- **Consistent error handling** across all endpoints
- **JWT authentication** for secure access
- **Permission-based authorization** with RBAC
- **Pagination** for list endpoints
- **Filtering and sorting** for data retrieval

### Content Type

All requests and responses use `application/json`:

```bash
Content-Type: application/json
Accept: application/json
```

## 🔐 Authentication

Chukfi CMS uses JWT (JSON Web Token) authentication with access and refresh tokens.

### Authentication Flow

#### 1. **Login**

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@chukfi.com",
  "password": "admin123"
}
```

**Response:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 900,
  "token_type": "Bearer",
  "user": {
    "id": "1",
    "email": "admin@chukfi.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin",
    "permissions": ["*"]
  }
}
```

#### 2. **Using Access Tokens**

Include the access token in the Authorization header:

```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. **Refreshing Tokens**

When the access token expires (15 minutes), use the refresh token:

```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. **Logout**

Invalidate tokens (optional, tokens expire automatically):

```bash
POST /api/v1/auth/logout
Authorization: Bearer ACCESS_TOKEN

{
  "refresh_token": "REFRESH_TOKEN"
}
```

### Authentication Endpoints

#### **POST /api/v1/auth/login**

Authenticate user and receive tokens.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "expires_in": 900,
  "token_type": "Bearer",
  "user": {
    "id": "string",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "permissions": ["string"]
  }
}
```

#### **POST /api/v1/auth/refresh**

Refresh access token using refresh token.

**Request Body:**

```json
{
  "refresh_token": "string"
}
```

**Response:** `200 OK`

```json
{
  "access_token": "string",
  "expires_in": 900,
  "token_type": "Bearer"
}
```

#### **POST /api/v1/auth/logout**

Invalidate user tokens.

**Request Body:**

```json
{
  "refresh_token": "string"
}
```

**Response:** `204 No Content`

#### **GET /api/v1/auth/me**

Get current user information.

**Headers:** `Authorization: Bearer ACCESS_TOKEN`

**Response:** `200 OK`

```json
{
  "id": "string",
  "email": "string",
  "firstName": "string",
  "lastName": "string",
  "role": "string",
  "permissions": ["string"],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-01T00:00:00Z"
}
```

## 👥 Users API

Manage user accounts, roles, and permissions.

### **GET /api/v1/users**

List all users with pagination and filtering.

**Query Parameters:**

- `limit` (number): Number of results per page (default: 25, max: 100)
- `offset` (number): Number of results to skip
- `page` (number): Page number (alternative to offset)
- `sort` (string): Sort field(s) - prefix with `-` for descending
- `search` (string): Search in name and email fields
- `role` (string): Filter by user role
- `status` (string): Filter by user status

**Example:**

```bash
GET /api/v1/users?limit=10&page=2&sort=-createdAt&role=editor&status=active
Authorization: Bearer ACCESS_TOKEN
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "1",
      "email": "admin@chukfi.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "admin",
      "status": "active",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z",
      "lastLogin": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "count": 10,
    "page": 2,
    "pages": 15,
    "limit": 10,
    "offset": 10
  }
}
```

### **POST /api/v1/users**

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "secure-password-123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "editor",
  "status": "active"
}
```

**Response:** `201 Created`

```json
{
  "id": "2",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "editor",
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### **GET /api/v1/users/:id**

Get a specific user by ID.

**Response:** `200 OK`

```json
{
  "id": "2",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "editor",
  "status": "active",
  "bio": "Content editor specializing in technical writing",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "lastLogin": "2024-01-01T12:00:00Z"
}
```

### **PATCH /api/v1/users/:id**

Update user information.

**Request Body:**

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "bio": "Senior content editor with 5+ years experience",
  "status": "active"
}
```

**Response:** `200 OK`

```json
{
  "id": "2",
  "email": "user@example.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "editor",
  "status": "active",
  "bio": "Senior content editor with 5+ years experience",
  "updatedAt": "2024-01-01T12:30:00Z"
}
```

### **DELETE /api/v1/users/:id**

Delete a user account.

**Response:** `204 No Content`

## 🏷️ Roles API

Manage user roles and permissions.

### **GET /api/v1/roles**

List all available roles.

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "1",
      "name": "Administrator",
      "slug": "admin",
      "description": "Full system access",
      "permissions": ["*"],
      "userCount": 2,
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "2",
      "name": "Editor",
      "slug": "editor",
      "description": "Content creation and editing",
      "permissions": ["collections.*.documents.*", "media.*", "users.read"],
      "userCount": 5,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **POST /api/v1/roles**

Create a new role.

**Request Body:**

```json
{
  "name": "Content Manager",
  "slug": "content-manager",
  "description": "Manages content but not users",
  "permissions": ["collections.blog-posts.*", "collections.pages.*", "media.*"]
}
```

### **GET /api/v1/roles/:slug**

Get role details including permissions.

### **PATCH /api/v1/roles/:slug**

Update role permissions and details.

### **DELETE /api/v1/roles/:slug**

Delete a role (if no users are assigned).

## 🏗️ Collections API

Manage content type definitions and schemas.

### **GET /api/v1/collections**

List all collections.

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "1",
      "name": "Blog Posts",
      "slug": "blog-posts",
      "description": "Articles and blog content",
      "documentCount": 45,
      "fields": [
        {
          "name": "title",
          "type": "text",
          "label": "Title",
          "required": true,
          "maxLength": 100
        },
        {
          "name": "content",
          "type": "textarea",
          "label": "Content",
          "required": true
        },
        {
          "name": "published",
          "type": "boolean",
          "label": "Published",
          "default": false
        }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### **POST /api/v1/collections**

Create a new collection.

**Request Body:**

```json
{
  "name": "Products",
  "slug": "products",
  "description": "E-commerce product catalog",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Product Name",
      "required": true,
      "maxLength": 100
    },
    {
      "name": "description",
      "type": "textarea",
      "label": "Description",
      "required": true
    },
    {
      "name": "price",
      "type": "number",
      "label": "Price",
      "required": true,
      "min": 0,
      "step": 0.01
    },
    {
      "name": "active",
      "type": "boolean",
      "label": "Active Product",
      "default": true
    }
  ]
}
```

**Response:** `201 Created`

```json
{
  "id": "2",
  "name": "Products",
  "slug": "products",
  "description": "E-commerce product catalog",
  "documentCount": 0,
  "fields": [...],
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### **GET /api/v1/collections/:slug**

Get collection details and schema.

### **PATCH /api/v1/collections/:slug**

Update collection schema and settings.

**Request Body:**

```json
{
  "description": "Updated description",
  "fields": [
    {
      "name": "title",
      "type": "text",
      "label": "Title",
      "required": true,
      "maxLength": 150
    }
  ]
}
```

### **DELETE /api/v1/collections/:slug**

Delete collection and all its documents.

**Response:** `204 No Content`

## 📄 Documents API

Manage content documents within collections.

### **GET /api/v1/collections/:slug/documents**

List documents in a collection.

**Query Parameters:**

- `limit` (number): Results per page (default: 25, max: 100)
- `offset` (number): Results to skip
- `page` (number): Page number
- `sort` (string): Sort fields (`-field` for descending)
- `search` (string): Full-text search
- `fields` (string): Comma-separated fields to include
- `exclude` (string): Comma-separated fields to exclude
- **Field filters**: `field[operator]=value`

**Filter Operators:**

- `eq` (equals): `published=true`
- `ne` (not equals): `status[ne]=draft`
- `gt` (greater than): `price[gt]=100`
- `gte` (greater than or equal): `price[gte]=100`
- `lt` (less than): `price[lt]=1000`
- `lte` (less than or equal): `price[lte]=1000`
- `in` (in array): `category[in]=tech,science`
- `nin` (not in array): `status[nin]=draft,archived`
- `regex` (regular expression): `title[regex]=^Hello`

**Example:**

```bash
GET /api/v1/collections/blog-posts/documents?published=true&sort=-createdAt&limit=10&search=javascript&fields=title,content,createdAt
Authorization: Bearer ACCESS_TOKEN
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "1",
      "title": "Getting Started with JavaScript",
      "content": "JavaScript is a powerful programming language...",
      "published": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "total": 45,
    "count": 10,
    "page": 1,
    "pages": 5,
    "limit": 10,
    "offset": 0
  }
}
```

### **POST /api/v1/collections/:slug/documents**

Create a new document.

**Request Body:**

```json
{
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post using Chukfi CMS.",
  "published": false
}
```

**Response:** `201 Created`

```json
{
  "id": "2",
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post using Chukfi CMS.",
  "published": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### **GET /api/v1/collections/:slug/documents/:id**

Get a specific document.

**Query Parameters:**

- `fields` (string): Comma-separated fields to include
- `exclude` (string): Comma-separated fields to exclude

**Response:** `200 OK`

```json
{
  "id": "2",
  "title": "My First Blog Post",
  "content": "This is the content of my first blog post using Chukfi CMS.",
  "published": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

### **PATCH /api/v1/collections/:slug/documents/:id**

Update a document.

**Request Body:**

```json
{
  "title": "My Updated Blog Post",
  "published": true
}
```

**Response:** `200 OK`

```json
{
  "id": "2",
  "title": "My Updated Blog Post",
  "content": "This is the content of my first blog post using Chukfi CMS.",
  "published": true,
  "updatedAt": "2024-01-01T12:30:00Z"
}
```

### **DELETE /api/v1/collections/:slug/documents/:id**

Delete a document.

**Response:** `204 No Content`

## 📁 Media API

Manage file uploads and media library.

### **GET /api/v1/media**

List media files.

**Query Parameters:**

- `limit`, `offset`, `page`: Pagination
- `sort`: Sort by `name`, `size`, `createdAt`
- `search`: Search by filename
- `type`: Filter by MIME type (`image`, `video`, `document`)
- `extension`: Filter by file extension

**Example:**

```bash
GET /api/v1/media?type=image&sort=-createdAt&limit=20
Authorization: Bearer ACCESS_TOKEN
```

**Response:** `200 OK`

```json
{
  "data": [
    {
      "id": "1",
      "filename": "hero-image.jpg",
      "originalName": "Hero Image.jpg",
      "mimeType": "image/jpeg",
      "size": 1048576,
      "url": "/media/hero-image.jpg",
      "thumbnailUrl": "/media/thumbnails/hero-image-thumb.jpg",
      "width": 1920,
      "height": 1080,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 25,
    "count": 20,
    "page": 1,
    "pages": 2,
    "limit": 20,
    "offset": 0
  }
}
```

### **POST /api/v1/media**

Upload a new file.

**Request:** Multipart form data

```bash
curl -X POST http://localhost:8080/api/v1/media \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -F "file=@/path/to/image.jpg" \
  -F "alt=Hero image for homepage"
```

**Response:** `201 Created`

```json
{
  "id": "2",
  "filename": "image-123.jpg",
  "originalName": "image.jpg",
  "mimeType": "image/jpeg",
  "size": 2048576,
  "url": "/media/image-123.jpg",
  "thumbnailUrl": "/media/thumbnails/image-123-thumb.jpg",
  "alt": "Hero image for homepage",
  "width": 2560,
  "height": 1440,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### **GET /api/v1/media/:id**

Get media file details.

### **PATCH /api/v1/media/:id**

Update media file metadata.

**Request Body:**

```json
{
  "alt": "Updated alt text",
  "caption": "Image caption text"
}
```

### **DELETE /api/v1/media/:id**

Delete a media file.

**Response:** `204 No Content`

## 🔍 System API

System health and information endpoints.

### **GET /health**

Health check endpoint (no authentication required).

**Response:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z",
  "version": "0.1.1",
  "database": "connected",
  "uptime": "2h 15m 30s"
}
```

### **GET /api/v1/system/info**

Get system information (admin only).

**Response:** `200 OK`

```json
{
  "version": "0.1.1",
  "goVersion": "go1.21.0",
  "buildTime": "2024-01-01T10:00:00Z",
  "environment": "development",
  "database": {
    "type": "sqlite",
    "version": "3.42.0"
  },
  "stats": {
    "totalUsers": 15,
    "totalCollections": 8,
    "totalDocuments": 342,
    "totalMedia": 127
  }
}
```

## 📊 Response Formats

### Success Responses

#### **Single Resource**

```json
{
  "id": "1",
  "name": "Resource Name",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

#### **Multiple Resources**

```json
{
  "data": [
    {
      "id": "1",
      "name": "Resource 1"
    },
    {
      "id": "2",
      "name": "Resource 2"
    }
  ],
  "pagination": {
    "total": 150,
    "count": 25,
    "page": 1,
    "pages": 6,
    "limit": 25,
    "offset": 0
  }
}
```

#### **Created Resource**

```json
{
  "id": "3",
  "name": "New Resource",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Error Responses

#### **400 Bad Request**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Email is required"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters"
      }
    ]
  }
}
```

#### **401 Unauthorized**

```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

#### **403 Forbidden**

```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions",
    "details": {
      "required": "collections.blog-posts.create",
      "provided": ["collections.blog-posts.read"]
    }
  }
}
```

#### **404 Not Found**

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found",
    "resource": "collection",
    "identifier": "invalid-slug"
  }
}
```

#### **409 Conflict**

```json
{
  "error": {
    "code": "CONFLICT",
    "message": "Resource already exists",
    "details": {
      "field": "email",
      "value": "user@example.com"
    }
  }
}
```

#### **422 Unprocessable Entity**

```json
{
  "error": {
    "code": "UNPROCESSABLE_ENTITY",
    "message": "Invalid data provided",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      }
    ]
  }
}
```

#### **500 Internal Server Error**

```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An internal server error occurred",
    "requestId": "req_123456789"
  }
}
```

## 📚 Common Patterns

### Pagination

All list endpoints support pagination:

**Query Parameters:**

- `limit`: Items per page (default: 25, max: 100)
- `offset`: Items to skip
- `page`: Page number (alternative to offset)

**Examples:**

```bash
# Get second page with 10 items per page
GET /api/v1/collections/blog-posts/documents?page=2&limit=10

# Skip first 20 items and get next 10
GET /api/v1/collections/blog-posts/documents?offset=20&limit=10
```

### Filtering

Filter resources using query parameters:

**Basic Filtering:**

```bash
# Equal to
GET /api/v1/collections/blog-posts/documents?published=true

# Not equal to
GET /api/v1/collections/blog-posts/documents?status[ne]=draft
```

**Numeric Filtering:**

```bash
# Greater than
GET /api/v1/collections/products/documents?price[gt]=100

# Less than or equal
GET /api/v1/collections/products/documents?price[lte]=1000

# Range
GET /api/v1/collections/products/documents?price[gte]=50&price[lte]=200
```

**Array Filtering:**

```bash
# In array
GET /api/v1/collections/blog-posts/documents?category[in]=tech,science

# Not in array
GET /api/v1/collections/blog-posts/documents?status[nin]=draft,archived
```

### Sorting

Sort resources using the `sort` parameter:

**Examples:**

```bash
# Sort by creation date (ascending)
GET /api/v1/collections/blog-posts/documents?sort=createdAt

# Sort by creation date (descending)
GET /api/v1/collections/blog-posts/documents?sort=-createdAt

# Multiple sort fields
GET /api/v1/collections/blog-posts/documents?sort=published,-createdAt
```

### Field Selection

Control which fields are returned:

**Examples:**

```bash
# Include only specific fields
GET /api/v1/collections/blog-posts/documents?fields=title,content,published

# Exclude specific fields
GET /api/v1/collections/blog-posts/documents?exclude=content,internalNotes
```

### Search

Full-text search across relevant fields:

**Examples:**

```bash
# Search in all searchable fields
GET /api/v1/collections/blog-posts/documents?search=javascript

# Combined with other filters
GET /api/v1/collections/blog-posts/documents?search=react&published=true
```

## 🔧 Rate Limiting _(Coming Soon)_

API endpoints will be rate limited to prevent abuse:

**Rate Limits:**

- **Authentication**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **File uploads**: 10 requests per minute per user
- **Search**: 20 requests per minute per user

**Headers:**

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640995200
```

## 📝 Code Examples

### JavaScript/Node.js

#### **Authentication and Basic Usage**

```javascript
class ChukfiCMSClient {
  constructor(baseURL = "http://localhost:8080/api/v1") {
    this.baseURL = baseURL;
    this.accessToken = null;
    this.refreshToken = null;
  }

  async login(email, password) {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.access_token;
      this.refreshToken = data.refresh_token;
      return data.user;
    }
    throw new Error("Login failed");
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      await this.refreshAccessToken();
      return this.request(endpoint, options);
    }

    return response.json();
  }

  async refreshAccessToken() {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: this.refreshToken }),
    });

    if (response.ok) {
      const data = await response.json();
      this.accessToken = data.access_token;
    }
  }

  // Collections
  async getCollections() {
    return this.request("/collections");
  }

  async getCollection(slug) {
    return this.request(`/collections/${slug}`);
  }

  // Documents
  async getDocuments(collectionSlug, params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/collections/${collectionSlug}/documents?${query}`);
  }

  async createDocument(collectionSlug, data) {
    return this.request(`/collections/${collectionSlug}/documents`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateDocument(collectionSlug, documentId, data) {
    return this.request(
      `/collections/${collectionSlug}/documents/${documentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      }
    );
  }

  async deleteDocument(collectionSlug, documentId) {
    return this.request(
      `/collections/${collectionSlug}/documents/${documentId}`,
      {
        method: "DELETE",
      }
    );
  }
}

// Usage example
async function example() {
  const client = new ChukfiCMSClient();

  // Login
  await client.login("admin@chukfi.com", "admin123");

  // Get blog posts
  const posts = await client.getDocuments("blog-posts", {
    published: true,
    sort: "-createdAt",
    limit: 10,
  });

  // Create new post
  const newPost = await client.createDocument("blog-posts", {
    title: "My New Post",
    content: "This is the content of my new post.",
    published: false,
  });

  console.log("Created post:", newPost);
}
```

### Python

#### **Basic Client**

```python
import requests
import json
from typing import Optional, Dict, Any

class ChukfiCMSClient:
    def __init__(self, base_url: str = 'http://localhost:8080/api/v1'):
        self.base_url = base_url
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.session = requests.Session()

    def login(self, email: str, password: str) -> Dict[str, Any]:
        response = self.session.post(
            f'{self.base_url}/auth/login',
            json={'email': email, 'password': password}
        )
        response.raise_for_status()

        data = response.json()
        self.access_token = data['access_token']
        self.refresh_token = data['refresh_token']

        return data['user']

    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f'{self.base_url}{endpoint}'
        headers = kwargs.pop('headers', {})

        if self.access_token:
            headers['Authorization'] = f'Bearer {self.access_token}'

        response = self.session.request(method, url, headers=headers, **kwargs)

        if response.status_code == 401:
            self._refresh_token()
            headers['Authorization'] = f'Bearer {self.access_token}'
            response = self.session.request(method, url, headers=headers, **kwargs)

        response.raise_for_status()
        return response.json() if response.text else {}

    def _refresh_token(self):
        response = self.session.post(
            f'{self.base_url}/auth/refresh',
            json={'refresh_token': self.refresh_token}
        )
        response.raise_for_status()

        data = response.json()
        self.access_token = data['access_token']

    # Collections
    def get_collections(self) -> Dict[str, Any]:
        return self._request('GET', '/collections')

    def get_collection(self, slug: str) -> Dict[str, Any]:
        return self._request('GET', f'/collections/{slug}')

    # Documents
    def get_documents(self, collection_slug: str, **params) -> Dict[str, Any]:
        return self._request('GET', f'/collections/{collection_slug}/documents', params=params)

    def create_document(self, collection_slug: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request('POST', f'/collections/{collection_slug}/documents', json=data)

    def update_document(self, collection_slug: str, document_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
        return self._request('PATCH', f'/collections/{collection_slug}/documents/{document_id}', json=data)

    def delete_document(self, collection_slug: str, document_id: str):
        return self._request('DELETE', f'/collections/{collection_slug}/documents/{document_id}')

# Usage example
def main():
    client = ChukfiCMSClient()

    # Login
    user = client.login('admin@chukfi.com', 'admin123')
    print(f'Logged in as: {user["email"]}')

    # Get published blog posts
    posts = client.get_documents('blog-posts', published=True, sort='-createdAt', limit=5)
    print(f'Found {posts["pagination"]["total"]} blog posts')

    # Create new post
    new_post = client.create_document('blog-posts', {
        'title': 'Python API Example',
        'content': 'This post was created using the Python client.',
        'published': False
    })
    print(f'Created post: {new_post["title"]}')

if __name__ == '__main__':
    main()
```

### cURL Examples

#### **Complete Workflow**

```bash
#!/bin/bash

# Configuration
API_BASE="http://localhost:8080/api/v1"
EMAIL="admin@chukfi.com"
PASSWORD="admin123"

# Login and get tokens
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

ACCESS_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.access_token')
echo "Access token: ${ACCESS_TOKEN:0:20}..."

# Get collections
echo -e "\nGetting collections..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$API_BASE/collections" | jq '.data[].name'

# Create a blog post
echo -e "\nCreating blog post..."
NEW_POST=$(curl -s -X POST "$API_BASE/collections/blog-posts/documents" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Automated Post",
    "content": "This post was created via cURL script.",
    "published": false
  }')

POST_ID=$(echo $NEW_POST | jq -r '.id')
echo "Created post with ID: $POST_ID"

# Update the post to publish it
echo -e "\nPublishing the post..."
curl -s -X PATCH "$API_BASE/collections/blog-posts/documents/$POST_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"published": true}' | jq '.title, .published'

# List published posts
echo -e "\nGetting published posts..."
curl -s -H "Authorization: Bearer $ACCESS_TOKEN" \
  "$API_BASE/collections/blog-posts/documents?published=true&fields=title,createdAt" \
  | jq '.data[] | {title, createdAt}'

echo -e "\nWorkflow completed!"
```

## 🚀 Next Steps

After mastering the REST API:

- 🏗️ **[Collections Guide](../guides/COLLECTIONS.md)** - Understand data structures behind the API
- 👥 **[Users & Permissions](../guides/USERS_PERMISSIONS.md)** - Learn about authentication and authorization
- 📁 **[Media Management](../guides/MEDIA.md)** - Handle file uploads and media API
- 🔧 **[Development Guide](../../DEVELOPMENT.md)** - Set up local development environment

## 💡 Best Practices

✅ **Always use HTTPS** in production environments  
✅ **Store tokens securely** and implement proper refresh logic  
✅ **Handle rate limits** with exponential backoff  
✅ **Validate responses** and implement proper error handling  
✅ **Use field selection** to minimize bandwidth usage  
✅ **Implement pagination** for large data sets  
✅ **Cache responses** appropriately to reduce API calls  
✅ **Log API errors** for debugging and monitoring
