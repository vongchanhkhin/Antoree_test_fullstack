# English Education Platform API - Postman Collection

This Postman collection provides comprehensive testing capabilities for all 12 modules of the English Education Platform API.

## 📋 Collection Overview

The collection includes endpoints for:

1. **Authentication** - User registration, login, profile management
2. **User Management** - User CRUD operations and role management
3. **Posts** - Content creation, editing, and management
4. **Comments** - Commenting system with nested replies
5. **Votes** - Voting/rating system for posts and comments
6. **Taxonomy** - Categories and tags management
7. **Search** - Full-text search across all content types
8. **Media** - File upload and media management
9. **Moderation** - Content reporting and moderation workflows
10. **AI Assist** - AI-powered content assistance and suggestions
11. **Learning Artifacts** - Quiz and flashcard creation/management
12. **Admin** - System administration and analytics

## 🚀 Quick Start

### 1. Import the Collection
- Download `postman_collection.json`
- Open Postman
- Click "Import" and select the JSON file
- The collection will be imported with all endpoints and variables

### 2. Set Environment Variables

The collection uses these key variables (update in Postman environment):

```
baseUrl: http://localhost:3000  // Your API base URL
accessToken: ""                 // JWT token (auto-set after login)
refreshToken: ""               // Refresh token (auto-set after login)
```

Additional ID variables for testing:
- `userId`, `postId`, `commentId`, `categoryId`, `tagId`
- `mediaId`, `reportId`, `artifactId`, `questionId`

### 3. Authentication Flow

1. **Sign Up**: Create a new user account
2. **Sign In**: Login and get JWT tokens
3. **Use Bearer Token**: All protected endpoints automatically use `{{accessToken}}`

## 📝 Testing Workflow

### Basic Content Flow
1. Sign up/Sign in
2. Create a category (Taxonomy)
3. Create a post
4. Add comments to the post
5. Vote on posts/comments
6. Search for content

### Learning Content Flow
1. Create a learning artifact
2. Add quiz questions or flashcards
3. Submit quiz answers
4. View learning statistics

### Moderation Flow
1. Report inappropriate content
2. Review reports (moderator/admin)
3. Resolve reports with decisions

### Admin Operations
1. View system statistics
2. Manage user roles
3. Monitor recent activity

## 🔧 Endpoint Categories

### Authentication
- `POST /auth/signup` - Create account
- `POST /auth/signin` - User login
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout
- `GET /auth/profile` - Get current user profile

### Posts (v1)
- `GET /v1/posts` - List posts with filtering
- `POST /v1/posts` - Create new post
- `GET /v1/posts/{id}` - Get post details
- `PATCH /v1/posts/{id}` - Update post
- `DELETE /v1/posts/{id}` - Delete post

### Comments
- `GET /comments/post/{postId}` - Get comments for post
- `POST /comments` - Create comment or reply
- `PATCH /comments/{id}` - Update comment
- `DELETE /comments/{id}` - Delete comment

### Votes
- `POST /votes` - Vote on content
- `DELETE /votes/{type}/{id}` - Remove vote
- `GET /votes/{type}/{id}/counts` - Get vote counts

### Search
- `GET /search` - Search all content
- `GET /search/suggestions` - Get search suggestions

### AI Assist
- `POST /ai/assist` - Get AI assistance
- `POST /ai/assist/batch` - Batch AI processing
- `GET /ai/usage` - Usage statistics

### Learning
- `POST /learning/artifacts` - Create learning artifact
- `POST /learning/artifacts/{id}/quiz` - Add quiz questions
- `POST /learning/artifacts/{id}/submit` - Submit quiz
- `GET /learning/stats` - Learning statistics

### Moderation
- `POST /moderation/reports` - Create report
- `GET /moderation/reports` - List reports
- `PUT /moderation/reports/{id}/resolve` - Resolve report
- `GET /moderation/queue` - Moderation queue

### Admin
- `GET /admin/stats` - System statistics
- `GET /admin/users` - User management
- `PUT /admin/users/{id}/role` - Update user role

## 🔐 Authentication

Most endpoints require authentication via JWT Bearer token:

```
Authorization: Bearer {{accessToken}}
```

The token is automatically set after successful login and used in subsequent requests.

## 📊 Response Examples

### Successful Response
```json
{
  "data": {
    "id": "uuid",
    "title": "Sample Post",
    "content": "Post content...",
    "createdAt": "2025-08-10T00:00:00Z"
  },
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "title",
      "message": "Title is required"
    }
  ]
}
```

## 🔄 Common Query Parameters

Many endpoints support these standard parameters:
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10-20)
- `search` - Search term
- `sortBy` - Sort field
- `sortOrder` - asc/desc

## 🧪 Testing Tips

1. **Set Variables**: Update collection variables with actual IDs after creating resources
2. **Check Auth**: Ensure access token is valid for protected endpoints
3. **Role Testing**: Test with different user roles (admin, moderator, user)
4. **Error Handling**: Test invalid inputs to verify error responses
5. **Pagination**: Test with different page/limit values

## 🚨 Environment Setup

For development testing:
1. Start your NestJS server: `npm run start:dev`
2. Ensure database is running and migrated
3. Update `baseUrl` variable if needed
4. Create test user accounts with different roles

## 📞 Support

For API issues or questions:
- Check the NestJS server logs
- Verify database connections
- Review endpoint documentation in code
- Test authentication flow first

---

**Collection Version**: 2.0.0  
**Last Updated**: August 10, 2025  
**Total Endpoints**: 80+  
**Modules Covered**: All 12 platform modules
