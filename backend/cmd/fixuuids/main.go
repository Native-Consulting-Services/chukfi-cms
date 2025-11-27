package main

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
	_ "modernc.org/sqlite"
)

func main() {
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Generate proper UUIDs
	roleID := uuid.New().String()
	userID := uuid.New().String()

	// Delete old data
	db.Exec("DELETE FROM user_roles")
	db.Exec("DELETE FROM users")
	db.Exec("DELETE FROM roles")

	// Insert role with proper UUID
	_, err = db.Exec("INSERT INTO roles (id, name, description, created_at, updated_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		roleID, "Admin", "Full access")
	if err != nil {
		log.Fatal("Insert role:", err)
	}
	fmt.Printf("✓ Inserted admin role: %s\n", roleID)

	// Generate hash
	hash, err := bcrypt.GenerateFromPassword([]byte("admin123"), 14)
	if err != nil {
		log.Fatal(err)
	}

	// Insert user with proper UUID
	_, err = db.Exec("INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
		userID, "admin@chukfi.com", string(hash), "Admin User")
	if err != nil {
		log.Fatal("Insert user:", err)
	}
	fmt.Printf("✓ Inserted admin user: %s\n", userID)

	// Assign role
	_, err = db.Exec("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)",
		userID, roleID)
	if err != nil {
		log.Fatal("Assign role:", err)
	}
	fmt.Println("✓ Assigned admin role")

	fmt.Println("\n✓ Database fixed with proper UUIDs!")
	fmt.Println("Login with: admin@chukfi.com / admin123")
}
