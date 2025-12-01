package activity

import (
	"context"
	"database/sql"
	"encoding/json"
	"log"
	"time"

	"chukfi-cms/backend/internal/models"

	"github.com/google/uuid"
)

type Logger struct {
	db *sql.DB
}

func NewLogger(db *sql.DB) *Logger {
	return &Logger{db: db}
}

// LogActivity records an activity log entry
func (l *Logger) LogActivity(ctx context.Context, activity models.ActivityLog) error {
	var metadataJSON []byte
	var err error
	
	if activity.Metadata != nil {
		metadataJSON, err = json.Marshal(activity.Metadata)
		if err != nil {
			log.Printf("Error marshaling metadata: %v", err)
			metadataJSON = nil
		}
	}

	query := `
		INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, entity_name, metadata, ip_address, user_agent, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err = l.db.ExecContext(ctx, query,
		uuid.New(),
		activity.UserID,
		activity.Action,
		activity.EntityType,
		activity.EntityID,
		activity.EntityName,
		metadataJSON,
		activity.IPAddress,
		activity.UserAgent,
		time.Now(),
	)

	if err != nil {
		log.Printf("Error logging activity: %v", err)
		return err
	}

	return nil
}

// LogLogin logs a user login event
func (l *Logger) LogLogin(ctx context.Context, userID uuid.UUID, ipAddress, userAgent string) error {
	return l.LogActivity(ctx, models.ActivityLog{
		UserID:     userID,
		Action:     "login",
		EntityType: "auth",
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
	})
}

// LogLogout logs a user logout event
func (l *Logger) LogLogout(ctx context.Context, userID uuid.UUID, ipAddress, userAgent string) error {
	return l.LogActivity(ctx, models.ActivityLog{
		UserID:     userID,
		Action:     "logout",
		EntityType: "auth",
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
	})
}

// LogCreate logs entity creation
func (l *Logger) LogCreate(ctx context.Context, userID uuid.UUID, entityType string, entityID uuid.UUID, entityName, ipAddress, userAgent string) error {
	return l.LogActivity(ctx, models.ActivityLog{
		UserID:     userID,
		Action:     "created",
		EntityType: entityType,
		EntityID:   &entityID,
		EntityName: entityName,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
	})
}

// LogUpdate logs entity update
func (l *Logger) LogUpdate(ctx context.Context, userID uuid.UUID, entityType string, entityID uuid.UUID, entityName, ipAddress, userAgent string) error {
	return l.LogActivity(ctx, models.ActivityLog{
		UserID:     userID,
		Action:     "updated",
		EntityType: entityType,
		EntityID:   &entityID,
		EntityName: entityName,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
	})
}

// LogDelete logs entity deletion
func (l *Logger) LogDelete(ctx context.Context, userID uuid.UUID, entityType string, entityID uuid.UUID, entityName, ipAddress, userAgent string) error {
	return l.LogActivity(ctx, models.ActivityLog{
		UserID:     userID,
		Action:     "deleted",
		EntityType: entityType,
		EntityID:   &entityID,
		EntityName: entityName,
		IPAddress:  ipAddress,
		UserAgent:  userAgent,
	})
}
