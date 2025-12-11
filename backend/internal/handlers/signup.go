package handlers

import (
	"chukfi-cms/backend/internal/models"
	"context"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// Signup handles public user registration
func (h *Handler) Signup(w http.ResponseWriter, r *http.Request) {
	var req models.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" || req.DisplayName == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Email, password, and display name are required")
		return
	}

	// Validate password length
	if len(req.Password) < 8 {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Password must be at least 8 characters")
		return
	}

	// Check if user already exists
	existingUser, _ := h.AuthService.GetUserByEmail(req.Email)
	if existingUser.ID != uuid.Nil {
		h.writeError(w, http.StatusConflict, "email_exists", "An account with this email already exists")
		return
	}

	// Hash password
	hashedPassword, err := h.AuthService.HashPassword(req.Password)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "server_error", "Failed to process password")
		return
	}

	// Create user
	userID := uuid.New()
	query := `
		INSERT INTO users (id, email, password_hash, display_name, name, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	now := time.Now()
	_, err = h.DB.Exec(query, userID, req.Email, hashedPassword, req.DisplayName, req.DisplayName, now, now)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to create user account")
		return
	}

	// Assign default "User" role if it exists
	var defaultRoleID uuid.UUID
	roleQuery := `SELECT id FROM roles WHERE name = 'User' LIMIT 1`
	err = h.DB.QueryRow(roleQuery).Scan(&defaultRoleID)
	if err == nil {
		// Role exists, assign it
		assignRoleQuery := `INSERT INTO user_roles (user_id, role_id, created_at) VALUES ($1, $2, $3)`
		h.DB.Exec(assignRoleQuery, userID, defaultRoleID, now)
	}

	// Fetch the created user
	user, err := h.AuthService.GetUserByID(userID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "server_error", "User created but failed to fetch details")
		return
	}

	// Generate tokens
	accessToken, refreshToken, err := h.AuthService.GenerateTokens(user)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "token_error", "Failed to generate authentication tokens")
		return
	}

	// Log activity
	h.ActivityLogger.LogActivity(context.Background(), models.ActivityLog{
		UserID:     userID,
		Action:     "signup",
		EntityType: "user",
		EntityName: req.Email,
	})

	// Remove password hash from response
	user.PasswordHash = ""

	response := models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}

	h.writeJSON(w, http.StatusCreated, response)
}
