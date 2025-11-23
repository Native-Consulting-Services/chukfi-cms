-- SQLite version of initial schema
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User roles junction table
CREATE TABLE IF NOT EXISTS user_roles (
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- Permissions table
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
    collection TEXT NOT NULL,
    can_create BOOLEAN DEFAULT 0,
    can_read BOOLEAN DEFAULT 0,
    can_update BOOLEAN DEFAULT 0,
    can_delete BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role_id, collection)
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    slug TEXT UNIQUE NOT NULL,
    label TEXT NOT NULL,
    schema TEXT NOT NULL DEFAULT '{}', -- JSON as TEXT in SQLite
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Documents table
CREATE TABLE IF NOT EXISTS documents (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    collection_id TEXT REFERENCES collections(id) ON DELETE CASCADE,
    data TEXT NOT NULL DEFAULT '{}', -- JSON as TEXT in SQLite
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    published_at DATETIME
);

-- Media table
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_collection ON permissions(collection);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_documents_collection_id ON documents(collection_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);

-- Insert default admin role
INSERT OR IGNORE INTO roles (id, name, description, created_at, updated_at) 
VALUES ('admin-role-id', 'Admin', 'Full access to all system functionality', datetime('now'), datetime('now'));

-- Insert default permissions for admin role
INSERT OR IGNORE INTO permissions (role_id, collection, can_create, can_read, can_update, can_delete, created_at, updated_at)
VALUES 
    ('admin-role-id', 'users', 1, 1, 1, 1, datetime('now'), datetime('now')),
    ('admin-role-id', 'roles', 1, 1, 1, 1, datetime('now'), datetime('now')),
    ('admin-role-id', 'collections', 1, 1, 1, 1, datetime('now'), datetime('now')),
    ('admin-role-id', 'documents', 1, 1, 1, 1, datetime('now'), datetime('now')),
    ('admin-role-id', 'media', 1, 1, 1, 1, datetime('now'), datetime('now'));

-- Insert default admin user (password: admin123)
INSERT OR IGNORE INTO users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
    'admin-user-id',
    'admin@chukfi.com',
    '$2a$14$7Z3.6OGcYKqY1.Qr0Jd.O.XJ3QVoZLGKE.K8Jz2nKb1yBvO7LZB1C', -- admin123
    'Admin User',
    datetime('now'),
    datetime('now')
);

-- Assign admin role to admin user
INSERT OR IGNORE INTO user_roles (user_id, role_id, created_at)
VALUES ('admin-user-id', 'admin-role-id', datetime('now'));