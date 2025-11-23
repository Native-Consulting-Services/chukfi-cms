package handlers

import (
	"chukfi-cms/backend/internal/auth"
	"chukfi-cms/backend/internal/db"
	"chukfi-cms/backend/internal/middleware"
	"chukfi-cms/backend/internal/models"
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
)

type Handler struct {
	DB          *db.DB
	AuthService *auth.Service
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

	user, err := h.AuthService.GetUserByEmail(req.Email)
	if err != nil {
		h.writeError(w, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}

	if !h.AuthService.CheckPassword(req.Password, user.PasswordHash) {
		h.writeError(w, http.StatusUnauthorized, "invalid_credentials", "Invalid email or password")
		return
	}

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
		SELECT id, email, display_name, created_at, updated_at
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
		err := rows.Scan(&user.ID, &user.Email, &user.DisplayName, &user.CreatedAt, &user.UpdatedAt)
		if err != nil {
			continue
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
		VALUES ($1, $2, $3, $4, $5, $6)
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
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Update user not yet implemented")
}

func (h *Handler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Delete user not yet implemented")
}

// Role handlers
func (h *Handler) GetRoles(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get roles not yet implemented")
}

func (h *Handler) CreateRole(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Create role not yet implemented")
}

func (h *Handler) GetRole(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get role not yet implemented")
}

func (h *Handler) UpdateRole(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Update role not yet implemented")
}

func (h *Handler) DeleteRole(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Delete role not yet implemented")
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
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get media not yet implemented")
}

func (h *Handler) UploadMedia(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Upload media not yet implemented")
}

func (h *Handler) GetMediaItem(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Get media item not yet implemented")
}

func (h *Handler) DeleteMedia(w http.ResponseWriter, r *http.Request) {
	h.writeError(w, http.StatusNotImplemented, "not_implemented", "Delete media not yet implemented")
}