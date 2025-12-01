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

	// Check if table exists
	var count int
	err = db.QueryRow("SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name='activity_logs'").Scan(&count)
	if err != nil {
		log.Fatal(err)
	}

	if count > 0 {
		fmt.Println("✓ activity_logs table exists")
		
		// Check structure
		rows, err := db.Query("PRAGMA table_info(activity_logs)")
		if err != nil {
			log.Fatal(err)
		}
		defer rows.Close()
		
		fmt.Println("Columns:")
		for rows.Next() {
			var cid int
			var name, typ string
			var notnull, pk int
			var dflt_value sql.NullString
			rows.Scan(&cid, &name, &typ, &notnull, &dflt_value, &pk)
			fmt.Printf("  - %s (%s)\n", name, typ)
		}
		
		// Count records
		var recordCount int
		db.QueryRow("SELECT COUNT(*) FROM activity_logs").Scan(&recordCount)
		fmt.Printf("\nRecords: %d\n", recordCount)
	} else {
		fmt.Println("✗ activity_logs table does NOT exist - running migration...")
	}
}
