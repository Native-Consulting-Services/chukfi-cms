package main

import (
	"database/sql"
	"fmt"
	"log"
	"time"

	"github.com/google/uuid"
	_ "modernc.org/sqlite"
)

func main() {
	dbPath := "./data/chukfi.db"

	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal("Failed to open database:", err)
	}
	defer db.Close()

	// Get Super Admin role ID
	var superAdminRoleID string
	err = db.QueryRow("SELECT id FROM roles WHERE name = 'Super Admin' LIMIT 1").Scan(&superAdminRoleID)
	if err != nil {
		log.Fatal("Failed to find Super Admin role:", err)
	}
	fmt.Printf("Found Super Admin role: %s\n", superAdminRoleID)

	// Check if activity permission already exists
	var existingID string
	err = db.QueryRow("SELECT id FROM permissions WHERE role_id = ? AND collection = 'activity'", superAdminRoleID).Scan(&existingID)
	
	if err == sql.ErrNoRows {
		// Insert activity permission for Super Admin
		now := time.Now()
		permissionID := uuid.New().String()
		
		_, err = db.Exec(`
			INSERT INTO permissions (id, role_id, collection, can_create, can_read, can_update, can_delete, created_at, updated_at)
			VALUES (?, ?, 'activity', 0, 1, 0, 0, ?, ?)
		`, permissionID, superAdminRoleID, now, now)
		
		if err != nil {
			log.Fatal("Failed to insert activity permission:", err)
		}
		
		fmt.Printf("✓ Created activity permission for Super Admin (ID: %s)\n", permissionID)
	} else if err != nil {
		log.Fatal("Failed to check existing permission:", err)
	} else {
		fmt.Printf("⊙ Activity permission already exists for Super Admin (ID: %s)\n", existingID)
	}

	// Display all permissions for Super Admin
	fmt.Println("\n📋 All permissions for Super Admin:")
	rows, err := db.Query(`
		SELECT collection, can_create, can_read, can_update, can_delete 
		FROM permissions 
		WHERE role_id = ? 
		ORDER BY collection
	`, superAdminRoleID)
	if err != nil {
		log.Fatal("Failed to query permissions:", err)
	}
	defer rows.Close()

	for rows.Next() {
		var collection string
		var canCreate, canRead, canUpdate, canDelete bool
		if err := rows.Scan(&collection, &canCreate, &canRead, &canUpdate, &canDelete); err != nil {
			continue
		}
		
		perms := []string{}
		if canCreate {
			perms = append(perms, "create")
		}
		if canRead {
			perms = append(perms, "read")
		}
		if canUpdate {
			perms = append(perms, "update")
		}
		if canDelete {
			perms = append(perms, "delete")
		}
		
		fmt.Printf("  • %s: %v\n", collection, perms)
	}

	fmt.Println("\n✅ Activity permissions setup complete!")
}
