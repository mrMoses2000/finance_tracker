# Usage Guide: My Finance (Obsidian Edition)

## 🚀 Quick Start

### 1. Start the System
```bash
./run.sh
```
This requires Docker. It will start Frontend (:3000), Backend (:4000), and Postgres (:5432).

### 2. Access
Open [http://localhost:3000](http://localhost:3000).

**Credentials (Admin):**
- **Email**: `moisey.vasilenko.abi@gmail.com`
- **Password**: `Moses2000nsu!`

## 🛠 Features

### Dashboard (`/dashboard`)
- **KPI Cards**: Real-time summary of Expenses, Income, and Deficit.
- **Chart**: Tremor Donut chart with % share (hover for details).
- **Calendar**: Visualizes payments by date.
- **Modes**: Toggle "Standard" (Recurring only) vs "February" (Specific trips).

### Transactions (`/transactions`)
- **Add**: Click "Add Expense", choose Category/Date.
- **Edit**: Click the "Edit" (Pencil) icon on any row to modify amount/desc.
- **Search**: Type in the search bar to filter by Description or Category instantly.
- **Delete**: Click "Trash" icon to remove.

### Localization
- Switch languages (EN/RU/DE) in the Landing Page or Header. This persists in `localStorage`.

## 🧪 Testing

To run backend integration tests:
```bash
cd server
npm test
```
Expect 3 passing tests (Login, Fetch, Create).

## 🎨 Theme System
The project uses the **Obsidian & Gold** theme.
- **Background**: `bg-slate-950`
- **Primary**: `indigo-500` to `violet-600` gradients.
- **Glass**: `bg-slate-900/50 backdrop-blur-xl border-white/5`.
- **Animations**: `framer-motion` (Staggered children).
