package database

import (
	"database/sql"
	"log"
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "modernc.org/sqlite"
)

var DB *gorm.DB

func Connect() {
	dbPath := os.Getenv("DB_PATH")
	if dbPath == "" {
		dbPath = "data.db"
	}
	sqlDB, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal("Failed to open database/sql DB:", err)
	}

	DB, err = gorm.Open(sqlite.New(sqlite.Config{
		Conn: sqlDB,
	}), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to SQLite:", err)
	}
	log.Println("Connected to SQLite database!")
}
