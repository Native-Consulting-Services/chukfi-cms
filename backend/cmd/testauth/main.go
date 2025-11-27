package main

import (
	"chukfi-cms/backend/internal/auth"
	"chukfi-cms/backend/internal/db"
	"fmt"
	"log"
)

func main() {
	// Connect to database
	database, err := db.NewDB("sqlite://./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer database.Close()

	// Create auth service
	authService := auth.NewService("test-secret-key", database)

	// Try to get user
	fmt.Println("Attempting to get user by email...")
	user, err := authService.GetUserByEmail("admin@chukfi.com")
	if err != nil {
		fmt.Printf("❌ GetUserByEmail failed: %v\n", err)
		return
	}

	fmt.Printf("✓ Found user: %s\n", user.Email)
	fmt.Printf("  Display Name: %s\n", user.DisplayName)
	fmt.Printf("  User ID: %s\n", user.ID)
	fmt.Printf("  Roles Count: %d\n", len(user.Roles))
	
	if len(user.Roles) > 0 {
		fmt.Println("\n📋 User Roles:")
		for _, role := range user.Roles {
			fmt.Printf("  • %s (ID: %s)\n", role.Name, role.ID)
			fmt.Printf("    Description: %s\n", role.Description)
		}
	} else {
		fmt.Println("\n⚠️  No roles assigned to this user!")
	}

	// Try to check password
	fmt.Println("\nChecking password 'admin123'...")
	if authService.CheckPassword("admin123", user.PasswordHash) {
		fmt.Println("✅ Password check SUCCESS!")
	} else {
		fmt.Println("❌ Password check FAILED!")
	}
}
