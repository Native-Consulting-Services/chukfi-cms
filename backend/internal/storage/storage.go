package storage

import (
	"mime/multipart"
)

// Storage defines the interface for file storage backends
// This allows swapping between local storage and cloud providers (like Cloudflare R2)
type Storage interface {
	// Upload stores a file and returns its URL
	Upload(file multipart.File, header *multipart.FileHeader) (string, error)
	
	// Delete removes a file
	Delete(filename string) error
	
	// GetURL returns the public URL for a file
	GetURL(filename string) string
	
	// Exists checks if a file exists
	Exists(filename string) bool
}

// Config holds storage configuration
type Config struct {
	Type string // "local" or "r2"
	
	// Local storage config
	LocalPath string
	BaseURL   string
	
	// Cloudflare R2 config (for future use)
	R2AccountID  string
	R2AccessKey  string
	R2SecretKey  string
	R2BucketName string
	R2PublicURL  string
}

// NewStorage creates a storage backend based on config
func NewStorage(config Config) (Storage, error) {
	switch config.Type {
	case "r2":
		// TODO: Implement R2 storage when needed
		return nil, nil
	default:
		// Default to local storage
		return NewLocalStorage(config.LocalPath, config.BaseURL)
	}
}
