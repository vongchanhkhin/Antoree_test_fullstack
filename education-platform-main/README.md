# English Education Platform

A comprehensive full-stack application for English language learning with AI assistance, community features, growth hack system, and robust moderation tools.

## 🚀 Project Overview

This platform combines educational content management with social learning features, implementing a point-based contribution system to encourage community engagement. Users can create posts, contribute improvements, and learn through AI-powered assistance.

## 📁 Project Structure

```
education-platform/
├── backend/                    # NestJS API Server
│   ├── src/
│   │   ├── routes/            # Feature modules
│   │   │   ├── auth/          # Authentication & authorization
│   │   │   ├── users/         # User management
│   │   │   ├── posts/         # Content creation & management
│   │   │   ├── comments/      # Threaded discussions
│   │   │   ├── votes/         # Upvoting/downvoting system
│   │   │   ├── search/        # Advanced content discovery
│   │   │   ├── media/         # File upload & management
│   │   │   ├── moderation/    # Content moderation & reporting
│   │   │   ├── admin/         # System administration
│   │   │   ├── content/       # Content management
│   │   │   └── profiles/      # User profiles & preferences
│   │   ├── shared/            # Common services & utilities
│   │   └── middleware/        # Custom middleware
│   ├── prisma/                # Database schema & migrations
│   ├── docker-compose.yml     # Docker services configuration
│   └── docs/                  # API documentation
└── frontend/                   # React TypeScript Application
    ├── src/
    │   ├── components/        # Reusable UI components
    │   ├── pages/             # Application pages
    │   ├── hooks/             # Custom React hooks
    │   ├── services/          # API service layer
    │   ├── types/             # TypeScript type definitions
    │   ├── config/            # Configuration files
    │   └── utils/             # Utility functions
    ├── public/                # Static assets
    └── build/                 # Production build
```

## 🛠️ Tech Stack

### Backend (NestJS)
- **Framework**: NestJS 11.x with TypeScript
- **Database**: MySQL 8.0 with Prisma ORM 6.x
- **Authentication**: JWT with Passport.js
- **Validation**: Class-validator & Class-transformer
- **Documentation**: Postman Collection & API docs
- **Testing**: Jest with comprehensive test coverage
- **Containerization**: Docker & Docker Compose

### Frontend (React)
- **Framework**: React 19.x with TypeScript
- **State Management**: TanStack React Query (React Query v5)
- **Styling**: Tailwind CSS 3.x with custom components
- **Routing**: React Router DOM 7.x
- **Forms**: React Hook Form with Yup validation
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **HTTP Client**: Axios
- **Notifications**: React Hot Toast

## ✨ Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Admin, Moderator, Learner)
- Social login integration ready
- Secure password hashing with bcrypt

### 📚 Content Management
- Rich text post creation and editing
- Media upload (images, audio) with Cloudinary integration
- Hierarchical commenting system
- Content moderation and reporting
- Voting system (upvote/downvote)
- Post categorization by learning levels

### 🎯 Growth Hack System
- **Contribution Types**:
  - Edit posts (5 points)
  - Add examples (3 points)
  - Ask questions (2 points)
- Point-based reward system
- Community contribution tracking
- Moderation workflow for contributions

### 🤖 AI Integration
- AI-powered learning assistance
- Smart content recommendations
- Automated content analysis

### � Advanced Features
- Real-time search and filtering
- User profiles with learning progress
- Reputation system
- Content analytics
- File management system
- Comprehensive admin dashboard

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and npm
- **Docker** and Docker Compose
- **Git**

### 🔧 Backend Setup

#### Option 1: Docker Compose (Recommended)

1. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd education-platform/backend
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment file
   cp .dotenv .env
   
   # Edit .env file with your configurations
   nano .env
   ```

3. **Start Services with Docker**
   ```bash
   # Build and start all services (MySQL + NestJS + phpMyAdmin)
   docker-compose up -d --build
   ```

4. **Database Migration**
   ```bash
   # Apply database schema
   docker-compose exec app npx prisma db push
   
   # Optional: Seed database with sample data
   docker-compose exec app npm run prisma:seed
   ```

5. **Verify Installation**
   ```bash
   # Check service status
   docker-compose ps
   
   # View application logs
   docker-compose logs -f app
   ```

#### Option 2: Local Development

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Setup Local MySQL Database**
   ```bash
   # Install and start MySQL 8.0
   # Create database: education_platform
   ```

3. **Configure Environment**
   ```bash
   # Update .env with local database URL
   DATABASE_URL="mysql://username:password@localhost:3306/education_platform"
   ```

4. **Run Migrations and Start**
   ```bash
   # Apply database schema
   npx prisma db push
   
   # Start development server
   npm run start:dev
   ```

### 🎨 Frontend Setup

1. **Navigate and Install**
   ```bash
   cd frontend
   npm install
   ```

2. **Environment Configuration**
   ```bash
   # Create .env file
   touch .env
   ```

3. **Start Development Server**
   ```bash
   npm start
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

## ⚙️ Environment Variables

### Backend (.env)
```
Copy file dotenv to .env
```

### Frontend (.env)
```
Copy file dotenv to .env
```

## � API Documentation

- **Base URL**: `http://localhost:3001/api/v1`
- **Postman Collection**: [backend/postman_collection.json](backend/postman_collection.json)
- **API Documentation**: [backend/API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)
- **Database Schema**: [backend/DATABASE_SCHEMA_OVERVIEW.md](backend/DATABASE_SCHEMA_OVERVIEW.md)
- **Docker Setup Guide**: [backend/DOCKER_SETUP.md](backend/DOCKER_SETUP.md)

### 🔗 Service URLs
- **Backend API**: http://localhost:3001
- **Frontend App**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080
- **Prisma Studio**: `npx prisma studio` (port 5555)

## � Development Guidelines

- Follow TypeScript strict mode
- Use ESLint and Prettier for code formatting
- Write tests for new features
- Update documentation for API changes
- Follow semantic commit messages
- Use feature branches for development

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check if MySQL is running
   docker-compose ps
   
   # Restart MySQL service
   docker-compose restart mysql
   ```


3. **Prisma Issues**
   ```bash
   # Reset database
   npx prisma db push --force-reset
   
   # Generate Prisma client
   npx prisma generate
   ```

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Support

- **Documentation**: Check the `/backend/docs` folder
- **API Testing**: Import Postman collection from `/backend/postman_collection.json`

### Latest Updates
- ✅ Growth hack contribution system implemented
- ✅ Media upload with Cloudinary integration
- ✅ Comprehensive commenting system
- ✅ Role-based access control
- ✅ Docker containerization with MySQL
- ✅ Production-ready API with 80+ endpoints