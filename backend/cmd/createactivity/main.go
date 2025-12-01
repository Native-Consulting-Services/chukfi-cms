package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Read and execute the migration
	content, err := os.ReadFile("migrations/004_add_activity_logs_sqlite.up.sql")
	if err != nil {
		log.Fatal("Failed to read migration file:", err)
	}

	fmt.Println("Creating activity_logs table...")
	
	// Execute the SQL
	_, err = db.Exec(string(content))
	if err != nil {
		log.Fatal("Failed to execute migration:", err)
	}

	fmt.Println("✓ activity_logs table created successfully")
	
	// Verify
	var count int
	db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='activity_logs'").Scan(&count)
	if count > 0 {
		fmt.Println("✓ Verified: table exists")
	}
}
