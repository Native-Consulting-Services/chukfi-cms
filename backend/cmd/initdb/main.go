package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"strings"

	_ "modernc.org/sqlite"
)

func main() {
	// Connect to database
	db, err := sql.Open("sqlite", "./data/chukfi.db")
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// Read SQL file
	sqlBytes, err := os.ReadFile("init_db.sql")
	if err != nil {
		log.Fatal(err)
	}

	// Execute each statement
	statements := strings.Split(string(sqlBytes), ";")
	for i, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}

		fmt.Printf("Executing statement %d...\n", i+1)
		if _, err := db.Exec(stmt); err != nil {
			fmt.Printf("ERROR on statement %d: %v\n", i+1, err)
			fmt.Printf("Statement: %s\n", stmt[:min(len(stmt), 100)])
		} else {
			fmt.Printf("✓ Statement %d successful\n", i+1)
		}
	}

	// Verify
	var count int
	db.QueryRow("SELECT COUNT(*) FROM users").Scan(&count)
	fmt.Printf("\n✓ Database initialized with %d users\n", count)
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
