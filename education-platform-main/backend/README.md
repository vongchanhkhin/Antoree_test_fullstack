# Backend - English Education Platform API

A comprehensive NestJS REST API server for the English Education Platform with 12 complete modules.

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database configuration

# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Start development server
npm run start:dev
```

## API Modules

### Core Features
- **Authentication** (`/auth`) - JWT-based authentication and authorization
- **Users** (`/users`) - User management and profiles
- **Posts** (`/posts`) - Content creation and management
- **Comments** (`/comments`) - Threaded discussions
- **Votes** (`/votes`) - Upvoting/downvoting system

### Educational Features
- **Taxonomy** (`/taxonomy`) - Learning levels, skills, and categories
- **Search** (`/search`) - Advanced content discovery
- **Media** (`/media`) - File upload and management
- **Learning** (`/learning`) - Educational artifacts and progress tracking
- **AI** (`/ai`) - AI-powered learning assistance

### Administration
- **Moderation** (`/moderation`) - Content moderation and reporting
- **Admin** (`/admin`) - System administration and analytics

## Development

### Scripts
```bash
npm run start:dev    # Development mode with hot reload
npm run build        # Build for production
npm run start:prod   # Start production server
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma studio          # Open database browser
npx prisma migrate dev      # Run migrations in development
npx prisma generate         # Generate Prisma client
npx prisma db push          # Push schema changes to database
```

## API Documentation

- **Postman Collection**: `postman_collection.json`
- **API Documentation**: `API_DOCUMENTATION.md`
- **Database Schema**: `DATABASE_SCHEMA_OVERVIEW.md`
- **Setup Guide**: `EDUCATION_PLATFORM_SETUP.md`

## Environment Variables

Required environment variables (see `.env.example`):

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/education_platform"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# File Upload
UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=5242880  # 5MB

# AI Integration (optional)
OPENAI_API_KEY="your-openai-key"
```

## Docker Support

```bash
# Build and run with Docker Compose
docker-compose up -d

# Run only the database
docker-compose up -d postgres
```

## Testing

### API Testing with Postman
1. Import `postman_collection.json` into Postman
2. Set environment variables in Postman
3. Run authentication requests first to get JWT tokens
4. Test all endpoints with proper authentication

### Unit Tests
```bash
npm run test
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Production Deployment

1. Build the application:
   ```bash
   npm run build
   ```

2. Set production environment variables

3. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Start the server:
   ```bash
   npm run start:prod
   ```

## API Endpoints Summary

- **Auth**: 5 endpoints (register, login, refresh, logout, profile)
- **Users**: 8 endpoints (CRUD, profiles, follow/unfollow)
- **Posts**: 10 endpoints (CRUD, search, voting, tagging)
- **Comments**: 8 endpoints (CRUD, threading, voting)
- **Votes**: 4 endpoints (upvote, downvote, get votes)
- **Taxonomy**: 12 endpoints (levels, skills, categories management)
- **Search**: 6 endpoints (global search, suggestions, filters)
- **Media**: 6 endpoints (upload, download, management)
- **Learning**: 10 endpoints (artifacts, progress, recommendations)
- **AI**: 6 endpoints (chat, assistance, usage stats)
- **Moderation**: 8 endpoints (reports, queue, decisions)
- **Admin**: 12 endpoints (analytics, user management, system config)

**Total: 95+ API endpoints**

## Architecture

- **Framework**: NestJS with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **Validation**: Class-validator with DTOs
- **File Upload**: Multer with local storage
- **Testing**: Jest for unit and e2e tests
- **Documentation**: Swagger/OpenAPI integration

## Support

For technical questions about the backend API, refer to:
- API Documentation (`API_DOCUMENTATION.md`)
- Database Schema (`DATABASE_SCHEMA_OVERVIEW.md`)
- Setup Guide (`EDUCATION_PLATFORM_SETUP.md`)
