package main

import (
	"os"

	"github.com/Native-Consulting-Services/chukfi-cms"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	chukficms.SetupChukfi(chukficms.ChufkiSetup{
		Port: "3000",
		TiDB_DSN: os.Getenv("TIDB_DATABASE_DSN"),
	})
}

