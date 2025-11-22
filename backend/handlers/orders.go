package handlers

import (
	"encoding/json"
	"net/http"

	"cart-backend/database"
	"cart-backend/models"

	"github.com/gin-gonic/gin"
)

func CreateOrder(c *gin.Context) {
	u, ok := c.Get("currentUser")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
		return
	}
	usr, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
		return
	}

	var items []models.CartItem
	if err := database.DB.Where("user_id = ?", usr.ID).Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch cart"})
		return
	}

	if len(items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty, cannot place order"})
		return
	}

	type outItem struct {
		ProductID uint    `json:"product_id"`
		Quantity  int     `json:"quantity"`
		Price     float64 `json:"price"`
	}
	var out []outItem
	var total float64

	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "internal error"})
		}
	}()

	for _, ci := range items {
		var p models.Product
		if err := tx.First(&p, ci.ProductID).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to load product"})
			return
		}
		total += p.Price * float64(ci.Quantity)
		out = append(out, outItem{ProductID: ci.ProductID, Quantity: ci.Quantity, Price: p.Price})
	}

	itemsJSON, _ := json.Marshal(out)

	order := models.Order{
		UserID: usr.ID,
		Items:  string(itemsJSON),
		Total:  total,
		Status: "created",
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order"})
		return
	}

	if err := tx.Where("user_id = ?", usr.ID).Delete(&models.CartItem{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "order created but failed to clear cart"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to finalize order"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "order created", "order": order})
}

func ListOrders(c *gin.Context) {
	u, ok := c.Get("currentUser")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
		return
	}
	usr, ok := u.(models.User)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing or invalid token"})
		return
	}

	var orders []models.Order
	if err := database.DB.Where("user_id = ?", usr.ID).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}
