package utils

import (
	"context"
	"encoding/json"
	"io"
	"net/http"

	"math/rand"
	"time"
	database "github.com/Native-Consulting-Services/chukfi-cms/src/database"

	uuid "github.com/satori/go.uuid"
	"gorm.io/gorm"
)

const Charset = "abcdefghijklmnopqrstuvwxyz" +
	"ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

var seededRand *rand.Rand = rand.New(
	rand.NewSource(time.Now().UnixNano()))

type ErrorResponse struct {
	Error string `json:"error"`
	Code  int    `json:"code,omitempty"`
}

func RandomString(length int, charset string) string {
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}

func ReadDataToString(data io.ReadCloser) ([]byte, error) {
	body, err := io.ReadAll(data)
	if err != nil {
		return nil, err
	}
	defer data.Close()

	return body, nil
}

func SendNormalResponse(httpWriter http.ResponseWriter, httpRequest *http.Request, payload interface{}) {
	httpWriter.Header().Set("Content-Type", "application/json")
	httpWriter.WriteHeader(http.StatusOK)
	json.NewEncoder(httpWriter).Encode(payload)
}

func SendErrorResponse(httpWriter http.ResponseWriter, httpRequest *http.Request, message string, code int) {
	// check if GET & is using a browser, send as HTML instead, this is just testing my knowledge with GO!

	// if httpRequest.Method == http.MethodGet && httpRequest.UserAgent() != "" {
	// 	httpWriter.Header().Set("Content-Type", "text/html")
	// 	httpWriter.WriteHeader(code)
	// 	fmt.Fprintf(httpWriter, "<h1>Error %d</h1><p>%s</p>", code, message)
	// 	return
	// }

	httpWriter.Header().Set("Content-Type", "application/json")
	httpWriter.WriteHeader(code)
	errorJSON, _ := json.Marshal(ErrorResponse{Error: message, Code: code})
	httpWriter.Write(errorJSON)
}

func ExpireTokens() {
	ctx := context.Background()
	// delete all tokens that are expired
	gorm.G[database.UserToken](database.DB).Where("expires_at < ?", time.Now().Unix()).Delete(ctx)
}

func IsTokenValid(tokenString string) bool {
	ctx := context.Background()
	_, err := gorm.G[database.UserToken](database.DB).Where("token = ? AND expires_at > ?", tokenString, time.Now().Unix()).First(ctx)

	return err == nil
}

func CreateTokenFromUserID(userID uuid.UUID) database.UserToken {
	ctx := context.Background()
	// generate random 64 char token
	token := RandomString(64, Charset)

	// check if user really exists
	_, err := gorm.G[database.User](database.DB).Where("id = ?", userID).First(ctx)

	if err != nil {
		return database.UserToken{}
	}

	// check if this token exists already, if so, generate a new one
	_, err = gorm.G[database.UserToken](database.DB).Where("token = ?", token).First(ctx)

	if err == nil {
		// token exists, generate a new one
		return CreateTokenFromUserID(userID)
	}

	// create token that expires in 7 days
	userToken := database.UserToken{
		UserID:    userID,
		Token:     token,
		ExpiresAt: time.Now().Add(7 * 24 * time.Hour).Unix(),
	}

	err = gorm.G[database.UserToken](database.DB).Create(ctx, &userToken)

	if err != nil {
		return database.UserToken{}
	}

	return userToken
}
