# 👥 Users & Permissions Guide

Chukfi CMS implements a robust Role-Based Access Control (RBAC) system that allows you to manage user access with granular permissions. This guide covers user management, role creation, and permission configuration.

## 🔐 Overview of RBAC System

Chukfi CMS uses a **Role-Based Access Control** system with three main components:

- **Users**: Individual accounts with authentication credentials
- **Roles**: Named permission sets (Admin, Editor, Viewer, etc.)
- **Permissions**: Specific actions users can perform on resources

### Key Benefits

✅ **Scalable Security**: Assign roles instead of individual permissions  
✅ **Flexible Access**: Fine-tune what users can access  
✅ **Audit Trail**: Track who has access to what  
✅ **Easy Management**: Add/remove permissions by changing roles  
✅ **Multi-Tenant Ready**: Support multiple organizations

## 👤 User Management

### Default User Account

After installation, Chukfi CMS creates a default administrator:

```
Email: admin@chukfi.com
Password: admin123
Role: Administrator
```

⚠️ **Security Note**: Change the default password immediately in production!

### Creating Users

#### **Method 1: Admin Dashboard**

1. **Navigate to Users**

   - Open admin dashboard: http://localhost:4321/admin
   - Click "Users" in the sidebar

2. **Click "Create User"**

3. **Fill in User Details**

   ```
   Email: editor@example.com
   Password: secure-password-123
   First Name: Jane
   Last Name: Editor
   Role: Editor
   Status: Active
   ```

4. **Set Initial Permissions** (optional)

   - Override role permissions if needed
   - Set collection-specific access
   - Configure expiration dates

5. **Save User**

#### **Method 2: API Creation**

```bash
curl -X POST http://localhost:8080/api/v1/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "email": "editor@example.com",
    "password": "secure-password-123",
    "firstName": "Jane",
    "lastName": "Editor",
    "role": "editor",
    "status": "active"
  }'
```

### User Properties

#### **Required Fields**

- **Email**: Unique identifier for login
- **Password**: Hashed and stored securely
- **Role**: Primary role assignment

#### **Optional Fields**

- **First Name**: User's first name
- **Last Name**: User's last name
- **Avatar**: Profile picture (integration with media library)
- **Bio**: User description or notes
- **Status**: Active, inactive, suspended
- **Last Login**: Automatically tracked
- **Email Verified**: Email verification status _(coming soon)_

#### **System Fields**

- **ID**: Unique user identifier
- **Created At**: Account creation timestamp
- **Updated At**: Last modification timestamp
- **Password Reset Token**: For password recovery _(coming soon)_

## 🏷️ Role System

Chukfi CMS comes with predefined roles that cover common use cases:

### Built-in Roles

#### **Administrator**

- **Full system access**: Can do everything
- **User management**: Create, modify, delete users
- **Role management**: Create and modify roles
- **System settings**: Configure global settings
- **Collection management**: Create, modify, delete collections
- **Content management**: Full CRUD on all content

```json
{
  "name": "Administrator",
  "slug": "admin",
  "permissions": ["*"],
  "description": "Full system access"
}
```

#### **Editor**

- **Content management**: Create, read, update, delete content
- **Media management**: Upload and manage media files
- **Collection access**: Use existing collections (no creation)
- **User access**: View other users (no modification)

```json
{
  "name": "Editor",
  "slug": "editor",
  "permissions": ["collections.*.documents.*", "media.*", "users.read"],
  "description": "Content creation and editing"
}
```

#### **Author**

- **Own content**: Create and edit own content only
- **Media upload**: Upload files for own content
- **Limited access**: Cannot modify other users' content
- **Read-only collections**: View collection schemas

```json
{
  "name": "Author",
  "slug": "author",
  "permissions": [
    "collections.*.documents.create",
    "collections.*.documents.read",
    "collections.*.documents.update[author=self]",
    "media.upload",
    "media.read[author=self]"
  ],
  "description": "Content authoring with limited access"
}
```

#### **Viewer**

- **Read-only access**: View published content only
- **No modification**: Cannot create, edit, or delete
- **Basic navigation**: Access admin dashboard for viewing
- **Public content**: Access to publicly available collections

```json
{
  "name": "Viewer",
  "slug": "viewer",
  "permissions": [
    "collections.*.documents.read[published=true]",
    "media.read[public=true]"
  ],
  "description": "Read-only access to published content"
}
```

### Creating Custom Roles

#### **Admin Dashboard**

1. **Navigate to Roles**

   - Go to Users → Roles in admin sidebar

2. **Click "Create Role"**

3. **Define Role Properties**

   ```
   Name: Content Manager
   Slug: content-manager
   Description: Manages content but not users
   ```

4. **Configure Permissions**

   - Select from available permission categories
   - Set collection-specific permissions
   - Define resource-level access

5. **Save Role**

#### **API Creation**

```bash
curl -X POST http://localhost:8080/api/v1/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Content Manager",
    "slug": "content-manager",
    "description": "Manages content but not users",
    "permissions": [
      "collections.*.read",
      "collections.blog-posts.*",
      "collections.pages.*",
      "media.*"
    ]
  }'
```

## 🔑 Permission System

Chukfi CMS uses a hierarchical permission system with specific syntax:

### Permission Format

```
resource.collection.action[condition]
```

**Components**:

- **Resource**: Top-level resource type (collections, users, media, etc.)
- **Collection**: Specific collection or wildcard (\*)
- **Action**: What can be done (create, read, update, delete, \*)
- **Condition**: Optional filtering condition

### Permission Examples

#### **Collection Permissions**

```bash
# Full access to all collections
collections.*

# Read-only access to all collections
collections.*.read

# Full access to blog posts only
collections.blog-posts.*

# Create and read blog posts
collections.blog-posts.create,collections.blog-posts.read

# Update own blog posts only
collections.blog-posts.update[author=self]

# Read published content only
collections.*.read[published=true]
```

#### **User Management Permissions**

```bash
# Full user management
users.*

# Read user information only
users.read

# Update own profile only
users.update[id=self]

# Create new users (admin function)
users.create
```

#### **Media Permissions**

```bash
# Full media access
media.*

# Upload media files
media.upload

# Access own uploaded files
media.read[author=self]

# Access public media only
media.read[public=true]
```

#### **System Permissions**

```bash
# System administration
system.*

# Manage roles
roles.*

# View system settings
settings.read

# Backup system
backup.create
```

### Conditional Permissions

Conditional permissions allow fine-grained access control:

#### **Owner-based Conditions**

```bash
# User can only edit their own content
collections.blog-posts.update[author=self]

# User can only delete their own media
media.delete[author=self]

# User can view their own profile
users.read[id=self]
```

#### **Status-based Conditions**

```bash
# Only published content
collections.*.read[published=true]

# Only active users
users.read[status=active]

# Only public media
media.read[public=true]
```

#### **Time-based Conditions** _(Coming Soon)_

```bash
# Content published in last 30 days
collections.*.read[published_at>-30d]

# Future scheduled content
collections.*.read[publish_at>now]
```

## 🛡️ Security Features

### Password Security

#### **Password Requirements**

- **Minimum length**: 8 characters
- **Complexity**: Mix of letters, numbers, symbols
- **No common passwords**: Dictionary check
- **No personal info**: No email/name in password

#### **Password Hashing**

- **Algorithm**: bcrypt with salt
- **Cost factor**: 12 (configurable)
- **No plaintext storage**: Passwords never stored in plain text

#### **Password Reset** _(Coming Soon)_

- **Secure tokens**: Cryptographically random reset tokens
- **Time limits**: Reset links expire after 1 hour
- **Single use**: Tokens invalidated after use

### JWT Authentication

#### **Token Structure**

```json
{
  "user_id": "123",
  "email": "user@example.com",
  "role": "editor",
  "permissions": ["collections.blog-posts.*"],
  "exp": 1640995200,
  "iat": 1640991600
}
```

#### **Token Types**

- **Access Token**: Short-lived (15 minutes) for API requests
- **Refresh Token**: Long-lived (7 days) for token renewal
- **Remember Me**: Extended refresh token (30 days) _(coming soon)_

#### **Token Security**

- **HMAC signing**: Tokens signed with secret key
- **Expiration checks**: Automatic token expiration
- **Revocation support**: Blacklist compromised tokens _(coming soon)_

### Session Management

#### **Security Headers**

```bash
# CSRF Protection
X-CSRF-Token: required-for-state-changing-operations

# Content Security Policy
Content-Security-Policy: default-src 'self'

# Secure Cookies
Set-Cookie: refresh_token=...; HttpOnly; Secure; SameSite=Strict
```

#### **Rate Limiting** _(Coming Soon)_

```bash
# Login attempts
POST /auth/login: 5 attempts per 15 minutes per IP

# Password reset
POST /auth/reset: 3 attempts per hour per email

# API requests
GET /api/*: 100 requests per minute per user
```

## 🎯 Common Permission Scenarios

### Scenario 1: Blog Management Team

#### **Chief Editor Role**

```json
{
  "name": "Chief Editor",
  "permissions": [
    "collections.blog-posts.*",
    "collections.authors.*",
    "collections.categories.*",
    "users.read",
    "users.update[role=author]",
    "media.*"
  ]
}
```

#### **Blog Writer Role**

```json
{
  "name": "Blog Writer",
  "permissions": [
    "collections.blog-posts.create",
    "collections.blog-posts.read",
    "collections.blog-posts.update[author=self]",
    "collections.authors.read",
    "collections.categories.read",
    "media.upload",
    "media.read[author=self]"
  ]
}
```

### Scenario 2: E-commerce Team

#### **Store Manager Role**

```json
{
  "name": "Store Manager",
  "permissions": [
    "collections.products.*",
    "collections.categories.*",
    "collections.orders.read",
    "collections.customers.read",
    "media.*"
  ]
}
```

#### **Product Coordinator Role**

```json
{
  "name": "Product Coordinator",
  "permissions": [
    "collections.products.create",
    "collections.products.read",
    "collections.products.update",
    "collections.categories.read",
    "media.upload",
    "media.read"
  ]
}
```

### Scenario 3: Agency Multi-Client

#### **Client Administrator Role**

```json
{
  "name": "Client Admin",
  "permissions": [
    "collections.pages.*[client=self]",
    "collections.posts.*[client=self]",
    "users.read[client=self]",
    "users.create[client=self]",
    "media.*[client=self]"
  ]
}
```

## 🔧 Managing Permissions

### Checking User Permissions

#### **Admin Dashboard**

1. Go to Users → Select User
2. View "Permissions" tab
3. See effective permissions (role + overrides)
4. Test specific permission scenarios

#### **API Permission Check**

```bash
curl -X GET http://localhost:8080/api/v1/auth/permissions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Response
{
  "permissions": [
    "collections.blog-posts.*",
    "media.upload",
    "users.read"
  ],
  "role": "editor",
  "effective_permissions": {
    "collections": {
      "blog-posts": ["create", "read", "update", "delete"]
    },
    "media": ["upload", "read"],
    "users": ["read"]
  }
}
```

### Permission Inheritance

#### **Role-based Inheritance**

```
User → Role → Permissions
```

#### **Permission Overrides**

```json
{
  "user_id": "123",
  "base_role": "editor",
  "permission_overrides": {
    "add": ["collections.products.read"],
    "remove": ["collections.blog-posts.delete"]
  }
}
```

#### **Temporary Permissions** _(Coming Soon)_

```json
{
  "user_id": "123",
  "temporary_permissions": [
    {
      "permission": "collections.products.*",
      "expires_at": "2024-01-01T00:00:00Z",
      "granted_by": "admin_user_456"
    }
  ]
}
```

### Permission Testing

#### **Test Permission Scenarios**

```bash
# Test if user can create blog posts
curl -X POST http://localhost:8080/api/v1/auth/check \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{"permission": "collections.blog-posts.create"}'

# Response
{
  "allowed": true,
  "reason": "User has editor role with collections.blog-posts.* permission"
}
```

#### **Bulk Permission Check**

```bash
curl -X POST http://localhost:8080/api/v1/auth/check-bulk \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{
    "permissions": [
      "collections.blog-posts.create",
      "collections.products.delete",
      "users.create"
    ]
  }'

# Response
{
  "results": [
    {"permission": "collections.blog-posts.create", "allowed": true},
    {"permission": "collections.products.delete", "allowed": false},
    {"permission": "users.create", "allowed": false}
  ]
}
```

## 🔒 Security Best Practices

### Role Design

#### **Principle of Least Privilege**

✅ **Give minimum required permissions**  
✅ **Start restrictive, expand as needed**  
✅ **Regular permission audits**  
❌ **Avoid overly broad permissions like `*`**

#### **Role Separation**

✅ **Separate content roles from admin roles**  
✅ **Create specific roles for specific tasks**  
✅ **Avoid mixing unrelated permissions**  
❌ **Don't create overly complex role hierarchies**

### User Management

#### **Account Security**

✅ **Enforce strong passwords**  
✅ **Regular access reviews**  
✅ **Disable unused accounts**  
✅ **Monitor login activity**  
❌ **Don't share accounts between people**

#### **Onboarding/Offboarding**

✅ **Provision accounts with appropriate roles**  
✅ **Review permissions during role changes**  
✅ **Immediately disable accounts when people leave**  
✅ **Regular cleanup of old accounts**

### API Security

#### **Token Management**

✅ **Short-lived access tokens**  
✅ **Secure refresh token storage**  
✅ **Token rotation on sensitive operations**  
❌ **Don't log tokens in application logs**

#### **Request Validation**

✅ **Validate all permissions on every request**  
✅ **Log security-relevant events**  
✅ **Rate limit authentication endpoints**  
✅ **Use HTTPS in production**

## 🔍 Troubleshooting Permissions

### Common Issues

#### **User Can't Access Content**

**Symptoms**: 403 Forbidden errors, empty content lists

**Solutions**:

1. **Check user role**: Verify user has appropriate role assigned
2. **Review permissions**: Ensure role has required permissions
3. **Check conditions**: Verify conditional permissions (published=true, author=self)
4. **Token validity**: Ensure JWT token is valid and not expired

```bash
# Debug: Check user's effective permissions
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/auth/permissions

# Debug: Test specific permission
curl -X POST -H "Authorization: Bearer TOKEN" \
  -d '{"permission":"collections.blog-posts.read"}' \
  http://localhost:8080/api/v1/auth/check
```

#### **Permission Changes Not Taking Effect**

**Symptoms**: Old permissions still active after role changes

**Solutions**:

1. **Token refresh**: User may need to log out and back in
2. **Cache clearing**: Clear any permission caches
3. **Role propagation**: Ensure role changes are saved properly
4. **Browser cache**: Clear browser cache and cookies

#### **Admin Locked Out**

**Symptoms**: Admin user can't access system

**Solutions**:

1. **Database direct access**:

   ```bash
   # Reset admin role via database
   cd backend/data
   sqlite3 chukfi.db
   UPDATE users SET role = 'admin' WHERE email = 'admin@chukfi.com';
   ```

2. **Create emergency admin**:
   ```bash
   # Use migration or seed script to create new admin
   go run cmd/create-admin/main.go
   ```

### Debug Tools

#### **Permission Debugging API**

```bash
# Get detailed permission breakdown
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8080/api/v1/debug/permissions

# Response includes:
{
  "user_id": "123",
  "role": "editor",
  "base_permissions": [...],
  "permission_overrides": [...],
  "effective_permissions": [...],
  "denied_permissions": [...],
  "permission_source": {
    "collections.blog-posts.read": "role:editor"
  }
}
```

#### **Audit Logging** _(Coming Soon)_

```bash
# View permission-related events
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8080/api/v1/audit/permissions?user_id=123

# View failed permission checks
curl -H "Authorization: Bearer ADMIN_TOKEN" \
  http://localhost:8080/api/v1/audit/permissions?result=denied
```

## 🚀 Advanced Features _(Coming Soon)_

### Multi-Tenant Permissions

- **Organization-level isolation**
- **Cross-tenant role inheritance**
- **Tenant-specific permission overrides**

### Dynamic Permissions

- **Time-based permissions** (business hours only)
- **Location-based permissions** (IP restrictions)
- **Context-based permissions** (device type, user agent)

### Permission Workflows

- **Approval workflows** for sensitive operations
- **Temporary elevated permissions**
- **Permission request system**

### Advanced Audit

- **Real-time permission monitoring**
- **Permission usage analytics**
- **Compliance reporting**

## 🚀 Next Steps

After mastering users and permissions:

- 🏗️ **[Collections Guide](COLLECTIONS.md)** - Design your content structure with appropriate permissions
- 📁 **[Media Management](MEDIA.md)** - Control file access with media permissions
- 🔌 **[REST API Reference](../api/REST_API.md)** - Understand authentication headers and permission checks
- 🎨 **[Admin Dashboard](ADMIN_DASHBOARD.md)** - Navigate permission-aware interfaces

## 💡 Pro Tips

✅ **Test permissions thoroughly** before going live  
✅ **Document your role structure** for team understanding  
✅ **Regular permission audits** prevent security drift  
✅ **Use descriptive role names** that explain their purpose  
✅ **Start with built-in roles** and customize as needed  
✅ **Monitor failed permission attempts** for security insights
