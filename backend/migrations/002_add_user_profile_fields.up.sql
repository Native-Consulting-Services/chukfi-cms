-- Add avatar column to users table
ALTER TABLE users ADD COLUMN avatar TEXT;

-- Rename display_name to name for consistency
-- SQLite doesn't support RENAME COLUMN directly in older versions
-- So we'll add a new name column and copy data
ALTER TABLE users ADD COLUMN name TEXT;

-- Copy display_name to name
UPDATE users SET name = display_name WHERE name IS NULL;

-- Now we can't drop display_name in SQLite easily, so we'll just keep both for now
-- Applications should use 'name' going forward
