package chumiddleware

import (
	"context"
	"net/http"
	"strings"
)

func CaseSensitiveMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		r.URL.Path = strings.ToLower(r.URL.Path)
		next.ServeHTTP(w, r)
	})
}

func SaveAuthTokenMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		cookies := r.Cookies()
		ctx := r.Context()

		// find auth cookie called "authToken"

		for _, cookie := range cookies {
			if cookie.Name == "chukfi_auth_token" {
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
