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

	// Update Admin role description
	_, err = db.Exec(`
		UPDATE roles 
		SET description = 'Site administrator - manage users, assign roles, and oversee all content and media' 
		WHERE name = 'Admin'
	`)
	if err != nil {
		log.Printf("❌ Failed to update Admin role: %v\n", err)
	} else {
		fmt.Println("✓ Updated Admin role description")
	}

	// Update Super Admin role description
	_, err = db.Exec(`
		UPDATE roles 
		SET description = 'Full system access including role management, system settings, and all administrative functions' 
		WHERE name = 'Super Admin'
	`)
	if err != nil {
		log.Printf("❌ Failed to update Super Admin role: %v\n", err)
	} else {
		fmt.Println("✓ Updated Super Admin role description")
	}

	// Get the Super Admin role ID
	var superAdminRoleID string
	err = db.QueryRow("SELECT id FROM roles WHERE name = 'Super Admin'").Scan(&superAdminRoleID)
	if err != nil {
		log.Fatal("Failed to get Super Admin role:", err)
	}

	// Get the admin user ID
	var adminUserID string
	err = db.QueryRow("SELECT id FROM users WHERE email = 'admin@chukfi.com'").Scan(&adminUserID)
	if err != nil {
		log.Fatal("Failed to get admin user:", err)
	}

	// Delete existing role assignment for admin user
	_, err = db.Exec("DELETE FROM user_roles WHERE user_id = ?", adminUserID)
	if err != nil {
		log.Printf("❌ Failed to remove old role: %v\n", err)
	}

	// Assign Super Admin role to admin@chukfi.com
	_, err = db.Exec("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", adminUserID, superAdminRoleID)
	if err != nil {
		log.Printf("❌ Failed to assign Super Admin role: %v\n", err)
	} else {
		fmt.Println("✓ Assigned Super Admin role to admin@chukfi.com")
	}

	// Display updated roles
	fmt.Println("\n📋 Updated roles:")
	rows, err := db.Query("SELECT name, description FROM roles ORDER BY name")
	if err != nil {
		log.Fatal("Failed to query roles:", err)
	}
	defer rows.Close()

	for rows.Next() {
		var name, description string
		if err := rows.Scan(&name, &description); err != nil {
			continue
		}
		fmt.Printf("  • %s\n    %s\n", name, description)
	}

	fmt.Println("\n✅ Role updates complete!")
}
