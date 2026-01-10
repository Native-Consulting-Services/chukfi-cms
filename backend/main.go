package main

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
	cli_generate_types "native-consult.io/chukfi-cms/internal/cli/generate-types"
)

func main() {
	godotenv.Load()

	args := os.Args[1:]

	if len(args) == 0 {
		println("No command provided")
		os.Exit(0)
		return
	}

	command := args[0]
	otherArgs := args[1:]
	println(strings.Join(args, " "))

	switch command {
	case "generate-types":
		dsn := os.Getenv("DATABASE_DSN")

		cli_generate_types.CLI(dsn, []interface{}{}, otherArgs)
	}
}
