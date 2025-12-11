package models

import "time"

// EventRegistration represents a user's registration for an event
type EventRegistration struct {
	ID           string     `json:"id" db:"id"`
	EventID      string     `json:"event_id" db:"event_id"`
	UserID       *string    `json:"user_id" db:"user_id"`
	Status       string     `json:"status" db:"status"`
	Name         string     `json:"name" db:"name"`
	Email        string     `json:"email" db:"email"`
	Notes        *string    `json:"notes" db:"notes"`
	RegisteredAt time.Time  `json:"registered_at" db:"registered_at"`
	CheckedInAt  *time.Time `json:"checked_in_at" db:"checked_in_at"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
}

// RegisterEventRequest represents the request body for event registration
type RegisterEventRequest struct {
	Name  string  `json:"name" validate:"required"`
	Email string  `json:"email" validate:"required,email"`
	Notes *string `json:"notes"`
}

// EventRegistrationResponse includes registration details with user info
type EventRegistrationResponse struct {
	EventRegistration
	UserDisplayName *string `json:"user_display_name,omitempty"`
}
