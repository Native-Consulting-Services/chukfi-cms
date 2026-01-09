package router

import (
	"context"
	"fmt"
	"net/http"
	"runtime"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"gorm.io/gorm"
	"native-consult.io/chukfi-cms/database/schema"
	"native-consult.io/chukfi-cms/src/chumiddleware"
	"native-consult.io/chukfi-cms/src/httpresponder"
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

func SetupRouter() *chi.Mux {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(chumiddleware.CaseSensitiveMiddleware)
	r.Use(chumiddleware.SaveAuthTokenMiddleware)

	r.Get("/", func(w http.ResponseWriter, r *http.Request) {
		// get ram, usage
		var memStats runtime.MemStats
		runtime.ReadMemStats(&memStats)

		// bytes to MB

		mb := memStats.Alloc / 1024 / 1024

		// output
		w.Write([]byte(fmt.Sprintf("RAM Usage: %d MB\nOK!\n", mb)))
	})

	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404"))
	})

	return r
}
