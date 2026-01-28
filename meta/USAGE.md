# Usage Guide: My Finance (Obsidian Edition)

## 🚀 Quick Start

### 1. Configure Environment
```bash
cp .env.example .env
# Set POSTGRES_* and JWT_SECRET
```

### 2. Start the System
```bash
./run.sh
```
This requires Docker. It will start Frontend (:3000), Backend (:4000), and Postgres (:5432).

### 2.1 Production Profile
```bash
RUN_MODE=prod ./run.sh
```
Uses `docker-compose.prod.yml` with `NODE_ENV=production` and applies migrations (`prisma migrate deploy`).

### 3. Access
Open http://localhost:3000

> Admin seed is optional and controlled by `.env` variables.
> No credentials are stored in the repository.
> Enable audit logs and rate limiting via `AUDIT_LOG_ENABLED` and `RATE_LIMIT_*`.

## 🛠 Features

### Dashboard (`/dashboard`)
- **KPI Cards**: Real-time summary of Expenses, Income, and Balance.
- **Chart**: Tremor Donut chart with % share.
- **Calendar**: Visualizes payments by date.
- **Modes**: Toggle Actual vs Plan views.

### Transactions (`/transactions`)
- **Add**: Click "Add Operation", choose Category/Date.
- **Edit**: Click the "Edit" (Pencil) icon on any row to modify amount/desc.
- **Search**: Type in the search bar to filter by Description or Category.
- **Delete**: Click "Trash" icon to remove.

### Localization
- Switch languages (EN/RU/DE) in the Landing Page or Header. This persists in `localStorage`.

## 🧪 Testing

Tests use a dedicated database:
```bash
cd server
DATABASE_URL="postgresql://user:password@localhost:5432/budget_app_test?schema=public" npx prisma db push
DATABASE_URL="postgresql://user:password@localhost:5432/budget_app_test?schema=public" npm test
```

## 🎨 Theme System
The project uses the **Obsidian & Gold** theme.
- **Background**: `bg-slate-950`
- **Primary**: `indigo-500` to `violet-600` gradients
- **Glass**: `bg-slate-900/50 backdrop-blur-xl border-white/5`
- **Animations**: `framer-motion` (Staggered children)
