package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"chukfi-cms/backend/internal/auth"
	"chukfi-cms/backend/internal/db"
	"chukfi-cms/backend/internal/handlers"
	"chukfi-cms/backend/internal/middleware"

	"github.com/go-chi/chi/v5"
	chimiddleware "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Get configuration from environment
	port := getEnv("PORT", "8080")
	dbURL := getEnv("DATABASE_URL", "postgres://chukfi:password@localhost:5432/chukfi_cms?sslmode=disable")
	jwtSecret := getEnv("JWT_SECRET", "your-secret-key")

	// Initialize database
	database, err := db.NewDB(dbURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer database.Close()

	// Initialize auth service
	authService := auth.NewService(jwtSecret, database)

	// Initialize handlers
	h := &handlers.Handler{
		DB:          database,
		AuthService: authService,
	}

	// Setup router
	r := chi.NewRouter()

	// Global middleware
	r.Use(chimiddleware.RequestID)
	r.Use(chimiddleware.RealIP)
	r.Use(chimiddleware.Logger)
	r.Use(chimiddleware.Recoverer)
	r.Use(chimiddleware.Timeout(60 * time.Second))

	// CORS configuration
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:4321", "http://localhost:3000"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Health check endpoint
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		fmt.Fprint(w, `{"status":"ok","service":"chukfi-cms"}`)
	})

	// API routes
	r.Route("/api/v1", func(r chi.Router) {
		// Auth routes (public)
		r.Route("/auth", func(r chi.Router) {
			r.Post("/login", h.Login)
			r.Post("/refresh", h.RefreshToken)
			r.With(middleware.RequireAuth(authService)).Post("/logout", h.Logout)
			r.With(middleware.RequireAuth(authService)).Get("/me", h.GetCurrentUser)
		})

		// Protected routes
		r.Group(func(r chi.Router) {
			r.Use(middleware.RequireAuth(authService))

			// Users
			r.Route("/users", func(r chi.Router) {
				r.Use(middleware.RequirePermission("users", "read"))
				r.Get("/", h.GetUsers)
				r.With(middleware.RequirePermission("users", "create")).Post("/", h.CreateUser)
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", h.GetUser)
					r.With(middleware.RequirePermission("users", "update")).Patch("/", h.UpdateUser)
					r.With(middleware.RequirePermission("users", "delete")).Delete("/", h.DeleteUser)
				})
			})

			// Roles
			r.Route("/roles", func(r chi.Router) {
				r.Use(middleware.RequirePermission("roles", "read"))
				r.Get("/", h.GetRoles)
				r.With(middleware.RequirePermission("roles", "create")).Post("/", h.CreateRole)
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", h.GetRole)
					r.With(middleware.RequirePermission("roles", "update")).Patch("/", h.UpdateRole)
					r.With(middleware.RequirePermission("roles", "delete")).Delete("/", h.DeleteRole)
				})
			})

			// Collections
			r.Route("/collections", func(r chi.Router) {
				r.Use(middleware.RequirePermission("collections", "read"))
				r.Get("/", h.GetCollections)
				r.With(middleware.RequirePermission("collections", "create")).Post("/", h.CreateCollection)
				r.Route("/{slug}", func(r chi.Router) {
					r.Get("/", h.GetCollection)
					r.With(middleware.RequirePermission("collections", "update")).Patch("/", h.UpdateCollection)
					r.With(middleware.RequirePermission("collections", "delete")).Delete("/", h.DeleteCollection)

					// Documents for this collection
					r.Route("/documents", func(r chi.Router) {
						r.Get("/", h.GetDocuments)
						r.Post("/", h.CreateDocument)
						r.Route("/{id}", func(r chi.Router) {
							r.Get("/", h.GetDocument)
							r.Patch("/", h.UpdateDocument)
							r.Delete("/", h.DeleteDocument)
						})
					})
				})
			})

			// Media
			r.Route("/media", func(r chi.Router) {
				r.Use(middleware.RequirePermission("media", "read"))
				r.Get("/", h.GetMedia)
				r.With(middleware.RequirePermission("media", "create")).Post("/", h.UploadMedia)
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", h.GetMediaItem)
					r.With(middleware.RequirePermission("media", "delete")).Delete("/", h.DeleteMedia)
				})
			})
		})
	})

	// Create server
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on port %s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal("Failed to start server:", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give outstanding requests 30 seconds to complete
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal("Server forced to shutdown:", err)
	}

	log.Println("Server exited")
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}