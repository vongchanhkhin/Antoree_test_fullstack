# Docker Setup for Education Platform

## Quick Start

### 1. Build and Start Services
```bash
# Build and start all services
docker-compose up -d

# Or use the npm script
npm run docker:up
```

### 2. Check Service Status
```bash
# View all running containers
docker-compose ps

# View application logs
docker-compose logs -f app

# Or use npm script
npm run docker:logs
```

### 3. Initialize Database Schema
```bash
# Run Prisma migration to create tables
docker-compose exec app npx prisma db push

# Alternative: Connect to the running app container and run migration
docker exec -it education_platform_app npx prisma db push
```

### 4. Access Services
- **NestJS App**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080 (username: `nestjs_user`, password: `nestjs_password`)
- **MySQL**: localhost:3306 (for external connections)

## Available Docker Commands

```bash
# Build services
npm run docker:build

# Start services in background
npm run docker:up

# Stop services
npm run docker:down

# View application logs
npm run docker:logs

# Reset everything (removes volumes)
npm run docker:reset

# Deploy Prisma schema
npm run prisma:deploy
```

## Docker Services

### 1. MySQL Database (`mysql`)
- **Image**: mysql:8.0
- **Port**: 3306
- **Database**: education_platform
- **User**: nestjs_user
- **Password**: nestjs_password
- **Root Password**: rootpassword

### 2. NestJS Application (`app`)
- **Port**: 3000
- **Environment**: Production
- **Auto-restart**: Yes
- **Health check**: Depends on MySQL

### 3. phpMyAdmin (`phpmyadmin`)
- **Port**: 8080
- **Purpose**: Database management interface
- **Access**: http://localhost:8080

## Environment Variables

The application uses these environment variables in Docker:

```env
DATABASE_URL="mysql://nestjs_user:nestjs_password@mysql:3306/education_platform"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-docker"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-this-in-production-docker"
JWT_REFRESH_EXPIRES_IN="7d"
PORT=3000
NODE_ENV="production"
```

## Testing the Setup

### 1. Health Check
```bash
curl http://localhost:3000
```

### 2. Test Authentication Endpoints
```bash
# Sign up a new user
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "role": "STUDENT"
  }'

# Sign in
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### Service Won't Start
```bash
# Check container logs
docker-compose logs mysql
docker-compose logs app

# Restart specific service
docker-compose restart app
```

### Database Connection Issues
```bash
# Check MySQL container status
docker-compose ps mysql

# Connect to MySQL container
docker-compose exec mysql mysql -u nestjs_user -p education_platform
```

### Reset Everything
```bash
# Stop and remove all containers, networks, and volumes
docker-compose down -v

# Remove all images (optional)
docker-compose down -v --rmi all

# Rebuild and start fresh
docker-compose up -d --build
```

## Production Considerations

### Security
1. Change default passwords in production
2. Use Docker secrets for sensitive data
3. Enable SSL/TLS for database connections
4. Use environment-specific configuration

### Performance
1. Use multi-stage Docker builds
2. Optimize MySQL configuration
3. Enable MySQL query caching
4. Use production-ready Node.js settings

### Monitoring
1. Add health checks
2. Configure logging
3. Set up monitoring with tools like Prometheus
4. Use proper backup strategies for MySQL data

## File Structure

```
├── docker-compose.yml          # Main Docker Compose configuration
├── Dockerfile                  # NestJS application container
├── .dockerignore              # Files to ignore in Docker build
├── .env.docker                # Docker environment variables
├── mysql-init/                # MySQL initialization scripts
│   └── 01-init.sql            # Database setup script
└── logs/                      # Application logs (mounted volume)
```
