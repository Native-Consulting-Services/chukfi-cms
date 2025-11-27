package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

type Role struct {
	ID          string
	Name        string
	Description string
}

func main() {
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Define the core roles
	roles := []Role{
		{
			ID:          uuid.New().String(),
			Name:        "Super Admin",
			Description: "Full system access including user management, role management, and all content operations",
		},
		{
			ID:          uuid.New().String(),
			Name:        "Editor",
			Description: "Full content management - create, edit, delete, and publish all content and manage media",
		},
		{
			ID:          uuid.New().String(),
			Name:        "Author",
			Description: "Create and manage own content, submit for review, upload media files",
		},
		{
			ID:          uuid.New().String(),
			Name:        "Viewer",
			Description: "Read-only access to view published content and media library",
		},
	}

	now := time.Now()

	// Check if roles already exist and insert new ones
	for _, role := range roles {
		// Check if role with this name already exists
		var existingID string
		err := db.QueryRow("SELECT id FROM roles WHERE name = ?", role.Name).Scan(&existingID)
		
		if err == sql.ErrNoRows {
			// Role doesn't exist, insert it
			_, err = db.Exec(
				"INSERT INTO roles (id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
				role.ID, role.Name, role.Description, now, now,
			)
			if err != nil {
				log.Printf("❌ Failed to insert role '%s': %v\n", role.Name, err)
				continue
			}
			fmt.Printf("✓ Created role: %s (ID: %s)\n", role.Name, role.ID)
		} else if err != nil {
			log.Printf("❌ Error checking role '%s': %v\n", role.Name, err)
		} else {
			fmt.Printf("⊙ Role '%s' already exists (ID: %s)\n", role.Name, existingID)
		}
	}

	// Display all roles
	fmt.Println("\n📋 Current roles in database:")
	rows, err := db.Query("SELECT id, name, description FROM roles ORDER BY name")
	if err != nil {
		log.Fatal("Failed to query roles:", err)
	}
	defer rows.Close()

	for rows.Next() {
		var id, name, description string
		if err := rows.Scan(&id, &name, &description); err != nil {
			continue
		}
		fmt.Printf("  • %s - %s\n", name, description)
	}

	fmt.Println("\n✅ Role seeding complete!")
}
