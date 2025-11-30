package licitmiddleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	database "github.com/Native-Consulting-Services/chukfi-cms/src/database"
	"github.com/Native-Consulting-Services/chukfi-cms/src/userCache"
	"github.com/Native-Consulting-Services/chukfi-cms/src/utils"
)

func CaseSensitiveMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.ToLower(r.URL.Path)

		// also set cors

		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func SaveAuthTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		cookies := r.Cookies()

		// find auth cookie called "authToken"

		ctx := r.Context()

		for _, cookie := range cookies {
			println("cookies", cookie.Name)

			if cookie.Name == "chukfi_token" {
				// save to context for later use
				ctx = context.WithValue(ctx, "authToken", cookie.Value)
				break
			}
		}

		// if no cookie, check authorization header
		if ctx.Value("authToken") == nil {
			authHeader := r.Header.Get("Authorization")
			if authHeader != "" {
				ctx = context.WithValue(ctx, "authToken", strings.Replace(authHeader, "Bearer ", "", 1))
			}
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if database.DB == nil {
			utils.SendErrorResponse(w, r, "Database not initialized", http.StatusInternalServerError)
			return
		}

		authToken, ok := r.Context().Value("authToken").(string)

		if !ok || authToken == "" {
			utils.SendErrorResponse(w, r, "Unauthorized: No auth token provided", http.StatusUnauthorized)
			return
		}

		cachedData, found := userCache.UserCacheInstance.Get(authToken)

		if found {
			// save userID to context for later use
			ctx := context.WithValue(r.Context(), "userID", cachedData.ID)
			next.ServeHTTP(w, r.WithContext(ctx))
			return
		}

		var userToken database.UserToken
		result := database.DB.Where("token = ?", authToken).First(&userToken)

		if result.Error != nil {
			utils.SendErrorResponse(w, r, "Unauthorized: Invalid auth token", http.StatusUnauthorized)
			return
		}

		// check if int64 date is longer than now
		if userToken.ExpiresAt < time.Now().Unix() {
			utils.SendErrorResponse(w, r, "Unauthorized: Auth token expired", http.StatusUnauthorized)
			return
		}

		// save userID to context for later use
		ctx := context.WithValue(r.Context(), "userID", userToken.UserID)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
