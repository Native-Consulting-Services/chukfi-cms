package generate_types

import (
	"fmt"
	"os"
	"strings"

	"gorm.io/gorm"
	"native-consult.io/chukfi-cms/src/lib/astparser"
	"native-consult.io/chukfi-cms/src/lib/detection"
	"native-consult.io/chukfi-cms/src/lib/schemaregistry"

	mysql "native-consult.io/chukfi-cms/database/mysql"
)

var isVerbose bool = false

func printlnVerbose(message string) {
	if isVerbose {
		fmt.Println(message)
	}
}

type GenerateTypesConfig struct {
	Schema   []interface{}
	Database *gorm.DB
}

func NewGenerateTypesConfig(schema []interface{}, database *gorm.DB) *GenerateTypesConfig {
	return &GenerateTypesConfig{
		Schema:   schema,
		Database: database,
	}
}

func GenerateTypescriptTypes(config *GenerateTypesConfig) []byte {
	types := schemaregistry.GenerateAllTypescriptInterfaces()

	var typeStrings []string
	for _, tsType := range types {
		typeStrings = append(typeStrings, tsType)
	}

	return []byte(strings.Join(typeStrings, "\n\n"))
}

func GenerateTypescriptFromSchemaFile(schemaPath string) (string, error) {
	structs, err := astparser.ParseSchemaFile(schemaPath)
	if err != nil {
		return "", fmt.Errorf("failed to parse schema file: %w", err)
	}

	if len(structs) == 0 {
		return "", fmt.Errorf("no structs found in schema file")
	}

	fmt.Printf("Found %d struct(s) in schema file:\n", len(structs))
	for _, s := range structs {
		fmt.Printf("  - %s (%d fields)\n", s.Name, len(s.Fields))
	}

	typescriptCode := astparser.GenerateTypescriptFromParsed(structs) // :)

	return typescriptCode, nil
}

func printHelp() {
	fmt.Println(`
Usage: go run main.go generate-types [options]

Options:
  --schema=<path>    Path to a Go file containing your schema structs
                     (e.g., --schema=./schema.go)

  --output=<path>    Output path for generated TypeScript file
                     (default: cms.types.ts)

  --database=<type>  Database type (mysql/postgres)
                     Only needed when not using --schema

Examples:
  go run main.go generate-types --schema=../backend-test/schema.go
  go run main.go generate-types --schema=./myschema.go --output=./types/api.ts
`)
}

func CLI(dsn string, customSchema []interface{}, args []string) {
	var schemaPath string
	var outputPath string
	var showHelp bool
	var databaseProvider detection.DatabaseType = detection.Unknown

	for _, arg := range args {
		if strings.HasPrefix(arg, "--schema=") {
			schemaPath = strings.TrimPrefix(arg, "--schema=")
		}
		if strings.HasPrefix(arg, "--output=") {
			outputPath = strings.TrimPrefix(arg, "--output=")
		}
		if arg == "--help" || arg == "-h" {
			showHelp = true
		}
		if arg == "--verbose" || arg == "-v" {
			isVerbose = true
			printlnVerbose("is verbose!")
		}
		if strings.HasPrefix(arg, "--database=") {
			databaseArg := strings.TrimPrefix(arg, "--database=")
			switch databaseArg {
			case "mysql":
				databaseProvider = detection.MySQL
			case "postgres":
				databaseProvider = detection.PostgreSQL
			default:
				databaseProvider = detection.Unknown
			}
		}
	}

	if showHelp {
		printHelp()
		return
	}

	if dsn == "" {
		fmt.Println("No DATABASE_DSN not set.")
		printHelp()
		os.Exit(1)
	}

	if databaseProvider == detection.Unknown {
		printlnVerbose("no database, detecting")
		databaseProvider = detection.DetectDatabaseType(dsn)
	}

	if schemaPath == "" {
		fmt.Println("No schema file provided, set one using --schema=<path> to generate types from a Go schema file.")
		return
	}

	if databaseProvider == detection.Unknown {
		panic("Failed to detect the database type, please retry the command with --database=mysql/postgres/etc.")
	}

	switch databaseProvider {
	case detection.MySQL:
		mysql.InitDatabase(customSchema)

		GenerateTypesConfig := NewGenerateTypesConfig(customSchema, mysql.DB)
		bytes := GenerateTypescriptTypes(GenerateTypesConfig)

		typescriptCode, err := GenerateTypescriptFromSchemaFile(schemaPath)

		if err != nil {
			fmt.Fprintf(os.Stderr, "Error: %v\n", err)
			os.Exit(1)
		}

		// append bytes to typescriptCode with a newline in between
		typescriptCode += "\n\n" + string(bytes)

		if outputPath == "" {
			outputPath = "./cms.types.ts"
		}

		err = os.WriteFile(outputPath, []byte(typescriptCode), 0644)
		if err != nil {
			fmt.Fprintf(os.Stderr, "Error writing TypeScript file: %v\n", err)
			os.Exit(1)
		}
		println("Done! Types have been generated to ./cms.types.ts")
	default:
		panic("Database type not supported yet for type generation")
	}
}
