# InclusiveCart AI

AI-powered accessible e-commerce platform built with React, FastAPI, and PostgreSQL.

## Tech Stack

### Frontend

- React 19, Vite, TypeScript
- Tailwind CSS, Framer Motion
- React Router DOM, Zustand, React Query, Axios

### Backend

- FastAPI, Python 3.12
- SQLAlchemy, PostgreSQL
- JWT Authentication (python-jose, passlib)

### AI

- Groq API for AI features
- Whisper (Speech-to-Text)
- Browser SpeechSynthesis API

## Project Structure

```
.
├── frontend/               # React SPA
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # API service layer
│   │   ├── utils/          # Utility functions
│   │   ├── layouts/        # Layout components
│   │   ├── assets/         # Static assets
│   │   └── types/          # TypeScript types
│   ├── Dockerfile
│   └── nginx.conf
├── backend/                # FastAPI server
│   └── app/
│       ├── routers/        # API route handlers
│       ├── models/         # SQLAlchemy models
│       ├── schemas/        # Pydantic schemas
│       ├── services/       # Business logic
│       ├── database/       # DB connection & base
│       ├── middleware/      # Custom middleware
│       └── core/           # Config, security, DI
├── docker-compose.yml
└── .env.example
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.12+
- PostgreSQL 16+

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker Setup

```bash
docker compose up --build
```

## API Documentation

Once the backend is running, visit:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Environment Variables

Copy `.env.example` to `.env` in both `frontend/` and `backend/` directories and configure as needed.
