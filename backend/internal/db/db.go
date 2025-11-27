package db

import (
	"database/sql"
	"fmt"
	"strings"

	_ "modernc.org/sqlite"
)

type DB struct {
	*sql.DB
	Driver string
}

func NewDB(databaseURL string) (*DB, error) {
	var driver string
	var dsn string
	
	if strings.HasPrefix(databaseURL, "sqlite://") {
		driver = "sqlite"
		dsn = strings.TrimPrefix(databaseURL, "sqlite://")
	} else {
		return nil, fmt.Errorf("unsupported database URL format: %s (only SQLite supported)", databaseURL)
	}

	db, err := sql.Open(driver, dsn)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	dbInstance := &DB{DB: db, Driver: driver}

	// For SQLite, create tables on startup (development only)
	if driver == "sqlite" {
		if err := dbInstance.initSQLiteTables(); err != nil {
			return nil, fmt.Errorf("failed to initialize SQLite tables: %w", err)
		}
	}

	return dbInstance, nil
}

func (db *DB) Close() error {
	return db.DB.Close()
}

// Initialize SQLite tables for development
func (db *DB) initSQLiteTables() error {
	schema := `
	-- Users table
	CREATE TABLE IF NOT EXISTS users (
		id TEXT PRIMARY KEY,
		email TEXT UNIQUE NOT NULL,
		password_hash TEXT NOT NULL,
		display_name TEXT NOT NULL,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	-- Roles table
	CREATE TABLE IF NOT EXISTS roles (
		id TEXT PRIMARY KEY,
		name TEXT UNIQUE NOT NULL,
		description TEXT,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);

	-- User roles junction table
	CREATE TABLE IF NOT EXISTS user_roles (
		user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
		role_id TEXT REFERENCES roles(id) ON DELETE CASCADE,
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (user_id, role_id)
	);

	-- Insert default admin role if not exists
	INSERT OR IGNORE INTO roles (id, name, description) 
	VALUES ('admin-role-id', 'Admin', 'Full access to all system functionality');

	-- Insert or replace default admin user (password: admin123)
	INSERT OR REPLACE INTO users (id, email, password_hash, display_name, created_at, updated_at)
	VALUES (
		'admin-user-id',
		'admin@chukfi.com',
		'$2a$14$vAvE/LgiKxrECFOf7dy0q.2FJ8EEl9Gqc6tBdbya/X6Z/38PozM6a',
		'Admin User',
		CURRENT_TIMESTAMP,
		CURRENT_TIMESTAMP
	);

	-- Assign admin role to admin user if not exists
	INSERT OR IGNORE INTO user_roles (user_id, role_id)
	VALUES ('admin-user-id', 'admin-role-id');
	`

	statements := strings.Split(schema, ";")
	for _, stmt := range statements {
		stmt = strings.TrimSpace(stmt)
		if stmt == "" || strings.HasPrefix(stmt, "--") {
			continue
		}

		if _, err := db.Exec(stmt); err != nil {
			// Log warning but continue - some statements might fail in SQLite
			fmt.Printf("Warning executing SQLite statement: %v\n", err)
		}
	}

	return nil
}