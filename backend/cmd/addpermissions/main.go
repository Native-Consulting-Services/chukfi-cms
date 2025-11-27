package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"

	_ "modernc.org/sqlite"
)

func main() {
	dbPath := "./data/chukfi.db"
	
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	// Read SQL file
	sqlBytes, err := os.ReadFile("add_permissions_table.sql")
	if err != nil {
		log.Fatal("Failed to read SQL file:", err)
	}

	// Execute SQL
	_, err = db.Exec(string(sqlBytes))
	if err != nil {
		log.Fatal("Failed to execute SQL:", err)
	}

	fmt.Println("✅ Permissions table created successfully!")
	
	// Verify table exists
	var tableName string
	err = db.QueryRow("SELECT name FROM sqlite_master WHERE type='table' AND name='permissions'").Scan(&tableName)
	if err != nil {
		log.Fatal("Failed to verify table:", err)
	}
	
	fmt.Println("✅ Verified: permissions table exists")
}
