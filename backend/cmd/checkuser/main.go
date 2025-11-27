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

	// Get admin user and their role
	var userID, userName, userEmail string
	err = db.QueryRow("SELECT id, display_name, email FROM users WHERE email = 'admin@chukfi.com'").Scan(&userID, &userName, &userEmail)
	if err != nil {
		log.Fatal("Failed to get admin user:", err)
	}

	fmt.Printf("👤 User: %s (%s)\n", userName, userEmail)
	fmt.Printf("   ID: %s\n\n", userID)

	// Get their roles
	rows, err := db.Query(`
		SELECT r.name, r.description 
		FROM roles r 
		JOIN user_roles ur ON r.id = ur.role_id 
		WHERE ur.user_id = ?
	`, userID)
	if err != nil {
		log.Fatal("Failed to get user roles:", err)
	}
	defer rows.Close()

	fmt.Println("📋 Current roles:")
	hasRoles := false
	for rows.Next() {
		hasRoles = true
		var roleName, roleDesc string
		if err := rows.Scan(&roleName, &roleDesc); err != nil {
			continue
		}
		fmt.Printf("  • %s - %s\n", roleName, roleDesc)
	}

	if !hasRoles {
		fmt.Println("  (No roles assigned)")
	}
}
