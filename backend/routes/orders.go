package routes

import (
	"cart-backend/handlers"
	"cart-backend/middleware"

	"github.com/gin-gonic/gin"
)

func OrdersRoutes(r *gin.Engine) {

	o := r.Group("/orders")
	o.Use(middleware.ValidateTokenMiddleware())
	{
		o.POST("", handlers.CreateOrder)
		o.POST("/", handlers.CreateOrder)
	}

	pl := r.Group("/orders")
	// protect list routes so only authenticated users can view their orders
	pl.Use(middleware.ValidateTokenMiddleware())
	{
		pl.GET("", handlers.ListOrders)
		pl.GET("/", handlers.ListOrders)
	}
}
