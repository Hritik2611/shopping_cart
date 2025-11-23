package main

import (
	"log"
	"os"
	"time"

	"cart-backend/database"
	"cart-backend/models"
	"cart-backend/routes"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println(".env not found or failed to load, continuing with environment variables")
	} else {
		log.Println("Loaded .env file")
	}

	// Ensure DB_PATH is set correctly
	if v := os.Getenv("DB_PATH"); v != "" {
		os.Setenv("DB_PATH", v)
	}

	// Connect to the database
	database.Connect()
	database.DB.AutoMigrate(&models.User{},
		&models.Product{},
		&models.CartItem{},
		&models.Order{},
	)

	// Seed products only if table is empty
	var productCount int64
	database.DB.Model(&models.Product{}).Count(&productCount)
	if productCount == 0 {
		seed := []models.Product{
			{Name: "Jacket", Description: "Warm winter jacket with waterproof fabric", Price: 20.99},
			{Name: "Sneakers", Description: "Comfortable running sneakers for daily use", Price: 35.50},
			{Name: "Backpack", Description: "Durable backpack with multiple compartments", Price: 18.75},
			{Name: "T-Shirt", Description: "Soft cotton t-shirt available in multiple sizes", Price: 9.99},
			{Name: "Headphones", Description: "Wireless headphones with noise cancellation", Price: 45.00},
			{Name: "Watch", Description: "Digital waterproof watch with alarm", Price: 25.49},
			{Name: "Sunglasses", Description: "UV-protected sunglasses with matte frame", Price: 12.89},
			{Name: "Keyboard", Description: "Mechanical keyboard with backlit keys", Price: 29.99},
			{Name: "Water Bottle", Description: "Insulated stainless steel bottle, 1-liter capacity", Price: 8.50},
		}
		for _, p := range seed {
			database.DB.Create(&p)
		}
		log.Printf("Seeded %d products", len(seed))
	}

	// Initialize Gin router
	r := gin.Default()

	// CORS configuration for frontend
	cfg := cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}
	r.Use(cors.New(cfg))

	// Health check route
	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Server is running successfully 🚀"})
	})

	// Register all route groups
	routes.UsersRoutes(r)
	routes.ItemsRoutes(r)
	routes.CartRoutes(r)
	routes.OrdersRoutes(r)

	// Bind to Render's dynamic PORT environment variable
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080" // Default for local testing
	}

	log.Printf("Server starting on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
