package database

import (
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var DB *gorm.DB

func InitDatabase(dsn string) {

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect database:" + err.Error())
	}

	// Migrate the schema
	db.AutoMigrate(AllModels...)

	// create mock user if not exists

	testUser := User{
		Fullname: "Robbie Tester",
		Email:    "user@rmfosho.me",
		Password: "$2a$10$qPJw.JJ0VkLIYWGFakFRlOpcLRs80hWE07hFq7KiYZ3mSLN2L0oae", // robbie.morgan@xcope.ai lol
	}

	// check if user exists
	var existingUser User
	result := db.Where("email = ?", testUser.Email).First(&existingUser)
	if result.Error != nil && result.Error == gorm.ErrRecordNotFound {
		db.Create(&testUser)
		println("Created mock user: " + testUser.Email)
	}

	DB = db

}
