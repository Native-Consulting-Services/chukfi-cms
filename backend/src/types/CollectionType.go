package types

import (
	"time"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type BaseCollectionType struct {
	ID        uuid.UUID `gorm:"type:char(36);primary_key;"`
	UpdatedBy uuid.UUID `gorm:"type:char(36);index"`
	UpdatedAt time.Time
	DeletedAt gorm.DeletedAt `gorm:"index"`
}

