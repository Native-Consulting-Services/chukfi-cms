package main

import (
	"github.com/Native-Consulting-Services/chufki-cms-backend/database/schema"
)

type APIKeys struct {
	schema.BaseModel
	schema.AdminOnly
	Key        string `gorm:"type:char(64);not null;uniqueIndex"`
	OwnerEmail string `gorm:"type:varchar(100);not null;index"`
	ExpiresAt  int64  `gorm:"not null;index"`
}

type Post struct {
	schema.BaseModel
	Type  string `gorm:"type:varchar(100);not null"`
	Body  string `gorm:"type:text;not null"`
	Title string `gorm:"type:varchar(255);not null;index"`

	AuthorID string `gorm:"type:char(36);index"`
}
