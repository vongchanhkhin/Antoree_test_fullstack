#!/bin/sh

echo "🚀 Starting Education Platform Backend..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."

# Deploy migrations (assumes migrations exist)
echo "🔄 Deploying migrations..."
npx prisma migrate deploy

# Generate Prisma client
echo "🔧 Ensuring Prisma client is generated..."
npx prisma generate

# Start the application
echo "✅ Starting NestJS application..."
exec "$@"
