package main

import (
	"database/sql"
	"flag"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	_ "modernc.org/sqlite"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	var direction string
	flag.StringVar(&direction, "direction", "up", "Migration direction: up or down")
	flag.Parse()

	dbURL := getEnv("DATABASE_URL", "sqlite://./data/chukfi.db")

	var driver string
	var dsn string
	
	if strings.HasPrefix(dbURL, "sqlite://") {
		driver = "sqlite"
		dsn = strings.TrimPrefix(dbURL, "sqlite://")
	} else {
		log.Fatal("Unsupported database URL format (only SQLite supported):", dbURL)
	}

	// Connect to database
	db, err := sql.Open(driver, dsn)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer db.Close()

	// Test connection
	if err := db.Ping(); err != nil {
		log.Fatal("Failed to ping database:", err)
	}

	// Run SQLite migrations
	switch direction {
	case "up":
		log.Println("Running SQLite migrations up...")
		if err := runSQLiteSchema(db, "up"); err != nil {
			log.Fatal("Failed to run migrations:", err)
		}
		log.Println("SQLite migrations completed successfully")
	case "down":
		log.Println("Running SQLite migrations down...")
		if err := runSQLiteSchema(db, "down"); err != nil {
			log.Fatal("Failed to run rollback:", err)
		}
		log.Println("SQLite rollback completed successfully")
	default:
		log.Fatal("Invalid direction. Use 'up' or 'down'")
	}
}

// Simple SQLite schema runner
func runSQLiteSchema(db *sql.DB, direction string) error {
	var filename string
	switch direction {
	case "up":
		filename = "migrations/001_initial_schema_sqlite.up.sql"
	case "down":
		filename = "migrations/001_initial_schema_sqlite.down.sql"
	default:
		log.Printf("invalid direction: %s", direction)
		return nil
	}

	content, err := os.ReadFile(filename)
	if err != nil {
		return err
	}

	// Execute each statement
	statements := strings.Split(string(content), ";")
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}
		
		if _, err := db.Exec(stmt); err != nil {
			log.Printf("Statement executed: %s", strings.Split(stmt, "\n")[0])
		}
	}

	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}