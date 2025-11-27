-- Add uploaded_by and updated_at columns to media table
ALTER TABLE media ADD COLUMN uploaded_by TEXT;
ALTER TABLE media ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP;

-- Create index for uploaded_by
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
