package chukficms

import (
	"fmt"
	"net/http"
	"runtime"

	"github.com/Native-Consulting-Services/chukfi-cms/src/database"
	"github.com/Native-Consulting-Services/chukfi-cms/src/routes"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type ChufkiSetup struct {
	TiDB_DSN string
	Port     string

	Collections []interface{}
}

func SetupChukfi(setup ChufkiSetup) {
	if setup.Port == "" {
		setup.Port = "3000"
	}

	r := chi.NewRouter()
	r.Use(middleware.Logger)

	database.InitDatabase(setup.TiDB_DSN)

	r.Route("/api/admin", func(r chi.Router) {
		routes.RegisterRoutes(r) // default chukfi routes

		r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
			// get ram, usage
			var memStats runtime.MemStats
			runtime.ReadMemStats(&memStats)

			// bytes to MB

			mb := memStats.Alloc / 1024 / 1024

			// output
			w.Write([]byte(fmt.Sprintf("RAM Usage: %d MB\nOK!\n", mb)))
		})

	})

	// 404
	r.NotFound(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusNotFound)
		w.Write([]byte("404"))
	})

	fmt.Println("Chukfi-CMS setup on http://localhost:" + setup.Port)

	fmt.Println("Routes:")

	chi.Walk(r, func(method string, route string, handler http.Handler, middlewares ...func(http.Handler) http.Handler) error {
		fmt.Printf("[%s]: '%s' has %d middlewares\n", method, route, len(middlewares))
		return nil
	})

	http.ListenAndServe(":"+setup.Port, r)
}
