package routes

import (
	authroutes "github.com/Native-Consulting-Services/chukfi-cms/src/routes/auth"
	"github.com/go-chi/chi/v5"
)

func RegisterRoutes(r chi.Router) {
	authroutes.Register(r)
}
