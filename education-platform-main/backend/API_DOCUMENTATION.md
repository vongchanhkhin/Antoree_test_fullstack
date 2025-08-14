# English Education Platform - API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require JWT authentication. Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Common Headers
```
Content-Type: application/json
Authorization: Bearer <access_token> // (when required)
```

## User Roles
- `student` - Student user
- `teacher` - Teacher user  
- `admin` - Administrator user

---

# Authentication Endpoints

## 1. Sign Up
Register a new user account.

**Endpoint:** `POST /auth/signup`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "student", // Optional: "student" | "teacher" | "admin" (default: "student")
  "bio": "Optional bio text" // Optional
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "bio": "Optional bio text",
    "createdAt": "2025-08-09T17:43:42.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `409 Conflict` - User with email already exists
- `400 Bad Request` - Validation errors

---

## 2. Sign In
Authenticate an existing user.

**Endpoint:** `POST /auth/signin`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null,
    "bio": "Optional bio text",
    "createdAt": "2025-08-09T17:43:42.000Z",
    "updatedAt": "2025-08-09T17:43:42.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Validation errors

---

## 3. Refresh Token
Get a new access token using refresh token.

**Endpoint:** `POST /auth/refresh`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or expired refresh token

---

## 4. Logout
Invalidate the refresh token.

**Endpoint:** `POST /auth/logout`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

## 5. Get Current User Profile
Get the authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null,
    "bio": "Optional bio text"
  }
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token

---

# User Management Endpoints

## 1. Get All Users
List all users (Admin/Teacher only).

**Endpoint:** `GET /users`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `role` (optional): Filter by role (`student` | `teacher` | `admin`)

**Example:** `GET /users?role=student`

**Required Roles:** `admin`, `teacher`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null,
    "bio": "Student bio",
    "createdAt": "2025-08-09T17:43:42.000Z",
    "updatedAt": "2025-08-09T17:43:42.000Z"
  },
  {
    "id": 2,
    "email": "teacher@example.com",
    "name": "Jane Smith",
    "role": "teacher",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Experienced English teacher",
    "createdAt": "2025-08-09T17:43:42.000Z",
    "updatedAt": "2025-08-09T17:43:42.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions

---

## 2. Get All Teachers
List all teacher users.

**Endpoint:** `GET /users/teachers`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
[
  {
    "id": 2,
    "email": "teacher@example.com",
    "name": "Jane Smith",
    "role": "teacher",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "Experienced English teacher",
    "createdAt": "2025-08-09T17:43:42.000Z",
    "updatedAt": "2025-08-09T17:43:42.000Z"
  }
]
```

---

## 3. Get All Students
List all student users (Admin/Teacher only).

**Endpoint:** `GET /users/students`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Required Roles:** `admin`, `teacher`

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "email": "student@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null,
    "bio": "Student bio",
    "createdAt": "2025-08-09T17:43:42.000Z",
    "updatedAt": "2025-08-09T17:43:42.000Z"
  }
]
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions

---

## 4. Get User Profile
Get the current user's profile.

**Endpoint:** `GET /users/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "role": "student",
    "avatar": null,
    "bio": "Optional bio text"
  }
}
```

---

## 5. Get User by ID
Get a specific user by ID (Admin/Teacher only).

**Endpoint:** `GET /users/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (number): User ID

**Required Roles:** `admin`, `teacher`

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "student",
  "avatar": null,
  "bio": "Optional bio text",
  "createdAt": "2025-08-09T17:43:42.000Z",
  "updatedAt": "2025-08-09T17:43:42.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found

---

## 6. Update User by ID
Update a specific user by ID (Admin only).

**Endpoint:** `PUT /users/:id`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Path Parameters:**
- `id` (number): User ID

**Required Roles:** `admin`

**Request Body:**
```json
{
  "name": "Updated Name", // Optional
  "bio": "Updated bio", // Optional
  "avatar": "https://example.com/new-avatar.jpg", // Optional
  "role": "teacher" // Optional: "student" | "teacher" | "admin"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Updated Name",
  "role": "teacher",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio",
  "updatedAt": "2025-08-09T18:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found
- `400 Bad Request` - Validation errors

---

## 7. Update Own Profile
Update the current user's profile.

**Endpoint:** `PUT /users/profile`

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Name", // Optional
  "bio": "Updated bio", // Optional
  "avatar": "https://example.com/new-avatar.jpg" // Optional
  // Note: role cannot be updated through this endpoint for security
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Updated Name",
  "role": "student",
  "avatar": "https://example.com/new-avatar.jpg",
  "bio": "Updated bio",
  "updatedAt": "2025-08-09T18:00:00.000Z"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `400 Bad Request` - Validation errors

---

## 8. Delete User
Delete a user by ID (Admin only).

**Endpoint:** `DELETE /users/:id`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `id` (number): User ID

**Required Roles:** `admin`

**Response (200 OK):**
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `401 Unauthorized` - Invalid or missing token
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - User not found

---

# Posts Endpoints (Legacy)

## 1. Get All Posts
Get all posts/courses.

**Endpoint:** `GET /posts`

**Response (200 OK):**
```json
"[{\"id\":1,\"title\":\"Course Title\",\"description\":\"Course Description\"}]"
```

---

## 2. Create Post
Create a new post (returns placeholder message).

**Endpoint:** `POST /posts`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post Content"
}
```

**Response (201 Created):**
```json
{
  "message": "Post functionality replaced with course system"
}
```

---

## 3. Get Post by ID
Get a specific post by ID.

**Endpoint:** `GET /posts/:id`

**Path Parameters:**
- `id` (string): Post ID

**Response (200 OK):**
```
"This action returns a #123 post"
```

---

## 4. Update Post
Update a post by ID.

**Endpoint:** `PUT /posts/:id`

**Headers:**
```
Content-Type: application/json
```

**Path Parameters:**
- `id` (string): Post ID

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated Content"
}
```

**Response (200 OK):**
```
"This action updates a #123 post with data {\"title\":\"Updated Title\",\"content\":\"Updated Content\"}"
```

---

## 5. Delete Post
Delete a post by ID.

**Endpoint:** `DELETE /posts/:id`

**Path Parameters:**
- `id` (string): Post ID

**Response (200 OK):**
```
"This action removes a #123 post"
```

---

# Error Responses

## Common Error Formats

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "User not found"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "User with this email already exists"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

---

# Authentication Flow Example

## Complete Authentication Flow

### 1. Sign Up
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "name": "John Doe",
    "password": "password123",
    "role": "student",
    "bio": "New student"
  }'
```

### 2. Sign In
```bash
curl -X POST http://localhost:3000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "password": "password123"
  }'
```

### 3. Use Access Token
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### 5. Logout
```bash
curl -X POST http://localhost:3000/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

# Postman Collection

You can import this as a Postman collection by creating a new collection and adding these endpoints with the specified headers and request bodies.

## Environment Variables for Testing
- `baseUrl`: `http://localhost:3000`
- `accessToken`: `YOUR_ACCESS_TOKEN`
- `refreshToken`: `YOUR_REFRESH_TOKEN`
