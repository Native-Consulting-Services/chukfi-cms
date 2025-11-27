package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	// Open database connection
	dbPath := "./data/chukfi.db"
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}
	defer db.Close()

	log.Printf("Connected to database: %s", dbPath)

	// Check if columns already exist
	var avatarExists, nameExists bool

	rows, err := db.Query("PRAGMA table_info(users)")
	if err != nil {
		log.Fatalf("Failed to get table info: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var cid int
		var name, dataType string
		var notNull, pk int
		var dfltValue sql.NullString
		
		err := rows.Scan(&cid, &name, &dataType, &notNull, &dfltValue, &pk)
		if err != nil {
			log.Fatalf("Failed to scan row: %v", err)
		}

		if name == "avatar" {
			avatarExists = true
		}
		if name == "name" {
			nameExists = true
		}
	}

	// Add avatar column if it doesn't exist
	if !avatarExists {
		_, err = db.Exec("ALTER TABLE users ADD COLUMN avatar TEXT")
		if err != nil {
			log.Fatalf("Failed to add avatar column: %v", err)
		}
		log.Println("✅ Added avatar column to users table")
	} else {
		log.Println("ℹ️  Avatar column already exists")
	}

	// Add name column if it doesn't exist
	if !nameExists {
		_, err = db.Exec("ALTER TABLE users ADD COLUMN name TEXT")
		if err != nil {
			log.Fatalf("Failed to add name column: %v", err)
		}
		log.Println("✅ Added name column to users table")

		// Copy display_name to name
		_, err = db.Exec("UPDATE users SET name = display_name WHERE name IS NULL")
		if err != nil {
			log.Fatalf("Failed to copy display_name to name: %v", err)
		}
		log.Println("✅ Copied display_name to name")
	} else {
		log.Println("ℹ️  Name column already exists")
	}

	fmt.Println("\n✅ Migration completed successfully!")
}
