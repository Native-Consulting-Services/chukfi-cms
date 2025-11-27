package handlers

import (
	"chukfi-cms/backend/internal/auth"
	"chukfi-cms/backend/internal/db"
	"chukfi-cms/backend/internal/middleware"
	"chukfi-cms/backend/internal/models"
	"chukfi-cms/backend/internal/storage"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

type Handler struct {
	DB          *db.DB
	AuthService *auth.Service
	Storage     storage.Storage
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

func (h *Handler) writeJSON(w http.ResponseWriter, status int, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (h *Handler) writeError(w http.ResponseWriter, status int, err string, message string) {
	h.writeJSON(w, status, ErrorResponse{
		Error:   err,
		Message: message,
	})
}

// Auth handlers
func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	fmt.Printf("Login attempt for email: %s\n", req.Email)
	user, err := h.AuthService.GetUserByEmail(req.Email)
	if err != nil {
		fmt.Printf("GetUserByEmail error: %v\n", err)
		h.writeError(w, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}

	fmt.Printf("Found user: %s, hash length: %d\n", user.Email, len(user.PasswordHash))
	if !h.AuthService.CheckPassword(req.Password, user.PasswordHash) {
		fmt.Printf("Password check failed for user: %s\n", user.Email)
		h.writeError(w, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}
	
	fmt.Printf("Login successful for: %s\n", user.Email)

	accessToken, refreshToken, err := h.AuthService.GenerateTokens(user)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "token_error", "Failed to generate tokens")
		return
	}

	// Remove password hash from response
	user.PasswordHash = ""

	response := models.LoginResponse{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		User:         user,
	}

	h.writeJSON(w, http.StatusOK, response)
}

func (h *Handler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	// Implementation for refresh token
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Refresh token not yet implemented")
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	// For JWT, logout is handled client-side by removing tokens
	h.writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
}

func (h *Handler) GetCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.GetUserID(r)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, "unauthorized", "User not authenticated")
		return
	}

	user, err := h.AuthService.GetUserByID(userID)
	if err != nil {
		h.writeError(w, http.StatusNotFound, "user_not_found", "User not found")
		return
	}

	// Remove password hash from response
	user.PasswordHash = ""

	h.writeJSON(w, http.StatusOK, user)
}

// User handlers
func (h *Handler) GetUsers(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id, email, display_name, COALESCE(name, display_name) as name, COALESCE(avatar, '') as avatar, created_at, updated_at
		FROM users
		ORDER BY created_at DESC
	`
	rows, err := h.DB.Query(query)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch users")
		return
	}
	defer rows.Close()

	var users []models.User
	for rows.Next() {
		var user models.User
		err := rows.Scan(&user.ID, &user.Email, &user.DisplayName, &user.Name, &user.Avatar, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			continue
		}

		// Fetch roles for this user
		roleQuery := `
			SELECT r.id, r.name, r.description
			FROM roles r
			INNER JOIN user_roles ur ON r.id = ur.role_id
			WHERE ur.user_id = ?
		`
		roleRows, err := h.DB.Query(roleQuery, user.ID)
		if err == nil {
			var roles []models.Role
			for roleRows.Next() {
				var role models.Role
				if err := roleRows.Scan(&role.ID, &role.Name, &role.Description); err == nil {
					roles = append(roles, role)
				}
			}
			roleRows.Close()
			user.Roles = roles
		}

		users = append(users, user)
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"users": users,
		"total": len(users),
	})
}

func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
	var req models.CreateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	hashedPassword, err := h.AuthService.HashPassword(req.Password)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "hash_error", "Failed to hash password")
		return
	}

	userID := uuid.New()
	query := `
		INSERT INTO users (id, email, password_hash, display_name, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?)
	`
	now := time.Now()
	_, err = h.DB.Exec(query, userID, req.Email, hashedPassword, req.DisplayName, now, now)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to create user")
		return
	}

	user := models.User{
		ID:          userID,
		Email:       req.Email,
		DisplayName: req.DisplayName,
		CreatedAt:   now,
		UpdatedAt:   now,
	}

	h.writeJSON(w, http.StatusCreated, user)
}

func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get user not yet implemented")
}

func (h *Handler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameter
	userIDStr := chi.URLParam(r, "id")
	if userIDStr == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "User ID is required")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_id", "Invalid user ID format")
		return
	}

	// Parse request body
	var req struct {
		Name   string `json:"name"`
		Email  string `json:"email"`
		Avatar string `json:"avatar"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Name and email are required")
		return
	}

	// Check if email is already taken by another user
	var existingUserID string
	err = h.DB.QueryRow("SELECT id FROM users WHERE email = ? AND id != ?", req.Email, userID).Scan(&existingUserID)
	if err == nil {
		h.writeError(w, http.StatusConflict, "email_exists", "Email already in use by another user")
		return
	} else if err != sql.ErrNoRows {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to check email availability")
		return
	}

	// Update user
	_, err = h.DB.Exec(
		"UPDATE users SET name = ?, email = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		req.Name, req.Email, req.Avatar, userID,
	)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to update user")
		return
	}

	// Return updated user data
	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"id":     userID,
		"name":   req.Name,
		"email":  req.Email,
		"avatar": req.Avatar,
	})
}

func (h *Handler) ChangePassword(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameter
	userIDStr := chi.URLParam(r, "id")
	if userIDStr == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "User ID is required")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_id", "Invalid user ID format")
		return
	}

	// Parse request body
	var req struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate required fields
	if req.CurrentPassword == "" || req.NewPassword == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Current and new passwords are required")
		return
	}

	// Validate new password length
	if len(req.NewPassword) < 8 {
		h.writeError(w, http.StatusBadRequest, "invalid_password", "Password must be at least 8 characters")
		return
	}

	// Get current password hash from database
	var currentHash string
	err = h.DB.QueryRow("SELECT password FROM users WHERE id = ?", userID).Scan(&currentHash)
	if err != nil {
		if err == sql.ErrNoRows {
			h.writeError(w, http.StatusNotFound, "user_not_found", "User not found")
		} else {
			h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to retrieve user")
		}
		return
	}

	// Verify current password
	if !h.AuthService.CheckPassword(currentHash, req.CurrentPassword) {
		h.writeError(w, http.StatusUnauthorized, "invalid_password", "Current password is incorrect")
		return
	}

	// Hash new password
	newHash, err := h.AuthService.HashPassword(req.NewPassword)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "hash_error", "Failed to hash password")
		return
	}

	// Update password
	_, err = h.DB.Exec(
		"UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
		newHash, userID,
	)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to update password")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{
		"message": "Password changed successfully",
	})
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameter
	userIDStr := chi.URLParam(r, "id")
	if userIDStr == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "User ID is required")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_id", "Invalid user ID format")
		return
	}

	// Start a transaction
	tx, err := h.DB.Begin()
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	// First, delete user's role associations
	_, err = tx.Exec("DELETE FROM user_roles WHERE user_id = ?", userID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to delete user roles")
		return
	}

	// Then, delete the user
	result, err := tx.Exec("DELETE FROM users WHERE id = ?", userID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to delete user")
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to verify deletion")
		return
	}

	if rowsAffected == 0 {
		h.writeError(w, http.StatusNotFound, "user_not_found", "User not found")
		return
	}

	// Commit the transaction
	if err := tx.Commit(); err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to commit transaction")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{
		"message": "User deleted successfully",
	})
}

func (h *Handler) UpdateUserRoles(w http.ResponseWriter, r *http.Request) {
	// Get user ID from URL parameter
	userIDStr := chi.URLParam(r, "id")
	if userIDStr == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "User ID is required")
		return
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_user_id", "Invalid user ID format")
		return
	}

	var req struct {
		RoleID *string `json:"roleId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Start transaction
	tx, err := h.DB.Begin()
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	// Delete existing roles for user
	_, err = tx.Exec("DELETE FROM user_roles WHERE user_id = ?", userID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to update roles")
		return
	}

	// If a role is provided, add it
	if req.RoleID != nil && *req.RoleID != "" {
		roleID, err := uuid.Parse(*req.RoleID)
		if err != nil {
			h.writeError(w, http.StatusBadRequest, "invalid_role_id", "Invalid role ID format")
			return
		}

		_, err = tx.Exec("INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)", userID, roleID)
		if err != nil {
			h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to assign role")
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to commit transaction")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]string{
		"message": "User roles updated successfully",
	})
}

// Role handlers
func (h *Handler) GetRoles(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT id, name, description, created_at, updated_at
		FROM roles
		ORDER BY name ASC
	`
	rows, err := h.DB.Query(query)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch roles")
		return
	}
	defer rows.Close()

	var roles []models.Role
	for rows.Next() {
		var role models.Role
		err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			continue
		}
		roles = append(roles, role)
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"roles": roles,
		"total": len(roles),
	})
}

func (h *Handler) CreateRole(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate input
	if req.Name == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_input", "Role name is required")
		return
	}
	if req.Description == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_input", "Role description is required")
		return
	}

	// Check if role already exists
	var existingID string
	err := h.DB.QueryRow("SELECT id FROM roles WHERE name = ?", req.Name).Scan(&existingID)
	if err == nil {
		h.writeError(w, http.StatusConflict, "role_exists", "A role with this name already exists")
		return
	}

	// Create new role
	roleID := uuid.New()
	query := `
		INSERT INTO roles (id, name, description, created_at, updated_at)
		VALUES (?, ?, ?, datetime('now'), datetime('now'))
	`
	_, err = h.DB.Exec(query, roleID, req.Name, req.Description)
	if err != nil {
		fmt.Printf("Error creating role: %v\n", err)
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to create role")
		return
	}

	// Fetch the created role
	var role models.Role
	query = "SELECT id, name, description, created_at, updated_at FROM roles WHERE id = ?"
	err = h.DB.QueryRow(query, roleID).Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch created role")
		return
	}

	h.writeJSON(w, http.StatusCreated, map[string]interface{}{
		"role":    role,
		"message": "Role created successfully",
	})
}

func (h *Handler) GetRole(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get role not yet implemented")
}

func (h *Handler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Update role not yet implemented")
}

func (h *Handler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")
	if roleID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Role ID is required")
		return
	}

	// Check if role exists
	var exists bool
	err := h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM roles WHERE id = ?)", roleID).Scan(&exists)
	if err != nil || !exists {
		h.writeError(w, http.StatusNotFound, "not_found", "Role not found")
		return
	}

	// Check if role is a system role (prevent deleting built-in roles)
	var roleName string
	err = h.DB.QueryRow("SELECT name FROM roles WHERE id = ?", roleID).Scan(&roleName)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch role")
		return
	}

	// Prevent deletion of system roles
	systemRoles := []string{"Super Admin", "Admin", "Editor", "Author", "Viewer"}
	for _, sysRole := range systemRoles {
		if roleName == sysRole {
			h.writeError(w, http.StatusForbidden, "forbidden", "Cannot delete system roles")
			return
		}
	}

	// Check if any users have this role
	var userCount int
	err = h.DB.QueryRow("SELECT COUNT(*) FROM user_roles WHERE role_id = ?", roleID).Scan(&userCount)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to check role usage")
		return
	}

	if userCount > 0 {
		h.writeError(w, http.StatusConflict, "role_in_use", fmt.Sprintf("Cannot delete role: %d user(s) currently have this role", userCount))
		return
	}

	// Delete the role (CASCADE will handle permissions)
	result, err := h.DB.Exec("DELETE FROM roles WHERE id = ?", roleID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to delete role")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		h.writeError(w, http.StatusNotFound, "not_found", "Role not found")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Role deleted successfully",
	})
}

// Permission handlers
func (h *Handler) GetRolePermissions(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")
	if roleID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Role ID is required")
		return
	}

	fmt.Printf("GetRolePermissions called for role ID: %s\n", roleID)

	// Validate role exists
	var exists bool
	err := h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM roles WHERE id = ?)", roleID).Scan(&exists)
	if err != nil {
		fmt.Printf("Error checking role exists: %v\n", err)
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to check role")
		return
	}
	if !exists {
		fmt.Printf("Role not found: %s\n", roleID)
		h.writeError(w, http.StatusNotFound, "not_found", "Role not found")
		return
	}

	fmt.Printf("Role exists, fetching permissions...\n")

	// Fetch permissions for the role
	rows, err := h.DB.Query(`
		SELECT id, role_id, collection, can_create, can_read, can_update, can_delete, created_at, updated_at
		FROM permissions
		WHERE role_id = ?
		ORDER BY collection
	`, roleID)
	if err != nil {
		fmt.Printf("Error querying permissions: %v\n", err)
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch permissions")
		return
	}
	defer rows.Close()

	permissions := []models.Permission{}
	for rows.Next() {
		var p models.Permission
		var idStr, roleIDStr string
		err := rows.Scan(
			&idStr,
			&roleIDStr,
			&p.Collection,
			&p.CanCreate,
			&p.CanRead,
			&p.CanUpdate,
			&p.CanDelete,
			&p.CreatedAt,
			&p.UpdatedAt,
		)
		if err != nil {
			fmt.Printf("Error scanning permission row: %v\n", err)
			h.writeError(w, http.StatusInternalServerError, "database_error", fmt.Sprintf("Failed to parse permissions: %v", err))
			return
		}
		
		// Parse UUIDs
		p.ID, _ = uuid.Parse(idStr)
		p.RoleID, _ = uuid.Parse(roleIDStr)
		
		permissions = append(permissions, p)
	}

	fmt.Printf("Successfully fetched %d permissions\n", len(permissions))

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"permissions": permissions,
	})
}

func (h *Handler) UpdateRolePermissions(w http.ResponseWriter, r *http.Request) {
	roleID := chi.URLParam(r, "id")
	if roleID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Role ID is required")
		return
	}

	// Validate role exists
	var exists bool
	err := h.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM roles WHERE id = ?)", roleID).Scan(&exists)
	if err != nil || !exists {
		h.writeError(w, http.StatusNotFound, "not_found", "Role not found")
		return
	}

	var req struct {
		Permissions []models.PermissionRequest `json:"permissions"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate collections
	validCollections := map[string]bool{
		"users":       true,
		"roles":       true,
		"collections": true,
		"documents":   true,
		"media":       true,
		"profile":     true,
	}

	for _, p := range req.Permissions {
		if !validCollections[p.Collection] {
			h.writeError(w, http.StatusBadRequest, "invalid_collection", fmt.Sprintf("Invalid collection: %s", p.Collection))
			return
		}
	}

	// Start transaction
	tx, err := h.DB.Begin()
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to start transaction")
		return
	}
	defer tx.Rollback()

	// Delete existing permissions for this role
	_, err = tx.Exec("DELETE FROM permissions WHERE role_id = ?", roleID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to delete existing permissions")
		return
	}

	// Insert new permissions
	stmt, err := tx.Prepare(`
		INSERT INTO permissions (id, role_id, collection, can_create, can_read, can_update, can_delete, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
	`)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to prepare statement")
		return
	}
	defer stmt.Close()

	now := time.Now()
	for _, p := range req.Permissions {
		permID := uuid.New().String()
		_, err = stmt.Exec(
			permID,
			roleID,
			p.Collection,
			p.CanCreate,
			p.CanRead,
			p.CanUpdate,
			p.CanDelete,
			now,
			now,
		)
		if err != nil {
			h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to insert permission")
			return
		}
	}

	// Commit transaction
	if err := tx.Commit(); err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to commit transaction")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"message": "Permissions updated successfully",
	})
}

// Collection handlers
func (h *Handler) GetCollections(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get collections not yet implemented")
}

func (h *Handler) CreateCollection(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Create collection not yet implemented")
}

func (h *Handler) GetCollection(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get collection not yet implemented")
}

func (h *Handler) UpdateCollection(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Update collection not yet implemented")
}

func (h *Handler) DeleteCollection(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Delete collection not yet implemented")
}

// Document handlers
func (h *Handler) GetDocuments(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get documents not yet implemented")
}

func (h *Handler) CreateDocument(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Create document not yet implemented")
}

func (h *Handler) GetDocument(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get document not yet implemented")
}

func (h *Handler) UpdateDocument(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Update document not yet implemented")
}

func (h *Handler) DeleteDocument(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Delete document not yet implemented")
}

// Media handlers
func (h *Handler) GetMedia(w http.ResponseWriter, r *http.Request) {
	query := `
		SELECT m.id, m.filename, m.url, m.mime_type, m.size, m.uploaded_by, m.created_at, m.updated_at,
		       COALESCE(u.name, u.display_name, 'Unknown') as uploader_name
		FROM media m
		LEFT JOIN users u ON m.uploaded_by = u.id
		ORDER BY m.created_at DESC
	`

	rows, err := h.DB.Query(query)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch media")
		return
	}
	defer rows.Close()

	var mediaList []map[string]interface{}
	for rows.Next() {
		var id, filename, url, mimeType, uploadedBy, uploaderName string
		var size int64
		var createdAt, updatedAt time.Time

		if err := rows.Scan(&id, &filename, &url, &mimeType, &size, &uploadedBy, &createdAt, &updatedAt, &uploaderName); err != nil {
			continue
		}

		mediaList = append(mediaList, map[string]interface{}{
			"id":           id,
			"filename":     filename,
			"url":          url,
			"mime_type":    mimeType,
			"size":         size,
			"uploaded_by":  uploadedBy,
			"uploader_name": uploaderName,
			"created_at":   createdAt,
			"updated_at":   updatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(mediaList)
}

func (h *Handler) UploadMedia(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form (max 10MB)
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Failed to parse upload")
		return
	}

	// Get the file from the form
	file, header, err := r.FormFile("file")
	if err != nil {
		h.writeError(w, http.StatusBadRequest, "no_file", "No file uploaded")
		return
	}
	defer file.Close()

	// Validate file size (10MB max)
	if header.Size > 10<<20 {
		h.writeError(w, http.StatusBadRequest, "file_too_large", "File must be under 10MB")
		return
	}

	// Validate file type (images only for now)
	contentType := header.Header.Get("Content-Type")
	allowedTypes := map[string]bool{
		"image/jpeg": true,
		"image/jpg":  true,
		"image/png":  true,
		"image/gif":  true,
		"image/webp": true,
	}
	if !allowedTypes[contentType] {
		h.writeError(w, http.StatusBadRequest, "invalid_type", "Only image files are allowed")
		return
	}

	// Upload file using storage backend
	url, err := h.Storage.Upload(file, header)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "upload_failed", fmt.Sprintf("Failed to upload file: %v", err))
		return
	}

	// Get authenticated user ID from context
	userID, ok := middleware.GetUserID(r)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, "unauthorized", "User not authenticated")
		return
	}

	// Save metadata to media table
	mediaID := uuid.New().String()
	query := `
		INSERT INTO media (id, filename, url, mime_type, size, uploaded_by, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
	`
	now := time.Now()
	_, err = h.DB.Exec(query, mediaID, header.Filename, url, contentType, header.Size, userID.String(), now, now)
	if err != nil {
		// Try to clean up uploaded file
		h.Storage.Delete(url)
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to save media metadata")
		return
	}

	// Return media info
	response := map[string]interface{}{
		"id":          mediaID,
		"filename":    header.Filename,
		"url":         url,
		"mime_type":   contentType,
		"size":        header.Size,
		"uploaded_by": userID.String(),
		"created_at":  now,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (h *Handler) GetMediaItem(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get media item not yet implemented")
}

func (h *Handler) DeleteMedia(w http.ResponseWriter, r *http.Request) {
	mediaID := chi.URLParam(r, "id")
	if mediaID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Media ID is required")
		return
	}

	// Get media info before deleting
	var url string
	query := "SELECT url FROM media WHERE id = ?"
	err := h.DB.QueryRow(query, mediaID).Scan(&url)
	if err == sql.ErrNoRows {
		h.writeError(w, http.StatusNotFound, "not_found", "Media not found")
		return
	}
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch media")
		return
	}

	// Delete from database first
	deleteQuery := "DELETE FROM media WHERE id = ?"
	_, err = h.DB.Exec(deleteQuery, mediaID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to delete media")
		return
	}

	// Try to delete the file (extract filename from URL)
	// URL format: http://localhost:8080/uploads/filename.ext
	filename := url[strings.LastIndex(url, "/")+1:]
	if err := h.Storage.Delete(filename); err != nil {
		// Log error but don't fail the request since DB record is already deleted
		log.Printf("Warning: Failed to delete file %s: %v", filename, err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Media deleted successfully"})
}