# Glow Stream Backend

A scalable video streaming platform backend API built with NestJS.

## 🚀 Features

- **User Authentication** - JWT-based auth with access/refresh tokens
- **Channel Management** - Create and manage video channels
- **Video Upload & Processing** - Handle large video uploads
- **Video Streaming** - HLS-based adaptive streaming
- **Comments & Likes** - Interactive video engagement
- **Search** - Full-text search for videos and channels
- **Analytics** - Track video views and engagement
- **Real-time Events** - WebSocket support for live updates
- **Rate Limiting** - Protection against abuse

## 🛠 Tech Stack

- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Cache**: Redis
- **Authentication**: JWT (Passport.js)
- **API Documentation**: Swagger/OpenAPI
- **Real-time**: Socket.io

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- FFmpeg (for video processing)

## 🏃‍♂️ Quick Start

### 1. Clone and Install Dependencies

```bash
cd BACKEND
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=yourpassword
DB_NAME=glow_stream

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 3. Start Database (Optional - using Docker)

```bash
docker-compose up -d postgres redis
```

### 4. Run the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 5. Access the API

- API: http://localhost:3000/api/v1
- Swagger Docs: http://localhost:3000/api/docs

## 📁 Project Structure

```
src/
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   └── interceptors/    # Request/response interceptors
├── config/              # Configuration files
├── gateway/             # WebSocket gateway
└── modules/             # Feature modules
    ├── auth/           # Authentication
    ├── user/           # User management
    ├── channel/        # Channel management
    ├── video/          # Video management
    ├── upload/         # File uploads
    ├── comment/        # Comments
    ├── like/           # Likes
    ├── analytics/      # Analytics
    ├── notification/   # Notifications
    └── search/         # Search functionality
```

## 📝 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/logout` - Logout

### Users
- `GET /api/v1/users/me` - Get current user
- `PUT /api/v1/users/me` - Update profile

### Channels
- `POST /api/v1/channels` - Create channel
- `GET /api/v1/channels` - Get all channels
- `GET /api/v1/channels/:id` - Get channel by ID
- `PUT /api/v1/channels/:id` - Update channel
- `DELETE /api/v1/channels/:id` - Delete channel

### Videos
- `POST /api/v1/videos` - Create video
- `GET /api/v1/videos` - Get all videos
- `GET /api/v1/videos/trending` - Get trending videos
- `GET /api/v1/videos/:id` - Get video by ID
- `PUT /api/v1/videos/:id` - Update video
- `DELETE /api/v1/videos/:id` - Delete video

### Uploads
- `POST /api/v1/uploads/video` - Upload video
- `POST /api/v1/uploads/thumbnail` - Upload thumbnail
- `POST /api/v1/uploads/avatar` - Upload avatar

### Comments
- `POST /api/v1/comments` - Add comment
- `GET /api/v1/comments/video/:videoId` - Get video comments
- `DELETE /api/v1/comments/:id` - Delete comment

### Likes
- `POST /api/v1/likes/:videoId/like` - Like video
- `POST /api/v1/likes/:videoId/dislike` - Dislike video

### Search
- `GET /api/v1/search?q=query` - Search videos and channels
- `GET /api/v1/search/videos?q=query` - Search videos
- `GET /api/v1/search/channels?q=query` - Search channels

## 🔒 Security Features

- JWT authentication with access/refresh tokens
- Rate limiting (throttling)
- CORS configuration
- Helmet security headers
- Input validation with class-validator
- SQL injection prevention (TypeORM)
- Password hashing with bcrypt

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📈 Performance Optimizations

- Redis caching for frequently accessed data
- Database indexing on common queries
- Lazy loading for relations
- Pagination for list endpoints
- Gzip compression

## 🔧 Development

```bash
# Generate migration
npm run migration:generate -- src/migrations/MigrationName

# Run migrations
npm run migration:run

# Lint code
npm run lint

# Format code
npm run format
```

## 📄 License

MIT License - feel free to use this project for any purpose.

