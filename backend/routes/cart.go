package routes

import (
	"cart-backend/handlers"
	"cart-backend/middleware"

	"github.com/gin-gonic/gin"
)


func CartRoutes(r *gin.Engine) {
	
	authCart := r.Group("/carts")
	authCart.Use(middleware.ValidateTokenMiddleware())
	{
		authCart.GET("", handlers.GetCarts)   
		authCart.POST("", handlers.AddToCart) 
		authCart.GET("/", handlers.GetCarts)
		authCart.POST("/", handlers.AddToCart)
	}
}
