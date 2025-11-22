package handlers

import (
	"net/http"

	"cart-backend/database"
	"cart-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateItem(c *gin.Context) {
	var body models.Product
	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if err := database.DB.Create(&body).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create item"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "item created", "item": body})
}

func ListItems(c *gin.Context) {
	var items []models.Product
	if err := database.DB.Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch items"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"items": items})
}
