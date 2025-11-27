package storage

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

// LocalStorage implements Storage interface for local file system
type LocalStorage struct {
	uploadPath string // Path where files are stored (e.g., "./uploads")
	baseURL    string // Base URL for accessing files (e.g., "http://localhost:8080/uploads")
}

// NewLocalStorage creates a new local storage backend
func NewLocalStorage(uploadPath, baseURL string) (*LocalStorage, error) {
	// Create uploads directory if it doesn't exist
	if err := os.MkdirAll(uploadPath, 0755); err != nil {
		return nil, fmt.Errorf("failed to create upload directory: %w", err)
	}

	return &LocalStorage{
		uploadPath: uploadPath,
		baseURL:    strings.TrimSuffix(baseURL, "/"),
	}, nil
}

// Upload saves a file to local storage
func (s *LocalStorage) Upload(file multipart.File, header *multipart.FileHeader) (string, error) {
	defer file.Close()

	// Generate unique filename
	filename, err := s.generateFilename(header.Filename)
	if err != nil {
		return "", fmt.Errorf("failed to generate filename: %w", err)
	}

	// Create file path
	filePath := filepath.Join(s.uploadPath, filename)

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy file contents
	if _, err := io.Copy(dst, file); err != nil {
		os.Remove(filePath) // Clean up on error
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	// Return public URL
	url := fmt.Sprintf("%s/%s", s.baseURL, filename)
	return url, nil
}

// Delete removes a file from local storage
func (s *LocalStorage) Delete(filename string) error {
	filePath := filepath.Join(s.uploadPath, filename)
	return os.Remove(filePath)
}

// GetURL returns the public URL for a file
func (s *LocalStorage) GetURL(filename string) string {
	return fmt.Sprintf("%s/%s", s.baseURL, filename)
}

// Exists checks if a file exists
func (s *LocalStorage) Exists(filename string) bool {
	filePath := filepath.Join(s.uploadPath, filename)
	_, err := os.Stat(filePath)
	return err == nil
}

// generateFilename creates a unique filename while preserving extension
func (s *LocalStorage) generateFilename(originalName string) (string, error) {
	// Generate random bytes
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	
	// Create unique name
	uniqueID := hex.EncodeToString(bytes)
	
	// Preserve file extension
	ext := filepath.Ext(originalName)
	filename := fmt.Sprintf("%s%s", uniqueID, ext)
	
	return filename, nil
}
