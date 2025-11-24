# 🏗️ Collections Guide

Collections are the foundation of Chukfi CMS content management. They define the structure and behavior of your content types, similar to database tables or content types in other CMS platforms.

## 📚 What are Collections?

A **Collection** is a content type definition that specifies:

- **Structure**: What fields your content has (title, body, author, etc.)
- **Validation**: Required fields, data types, and constraints
- **Behavior**: Permissions, lifecycle hooks, and relationships
- **API**: Automatic REST endpoints for CRUD operations

Think of collections as **blueprints** for your content. Once you create a collection, you can create multiple **documents** (individual pieces of content) within that collection.

### Common Collection Examples

- **Blog Posts**: Title, content, author, publish date, tags
- **Products**: Name, description, price, images, categories
- **Pages**: Title, content, slug, meta description
- **Authors**: Name, bio, avatar, contact information
- **Categories**: Name, description, parent category

## 🎯 Creating Collections

### Method 1: Admin Dashboard (Recommended)

1. **Navigate to Collections**

   - Open the admin dashboard: http://localhost:4321/admin
   - Click "Collections" in the sidebar

2. **Click "Create Collection"**

3. **Basic Information**

   ```
   Name: Blog Posts
   Slug: blog-posts (auto-generated, but editable)
   Description: Articles and blog content for the website
   ```

4. **Configure Settings**

   - **Permissions**: Who can read/write this collection
   - **Enable Drafts**: Allow draft/published states
   - **Enable Versioning**: Track content history
   - **Soft Delete**: Move to trash instead of permanent deletion

5. **Add Fields** (see Field Types section below)

6. **Save Collection**

### Method 2: API Creation

```bash
curl -X POST http://localhost:8080/api/v1/collections \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Blog Posts",
    "slug": "blog-posts",
    "description": "Articles and blog content",
    "fields": [
      {
        "name": "title",
        "type": "text",
        "label": "Title",
        "required": true
      },
      {
        "name": "content",
        "type": "textarea",
        "label": "Content",
        "required": true
      }
    ]
  }'
```

## 📋 Field Types

Chukfi CMS supports various field types for different content needs:

### Text Fields

#### **Text**

- **Use for**: Short strings (titles, names, URLs)
- **Max length**: 255 characters
- **Validation**: Required, min/max length, regex patterns

```json
{
  "name": "title",
  "type": "text",
  "label": "Title",
  "required": true,
  "maxLength": 100,
  "placeholder": "Enter a compelling title..."
}
```

#### **Textarea**

- **Use for**: Long text content (descriptions, articles)
- **Features**: Multi-line input, character counting
- **Validation**: Min/max length

```json
{
  "name": "content",
  "type": "textarea",
  "label": "Content",
  "required": true,
  "rows": 10,
  "maxLength": 5000
}
```

#### **Rich Text** _(Coming Soon)_

- **Use for**: Formatted content with HTML
- **Features**: WYSIWYG editor, markdown support
- **Output**: HTML or markdown

### Numeric Fields

#### **Number**

- **Use for**: Integers, prices, quantities, ratings
- **Validation**: Min/max values, step increments

```json
{
  "name": "price",
  "type": "number",
  "label": "Price",
  "min": 0,
  "max": 10000,
  "step": 0.01
}
```

### Selection Fields

#### **Boolean**

- **Use for**: On/off switches, yes/no questions
- **Display**: Checkbox or toggle switch

```json
{
  "name": "published",
  "type": "boolean",
  "label": "Published",
  "default": false
}
```

#### **Select** _(Coming Soon)_

- **Use for**: Predefined options (categories, status)
- **Options**: Single or multiple selection

```json
{
  "name": "status",
  "type": "select",
  "label": "Status",
  "options": ["draft", "published", "archived"],
  "default": "draft"
}
```

### Date & Time Fields _(Coming Soon)_

#### **Date**

- **Use for**: Publication dates, events, deadlines
- **Format**: ISO 8601 date strings

#### **DateTime**

- **Use for**: Timestamps, scheduled content
- **Format**: Full ISO 8601 datetime

### Relationship Fields _(Coming Soon)_

#### **Relationship**

- **Use for**: Links between collections
- **Types**: One-to-one, one-to-many, many-to-many

```json
{
  "name": "author",
  "type": "relationship",
  "label": "Author",
  "relationTo": "authors",
  "relationshipType": "one-to-one"
}
```

### Media Fields _(Coming Soon)_

#### **Upload**

- **Use for**: Images, documents, videos
- **Features**: Drag-and-drop, file validation
- **Integration**: Connects to media library

## ⚙️ Collection Configuration

### Basic Settings

#### **Name & Slug**

- **Name**: Human-readable collection name (e.g., "Blog Posts")
- **Slug**: URL-safe identifier (e.g., "blog-posts")
- **Description**: Optional description for documentation

#### **Timestamps**

- **Created At**: Automatically added timestamp
- **Updated At**: Automatically updated timestamp
- **Custom timestamps**: Add your own date fields

### Advanced Settings

#### **Draft/Published States**

```json
{
  "enableDrafts": true,
  "publishedField": "published",
  "defaultStatus": "draft"
}
```

**Benefits**:

- Content can be saved without publishing
- Preview drafts before going live
- Editorial workflow support

#### **Soft Delete**

```json
{
  "enableSoftDelete": true,
  "deletedField": "deleted_at"
}
```

**Benefits**:

- Content moves to "trash" instead of permanent deletion
- Ability to restore accidentally deleted content
- Audit trail preservation

#### **Versioning** _(Coming Soon)_

```json
{
  "enableVersioning": true,
  "maxVersions": 10
}
```

**Benefits**:

- Track all changes to content
- Revert to previous versions
- Compare version differences

## 🔒 Permissions & Access Control

Collections inherit the RBAC (Role-Based Access Control) system:

### Collection-Level Permissions

#### **Read Permissions**

- **Public**: Anyone can read
- **Authenticated**: Logged-in users only
- **Role-based**: Specific roles (Admin, Editor, Viewer)

#### **Write Permissions**

- **Admin only**: Only administrators can modify
- **Editor+**: Editors and administrators
- **Custom roles**: Define your own permission sets

#### **Field-Level Permissions** _(Coming Soon)_

- Hide sensitive fields from certain users
- Read-only fields for specific roles
- Conditional field visibility

### Example Permission Configuration

```json
{
  "permissions": {
    "read": ["public"],
    "create": ["admin", "editor"],
    "update": ["admin", "editor", "author"],
    "delete": ["admin"]
  }
}
```

## 🔄 Lifecycle Hooks _(Coming Soon)_

Lifecycle hooks allow you to run custom logic when content changes:

### Available Hooks

#### **Before Hooks**

- `beforeCreate`: Run before document creation
- `beforeUpdate`: Run before document updates
- `beforeDelete`: Run before document deletion

#### **After Hooks**

- `afterCreate`: Run after document creation
- `afterUpdate`: Run after document updates
- `afterDelete`: Run after document deletion

### Example Use Cases

```javascript
// Send notification when blog post is published
afterUpdate: async (doc, operation) => {
  if (doc.published && !operation.previousDoc.published) {
    await sendNotification(`New blog post: ${doc.title}`);
  }
};

// Auto-generate slug from title
beforeCreate: async (doc) => {
  if (!doc.slug && doc.title) {
    doc.slug = generateSlug(doc.title);
  }
};

// Audit logging
afterUpdate: async (doc, operation) => {
  await logAuditEvent({
    action: "update",
    collection: "blog-posts",
    documentId: doc.id,
    userId: operation.userId,
    changes: operation.changes,
  });
};
```

## 🔌 Automatic API Generation

When you create a collection, Chukfi CMS automatically generates REST API endpoints:

### Generated Endpoints

#### **Collection Management**

```
GET    /api/v1/collections           # List all collections
POST   /api/v1/collections          # Create collection
GET    /api/v1/collections/:slug    # Get collection details
PATCH  /api/v1/collections/:slug    # Update collection
DELETE /api/v1/collections/:slug    # Delete collection
```

#### **Document Management**

```
GET    /api/v1/collections/:slug/documents       # List documents
POST   /api/v1/collections/:slug/documents      # Create document
GET    /api/v1/collections/:slug/documents/:id  # Get document
PATCH  /api/v1/collections/:slug/documents/:id  # Update document
DELETE /api/v1/collections/:slug/documents/:id  # Delete document
```

### Query Parameters

#### **Filtering**

```bash
# Filter by field values
GET /api/v1/collections/blog-posts/documents?published=true
GET /api/v1/collections/products/documents?price[gte]=100

# Text search
GET /api/v1/collections/blog-posts/documents?search=javascript
```

#### **Sorting**

```bash
# Sort by field (ascending)
GET /api/v1/collections/blog-posts/documents?sort=created_at

# Sort descending
GET /api/v1/collections/blog-posts/documents?sort=-created_at

# Multiple sort fields
GET /api/v1/collections/blog-posts/documents?sort=published,-created_at
```

#### **Pagination**

```bash
# Limit results
GET /api/v1/collections/blog-posts/documents?limit=10

# Skip results (offset)
GET /api/v1/collections/blog-posts/documents?limit=10&offset=20

# Page-based pagination
GET /api/v1/collections/blog-posts/documents?page=3&limit=10
```

#### **Field Selection**

```bash
# Select specific fields only
GET /api/v1/collections/blog-posts/documents?fields=title,content,published

# Exclude fields
GET /api/v1/collections/blog-posts/documents?exclude=content
```

## 🎯 Collection Best Practices

### Design Principles

#### **1. Single Responsibility**

Each collection should represent one type of content:

✅ **Good**:

- `blog-posts` for articles
- `authors` for author information
- `categories` for content categories

❌ **Avoid**:

- `content` for everything
- `misc` for random fields

#### **2. Descriptive Naming**

Use clear, descriptive names:

✅ **Good**:

- `product-reviews`
- `customer-testimonials`
- `event-registrations`

❌ **Avoid**:

- `stuff`
- `data`
- `items`

#### **3. Consistent Field Naming**

Use consistent naming across collections:

✅ **Good**:

- `title` (not `name` or `heading`)
- `content` (not `body` or `text`)
- `published_at` (consistent timestamp format)

#### **4. Logical Field Ordering**

Order fields by importance:

1. **Identifier fields**: title, name, slug
2. **Content fields**: description, content, body
3. **Metadata fields**: author, category, tags
4. **Status fields**: published, featured, status
5. **Timestamps**: created_at, updated_at

### Performance Considerations

#### **Field Limits**

- **Reasonable field count**: 10-20 fields per collection
- **Text field limits**: Set appropriate max lengths
- **Avoid huge content**: Use separate collections for large content

#### **Indexing** _(Future Feature)_

- **Index frequently queried fields**: published, created_at, author
- **Index search fields**: title, content (full-text search)
- **Avoid over-indexing**: Only index what you actually query

## 📝 Real-World Examples

### Blog CMS Collections

#### **Posts Collection**

```json
{
  "name": "Blog Posts",
  "slug": "posts",
  "description": "Blog articles and news content",
  "fields": [
    {
      "name": "title",
      "type": "text",
      "label": "Title",
      "required": true,
      "maxLength": 100
    },
    {
      "name": "slug",
      "type": "text",
      "label": "URL Slug",
      "required": true,
      "unique": true
    },
    {
      "name": "excerpt",
      "type": "textarea",
      "label": "Excerpt",
      "maxLength": 300
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
    },
    {
      "name": "featured",
      "type": "boolean",
      "label": "Featured Post",
      "default": false
    }
  ]
}
```

#### **Authors Collection**

```json
{
  "name": "Authors",
  "slug": "authors",
  "description": "Blog post authors and contributors",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Full Name",
      "required": true
    },
    {
      "name": "email",
      "type": "text",
      "label": "Email",
      "required": true,
      "unique": true
    },
    {
      "name": "bio",
      "type": "textarea",
      "label": "Biography",
      "maxLength": 500
    },
    {
      "name": "active",
      "type": "boolean",
      "label": "Active Author",
      "default": true
    }
  ]
}
```

### E-commerce Collections

#### **Products Collection**

```json
{
  "name": "Products",
  "slug": "products",
  "description": "Product catalog items",
  "fields": [
    {
      "name": "name",
      "type": "text",
      "label": "Product Name",
      "required": true
    },
    {
      "name": "sku",
      "type": "text",
      "label": "SKU",
      "required": true,
      "unique": true
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
      "name": "inventory",
      "type": "number",
      "label": "Inventory Count",
      "min": 0,
      "default": 0
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

## 🔧 Troubleshooting Collections

### Common Issues

#### **Collection Won't Save**

- **Check field validation**: Ensure all required fields are configured
- **Verify permissions**: User needs admin/editor role
- **Check field names**: Must be unique within collection
- **Review API errors**: Check browser console for detailed errors

#### **Documents Not Appearing**

- **Check permissions**: Verify read permissions for current user
- **Review filters**: Ensure no active filters hiding content
- **Check published status**: Unpublished drafts won't appear publicly
- **Verify API calls**: Check network requests for errors

#### **API Endpoints Not Working**

- **Collection slug**: Ensure using correct slug in URL
- **Authentication**: Check JWT token is valid and included
- **HTTP methods**: Ensure using correct method (GET, POST, etc.)
- **Content-Type**: Include `application/json` header for POST/PATCH

### Debug Tools

#### **API Testing**

```bash
# Test collection endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:8080/api/v1/collections/blog-posts

# Test document creation
curl -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Post","content":"Test content"}' \
  http://localhost:8080/api/v1/collections/blog-posts/documents
```

#### **Database Inspection**

```bash
# Open SQLite database
cd backend/data
sqlite3 chukfi.db

# List tables
.tables

# View collection schema
.schema collections

# Query collections
SELECT * FROM collections;
```

## 🚀 Next Steps

After mastering collections, explore these related topics:

- 👥 **[Users & Permissions](USERS_PERMISSIONS.md)** - Set up roles and access control
- 📁 **[Media Management](MEDIA.md)** - Handle file uploads and media library
- 🔌 **[REST API Reference](../api/REST_API.md)** - Complete API documentation
- 🎨 **[Admin Dashboard Guide](ADMIN_DASHBOARD.md)** - Navigate the interface efficiently

## 💡 Tips for Success

✅ **Start simple**: Begin with basic text and boolean fields  
✅ **Plan relationships**: Think about how collections connect  
✅ **Use validation**: Set required fields and constraints early  
✅ **Test the API**: Verify endpoints work as expected  
✅ **Document your schema**: Keep notes on field purposes and relationships
