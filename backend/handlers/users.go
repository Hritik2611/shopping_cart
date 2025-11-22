package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"time"

	"cart-backend/database"
	"cart-backend/models"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func GetCurrentUser(c *gin.Context) {
	u, ok := c.Get("currentUser")
	if !ok {
		c.JSON(401, gin.H{"error": "authentication required"})
		return
	}
	user, ok := u.(models.User)
	if !ok {
		c.JSON(401, gin.H{"error": "invalid user in context"})
		return
	}
	user.Password = ""
	c.JSON(200, gin.H{"user": user})
}

const fallbackTokenSecret = "please_change_me_to_secure_secret"

func generateToken(userID uint) string {
	secret := os.Getenv("TOKEN_SECRET")
	if secret == "" {
		secret = fallbackTokenSecret
	}

	data := []byte(fmt.Sprintf("%d:%d", userID, time.Now().Unix()))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(data)
	sig := mac.Sum(nil)
	combined := append(data, []byte(":")...)
	combined = append(combined, []byte(hex.EncodeToString(sig))...)
	return base64.StdEncoding.EncodeToString(combined)
}

func CreateUser(c *gin.Context) {
	var body models.User
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to process password"})
		return
	}
	body.Password = string(hashed)

	if err := database.DB.Create(&body).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email already exists or invalid"})
		return
	}

	token := generateToken(body.ID)
	secure := false
	if os.Getenv("COOKIE_SECURE") == "true" {
		secure = true
	}
	c.SetCookie("auth_token", token, 60*60*24, "/", "", secure, true)

	body.Password = ""

	c.JSON(http.StatusOK, gin.H{"message": "user created", "user": body, "token": token})
}

func ListUsers(c *gin.Context) {
	var users []models.User
	if err := database.DB.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch users"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"users": users})
}

func LoginUser(c *gin.Context) {
	var body models.User
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	var user models.User
	database.DB.Where("email = ?", body.Email).First(&user)
	if user.ID == 0 {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token := generateToken(user.ID)
	secure := false
	if os.Getenv("COOKIE_SECURE") == "true" {
		secure = true
	}
	c.SetCookie("auth_token", token, 60*60*24, "/", "", secure, true)

	user.Password = ""
	c.JSON(http.StatusOK, gin.H{"message": "login successful", "token": token, "user": user})
}
