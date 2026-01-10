package generate_types

import (
	"fmt"
	"os"
	"strings"

	"gorm.io/gorm"
	"native-consult.io/chukfi-cms/src/lib/schemaregistry"
)

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

func GenerateTypescriptTypes(config *GenerateTypesConfig) {
	types := schemaregistry.GenerateAllTypescriptInterfaces()

	println("GenerateTypescript:")
	for tableName, tsType := range types {
		fmt.Printf("Table: %s\nType:\n%s\n\n", tableName, tsType)
	}

	// save to cms.types.ts
	var typeStrings []string
	for _, tsType := range types {
		typeStrings = append(typeStrings, tsType)
	}
	err := os.WriteFile("cms.types.ts", []byte(strings.Join(typeStrings, "\n\n")), 0644)
	if err != nil {
		panic("failed to write typescript types to file: " + err.Error())
	}
}
