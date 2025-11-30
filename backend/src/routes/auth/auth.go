package authroutes

import (
	"encoding/json"
	"net/http"
	"net/mail"
	userCache "github.com/Native-Consulting-Services/chukfi-cms/src/userCache"
	database "github.com/Native-Consulting-Services/chukfi-cms/src/database"
	"github.com/Native-Consulting-Services/chukfi-cms/src/chumiddlewares"
	"github.com/Native-Consulting-Services/chukfi-cms/src/utils"

	"time"
	
	"github.com/go-chi/chi/v5"
	uuid "github.com/satori/go.uuid"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	// "github.com/go-chi/chi/v5/middleware"
)

// routes to register, login, logout & get user info

type RegisterResponse struct {
	Fullname string `json:"fullname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type LoginResponse struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func Register(r chi.Router) {
	r.Route("/auth", func(r chi.Router) {
		// login route

		r.Group(func(r chi.Router) {
			r.Use(licitmiddleware.AuthMiddleware)

			r.Get("/logout", func(w http.ResponseWriter, r *http.Request) {
				userID := r.Context().Value("userID").(uuid.UUID)
				token := r.Context().Value("authToken").(string)

				if userID == uuid.Nil || token == "" {
					utils.SendNormalResponse(w, r, map[string]interface{}{
						"message": "logged out",
					})
				}

				// delete token from db
				_, err := gorm.G[database.UserToken](database.DB).Where("token = ?", token).Delete(r.Context())

				if err != nil {
					println("Database error: " + err.Error())
					utils.SendErrorResponse(w, r, "Database error", http.StatusInternalServerError)
					return
				}

				// delete user from cache

				userCache.UserCacheInstance.Delete(token)

				// delete cookie
				http.SetCookie(w, &http.Cookie{
					Name:     "chukfi_token",
					Value:    "",
					HttpOnly: true,
					Expires:  time.Unix(0, 0),
					Path:     "/",
				})

				utils.SendNormalResponse(w, r, map[string]interface{}{
					"message": "logged out",
				})
			})

			r.Get("/me", func(w http.ResponseWriter, r *http.Request) {
				// get userId
				userID := r.Context().Value("userID").(uuid.UUID)
				token := r.Context().Value("authToken").(string)

				if userID == uuid.Nil {
					utils.SendErrorResponse(w, r, "Unauthorized", http.StatusUnauthorized)
					return
				}

				if token == "" {
					utils.SendErrorResponse(w, r, "Unauthorized", http.StatusUnauthorized)
					return
				}

				// get data from cache if its there
				cachedUser, found := userCache.UserCacheInstance.Get(token)

				if found {
					user := cachedUser
					utils.SendNormalResponse(w, r, map[string]interface{}{
						"fullname": user.Fullname,
						"email":    user.Email,
						"id":       user.ID,
						"success":  true,
					})
					return
				}

				// get user from db
				user, err := gorm.G[database.User](database.DB).Where("id = ?", userID).First(r.Context())
				if err != nil {
					if err == gorm.ErrRecordNotFound {
						utils.SendErrorResponse(w, r, "User not found", http.StatusNotFound)
						return
					}
					println("Database error: " + err.Error())
					utils.SendErrorResponse(w, r, "Database error", http.StatusInternalServerError)
					return
				}

				// add to cache
				userCache.UserCacheInstance.Set(token, user)
				utils.SendNormalResponse(w, r, map[string]interface{}{
					"fullname": user.Fullname,
					"email":    user.Email,
					"id":       user.ID,
					"success":  true,
				})
			})
		})
		r.Post("/login", func(w http.ResponseWriter, r *http.Request) {
			// check if token, if so, reject
			authToken, ok := r.Context().Value("authToken").(string)

			if ok && authToken != "" {
				// check if valid auth token
				valid := utils.IsTokenValid(authToken)

				if valid {
					utils.SendErrorResponse(w, r, "You are already logged in", http.StatusBadRequest)
					return
				}

				// keep going!
			}

			// check if body is correct
			body, err := utils.ReadDataToString(r.Body)

			if err != nil {
				println(`Failed to read request body: ` + err.Error())
				utils.SendErrorResponse(w, r, "Failed to read request body", http.StatusBadRequest)
				return
			}

			var loginData LoginResponse

			if err := json.Unmarshal(body, &loginData); err != nil {
				println(`Failed to parse request body: ` + err.Error())
				utils.SendErrorResponse(w, r, "Failed to parse request body", http.StatusBadRequest)
				return
			}

			if loginData.Email == "" || loginData.Password == "" {
				utils.SendErrorResponse(w, r, "Email and password are required", http.StatusBadRequest)
				return
			}

			// find user by email
			user, err := gorm.G[database.User](database.DB).Where("email = ?", loginData.Email).First(r.Context())

			if err != nil {
				if err == gorm.ErrRecordNotFound {
					utils.SendErrorResponse(w, r, "Invalid email or password", http.StatusUnauthorized)
					return
				}
				println("Database error: " + err.Error())
				utils.SendErrorResponse(w, r, "Database error", http.StatusInternalServerError)
				return
			}

			// compare password
			err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(loginData.Password))

			if err != nil {
				utils.SendErrorResponse(w, r, "Invalid email or password", http.StatusUnauthorized)
				return
			}

			// they are valid! woo! create token
			token := utils.CreateTokenFromUserID(user.ID)

			if token.Token == "" {
				println("Failed to create auth token")
				utils.SendErrorResponse(w, r, "Failed to create auth token", http.StatusInternalServerError)
				return
			}

			// send token as cookie
			http.SetCookie(w, &http.Cookie{
				Name:     "chukfi_token",
				Value:    token.Token,
				HttpOnly: true,
				Expires:  time.Unix(token.ExpiresAt, 0),
				Domain:   "localhost",
				Path:     "/",
			})

			// add user to cache
			userCache.UserCacheInstance.Set(token.Token, user)
			// send response
			utils.SendNormalResponse(w, r, map[string]interface{}{
				"fullname": user.Fullname,
				"email":    user.Email,
				"token":    token.Token,
				"success":  true,
				"id":       user.ID,
			})

		})
		// register route
		r.Post("/register", func(w http.ResponseWriter, r *http.Request) {
			// check if token, if so, reject
			authToken, ok := r.Context().Value("authToken").(string)

			if ok && authToken != "" {
				utils.SendErrorResponse(w, r, "You are already logged in", http.StatusBadRequest)
				return
			}

			// check if body is correct
			body, err := utils.ReadDataToString(r.Body)

			if err != nil {
				println(`Failed to read request body: ` + err.Error())
				utils.SendErrorResponse(w, r, "Failed to read request body", http.StatusBadRequest)
				return
			}

			var registerData RegisterResponse

			if err := json.Unmarshal(body, &registerData); err != nil {
				println(`Failed to parse request body: ` + err.Error())
				utils.SendErrorResponse(w, r, "Failed to parse request body", http.StatusBadRequest)
				return
			}

			// validate data
			if registerData.Fullname == "" || registerData.Email == "" || registerData.Password == "" {
				utils.SendErrorResponse(w, r, "Fullname, email and password are required", http.StatusBadRequest)
				return
			}

			// check if password is strong enough
			if len(registerData.Password) < 8 {
				utils.SendErrorResponse(w, r, "Password must be at least 8 characters long", http.StatusBadRequest)
				return
			}

			// check if email is valid
			_, err = mail.ParseAddress(registerData.Email)

			if err != nil {
				utils.SendErrorResponse(w, r, "Invalid email address", http.StatusBadRequest)
				return
			}

			// check if email exists already
			_, err = gorm.G[database.User](database.DB).Where("email = ?", registerData.Email).First(r.Context())

			if err != nil && err != gorm.ErrRecordNotFound {
				println("Database error: " + err.Error())
				utils.SendErrorResponse(w, r, "Database error", http.StatusInternalServerError)
				return
			}

			if err != gorm.ErrRecordNotFound {
				utils.SendErrorResponse(w, r, "Email already in use", http.StatusBadRequest)
				return
			}

			// bcrypt password
			hashedPassword, err := bcrypt.GenerateFromPassword([]byte(registerData.Password), bcrypt.DefaultCost)

			if err != nil {
				println("Failed to hash password: " + err.Error())
				utils.SendErrorResponse(w, r, "Failed to hash password", http.StatusInternalServerError)
				return
			}

			// create user
			user := database.User{
				Fullname: registerData.Fullname,
				Email:    registerData.Email,
				Password: string(hashedPassword),
			}

			err = gorm.G[database.User](database.DB).Create(r.Context(), &user)

			if err != nil {
				println("Failed to create user: " + err.Error())
				utils.SendErrorResponse(w, r, "Failed to create user", http.StatusInternalServerError)
				return
			}

			// yay! created!

			token := utils.CreateTokenFromUserID(user.ID)

			if token.Token == "" {
				println("Failed to create auth token")
				utils.SendErrorResponse(w, r, "Failed to create auth token", http.StatusInternalServerError)
				return
			}

			// send token as cookie
			http.SetCookie(w, &http.Cookie{
				Name:     "chukfi_token",
				Value:    token.Token,
				HttpOnly: true,
				Expires:  time.Unix(token.ExpiresAt, 0),
				Path:     "/",
				Domain:   "localhost",
			})

			// add user to cache
			userCache.UserCacheInstance.Set(token.Token, user)

			// send response
			utils.SendNormalResponse(w, r, map[string]interface{}{
				"fullname": user.Fullname,
				"email":    user.Email,
				"token":    token.Token,
				"id":       user.ID,
				"success":  true,
			})

		})
	})
}
