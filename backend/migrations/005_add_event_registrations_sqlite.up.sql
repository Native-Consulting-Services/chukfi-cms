-- Event registrations table (SQLite version)
CREATE TABLE IF NOT EXISTS event_registrations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    event_id TEXT NOT NULL,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'confirmed',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    notes TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checked_in_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_event_registrations_event_id ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_user_id ON event_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);
CREATE INDEX IF NOT EXISTS idx_event_registrations_email ON event_registrations(email);
