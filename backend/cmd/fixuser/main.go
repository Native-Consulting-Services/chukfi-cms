package main

import (
	"database/sql"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

func main() {
	// Connect to database
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Generate new hash for admin123
	password := "admin123"
	hash, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	if err != nil {
		log.Fatal(err)
	}

	// Update the admin user's password
	result, err := db.Exec("UPDATE users SET password_hash = ? WHERE email = ?", string(hash), "admin@chukfi.com")
	if err != nil {
		log.Fatal(err)
	}

	rows, _ := result.RowsAffected()
	fmt.Printf("✓ Updated admin user password (rows affected: %d)\n", rows)
	fmt.Printf("✓ Password hash: %s\n", string(hash))
	
	// Verify the user exists
	var email, displayName string
	err = db.QueryRow("SELECT email, display_name FROM users WHERE email = ?", "admin@chukfi.com").Scan(&email, &displayName)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Printf("✓ User confirmed: %s (%s)\n", email, displayName)
}
