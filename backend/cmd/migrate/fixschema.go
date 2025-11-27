package main

import (
	"database/sql"
	"fmt"
	"log"

	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Add missing columns
	_, err = db.Exec("ALTER TABLE users ADD COLUMN created_at DATETIME")
	if err != nil {
		fmt.Printf("Warning adding created_at: %v (may already exist)\n", err)
	} else {
		fmt.Println("✓ Added created_at to users")
		db.Exec("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
	}

	_, err = db.Exec("ALTER TABLE users ADD COLUMN updated_at DATETIME")
	if err != nil {
		fmt.Printf("Warning adding updated_at: %v (may already exist)\n", err)
	} else {
		fmt.Println("✓ Added updated_at to users")
		db.Exec("UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL")
	}

	_, err = db.Exec("ALTER TABLE roles ADD COLUMN created_at DATETIME")
	if err != nil {
		fmt.Printf("Warning adding created_at to roles: %v (may already exist)\n", err)
	} else {
		fmt.Println("✓ Added created_at to roles")
		db.Exec("UPDATE roles SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL")
	}

	_, err = db.Exec("ALTER TABLE roles ADD COLUMN updated_at DATETIME")
	if err != nil {
		fmt.Printf("Warning adding updated_at to roles: %v (may already exist)\n", err)
	} else {
		fmt.Println("✓ Added updated_at to roles")
		db.Exec("UPDATE roles SET updated_at = CURRENT_TIMESTAMP WHERE updated_at IS NULL")
	}

	fmt.Println("\n✓ Schema updated!")
}
