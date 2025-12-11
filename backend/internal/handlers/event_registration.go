package handlers

import (
	"chukfi-cms/backend/internal/auth"
	"chukfi-cms/backend/internal/models"
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

// RegisterForEvent handles user registration for an event
func (h *Handler) RegisterForEvent(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	if eventID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Event ID is required")
		return
	}

	var req models.RegisterEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_json", "Invalid request body")
		return
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Name and email are required")
		return
	}

	// Get user ID from context if authenticated
	var userID *string
	if userClaims, ok := r.Context().Value("user").(*auth.Claims); ok {
		userIDStr := userClaims.UserID.String()
		userID = &userIDStr
	}

	// Check if user is already registered
	var existingID string
	checkQuery := `SELECT id FROM event_registrations WHERE event_id = $1 AND email = $2 AND status != 'cancelled'`
	err := h.DB.QueryRow(checkQuery, eventID, req.Email).Scan(&existingID)
	if err == nil {
		h.writeError(w, http.StatusConflict, "already_registered", "You are already registered for this event")
		return
	} else if err != sql.ErrNoRows {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to check registration")
		return
	}

	// Check event capacity (assuming events are stored somewhere - adjust based on your implementation)
	var registrationCount int
	countQuery := `SELECT COUNT(*) FROM event_registrations WHERE event_id = $1 AND status = 'confirmed'`
	if err := h.DB.QueryRow(countQuery, eventID).Scan(&registrationCount); err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to check capacity")
		return
	}

	// For now, we'll skip capacity check as events are in localStorage
	// TODO: Add capacity check when events are moved to database

	// Create registration
	registration := models.EventRegistration{
		ID:           uuid.New().String(),
		EventID:      eventID,
		UserID:       userID,
		Status:       "confirmed",
		Name:         req.Name,
		Email:        req.Email,
		Notes:        req.Notes,
		RegisteredAt: time.Now(),
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	insertQuery := `
		INSERT INTO event_registrations (id, event_id, user_id, status, name, email, notes, registered_at, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`
	_, err = h.DB.Exec(insertQuery,
		registration.ID,
		registration.EventID,
		registration.UserID,
		registration.Status,
		registration.Name,
		registration.Email,
		registration.Notes,
		registration.RegisteredAt,
		registration.CreatedAt,
		registration.UpdatedAt,
	)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to create registration")
		return
	}

	// Log activity if user is authenticated
	if userID != nil {
		userUUID, _ := uuid.Parse(*userID)
		h.ActivityLogger.LogActivity(context.Background(), models.ActivityLog{
			UserID:     userUUID,
			Action:     "register_event",
			EntityType: "event",
			EntityName: eventID,
			Metadata: map[string]interface{}{
				"event_id":        eventID,
				"registration_id": registration.ID,
			},
		})
	}

	h.writeJSON(w, http.StatusCreated, registration)
}

// UnregisterFromEvent handles user unregistration from an event
func (h *Handler) UnregisterFromEvent(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	if eventID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Event ID is required")
		return
	}

	// Get user from context
	userClaims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	// Update registration status to cancelled
	updateQuery := `
		UPDATE event_registrations 
		SET status = 'cancelled', updated_at = $1
		WHERE event_id = $2 AND user_id = $3 AND status = 'confirmed'
	`
	result, err := h.DB.Exec(updateQuery, time.Now(), eventID, userClaims.UserID.String())
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to cancel registration")
		return
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		h.writeError(w, http.StatusNotFound, "not_found", "Registration not found")
		return
	}

	// Log activity
	h.ActivityLogger.LogActivity(context.Background(), models.ActivityLog{
		UserID:     userClaims.UserID,
		Action:     "unregister_event",
		EntityType: "event",
		EntityName: eventID,
		Metadata: map[string]interface{}{
			"event_id": eventID,
		},
	})

	h.writeJSON(w, http.StatusOK, map[string]string{
		"message": "Successfully unregistered from event",
	})
}

// GetEventRegistrations retrieves all registrations for an event (admin only)
func (h *Handler) GetEventRegistrations(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	if eventID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Event ID is required")
		return
	}

	query := `
		SELECT 
			er.id, er.event_id, er.user_id, er.status, er.name, er.email, 
			er.notes, er.registered_at, er.checked_in_at, er.created_at, er.updated_at,
			u.display_name as user_display_name
		FROM event_registrations er
		LEFT JOIN users u ON er.user_id = u.id
		WHERE er.event_id = $1 AND er.status = 'confirmed'
		ORDER BY er.registered_at DESC
	`

	rows, err := h.DB.Query(query, eventID)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch registrations")
		return
	}
	defer rows.Close()

	var registrations []models.EventRegistrationResponse
	for rows.Next() {
		var reg models.EventRegistrationResponse
		err := rows.Scan(
			&reg.ID,
			&reg.EventID,
			&reg.UserID,
			&reg.Status,
			&reg.Name,
			&reg.Email,
			&reg.Notes,
			&reg.RegisteredAt,
			&reg.CheckedInAt,
			&reg.CreatedAt,
			&reg.UpdatedAt,
			&reg.UserDisplayName,
		)
		if err != nil {
			continue
		}
		registrations = append(registrations, reg)
	}

	if registrations == nil {
		registrations = []models.EventRegistrationResponse{}
	}

	h.writeJSON(w, http.StatusOK, registrations)
}

// GetUserEventRegistration checks if current user is registered for an event
func (h *Handler) GetUserEventRegistration(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	if eventID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Event ID is required")
		return
	}

	// Get user from context
	userClaims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	query := `
		SELECT id, event_id, user_id, status, name, email, notes, registered_at, checked_in_at, created_at, updated_at
		FROM event_registrations
		WHERE event_id = $1 AND user_id = $2 AND status = 'confirmed'
	`

	var reg models.EventRegistration
	err := h.DB.QueryRow(query, eventID, userClaims.UserID.String()).Scan(
		&reg.ID,
		&reg.EventID,
		&reg.UserID,
		&reg.Status,
		&reg.Name,
		&reg.Email,
		&reg.Notes,
		&reg.RegisteredAt,
		&reg.CheckedInAt,
		&reg.CreatedAt,
		&reg.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		h.writeJSON(w, http.StatusOK, map[string]interface{}{
			"registered": false,
		})
		return
	}

	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to check registration")
		return
	}

	h.writeJSON(w, http.StatusOK, map[string]interface{}{
		"registered":   true,
		"registration": reg,
	})
}

// GetEventRegistrationStats returns registration statistics for an event
func (h *Handler) GetEventRegistrationStats(w http.ResponseWriter, r *http.Request) {
	eventID := chi.URLParam(r, "eventId")
	if eventID == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Event ID is required")
		return
	}

	query := `
		SELECT 
			COUNT(*) as total_registrations,
			COUNT(CASE WHEN checked_in_at IS NOT NULL THEN 1 END) as checked_in_count
		FROM event_registrations
		WHERE event_id = $1 AND status = 'confirmed'
	`

	var stats struct {
		TotalRegistrations int `json:"total_registrations"`
		CheckedInCount     int `json:"checked_in_count"`
	}

	err := h.DB.QueryRow(query, eventID).Scan(&stats.TotalRegistrations, &stats.CheckedInCount)
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch statistics")
		return
	}

	h.writeJSON(w, http.StatusOK, stats)
}

// GetMyRegistrations returns all events the current user is registered for
func (h *Handler) GetMyRegistrations(w http.ResponseWriter, r *http.Request) {
	// Get user from context
	userClaims, ok := r.Context().Value("user").(*auth.Claims)
	if !ok {
		h.writeError(w, http.StatusUnauthorized, "unauthorized", "Authentication required")
		return
	}

	query := `
		SELECT id, event_id, user_id, status, name, email, notes, registered_at, checked_in_at, created_at, updated_at
		FROM event_registrations
		WHERE user_id = $1 AND status = 'confirmed'
		ORDER BY registered_at DESC
	`

	rows, err := h.DB.Query(query, userClaims.UserID.String())
	if err != nil {
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch registrations")
		return
	}
	defer rows.Close()

	var registrations []models.EventRegistration
	for rows.Next() {
		var reg models.EventRegistration
		err := rows.Scan(
			&reg.ID,
			&reg.EventID,
			&reg.UserID,
			&reg.Status,
			&reg.Name,
			&reg.Email,
			&reg.Notes,
			&reg.RegisteredAt,
			&reg.CheckedInAt,
			&reg.CreatedAt,
			&reg.UpdatedAt,
		)
		if err != nil {
			continue
		}
		registrations = append(registrations, reg)
	}

	if registrations == nil {
		registrations = []models.EventRegistration{}
	}

	h.writeJSON(w, http.StatusOK, registrations)
}
