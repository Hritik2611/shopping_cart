Shopping Cart — fullstack challenge

This repo contains a Go backend using Gin + GORM (SQLite) and a planned React frontend.

Backend quick run:

cd backend
go mod tidy
go run .

Server will listen on :8080 and auto-migrate models into backend/data/dev.db

Next steps: implement frontend in `frontend/` and add Postman collection.
