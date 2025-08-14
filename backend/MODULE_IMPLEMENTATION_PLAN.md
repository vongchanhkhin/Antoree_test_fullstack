# Module Implementation Plan

## ✅ Completed Modules

### 1. Auth & RBAC Module
- **Location**: `src/routes/auth/`
- **Status**: ✅ Updated to new database schema
- **Endpoints**:
  - `POST /v1/auth/register`
  - `POST /v1/auth/login`
  - `POST /v1/auth/token/refresh`
  - `POST /v1/auth/logout`
  - `GET /v1/auth/me`
  - `GET /v1/auth/roles`

### 2. Profile / Points / Badge Module
- **Location**: `src/routes/profiles/`
- **Status**: ✅ Implemented
- **Endpoints**:
  - `GET /v1/profiles/:id`
  - `PATCH /v1/profiles/:id`
  - `GET /v1/profiles/:id/badges`
  - `GET /v1/profiles/:id/stats`

## 🚧 Modules to Implement

### 3. Post Service Module
```bash
# Generate module
npx nest generate module routes/posts
npx nest generate service routes/posts
npx nest generate controller routes/posts

# Create DTOs
mkdir src/routes/posts/dto
```

**Required DTOs**:
- `CreatePostDto`
- `UpdatePostDto`
- `QueryPostsDto`

**Endpoints**:
- `POST /v1/posts` (create draft)
- `GET /v1/posts/:id`
- `PATCH /v1/posts/:id` (edit)
- `DELETE /v1/posts/:id`
- `POST /v1/posts/:id/publish`
- `GET /v1/posts` (with filters: tag, level, q, sort, page, limit)

### 4. Comment Service Module
```bash
npx nest generate module routes/comments
npx nest generate service routes/comments
npx nest generate controller routes/comments
```

**Endpoints**:
- `POST /v1/posts/:id/comments`
- `GET /v1/posts/:id/comments`
- `PATCH /v1/comments/:id`
- `DELETE /v1/comments/:id`

### 5. Vote / Ranking Module
```bash
npx nest generate module routes/votes
npx nest generate service routes/votes
npx nest generate controller routes/votes
```

**Endpoints**:
- `POST /v1/posts/:id/votes`
- `POST /v1/comments/:id/votes`
- `GET /v1/posts/:id/score`

### 6. Tag & Taxonomy Module
```bash
npx nest generate module routes/taxonomy
npx nest generate service routes/taxonomy
npx nest generate controller routes/taxonomy
```

**Endpoints**:
- `GET /v1/tags`
- `POST /v1/tags` (admin)
- `GET /v1/levels`
- `GET /v1/skills`

### 7. Search / Feed Module
```bash
npx nest generate module routes/search
npx nest generate service routes/search
npx nest generate controller routes/search
```

**Endpoints**:
- `GET /v1/search`
- `GET /v1/feed`

### 8. Moderation Module
```bash
npx nest generate module routes/moderation
npx nest generate service routes/moderation
npx nest generate controller routes/moderation
```

**Endpoints**:
- `POST /v1/posts/:id/report`
- `POST /v1/comments/:id/report`
- `GET /v1/mod/queue`
- `POST /v1/mod/items/:id/decision`

### 9. Media Module
```bash
npx nest generate module routes/media
npx nest generate service routes/media
npx nest generate controller routes/media
```

**Endpoints**:
- `POST /v1/media/sign`
- `POST /v1/media/complete`

### 10. AI Assist Module
```bash
npx nest generate module routes/ai
npx nest generate service routes/ai
npx nest generate controller routes/ai
```

**Endpoints**:
- `POST /v1/ai/proofread`
- `POST /v1/ai/explain`
- `POST /v1/ai/quiz`
- `GET /v1/ai/jobs/:jobId`

### 11. Learning Artifacts Module
```bash
npx nest generate module routes/learning
npx nest generate service routes/learning
npx nest generate controller routes/learning
```

**Endpoints**:
- `GET /v1/posts/:id/artifacts`
- `POST /v1/flashcards`
- `GET /v1/flashcards/:id`
- `POST /v1/quizzes/:id/submit`

### 12. Admin / Config Module
```bash
npx nest generate module routes/admin
npx nest generate service routes/admin
npx nest generate controller routes/admin
```

**Endpoints**:
- `GET /v1/admin/config`
- `PATCH /v1/admin/config`
- `GET /v1/admin/users`
- `PATCH /v1/admin/users/:id`

## Implementation Commands

### Quick Setup Script
```bash
#!/bin/bash

# Posts module
npx nest generate module routes/posts
npx nest generate service routes/posts
npx nest generate controller routes/posts

# Comments module
npx nest generate module routes/comments
npx nest generate service routes/comments
npx nest generate controller routes/comments

# Votes module
npx nest generate module routes/votes
npx nest generate service routes/votes
npx nest generate controller routes/votes

# Taxonomy module
npx nest generate module routes/taxonomy
npx nest generate service routes/taxonomy
npx nest generate controller routes/taxonomy

# Search module
npx nest generate module routes/search
npx nest generate service routes/search
npx nest generate controller routes/search

# Moderation module
npx nest generate module routes/moderation
npx nest generate service routes/moderation
npx nest generate controller routes/moderation

# Media module
npx nest generate module routes/media
npx nest generate service routes/media
npx nest generate controller routes/media

# AI module
npx nest generate module routes/ai
npx nest generate service routes/ai
npx nest generate controller routes/ai

# Learning module
npx nest generate module routes/learning
npx nest generate service routes/learning
npx nest generate controller routes/learning

# Admin module
npx nest generate module routes/admin
npx nest generate service routes/admin
npx nest generate controller routes/admin

echo "All modules generated successfully!"
```

## Key Implementation Notes

### 1. Database Integration
- All services use the existing `PrismaService`
- Import `SharedModule` in each module for database access
- Use the comprehensive schema we created

### 2. Authentication & Authorization
- Use `JwtAuthGuard` for protected endpoints
- Implement role-based guards for admin/moderator endpoints
- Use `@CurrentUser()` decorator to get authenticated user

### 3. DTOs & Validation
- Create comprehensive DTOs for each module
- Use `class-validator` for input validation
- Implement proper TypeScript types

### 4. Error Handling
- Use appropriate HTTP status codes
- Implement custom exceptions
- Provide meaningful error messages

### 5. Pagination & Filtering
- Implement consistent pagination pattern
- Support advanced filtering and sorting
- Use query parameters for search criteria

### 6. Performance Optimization
- Implement proper database indexes
- Use efficient queries with Prisma
- Consider caching for frequently accessed data

## Next Steps

1. **Run the module generation script**
2. **Implement each service with proper business logic**
3. **Create comprehensive DTOs for each module**
4. **Add proper error handling and validation**
5. **Implement authentication and authorization**
6. **Add comprehensive testing**
7. **Create API documentation with Swagger**

The foundation is now in place with the updated auth and profiles modules. The remaining modules follow the same pattern and can be implemented systematically.
