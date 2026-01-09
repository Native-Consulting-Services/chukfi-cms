package database

import (
	"context"
	"os"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"native-consult.io/chukfi-cms/database/global"
	"native-consult.io/chukfi-cms/src/lib/permissions"
)

var DB *gorm.DB

func InitDatabase(schema []interface{}) {
	err := godotenv.Load()
	if err != nil {
		panic("Error loading .env file")
	}

	dsn := os.Getenv("DATABASE_DSN")

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		DisableForeignKeyConstraintWhenMigrating: true,
	})

	if err != nil {
		panic("failed to connect database:" + err.Error())
	}

	fullSchema := append(schema, global.DefaultSchema...)

	db.AutoMigrate(fullSchema...)

	// create base user

	basePassword, err := bcrypt.GenerateFromPassword([]byte("chukfi123"), bcrypt.DefaultCost)
	if err != nil {
		panic("failed to hash base user password:" + err.Error())
	}

	user := global.User{
		Fullname:    "Chukfi Admin",
		Password:    string(basePassword),
		Email:       "admin@nativeconsult.io",
		Permissions: uint(permissions.Admin),
	}

	err = gorm.G[global.User](db).Create(context.Background(), &user)

	if err != nil {
		panic("failed to create base user:" + err.Error())
	}

	// setup :)
	DB = db

}
