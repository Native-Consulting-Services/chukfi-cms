-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    display_name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id TEXT PRIMARY KEY,
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

-- Insert default admin role
INSERT OR IGNORE INTO roles (id, name, description) 
VALUES ('admin-role-id', 'Admin', 'Full access to all system functionality');

-- Insert or replace admin user (password: admin123)
INSERT OR REPLACE INTO users (id, email, password_hash, display_name, created_at, updated_at)
VALUES (
    'admin-user-id',
    'admin@chukfi.com',
    '$2a$14$vAvE/LgiKxrECFOf7dy0q.2FJ8EEl9Gqc6tBdbya/X6Z/38PozM6a',
    'Admin User',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Assign admin role to admin user
INSERT OR IGNORE INTO user_roles (user_id, role_id)
VALUES ('admin-user-id', 'admin-role-id');
