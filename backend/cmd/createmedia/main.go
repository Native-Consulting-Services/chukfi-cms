package main

import (
	"database/sql"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	sql := `
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    filename TEXT NOT NULL,
    original_name TEXT NOT NULL DEFAULT '',
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    url TEXT NOT NULL,
    uploaded_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
`
	
	if _, err := db.Exec(sql); err != nil {
		log.Fatal("Failed to create media table:", err)
	}
	
	log.Println("✓ Media table created successfully")
}
