# StudyHub AI Backend

Backend API for **StudyHub AI** — an intelligent learning platform with AI-powered tutoring, quiz generation, course management, and payment integration.

## Tech Stack

- **Runtime:** Node.js 20
- **Framework:** Express + TypeScript (strict mode)
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** JWT (access + refresh tokens in httpOnly cookies)
- **Validation:** Zod
- **AI:** OpenAI GPT-4o, Nvidia Riva (speech-to-text)
- **Payments:** Stripe (test mode)
- **Storage:** Cloudinary
- **OAuth:** Google OAuth2
- **Integrations:** GitHub API
- **Testing:** Jest + Supertest
- **DevOps:** Docker, docker-compose

## Prerequisites

- Node.js 20+
- PostgreSQL 14+ (or use Docker)
- npm

## Quick Start

### 1. Clone & Install

```bash
cd studyhub-backend
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your credentials. For local development, the defaults in `.env.example` work with Docker PostgreSQL.

### 3. Start PostgreSQL (Docker)

```bash
docker compose up postgres -d
```

Or use your own PostgreSQL instance and update `DATABASE_URL`.

### 4. Database Migration & Seed

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Server runs at `http://localhost:4000`

### 6. Run Tests

```bash
npm test
```

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| student@demo.com | demo1234 | STUDENT |
| instructor@demo.com | demo1234 | INSTRUCTOR |
| admin@demo.com | demo1234 | ADMIN |

## API Documentation

Base URL: `http://localhost:4000/api`

All authenticated endpoints use JWT cookies (`accessToken`, `refreshToken`).

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/google` | Google OAuth login | No |
| POST | `/auth/refresh` | Refresh access token | Cookie |
| POST | `/auth/forgot-password` | Request password reset | No |
| POST | `/auth/reset-password` | Reset password with token | No |

### Users

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/users/me` | Get current user profile | Yes |
| PATCH | `/users/me` | Update profile | Yes |
| GET | `/users/:id` | Get user by ID | Yes |
| PATCH | `/users/me/language` | Update language preference | Yes |
| PATCH | `/users/me/learning-type` | Update VARK learning type | Yes |

### Courses

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/courses` | List courses (search, filter, pagination) | No |
| GET | `/courses/:id` | Get course with lessons & instructor | No |
| POST | `/courses` | Create course | Instructor |
| PATCH | `/courses/:id` | Update course | Owner |
| DELETE | `/courses/:id` | Delete course | Owner/Admin |
| POST | `/courses/:id/enroll` | Enroll in course | Student |
| GET | `/courses/enrolled` | Get enrolled courses | Yes |

### Lessons

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/courses/:courseId/lessons` | Create lesson | Instructor |
| GET | `/lessons/:id` | Get lesson details | No |
| PATCH | `/lessons/:id` | Update lesson | Instructor |
| DELETE | `/lessons/:id` | Delete lesson | Instructor |

### Quizzes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/lessons/:lessonId/quizzes` | Create quiz | Instructor |
| GET | `/quizzes/:id` | Get quiz (hides answers for students) | Yes |
| POST | `/quizzes/:id/attempt` | Submit quiz attempt | Yes |
| GET | `/quizzes/:id/attempts` | Get attempt history | Yes |

### AI

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/ai/chat` | Chat with GPT-4o tutor | Yes |
| POST | `/ai/generate-quiz` | Generate quiz from lesson content | Yes |
| POST | `/ai/speech-to-text` | Transcribe audio via Nvidia Riva | Yes |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/payments/create-checkout` | Create Stripe checkout session | Yes |
| POST | `/payments/webhook` | Stripe webhook handler | Stripe |

### GitHub

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/github/repos` | Fetch & cache user GitHub repos | Yes |

### Stats

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats/dashboard` | Role-based dashboard stats | Yes |

### Notes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/notes` | List notes (optional `?lessonId=`) | Yes |
| POST | `/notes` | Create note | Yes |
| PATCH | `/notes/:id` | Update note | Yes |
| DELETE | `/notes/:id` | Delete note | Yes |

### Upload

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/upload` | Upload file to Cloudinary | Yes |

### Health

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |

## Project Structure

```
studyhub-backend/
├── src/
│   ├── controllers/   # Request handlers
│   ├── services/      # Business logic
│   ├── middlewares/   # Auth, validation, error handling
│   ├── routes/        # Route definitions
│   ├── validators/    # Zod schemas
│   ├── utils/         # Helpers, JWT, Prisma client
│   ├── config/        # Environment config
│   ├── app.ts         # Express setup
│   └── server.ts      # Entry point
├── prisma/
│   ├── schema.prisma  # Database schema
│   └── seed.ts        # Demo data seeder
├── tests/             # Jest + Supertest tests
├── docs/              # Postman collection
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Docker Deployment

### Full Stack (Backend + PostgreSQL)

```bash
cp .env.example .env
docker compose up --build -d
```

### Production Build

```bash
docker build -t studyhub-backend .
docker run -p 4000:4000 --env-file .env studyhub-backend
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Secret for access tokens (15 min) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (7 days) |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o |
| `NVIDIA_API_KEY` | Nvidia API key for Riva ASR |
| `NVIDIA_RIVA_URL` | Nvidia Riva ASR endpoint |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GITHUB_TOKEN` | GitHub personal access token |
| `STRIPE_SECRET_KEY` | Stripe secret key (test mode) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `CLOUDINARY_URL` | Cloudinary connection URL |
| `PORT` | Server port (default: 4000) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `NODE_ENV` | Environment (development/production) |

## Security Features

- JWT access tokens (15 min) + refresh tokens (7 days) in httpOnly cookies
- Helmet security headers
- CORS restricted to `FRONTEND_URL`
- Rate limiting on auth and AI routes
- Zod input validation on all request bodies
- Role-based access control (STUDENT, INSTRUCTOR, ADMIN)
- Stripe webhook signature verification

## License

MIT
