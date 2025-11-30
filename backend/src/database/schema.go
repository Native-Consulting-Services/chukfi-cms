package database

import (
	"github.com/Native-Consulting-Services/chukfi-cms/src/types"
	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

type UserToken struct {
	types.BaseCollectionType
	UserID    uuid.UUID `gorm:"type:char(36);not null;index"`
	Token     string    `gorm:"type:char(64);not null;uniqueIndex"`
	ExpiresAt int64     `gorm:"not null;index"`

	HiddenType string `gorm:"-:all"` // to hide type field from gorm
}

type User struct {
	types.BaseCollectionType
	ID       uuid.UUID `gorm:"type:char(36);primary_key;"`
	Fullname string    `gorm:"type:varchar(255);not null;"`
	Email    string    `gorm:"type:char(32);not null;uniqueIndex"`
	Password string    `gorm:"type:varchar(255);not null;"`

	Tokens []UserToken
}

func (user *User) BeforeCreate(tx *gorm.DB) (err error) {
	user.ID = uuid.NewV4()
	return
}

var AllModels = []interface{}{
	&User{},
	&UserToken{},
}
