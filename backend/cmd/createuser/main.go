package main

import (
	"fmt"
	"log"
	"os"
	"time"

	"chukfi-cms/backend/internal/db"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Get database URL
	dbURL := getEnv("DATABASE_URL", "sqlite://./data/chukfi.db")

	// Connect to database
	database, err := db.NewDB(dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Create John Doe user
	userID := uuid.New()
	email := "john.doe@example.com"
	password := "password123"
	displayName := "John Doe"
	name := "John Doe"

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	now := time.Now()

	// Check if user already exists
	var existingUserID string
	err = database.DB.QueryRow("SELECT id FROM users WHERE email = ?", email).Scan(&existingUserID)
	if err == nil {
		log.Printf("User with email %s already exists (ID: %s)", email, existingUserID)
		return
	}

	// Insert user
	_, err = database.DB.Exec(`
		INSERT INTO users (id, email, password_hash, display_name, name, avatar, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`, userID.String(), email, string(hashedPassword), displayName, name, "", now, now)
	if err != nil {
		log.Fatal("Failed to create user:", err)
	}

	log.Printf("Created user: %s (ID: %s)", email, userID.String())

	// Get the "User" role ID (fallback to "Viewer" if not found)
	var roleID string
	var roleName string
	err = database.DB.QueryRow("SELECT id, name FROM roles WHERE name = 'User' LIMIT 1").Scan(&roleID, &roleName)
	if err != nil {
		// Try to get Viewer role instead
		err = database.DB.QueryRow("SELECT id, name FROM roles WHERE name = 'Viewer' LIMIT 1").Scan(&roleID, &roleName)
		if err != nil {
			log.Printf("Warning: Neither 'User' nor 'Viewer' role found. User created without role assignment.")
			log.Printf("You may need to run the seed roles command first.")
			roleName = ""
		}
	}

	if roleName != "" {
		// Assign role
		_, err = database.DB.Exec(`
			INSERT INTO user_roles (user_id, role_id)
			VALUES (?, ?)
		`, userID.String(), roleID)
		if err != nil {
			log.Fatal("Failed to assign role:", err)
		}
		log.Printf("Assigned '%s' role to %s", roleName, email)
	}

	fmt.Println("\n=== Sample User Account Created ===")
	fmt.Printf("Email: %s\n", email)
	fmt.Printf("Password: %s\n", password)
	fmt.Printf("Display Name: %s\n", displayName)
	fmt.Println("===================================")
	fmt.Println("\nYou can now log in with these credentials.")
	fmt.Println("The user will be directed to the user dashboard (not admin).")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
