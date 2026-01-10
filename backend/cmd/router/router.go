package router

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"gorm.io/gorm"
	"native-consult.io/chukfi-cms/database/schema"
	"native-consult.io/chukfi-cms/src/chumiddleware"
	"native-consult.io/chukfi-cms/src/httpresponder"
	"native-consult.io/chukfi-cms/src/lib/permissions"
	"native-consult.io/chukfi-cms/src/lib/schemaregistry"
)

func GetUserIDFromRequest(request *http.Request) string {
	userID, ok := request.Context().Value("userID").(string)
	if !ok || userID == "" {
		return ""
	}
	return userID
}

func GetUserFromRequest(request *http.Request, database *gorm.DB) (*schema.User, error) {
	userID, ok := request.Context().Value("userID").(string)
	if !ok || userID == "" {
		return nil, fmt.Errorf("no user ID in request context")
	}
	var user schema.User
	result := database.Where("id = ?", userID).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}

func RequestRequiresPermission(request *http.Request, database *gorm.DB, requiredPermissions permissions.Permission) bool {
	userID, ok := request.Context().Value("userID").(string)
	if !ok || userID == "" {
		return false
	}

	var user schema.User
	result := database.Where("id = ?", userID).First(&user)

	if result.Error != nil {
		return false
	}

	return permissions.HasPermission(permissions.Permission(user.Permissions), requiredPermissions)

}
func RouteRequiresPermission(database *gorm.DB, required permissions.Permission) func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userId, ok := r.Context().Value("userID").(string)
			if !ok || userId == "" {
				httpresponder.SendErrorResponse(w, r, "Unauthorized: No user ID in context", http.StatusUnauthorized)
				return
			}
			user, err := GetUserFromRequest(r, database)
			if err != nil {
				httpresponder.SendErrorResponse(w, r, "Unauthorized: "+err.Error(), http.StatusUnauthorized)
				return
			}
			if !permissions.HasPermission(permissions.Permission(user.Permissions), required) {
				httpresponder.SendErrorResponse(w, r, "Forbidden: Insufficient permissions", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func AuthMiddlewareWithDatabase(database *gorm.DB) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if database == nil {
				httpresponder.SendErrorResponse(w, r, "Database not initialized", http.StatusInternalServerError)
				return
			}

			authToken, ok := r.Context().Value("authToken").(string)

			if !ok || authToken == "" {
				httpresponder.SendErrorResponse(w, r, "Unauthorized: No auth token provided", http.StatusUnauthorized)
				return
			}

			result, err := gorm.G[schema.UserToken](database).Where("token = ? AND expires_at > ?", authToken, time.Now().Unix()).First(r.Context())

			if err != nil {
				httpresponder.SendErrorResponse(w, r, "Unauthorized: Invalid auth token", http.StatusUnauthorized)
				return
			}

			if result.ExpiresAt < time.Now().Unix() {
				httpresponder.SendErrorResponse(w, r, "Unauthorized: Auth token expired", http.StatusUnauthorized)
				return
			}

			ctx := context.WithValue(r.Context(), "userID", result.UserID)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func SetupRouter(database *gorm.DB) *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(chumiddleware.CaseSensitiveMiddleware)
	r.Use(chumiddleware.SaveAuthTokenMiddleware)

	// admin routes with database so /admin/collection/${collectionName}/get

	r.Route("/admin", func(r chi.Router) {
		r.Route("/collection", func(r chi.Router) {
			r.Route("/{collectionName}", func(r chi.Router) {

				// auth mandated routes

				r.Group(func(r chi.Router) {
					r.Use(AuthMiddlewareWithDatabase(database))

					r.Get("/metadata", func(w http.ResponseWriter, r *http.Request) {
						hasPermission := RequestRequiresPermission(r, database, permissions.ViewModels)
						if !hasPermission {
							httpresponder.SendErrorResponse(w, r, "Forbidden: You do not have permission to access this collection metadata", http.StatusForbidden)
							return
						}

						collectionName := chi.URLParam(r, "collectionName")

						resolvedName, exists := schemaregistry.ResolveTableName(collectionName)
						if !exists {
							httpresponder.SendErrorResponse(w, r, "Invalid collection name: "+collectionName, http.StatusBadRequest)
							return
						}
						collectionName = resolvedName

						metadata, _ := schemaregistry.GetMetadata(collectionName)

						httpresponder.SendNormalResponse(w, r, metadata)
					})

					r.Post("/create", func(w http.ResponseWriter, r *http.Request) {
						// this route creates a new entry in the specified collection
						collectionName := chi.URLParam(r, "collectionName")

						// resolve collection name (allows singular or plural)
						resolvedName, exists := schemaregistry.ResolveTableName(collectionName)
						if !exists {
							httpresponder.SendErrorResponse(w, r, "Invalid collection name: "+collectionName, http.StatusBadRequest)
							return
						}
						collectionName = resolvedName

						if schemaregistry.IsAdminOnly(collectionName) {
							hasPermission := RequestRequiresPermission(r, database, permissions.ManageModels)
							if !hasPermission {
								httpresponder.SendErrorResponse(w, r, "Forbidden: You do not have permission to access this collection metadata", http.StatusForbidden)
								return
							}
						}

						// parse body into map
						var data map[string]interface{}
						err := json.NewDecoder(r.Body).Decode(&data)
						if err != nil {
							httpresponder.SendErrorResponse(w, r, "Invalid request body: "+err.Error(), http.StatusBadRequest)
							return
						}

						missing, unknown := schemaregistry.ValidateBody(collectionName, data)

						if len(missing) > 0 {
							httpresponder.SendErrorResponse(w, r, "Missing required fields: "+strings.Join(missing, ", "), http.StatusBadRequest)
							return
						}

						if len(unknown) > 0 {
							httpresponder.SendErrorResponse(w, r, "Unknown fields: "+strings.Join(unknown, ", "), http.StatusBadRequest)
							return
						}

						result := gorm.G[map[string]interface{}](database).Table(collectionName).Create(r.Context(), &data)

						if result != nil {
							httpresponder.SendErrorResponse(w, r, "Error creating entry: "+result.Error(), http.StatusInternalServerError)
							return
						}

						httpresponder.SendNormalResponse(w, r, data)

					})
				})

				// non auth mandated routes
				r.Get("/get", func(w http.ResponseWriter, r *http.Request) {
					collectionName := chi.URLParam(r, "collectionName")

					// resolve collection name (allows singular or plural)
					resolvedName, exists := schemaregistry.ResolveTableName(collectionName)
					if !exists {
						httpresponder.SendErrorResponse(w, r, "Invalid collection name: "+collectionName, http.StatusBadRequest)
						return
					}
					collectionName = resolvedName

					if schemaregistry.IsAdminOnly(collectionName) {
						// check auth
						hasPermission := RequestRequiresPermission(r, database, permissions.ManageModels)
						if !hasPermission {
							httpresponder.SendErrorResponse(w, r, "Forbidden: You do not have permission to access this collection metadata", http.StatusForbidden)
							return
						}
					}

					var results []map[string]interface{}

					result, err := gorm.G[map[string]interface{}](database).Table(collectionName).Find(r.Context())
					if err != nil {
						if err == gorm.ErrRecordNotFound {
							httpresponder.SendErrorResponse(w, r, "Invalid collection name: "+collectionName, http.StatusBadRequest)
							return
						}
						httpresponder.SendErrorResponse(w, r, "Error fetching collection: "+err.Error(), http.StatusInternalServerError)
						return
					}
					results = result

					httpresponder.SendNormalResponse(w, r, results)
				})
			})

		})
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404"))
	})

	return r
}
