package routes

import (
	"cart-backend/handlers"

	"github.com/gin-gonic/gin"
)

func ItemsRoutes(r *gin.Engine) {
	it := r.Group("/items")
	{
		it.POST("", handlers.CreateItem)
		it.GET("", handlers.ListItems)
		it.POST("/", handlers.CreateItem)
		it.GET("/", handlers.ListItems)
	}
}
