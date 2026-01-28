# Project Info

## Overview
**Name**: My Finance Enterprise Tracker
**Goal**: A full-stack, Dockerized SaaS for personal finance tracking with multi-user support, budgeting, and transactions.
**Architecture**: React (Client) + Node/Express (Server) + PostgreSQL (DB).
**Visual Style**: Premium Dark Glassmorphism + Tremor Charts.

## Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, TanStack Query, Tremor, Lucide React.
- **Backend**: Node.js, Express (modular routes + middleware), Prisma ORM, JSON Web Token (JWT).
- **Database**: PostgreSQL 15.
- **DevOps**: Docker, Docker Compose, Nginx (Reverse Proxy).

## Key Features
- Multi-user support with secure Auth (JWT expiry + CORS control).
- Dashboard with real-time KPI and Charts.
- Transaction management (CRUD).
- Budget Planning (Monthly limits + planned income).
- Debts & Loans tracking with payment schedule.
- Upcoming payment notifications (n8n workflow ready).
- **Clawd.bot Integration**: Natural-language expenses with currency conversion.
- **Precision**: Money fields stored as Prisma Decimal (DB-level precision).
- **Security**: API rate limiting + audit logs for all mutating endpoints.
- **Ops**: Production Docker profile (`docker-compose.prod.yml`) with `prisma migrate deploy`.

## Environment
All secrets and runtime configuration are stored in `.env` on the server (see `.env.example`).
No credentials are committed to the repository.
Use `TRUST_PROXY=true` when running behind Nginx/Cloudflare and tune `RATE_LIMIT_*` if needed.
