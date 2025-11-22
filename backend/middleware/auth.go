package middleware

import (
	"crypto/hmac"
	"crypto/sha256"
	"crypto/subtle"
	"encoding/base64"
	"encoding/hex"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"

	"cart-backend/database"
	"cart-backend/models"

	"github.com/gin-gonic/gin"
)

const fallbackTokenSecret = "please_change_me_to_secure_secret"
const tokenMaxAge = 24 * time.Hour

func ValidateTokenMiddleware() gin.HandlerFunc {
	secret := os.Getenv("TOKEN_SECRET")
	if secret == "" {
		secret = fallbackTokenSecret
	}

	return func(c *gin.Context) {

		auth := c.GetHeader("Authorization")
		var token string
		if auth != "" && strings.HasPrefix(auth, "Bearer ") {
			token = strings.TrimPrefix(auth, "Bearer ")
		} else {
			// try cookie
			if cookie, err := c.Cookie("auth_token"); err == nil {
				token = cookie
			} else {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
				return
			}
		}

		raw, err := base64.StdEncoding.DecodeString(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token encoding"})
			return
		}

		s := string(raw)
		sep := strings.LastIndex(s, ":")
		if sep <= 0 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token format"})
			return
		}

		payload := s[:sep]
		sigHex := s[sep+1:]

		mac := hmac.New(sha256.New, []byte(secret))
		mac.Write([]byte(payload))
		expected := mac.Sum(nil)
		provided, err := hex.DecodeString(sigHex)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token signature encoding"})
			return
		}

		if len(provided) != len(expected) || subtle.ConstantTimeCompare(provided, expected) != 1 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token signature"})
			return
		}

		parts := strings.Split(payload, ":")
		if len(parts) != 2 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "malformed token payload"})
			return
		}
		uid64, err := strconv.ParseUint(parts[0], 10, 32)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid user in token"})
			return
		}
		ts, err := strconv.ParseInt(parts[1], 10, 64)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid timestamp in token"})
			return
		}
		if time.Since(time.Unix(ts, 0)) > tokenMaxAge {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token expired"})
			return
		}

		var user models.User
		if err := database.DB.First(&user, uint(uid64)).Error; err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
			return
		}

		user.Password = ""
		c.Set("currentUser", user)

		c.Next()
	}
}
