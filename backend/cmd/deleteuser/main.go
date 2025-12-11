package main

import (
	"fmt"
	"log"
	"os"

	"chukfi-cms/backend/internal/db"

	"github.com/joho/godotenv"
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

	// Delete user by email
	email := "john.doe@example.com"
	if len(os.Args) > 1 {
		email = os.Args[1]
	}

	result, err := database.DB.Exec("DELETE FROM users WHERE email = ?", email)
	if err != nil {
		log.Fatal("Failed to delete user:", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		fmt.Printf("Deleted user: %s\n", email)
	} else {
		fmt.Printf("No user found with email: %s\n", email)
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
