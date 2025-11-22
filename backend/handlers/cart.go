package handlers

import (
	"net/http"

	"cart-backend/database"
	"cart-backend/models"

	"github.com/gin-gonic/gin"
)

func AddToCart(c *gin.Context) {
	var body struct {
		UserID    uint `json:"user_id"`
		ProductID uint `json:"product_id"`
		Quantity  int  `json:"quantity"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	if body.ProductID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_id is required"})
		return
	}

	if body.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "quantity must be > 0"})
		return
	}

	var product models.Product
	if err := database.DB.First(&product, body.ProductID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product not found"})
		return
	}

	u, ok := c.Get("currentUser")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	usr, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user in context"})
		return
	}
	body.UserID = usr.ID

	var existing models.CartItem
	if err := database.DB.Where("user_id = ? AND product_id = ?", body.UserID, body.ProductID).First(&existing).Error; err == nil {

		existing.Quantity += body.Quantity
		if existing.Quantity < 1 {
			existing.Quantity = 1
		}
		if err := database.DB.Save(&existing).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update cart"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Product quantity updated in cart", "cart": existing})
		return
	}

	cartItem := models.CartItem{
		UserID:    body.UserID,
		ProductID: body.ProductID,
		Quantity:  body.Quantity,
	}

	if err := database.DB.Create(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to add to cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Product added to cart",
		"cart":    cartItem,
	})
}

func GetCarts(c *gin.Context) {

	u, ok := c.Get("currentUser")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	usr, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid user in context"})
		return
	}

	var items []models.CartItem
	if err := database.DB.Where("user_id = ?", usr.ID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"cart": items})
}
