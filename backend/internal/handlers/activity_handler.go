package handlers

import (
	"chukfi-cms/backend/internal/models"
	"database/sql"
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/google/uuid"
)

// CreateActivityLog creates a new activity log entry
func (h *Handler) CreateActivityLog(w http.ResponseWriter, r *http.Request) {
	// Get user ID from context (set by auth middleware)
	userID := r.Context().Value("user_id").(uuid.UUID)

	// Parse request body
	var req struct {
		Action     string                 `json:"action"`
		EntityType string                 `json:"entityType"`
		EntityID   string                 `json:"entityId,omitempty"`
		EntityName string                 `json:"entityName,omitempty"`
		Metadata   string                 `json:"metadata,omitempty"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Invalid request body")
		return
	}

	// Validate required fields
	if req.Action == "" || req.EntityType == "" {
		h.writeError(w, http.StatusBadRequest, "invalid_request", "Action and entityType are required")
		return
	}

	// Get IP address and user agent from request
	ipAddress := r.RemoteAddr
	userAgent := r.UserAgent()

	// Parse entity ID if provided
	var entityID *uuid.UUID
	if req.EntityID != "" {
		parsed, err := uuid.Parse(req.EntityID)
		if err == nil {
			entityID = &parsed
		}
	}

	// Insert into database
	query := `
		INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, entity_name, metadata, ip_address, user_agent, created_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
	`

	newID := uuid.New()
	now := time.Now()

	_, err := h.DB.DB.Exec(query,
		newID,
		userID,
		req.Action,
		req.EntityType,
		entityID,
		req.EntityName,
		req.Metadata,
		ipAddress,
		userAgent,
		now,
	)

	if err != nil {
		log.Printf("Error creating activity log: %v", err)
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to create activity log")
		return
	}

	// Return created activity log
	response := models.ActivityLogResponse{
		ID:         newID,
		UserID:     userID,
		Action:     req.Action,
		EntityType: req.EntityType,
		EntityID:   entityID,
		EntityName: req.EntityName,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
		CreatedAt:  now,
	}

	h.writeJSON(w, http.StatusCreated, response)
}

// GetActivityLogs retrieves activity logs with pagination and filters
func (h *Handler) GetActivityLogs(w http.ResponseWriter, r *http.Request) {
	// Get query parameters
	limit := r.URL.Query().Get("limit")
	if limit == "" {
		limit = "50"
	}
	offset := r.URL.Query().Get("offset")
	if offset == "" {
		offset = "0"
	}
	userID := r.URL.Query().Get("user_id")
	entityType := r.URL.Query().Get("entity_type")
	action := r.URL.Query().Get("action")

	// Build query with optional filters
	queryBuilder := `
		SELECT 
			a.id, a.user_id, a.action, a.entity_type, a.entity_id, a.entity_name,
			a.metadata, a.ip_address, a.user_agent, a.created_at,
			COALESCE(u.name, u.display_name, 'Unknown') as user_name,
			COALESCE(u.avatar, 'https://avatar.iran.liara.run/public') as user_avatar
		FROM activity_logs a
		LEFT JOIN users u ON a.user_id = u.id
		WHERE 1=1
	`
	
	args := []interface{}{}

	if userID != "" {
		queryBuilder += " AND a.user_id = ?"
		args = append(args, userID)
	}
	if entityType != "" {
		queryBuilder += " AND a.entity_type = ?"
		args = append(args, entityType)
	}
	if action != "" {
		queryBuilder += " AND a.action = ?"
		args = append(args, action)
	}

	queryBuilder += " ORDER BY a.created_at DESC LIMIT ? OFFSET ?"
	args = append(args, limit, offset)

	rows, err := h.DB.Query(queryBuilder, args...)
	if err != nil {
		log.Printf("Error querying activity logs: %v", err)
		h.writeError(w, http.StatusInternalServerError, "database_error", "Failed to fetch activity logs")
		return
	}
	defer rows.Close()

	var activities []models.ActivityLogResponse
	for rows.Next() {
		var activity models.ActivityLogResponse
		var entityID sql.NullString
		var entityName, metadata, ipAddress, userAgent sql.NullString

		err := rows.Scan(
			&activity.ID,
			&activity.UserID,
			&activity.Action,
			&activity.EntityType,
			&entityID,
			&entityName,
			&metadata,
			&ipAddress,
			&userAgent,
			&activity.CreatedAt,
			&activity.UserName,
			&activity.UserAvatar,
		)
		if err != nil {
			log.Printf("Error scanning activity log: %v", err)
			continue
		}

		// Handle nullable fields
		if entityID.Valid {
			parsedID, err := uuid.Parse(entityID.String)
			if err == nil {
				activity.EntityID = &parsedID
			}
		}
		if entityName.Valid {
			activity.EntityName = entityName.String
		}
		if ipAddress.Valid {
			activity.IPAddress = ipAddress.String
		}
		if userAgent.Valid {
			activity.UserAgent = userAgent.String
		}
		if metadata.Valid {
			var metadataMap map[string]interface{}
			if err := json.Unmarshal([]byte(metadata.String), &metadataMap); err == nil {
				activity.Metadata = metadataMap
			}
		}

		activities = append(activities, activity)
	}

	if activities == nil {
		activities = []models.ActivityLogResponse{}
	}

	h.writeJSON(w, http.StatusOK, activities)
}
