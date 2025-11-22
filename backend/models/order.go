package models

import "gorm.io/gorm"

type Order struct {
	gorm.Model
	UserID uint    `json:"user_id"`
	Items  string  `json:"items"` 
	Total  float64 `json:"total"`
	Status string  `json:"status"`
}
