package main

import (
	"database/sql"
	"fmt"
	"log"

	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Query user
	var email, hash, displayName string
	err = db.QueryRow("SELECT email, password_hash, display_name FROM users WHERE email = ?", "admin@chukfi.com").Scan(&email, &hash, &displayName)
	if err != nil {
		log.Fatal("User not found:", err)
	}

	fmt.Printf("Email: %s\n", email)
	fmt.Printf("Display Name: %s\n", displayName)
	fmt.Printf("Password Hash: %s\n", hash)

	// Test password
	password := "admin123"
	err = bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	if err != nil {
		fmt.Printf("\n❌ Password 'admin123' does NOT match hash\n")
		fmt.Printf("Error: %v\n", err)
	} else {
		fmt.Printf("\n✅ Password 'admin123' MATCHES hash!\n")
	}
}
