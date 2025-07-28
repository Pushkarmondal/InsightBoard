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

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 🙏 Acknowledgments

- [Prisma](https://www.prisma.io/) for database ORM
- [Next.js](https://nextjs.org/) for the React framework
