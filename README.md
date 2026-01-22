# BudgetFlow Premium (Obsidian Edition)

**Current Version**: 1.5.0 (Obsidian UI + Localization)
**Status**: Stable / Feature Rich

## 🌟 Overview
BudgetFlow is a premium, high-performance financial tracking application. It helps users track expenses, plan budgets, and visualize financial health with a stunning "Obsidian" (Dark Glassmorphism) interface.

## 🚀 Key Features
- **Obsidian UX**: Deep blue/indigo aesthetics, glassmorphism, and smooth Framer Motion animations.
- **Smart Dashboard**: Toggle between "Standard" and "February" (Travel) modes.
- **Advanced Transactions**: Full CRUD (Create, Read, Update, Delete) with search and filters.
- **Visualization**: Interactive Tremor charts (Donut) and custom Calendar view.
- **Localization**: Fully translated in English (EN), Russian (RU), and German (DE).
- **Security**: JWT-based authentication (Login/Register) with secure backend.

## 🛠 Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Framer Motion, Tremor, Lucide React.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL (via Docker).
- **Infrastructure**: Docker & Docker Compose.

## 🏁 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js (for local development)

### Running the App (Docker)
```bash
./run.sh
```
This script ensures the db is ready, seed data is loaded, and the app starts on `http://localhost:3000`.

### Running Tests
The backend has live integration tests:
```bash
cd server
npm test
```

## 📂 Project Structure
- `client/`: React Frontend (Obsidian Theme).
- `server/`: Express Backend API.
- `meta/`: Agent Memory & Documentation.

## 🤖 For AI Agents
Please refer to `meta/AGENTS.md` and `meta/CONTINUITY.md` before making changes.
