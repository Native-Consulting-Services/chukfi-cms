package main

import (
	"database/sql"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

func main() {
	// Connect
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Create tables
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS roles (
			id TEXT PRIMARY KEY,
			name TEXT UNIQUE NOT NULL,
			description TEXT,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal("Create roles table:", err)
	}
	fmt.Println("✓ Created roles table")

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS users (
			id TEXT PRIMARY KEY,
			email TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			display_name TEXT NOT NULL,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
			updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		log.Fatal("Create users table:", err)
	}
	fmt.Println("✓ Created users table")

	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS user_roles (
			user_id TEXT,
			role_id TEXT,
			PRIMARY KEY (user_id, role_id)
		)
	`)
	if err != nil {
		log.Fatal("Create user_roles table:", err)
	}
	fmt.Println("✓ Created user_roles table")

	// Insert role
	_, err = db.Exec("INSERT OR IGNORE INTO roles (id, name, description) VALUES (?, ?, ?)",
		"admin-role-id", "Admin", "Full access")
	if err != nil {
		log.Fatal("Insert role:", err)
	}
	fmt.Println("✓ Inserted admin role")

	// Generate hash
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), 14)
	if err != nil {
		log.Fatal(err)
	}

	// Insert user
	_, err = db.Exec("INSERT OR REPLACE INTO users (id, email, password_hash, display_name) VALUES (?, ?, ?, ?)",
		"admin-user-id", "admin@chukfi.com", string(hash), "Admin User")
	if err != nil {
		log.Fatal("Insert user:", err)
	}
	fmt.Println("✓ Inserted admin user")

	// Assign role
	_, err = db.Exec("INSERT OR IGNORE INTO user_roles (user_id, role_id) VALUES (?, ?)",
		"admin-user-id", "admin-role-id")
	if err != nil {
		log.Fatal("Assign role:", err)
	}
	fmt.Println("✓ Assigned admin role")

	fmt.Println("\n✓ Database setup complete!")
	fmt.Println("Login with: admin@chukfi.com / admin123")
}
