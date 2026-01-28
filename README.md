# BudgetFlow Premium (Obsidian Edition)

**Current Version**: 1.6.0 (Modular API + Clawd Currency Fixes)
**Status**: Stable / Production-Hardened

## 🌟 Overview
BudgetFlow is a premium, high-performance financial tracking application. It helps users track expenses, plan budgets, and visualize financial health with a stunning "Obsidian" (Dark Glassmorphism) interface.

## 🚀 Key Features
- **Obsidian UX**: Deep blue/indigo aesthetics, glassmorphism, and smooth Framer Motion animations.
- **Smart Dashboard**: Toggle between Actual vs Plan views with budget variance and warnings.
- **Advanced Operations**: Full CRUD with search, filters, and category management.
- **Planning & Schedules**: Monthly budget limits, debts/loans, and payment calendars.
- **Localization**: Fully translated in English (EN), Russian (RU), and German (DE).
- **Security**: JWT-based auth with configurable expiry and locked-down CORS.
- **Clawd.bot Integration**: Natural-language expense parsing with currency conversion.

## 🛠 Tech Stack
- **Frontend**: React 18, Vite, TailwindCSS, Framer Motion, TanStack Query, Tremor, Lucide React.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL (via Docker).
- **Infrastructure**: Docker, Docker Compose, Nginx (Reverse Proxy).

## 🏁 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### Environment
```bash
cp .env.example .env
# Fill in JWT_SECRET and DB credentials
```

### Running the App (Docker)
```bash
./run.sh
```
This script builds and launches Frontend (:3000), Backend (:4000), and Postgres (:5432).

### Running Tests
Tests use a dedicated test database.
```bash
# Start Postgres (if not running)
docker compose up -d db

# Sync schema for the test DB
cd server
DATABASE_URL="postgresql://user:password@localhost:5432/budget_app_test?schema=public" npx prisma db push

# Run tests
DATABASE_URL="postgresql://user:password@localhost:5432/budget_app_test?schema=public" npm test
```

## 📂 Project Structure
- `client/`: React Frontend (Obsidian Theme).
- `server/`: Express Backend API (modular routes, middleware, services).
- `meta/`: Agent Memory & Documentation.

## 🤖 For AI Agents
Please refer to `meta/AGENTS.md` and `meta/CONTINUITY.md` before making changes.
