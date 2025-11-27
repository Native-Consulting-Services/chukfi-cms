package auth

import (
	"chukfi-cms/backend/internal/db"
	"chukfi-cms/backend/internal/models"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type Service struct {
	jwtSecret string
	db        *db.DB
}

type Claims struct {
	UserID uuid.UUID `json:"user_id"`
	Email  string    `json:"email"`
	Roles  []string  `json:"roles"`
	jwt.RegisteredClaims
}

func NewService(jwtSecret string, database *db.DB) *Service {
	return &Service{
		jwtSecret: jwtSecret,
		db:        database,
	}
}

func (s *Service) HashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 14)
	return string(bytes), err
}

func (s *Service) CheckPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func (s *Service) GenerateTokens(user models.User) (string, string, error) {
	// Generate access token (24 hours)
	accessClaims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		Roles:  s.getUserRoleNames(user.ID),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessTokenString, err := accessToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", err
	}

	// Generate refresh token (7 days)
	refreshClaims := Claims{
		UserID: user.ID,
		Email:  user.Email,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(7 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			NotBefore: jwt.NewNumericDate(time.Now()),
		},
	}

	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshTokenString, err := refreshToken.SignedString([]byte(s.jwtSecret))
	if err != nil {
		return "", "", err
	}

	return accessTokenString, refreshTokenString, nil
}

func (s *Service) ValidateToken(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(s.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*Claims); ok && token.Valid {
		return claims, nil
	}

	return nil, fmt.Errorf("invalid token")
}

func (s *Service) GetUserByEmail(email string) (models.User, error) {
	var user models.User
	query := `
		SELECT id, email, password_hash, display_name, COALESCE(name, display_name) as name, COALESCE(avatar, '') as avatar, created_at, updated_at
		FROM users 
		WHERE email = ?
	`
	err := s.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash, 
		&user.DisplayName, &user.Name, &user.Avatar, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		return user, err
	}

	// Load user roles
	user.Roles, _ = s.getUserRoles(user.ID)
	
	return user, nil
}

func (s *Service) GetUserByID(id uuid.UUID) (models.User, error) {
	var user models.User
	query := `
		SELECT id, email, password_hash, display_name, COALESCE(name, display_name) as name, COALESCE(avatar, '') as avatar, created_at, updated_at
		FROM users 
		WHERE id = ?
	`
	err := s.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.PasswordHash, 
		&user.DisplayName, &user.Name, &user.Avatar, &user.CreatedAt, &user.UpdatedAt,
	)
	
	if err != nil {
		return user, err
	}

	// Load user roles
	user.Roles, _ = s.getUserRoles(user.ID)
	
	return user, nil
}

func (s *Service) getUserRoles(userID uuid.UUID) ([]models.Role, error) {
	query := `
		SELECT r.id, r.name, r.description, r.created_at, r.updated_at
		FROM roles r
		JOIN user_roles ur ON r.id = ur.role_id
		WHERE ur.user_id = ?
	`
	rows, err := s.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var roles []models.Role
	for rows.Next() {
		var role models.Role
		err := rows.Scan(&role.ID, &role.Name, &role.Description, &role.CreatedAt, &role.UpdatedAt)
		if err != nil {
			return nil, err
		}
		
		// Load permissions for this role
		role.Permissions, _ = s.getRolePermissions(role.ID)
		
		roles = append(roles, role)
	}

	return roles, nil
}

func (s *Service) getRolePermissions(roleID uuid.UUID) ([]models.Permission, error) {
	query := `
		SELECT id, role_id, collection, can_create, can_read, can_update, can_delete, created_at, updated_at
		FROM permissions
		WHERE role_id = ?
		ORDER BY collection
	`
	rows, err := s.db.Query(query, roleID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var permissions []models.Permission
	for rows.Next() {
		var perm models.Permission
		var idStr, roleIDStr string
		err := rows.Scan(
			&idStr,
			&roleIDStr,
			&perm.Collection,
			&perm.CanCreate,
			&perm.CanRead,
			&perm.CanUpdate,
			&perm.CanDelete,
			&perm.CreatedAt,
			&perm.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		
		// Parse UUIDs
		perm.ID, _ = uuid.Parse(idStr)
		perm.RoleID, _ = uuid.Parse(roleIDStr)
		
		permissions = append(permissions, perm)
	}

	return permissions, nil
}

func (s *Service) getUserRoleNames(userID uuid.UUID) []string {
	roles, err := s.getUserRoles(userID)
	if err != nil {
		return []string{}
	}

	var roleNames []string
	for _, role := range roles {
		roleNames = append(roleNames, role.Name)
	}
	return roleNames
}

func (s *Service) HasPermission(userID uuid.UUID, collection, action string) bool {
	query := `
		SELECT p.can_create, p.can_read, p.can_update, p.can_delete
		FROM permissions p
		JOIN user_roles ur ON p.role_id = ur.role_id
		WHERE ur.user_id = ? AND p.collection = ?
	`
	rows, err := s.db.Query(query, userID, collection)
	if err != nil {
		return false
	}
	defer rows.Close()

	for rows.Next() {
		var canCreate, canRead, canUpdate, canDelete bool
		err := rows.Scan(&canCreate, &canRead, &canUpdate, &canDelete)
		if err != nil {
			continue
		}

		switch action {
		case "create":
			if canCreate {
				return true
			}
		case "read":
			if canRead {
				return true
			}
		case "update":
			if canUpdate {
				return true
			}
		case "delete":
			if canDelete {
				return true
			}
		}
	}

	return false
}

func GenerateSecureToken(length int) string {
	bytes := make([]byte, length)
	rand.Read(bytes)
	return hex.EncodeToString(bytes)
}