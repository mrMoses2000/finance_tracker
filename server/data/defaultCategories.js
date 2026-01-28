export const DEFAULT_CATEGORIES = [
  { labelKey: 'housing', label: 'Housing', color: '#0d9488', limit: 300, type: 'expense' },
  { labelKey: 'transport', label: 'Transport', color: '#3b82f6', limit: 100, type: 'expense' },
  { labelKey: 'food', label: 'Food', color: '#ea580c', limit: 400, type: 'expense' },
  { labelKey: 'entertainment', label: 'Entertainment', color: '#8b5cf6', limit: 100, type: 'expense' },
  { labelKey: 'health', label: 'Health', color: '#ef4444', limit: 100, type: 'expense' },
  { labelKey: 'subscriptions', label: 'Subscriptions', color: '#64748b', limit: 50, type: 'expense' },
  { labelKey: 'shopping', label: 'Shopping', color: '#f59e0b', limit: 150, type: 'expense' },
  { labelKey: 'salary', label: 'Salary', color: '#10b981', limit: 0, type: 'income' },
  { labelKey: 'freelance', label: 'Freelance', color: '#22c55e', limit: 0, type: 'income' },
];

export const CATEGORY_COLORS = DEFAULT_CATEGORIES.map((item) => item.color);
