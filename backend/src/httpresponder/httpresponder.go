package httpresponder

import (
	"encoding/json"
	"io"
	"net/http"
)

type ErrorResponse struct {
	Error string `json:"error"`
	Code  int    `json:"code,omitempty"`
}

func ReadDataToString(data io.ReadCloser) ([]byte, error) {
	body, err := io.ReadAll(data)
	if err != nil {
		return nil, err
	}
	defer data.Close()

	return body, nil
}

// does the same as send normal response
func SendSuccessResponse(httpWriter http.ResponseWriter, httpRequest *http.Request, payload interface{}) {
	SendNormalResponse(httpWriter, httpRequest, payload)
}

func SendNormalResponse(httpWriter http.ResponseWriter, httpRequest *http.Request, payload interface{}) {
	httpWriter.Header().Set("Content-Type", "application/json")
	httpWriter.WriteHeader(http.StatusOK)
	json.NewEncoder(httpWriter).Encode(payload)
}

func SendErrorResponse(httpWriter http.ResponseWriter, httpRequest *http.Request, message string, code int) {
	httpWriter.Header().Set("Content-Type", "application/json")
	httpWriter.WriteHeader(code)
	errorJSON, _ := json.Marshal(ErrorResponse{Error: message, Code: code})
	httpWriter.Write(errorJSON)
}
