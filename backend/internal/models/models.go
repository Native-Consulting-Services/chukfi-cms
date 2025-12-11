package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	DisplayName  string    `json:"displayName" db:"display_name"`
	Name         string    `json:"name" db:"name"`
	Avatar       string    `json:"avatar" db:"avatar"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
	Roles        []Role    `json:"roles,omitempty"`
}

type Role struct {
	ID          uuid.UUID    `json:"id" db:"id"`
	Name        string       `json:"name" db:"name"`
	Description string       `json:"description" db:"description"`
	CreatedAt   time.Time    `json:"createdAt" db:"created_at"`
	UpdatedAt   time.Time    `json:"updatedAt" db:"updated_at"`
	Permissions []Permission `json:"permissions,omitempty"`
}

type Permission struct {
	ID         uuid.UUID `json:"id" db:"id"`
	RoleID     uuid.UUID `json:"roleId" db:"role_id"`
	Collection string    `json:"collection" db:"collection"`
	CanCreate  bool      `json:"canCreate" db:"can_create"`
	CanRead    bool      `json:"canRead" db:"can_read"`
	CanUpdate  bool      `json:"canUpdate" db:"can_update"`
	CanDelete  bool      `json:"canDelete" db:"can_delete"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt  time.Time `json:"updatedAt" db:"updated_at"`
}

type Collection struct {
	ID        uuid.UUID              `json:"id" db:"id"`
	Slug      string                 `json:"slug" db:"slug"`
	Label     string                 `json:"label" db:"label"`
	Schema    map[string]interface{} `json:"schema" db:"schema"`
	CreatedAt time.Time              `json:"createdAt" db:"created_at"`
	UpdatedAt time.Time              `json:"updatedAt" db:"updated_at"`
}

type Document struct {
	ID           uuid.UUID              `json:"id" db:"id"`
	CollectionID uuid.UUID              `json:"collectionId" db:"collection_id"`
	Data         map[string]interface{} `json:"data" db:"data"`
	Status       string                 `json:"status" db:"status"` // draft, published
	CreatedAt    time.Time              `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time              `json:"updatedAt" db:"updated_at"`
	PublishedAt  *time.Time             `json:"publishedAt" db:"published_at"`
}

type Media struct {
	ID           uuid.UUID `json:"id" db:"id"`
	Filename     string    `json:"filename" db:"filename"`
	OriginalName string    `json:"originalName" db:"original_name"`
	MimeType     string    `json:"mimeType" db:"mime_type"`
	Size         int64     `json:"size" db:"size"`
	URL          string    `json:"url" db:"url"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
}

type ActivityLog struct {
	ID         uuid.UUID              `json:"id" db:"id"`
	UserID     uuid.UUID              `json:"userId" db:"user_id"`
	Action     string                 `json:"action" db:"action"`
	EntityType string                 `json:"entityType" db:"entity_type"`
	EntityID   *uuid.UUID             `json:"entityId,omitempty" db:"entity_id"`
	EntityName string                 `json:"entityName,omitempty" db:"entity_name"`
	Metadata   map[string]interface{} `json:"metadata,omitempty" db:"metadata"`
	IPAddress  string                 `json:"ipAddress,omitempty" db:"ip_address"`
	UserAgent  string                 `json:"userAgent,omitempty" db:"user_agent"`
	CreatedAt  time.Time              `json:"createdAt" db:"created_at"`
}

type ActivityLogResponse struct {
	ID         uuid.UUID              `json:"id"`
	UserID     uuid.UUID              `json:"userId"`
	UserName   string                 `json:"userName"`
	UserAvatar string                 `json:"userAvatar"`
	Action     string                 `json:"action"`
	EntityType string                 `json:"entityType"`
	EntityID   *uuid.UUID             `json:"entityId,omitempty"`
	EntityName string                 `json:"entityName,omitempty"`
	Metadata   map[string]interface{} `json:"metadata,omitempty"`
	IPAddress  string                 `json:"ipAddress,omitempty"`
	UserAgent  string                 `json:"userAgent,omitempty"`
	CreatedAt  time.Time              `json:"createdAt"`
}

// Request/Response models
type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
}

type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	User         User   `json:"user"`
}

type SignupRequest struct {
	Email       string `json:"email" validate:"required,email"`
	Password    string `json:"password" validate:"required,min=8"`
	DisplayName string `json:"display_name" validate:"required"`
}

type CreateUserRequest struct {
	Email       string      `json:"email" validate:"required,email"`
	Password    string      `json:"password" validate:"required,min=6"`
	DisplayName string      `json:"displayName" validate:"required"`
	RoleIDs     []uuid.UUID `json:"roleIds"`
}

type UpdateUserRequest struct {
	Email       *string     `json:"email,omitempty"`
	DisplayName *string     `json:"displayName,omitempty"`
	RoleIDs     []uuid.UUID `json:"roleIds,omitempty"`
}

type CreateRoleRequest struct {
	Name        string              `json:"name" validate:"required"`
	Description string              `json:"description"`
	Permissions []PermissionRequest `json:"permissions"`
}

type UpdateRoleRequest struct {
	Name        *string             `json:"name,omitempty"`
	Description *string             `json:"description,omitempty"`
	Permissions []PermissionRequest `json:"permissions,omitempty"`
}

type PermissionRequest struct {
	Collection string `json:"collection" validate:"required"`
	CanCreate  bool   `json:"canCreate"`
	CanRead    bool   `json:"canRead"`
	CanUpdate  bool   `json:"canUpdate"`
	CanDelete  bool   `json:"canDelete"`
}

type CreateCollectionRequest struct {
	Slug   string                 `json:"slug" validate:"required"`
	Label  string                 `json:"label" validate:"required"`
	Schema map[string]interface{} `json:"schema" validate:"required"`
}

type UpdateCollectionRequest struct {
	Label  *string                `json:"label,omitempty"`
	Schema map[string]interface{} `json:"schema,omitempty"`
}

type CreateDocumentRequest struct {
	Data   map[string]interface{} `json:"data" validate:"required"`
	Status string                 `json:"status"`
}

type UpdateDocumentRequest struct {
	Data   map[string]interface{} `json:"data,omitempty"`
	Status *string                `json:"status,omitempty"`
}
