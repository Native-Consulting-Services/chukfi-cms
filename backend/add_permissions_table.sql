-- Add permissions table if it doesn't exist
CREATE TABLE IF NOT EXISTS permissions (
    id TEXT PRIMARY KEY,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_permissions_role_id ON permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_collection ON permissions(collection);
