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

## Environment
All secrets and runtime configuration are stored in `.env` on the server (see `.env.example`).
No credentials are committed to the repository.
