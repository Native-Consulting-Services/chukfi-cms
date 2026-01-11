package main

import (
	"net/http"

	uuid "github.com/satori/go.uuid"

	// crm
	databasehelper "native-consult.io/chukfi-cms/database/helper"
	database "native-consult.io/chukfi-cms/database/mysql"
	"native-consult.io/chukfi-cms/server/router"
	"native-consult.io/chukfi-cms/server/serve"
	"native-consult.io/chukfi-cms/src/httpresponder"
	"native-consult.io/chukfi-cms/src/lib/permissions"

	generate_types "native-consult.io/chukfi-cms/cmd/generate-types"

	// gorm
	"gorm.io/gorm"

	// chi
	"github.com/go-chi/chi/v5"
)

func main() {
	customSchema := []interface{}{
		&Post{},
		&APIKeys{},
	}
	database.InitDatabase(customSchema)

	// register custom permission
	_, err := permissions.RegisterPermission("ViewPosts")
	if err != nil {
		panic("failed to register permission: " + err.Error())
	}

	generate_types.GenerateTypescriptTypes(
		&generate_types.GenerateTypesConfig{
			Schema:   customSchema,
			Database: database.DB,
		},
	)

	// generate a post from schema
	testPost := Post{
		Type:     "blog",
		Body:     "This is a test post",
		Title:    "Test Post",
		AuthorID: uuid.NewV4().String(),
	}

	// check if test post exists
	result, err := databasehelper.Get[Post](database.DB).Where("title = ?", testPost.Title).Take()

	/* or by just using gorm directly, either works, up to preference :)
	var existingPost Post
	result := database.DB.Where("title = ?", testPost.Title).First(&existingPost)
	if result.Error != nil && result.Error == gorm.ErrRecordNotFound {
		err := gorm.G[Post](database.DB).Create(context.Background(), &testPost)
		if err != nil {
			panic("failed to create test post:" + err.Error())
		}
	}

	*/

	if err != nil || result.ID == uuid.Nil {
		// create test post
		database.DB.Create(&testPost)
	}

	r := router.SetupRouter(database.DB)

	serveConfig := serve.NewServeConfig("3000", []interface{}{}, database.DB, r)

	r.Get("/myroute", func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("OK from test main.go"))
	})

	r.Get("/posts", func(w http.ResponseWriter, r *http.Request) {
		posts, err := gorm.G[Post](database.DB).Find(r.Context())
		if err != nil {
			w.Write([]byte("Error fetching posts: " + err.Error()))
			return
		}

		httpresponder.SendNormalResponse(w, r, posts)
	})

	r.Route("/required-auth", func(r chi.Router) {
		r.Use(router.AuthMiddlewareWithDatabase(database.DB))

		// everything here now requires auth
		r.Get("/whoami", func(w http.ResponseWriter, r *http.Request) {
			// get userID from request
			userID := router.GetUserIDFromRequest(r)
			w.Write([]byte("Your user ID is: " + userID))

			// get full user info
			user, err := router.GetUserFromRequest(r, database.DB) // check /backend/cmd/router/router.go to see how this works, it uses context values from a middleware

			if err != nil {
				w.Write([]byte("Error getting user info: " + err.Error()))
				return
			}

			userInfo := "Fullname: " + user.Fullname + ", Email: " + user.Email + ", Permissions: " + string(rune(user.Permissions))
			w.Write([]byte("\n" + userInfo))
		})
	})

	serve.Serve(serveConfig)
}
