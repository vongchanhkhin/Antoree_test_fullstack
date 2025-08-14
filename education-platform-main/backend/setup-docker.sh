#!/bin/bash

echo "🧹 Cleaning up Docker environment..."
docker-compose down -v
docker system prune -f

echo "🗑️ Removing conflicting migration files..."
rm -rf prisma/migrations/

echo "🚀 Starting fresh Docker environment..."
docker-compose up --build

echo "✅ Docker Compose setup complete!"
