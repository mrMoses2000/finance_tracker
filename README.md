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
# Fill in JWT_SECRET, DB credentials, and security settings
```

### Auto-fill & Validation (Interactive)
`run.sh` now calls `scripts/ensure_env.sh` to auto-fill missing `.env` values.
- If a value is missing, it will ask you in the console.
- `JWT_SECRET` can be auto-generated.
- The script offers a startup menu (keep env, reset env, wipe DB volume, stop).
- Preflight checks validate dependencies, .env, and DB-credential mismatch before запуск.
```bash
./run.sh
```

### Example `.env` (EN)
```env
# Database
POSTGRES_USER=budget_user
POSTGRES_PASSWORD=change_me_strong
POSTGRES_DB=budget_app

# Auth
JWT_SECRET=replace_with_32_char_secret
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://moneycheckos.duckdns.org
CORS_ALLOW_ALL=false

# Networking
TRUST_PROXY=true

# Rate limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=20

# Audit log
AUDIT_LOG_ENABLED=true

# Optional admin seed
SEED_ADMIN=false
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change_me_strong
SEED_ADMIN_NAME=Admin User
```

### Пример `.env` (RU)
```env
# База данных
POSTGRES_USER=budget_user
POSTGRES_PASSWORD=change_me_strong
POSTGRES_DB=budget_app

# Аутентификация
JWT_SECRET=replace_with_32_char_secret
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=https://moneycheckos.duckdns.org
CORS_ALLOW_ALL=false

# Сеть / прокси
TRUST_PROXY=true

# Лимиты запросов
RATE_LIMIT_ENABLED=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=300
RATE_LIMIT_AUTH_WINDOW_MS=900000
RATE_LIMIT_AUTH_MAX=20

# Аудит-лог
AUDIT_LOG_ENABLED=true

# Опциональный seed администратора
SEED_ADMIN=false
SEED_ADMIN_EMAIL=admin@example.com
SEED_ADMIN_PASSWORD=change_me_strong
SEED_ADMIN_NAME=Admin User
```

### Running the App (Docker)
```bash
./run.sh
```
This script builds and launches Frontend (:3000), Backend (:4000), and Postgres (:5432).

### Production Profile (Docker)
Use the production compose file and migration-based startup.
```bash
RUN_MODE=prod ./run.sh
```
This uses `docker-compose.prod.yml` (no bind mounts, `NODE_ENV=production`) and runs `prisma migrate deploy` on startup.

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

## 🔐 Security & Observability
- **Rate limiting**: Configurable via `RATE_LIMIT_*` in `.env.example`.
- **Audit logs**: Enabled by default (`AUDIT_LOG_ENABLED=true`) and stored in `AuditLog`.
- **Reverse proxy**: Set `TRUST_PROXY=true` if running behind Nginx/Cloudflare.

## 📂 Project Structure
- `client/`: React Frontend (Obsidian Theme).
- `server/`: Express Backend API (modular routes, middleware, services).
- `meta/`: Agent Memory & Documentation.

## 🤖 For AI Agents
Please refer to `meta/AGENTS.md` and `meta/CONTINUITY.md` before making changes.
