-- Remove uploaded_by and updated_at columns from media table
DROP INDEX IF EXISTS idx_media_uploaded_by;

-- SQLite doesn't support DROP COLUMN, so we need to recreate the table
CREATE TABLE media_backup (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO media_backup SELECT id, filename, original_name, mime_type, size, url, created_at FROM media;

DROP TABLE media;

ALTER TABLE media_backup RENAME TO media;

CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
