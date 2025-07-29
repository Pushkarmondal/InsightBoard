# InsightBoard

A modern feedback and feature management platform that helps teams collect, organize, and prioritize user feedback.

## 🚀 Features

- **Feedback Collection**: Rich text feedback with file attachments
- **Voting System**: Upvote/downvote with real-time updates
- **Workflow Management**: Custom statuses and progress tracking
- **Roadmapping**: Visual planning with prioritization
- **Multi-tenant**: Support for multiple organizations
- **Real-time Updates**: WebSocket support for live updates

## 🛠 Tech Stack

### Frontend
- Next.js 14 with App Router
- TypeScript
- TailwindCSS
- React Query

### Backend
- Node.js with Express
- Prisma ORM
- PostgreSQL
- WebSockets

### DevOps
- Docker & Docker Compose
- GitHub Actions
- AWS (for production)

## 📦 Prerequisites

- Node.js/Bun
- PostgreSQL
- Docker (optional, for containerization)

## 🚀 Getting Started

### 1. Fork the repository

### 2. Clone the repository
```bash
git clone https://github.com/yourusername/insightboard.git
cd insightboard
```

### 3. Set up environment variables
Create a `.env` file in the root directory:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/insightboard?schema=public"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3333
```

### 4. Install dependencies
```bash
# Install root dependencies
bun install

# Install backend dependencies
cd backend
bun install

# Install frontend dependencies
cd ../frontend
bun install
```

### 5. Database Setup
```bash
# Apply database migrations
cd backend
bunx prisma migrate dev --name init_db

# Generate Prisma Client
bunx prisma generate
```

### 6. Run the application

#### Development Mode
```bash
# Start backend server
cd backend
bun run index.ts

# In a new terminal, start frontend
cd frontend
bun run dev
```

#### Production Mode (with Docker)
```bash
docker-compose up --build
```

## 📂 Project Structure

```
insightboard/
├── backend/              # Backend server
│   ├── prisma/          # Database schema and migrations
│   ├── src/             # Source code
│   └── package.json     # Backend dependencies
├── frontend/            # Next.js frontend
│   ├── app/             # App router pages
│   ├── components/      # Reusable components
│   └── package.json     # Frontend dependencies
├── docker/              # Docker configuration
├── docs/                # Documentation
└── README.md            # This file
```

## 📚 API Documentation

### Authentication

#### Signup
- **Endpoint**: `POST /api/auth/signup`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "password": "securepassword123",
    "role": "MEMBER" // Optional, defaults to MEMBER
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "MEMBER"
      }
    }
  }
  ```

#### Login
- **Endpoint**: `POST /api/auth/login`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword123"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "token": "jwt-token",
      "user": {
        "id": "user-id",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "MEMBER"
      }
    }
  }
  ```

### Organizations

#### Create Organization
- **Endpoint**: `POST /api/organizations`
- **Headers**: `Authorization: Bearer <token>`
- **Request**:
  ```json
  {
    "name": "Acme Corp"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "org-id",
      "name": "Acme Corp",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Feedback

#### Create Feedback
- **Endpoint**: `POST /api/boards/:boardId/feedback`
- **Headers**: `Authorization: Bearer <token>`
- **Request**:
  ```json
  {
    "title": "New Feature Request",
    "description": "Please add dark mode",
    "category": "FEATURE"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback-id",
      "title": "New Feature Request",
      "description": "Please add dark mode",
      "status": "SUGGESTION",
      "voteCount": 0,
      "authorId": "user-id",
      "boardId": "board-id",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

### Votes

#### Toggle Vote on Feedback
- **Endpoint**: `POST /api/feedback/:feedbackId/vote`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Toggles the current user's vote on a feedback item. If the user hasn't voted, adds a vote. If already voted, removes the vote.
- **Response (on add vote)**:
  ```json
  {
    "success": true,
    "data": {
      "action": "added",
      "voteCount": 5,
      "feedback": {
        "id": "feedback-id",
        "title": "New Feature Request",
        "description": "Please add dark mode",
        "status": "SUGGESTION",
        "voteCount": 5,
        "hasVoted": true,
        "author": {
          "id": "user-id",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    }
  }
  ```
- **Response (on remove vote)**:
  ```json
  {
    "success": true,
    "data": {
      "action": "removed",
      "voteCount": 4,
      "feedback": {
        "id": "feedback-id",
        "title": "New Feature Request",
        "description": "Please add dark mode",
        "status": "SUGGESTION",
        "voteCount": 4,
        "hasVoted": false,
        "author": {
          "id": "user-id",
          "firstName": "John",
          "lastName": "Doe"
        }
      }
    }
  }
  ```

#### Get Feedback with Votes
- **Endpoint**: `GET /api/feedback/:feedbackId`
- **Headers**: `Authorization: Bearer <token>`
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "feedback-id",
      "title": "New Feature Request",
      "description": "Please add dark mode",
      "status": "SUGGESTION",
      "voteCount": 3,
      "hasVoted": true,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "author": {
        "id": "user-id",
        "firstName": "John",
        "lastName": "Doe"
      },
      "votes": [
        {
          "id": "vote-1",
          "user": {
            "id": "user-1",
            "firstName": "Alice",
            "lastName": "Smith"
          }
        },
        {
          "id": "vote-2",
          "user": {
            "id": "user-2",
            "firstName": "Bob",
            "lastName": "Johnson"
          }
        }
      ]
    }
  }
  ```

#### Get User's Voted Feedback
- **Endpoint**: `GET /api/users/me/votes`
- **Headers**: `Authorization: Bearer <token>`
- **Description**: Get all feedback items that the current user has voted on
- **Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "feedback-1",
        "title": "Dark Mode",
        "description": "Add dark theme support",
        "voteCount": 5,
        "status": "PLANNED"
      },
      {
        "id": "feedback-2",
        "title": "Mobile App",
        "description": "Build native mobile apps",
        "voteCount": 12,
        "status": "IN_PROGRESS"
      }
    ]
  }
  ```

### Comments

#### Add Comment
- **Endpoint**: `POST /api/boards/:boardId/feedback/:feedbackId/comments`
- **Headers**: `Authorization: Bearer <token>`
- **Request**:
  ```json
  {
    "content": "This is a great idea!"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "comment-id",
      "content": "This is a great idea!",
      "authorId": "user-id",
      "feedbackId": "feedback-id",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
  ```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [Prisma](https://www.prisma.io/) for database ORM
- [Next.js](https://nextjs.org/) for the React framework
