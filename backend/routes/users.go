package routes

import (
	"cart-backend/handlers"
	"cart-backend/middleware"

	"github.com/gin-gonic/gin"
)

func UsersRoutes(r *gin.Engine) {
	u := r.Group("/users")
	{
		u.POST("", handlers.CreateUser)
		u.GET("", handlers.ListUsers)
		u.POST("/", handlers.CreateUser)
		u.GET("/", handlers.ListUsers)
		u.POST("/login", handlers.LoginUser)
	}

	
	mu := r.Group("/users")
	mu.Use(middleware.ValidateTokenMiddleware())
	{
		mu.GET("/me", handlers.GetCurrentUser)
	}
}
