import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { parseExpenseText, CATEGORY_KEYWORDS } from '../utils/parseExpense.js';
import { convertFromUSD, convertToUSD, getCurrencySymbol, normalizeCurrency } from '../utils/currency.js';
import { getMonthRange, toMonthKey, toMonthStart } from '../utils/date.js';
import { toDecimal } from '../utils/money.js';
import { formatBudgetMonth, formatCategory, formatExpense } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';

const router = Router();

const resolveUserCurrency = async (userId, requestCurrency) => {
  if (requestCurrency) {
    return normalizeCurrency(requestCurrency);
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return normalizeCurrency(user?.currency || 'USD');
};

router.post('/expense', asyncHandler(async (req, res) => {
  const { text, date, currency } = req.body || {};

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const parsed = parseExpenseText(text);

  if (!parsed.amount || parsed.amount <= 0) {
    return res.status(400).json({
      error: 'Could not parse amount from text',
      parsed,
    });
  }

  const targetCurrency = await resolveUserCurrency(req.user.id, currency);
  const amountUSD = convertToUSD(parsed.amount, targetCurrency);

  let category = null;
  if (parsed.categoryKey) {
    category = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        OR: [
          { labelKey: parsed.categoryKey },
          { label: { contains: parsed.categoryKey, mode: 'insensitive' } },
        ],
      },
    });
  }

  if (!category) {
    category = await prisma.category.findFirst({
      where: {
        userId: req.user.id,
        type: parsed.type === 'income' ? 'income' : 'expense',
      },
    });
  }

  if (!category) {
    return res.status(400).json({ error: 'No matching category found' });
  }

  const expense = await prisma.expense.create({
    data: {
      userId: req.user.id,
      categoryId: category.id,
      amountUSD: toDecimal(amountUSD),
      description: parsed.description,
      date: date ? new Date(date) : new Date(),
      type: parsed.type,
      currency: targetCurrency,
    },
    include: { category: true },
  });

  const symbol = getCurrencySymbol(targetCurrency);
  const amountLocal = convertFromUSD(amountUSD, targetCurrency);

  await logAudit({
    req,
    userId: req.user.id,
    action: 'create',
    entity: 'expense',
    entityId: expense.id,
    metadata: { source: 'clawd' },
  });

  return res.json({
    success: true,
    expense: formatExpense(expense),
    parsed: {
      ...parsed,
      amountUSD,
      amountLocal,
      currency: targetCurrency,
    },
    message: `Added: ${parsed.description} - ${Math.round(amountLocal)} ${symbol} (${category.label})`,
  });
}));

router.get('/summary', asyncHandler(async (req, res) => {
  const monthStr = req.query.month;
  const currency = await resolveUserCurrency(req.user.id, req.query.currency);
  const symbol = getCurrencySymbol(currency);

  const monthStart = toMonthStart(monthStr);
  const { start, end } = getMonthRange(monthStart);

  const expenses = await prisma.expense.findMany({
    where: {
      userId: req.user.id,
      date: { gte: start, lt: end },
    },
    include: { category: true },
  });
  const formattedExpenses = expenses.map(formatExpense);

  const totalIncomeUSD = formattedExpenses
    .filter((e) => e.type === 'income')
    .reduce((sum, e) => sum + e.amountUSD, 0);

  const totalExpensesUSD = formattedExpenses
    .filter((e) => e.type !== 'income')
    .reduce((sum, e) => sum + e.amountUSD, 0);

  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
    include: { items: true },
  });
  const formattedBudget = budgetMonth ? formatBudgetMonth(budgetMonth) : null;

  const budgetLimits = new Map();
  (formattedBudget?.items || []).forEach((item) => {
    if (item.plannedAmount > 0) {
      budgetLimits.set(item.categoryId, item.plannedAmount);
    }
  });

  const byCategory = {};
  formattedExpenses.filter((e) => e.type !== 'income').forEach((e) => {
    const label = e.category?.label || 'Other';
    const limitUSD = budgetLimits.get(e.categoryId) || e.category?.limit || 0;
    if (!byCategory[label]) {
      byCategory[label] = { spent: 0, limit: convertFromUSD(limitUSD, currency) };
    }
    byCategory[label].spent += convertFromUSD(e.amountUSD, currency);
  });

  return res.json({
    month: toMonthKey(monthStart),
    currency,
    symbol,
    income: convertFromUSD(totalIncomeUSD, currency),
    expenses: convertFromUSD(totalExpensesUSD, currency),
    balance: convertFromUSD(totalIncomeUSD - totalExpensesUSD, currency),
    plannedIncome: convertFromUSD(formattedBudget?.incomePlanned || 0, currency),
    byCategory,
  });
}));

router.get('/alerts', asyncHandler(async (req, res) => {
  const monthStr = req.query.month;
  const currency = await resolveUserCurrency(req.user.id, req.query.currency);
  const symbol = getCurrencySymbol(currency);

  const monthStart = toMonthStart(monthStr);
  const { start, end } = getMonthRange(monthStart);

  const categories = await prisma.category.findMany({
    where: { userId: req.user.id, type: 'expense' },
  });
  const formattedCategories = categories.map(formatCategory);

  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
    include: { items: true },
  });
  const formattedBudget = budgetMonth ? formatBudgetMonth(budgetMonth) : null;

  const budgetLimits = new Map();
  (formattedBudget?.items || []).forEach((item) => {
    if (item.plannedAmount > 0) {
      budgetLimits.set(item.categoryId, item.plannedAmount);
    }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      userId: req.user.id,
      type: 'expense',
      date: { gte: start, lt: end },
    },
  });
  const formattedExpenses = expenses.map(formatExpense);

  const spentByCategory = new Map();
  formattedExpenses.forEach((e) => {
    const current = spentByCategory.get(e.categoryId) || 0;
    spentByCategory.set(e.categoryId, current + e.amountUSD);
  });

  const alerts = [];
  const thresholds = [
    { percent: 100, level: 'exceeded', emoji: '\u{1F6A8}' },
    { percent: 95, level: 'critical', emoji: '\u26A0\uFE0F' },
    { percent: 80, level: 'warning', emoji: '\u26A1' },
  ];

  for (const category of formattedCategories) {
    const limitUSD = budgetLimits.get(category.id) || category.limit || 0;
    if (limitUSD <= 0) continue;

    const spentUSD = spentByCategory.get(category.id) || 0;
    const percent = Math.round((spentUSD / limitUSD) * 100);

    for (const threshold of thresholds) {
      if (percent >= threshold.percent) {
        const spentLocal = convertFromUSD(spentUSD, currency);
        const limitLocal = convertFromUSD(limitUSD, currency);
        alerts.push({
          categoryId: category.id,
          category: category.label,
          labelKey: category.labelKey,
          spent: spentLocal,
          limit: limitLocal,
          percent,
          remaining: Math.max(0, limitLocal - spentLocal),
          level: threshold.level,
          emoji: threshold.emoji,
          message: `${threshold.emoji} ${category.label}: ${Math.round(spentLocal)}/${Math.round(limitLocal)} ${symbol} (${percent}%)`,
        });
        break;
      }
    }
  }

  alerts.sort((a, b) => b.percent - a.percent);

  return res.json({
    month: toMonthKey(monthStart),
    currency,
    symbol,
    alerts,
    hasAlerts: alerts.length > 0,
  });
}));

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
    orderBy: { type: 'asc' },
  });

  const result = categories.map((cat) => ({
    id: cat.id,
    label: cat.label,
    labelKey: cat.labelKey,
    type: cat.type,
    color: cat.color,
    keywords: cat.labelKey ? (CATEGORY_KEYWORDS[cat.labelKey] || []) : [],
  }));

  return res.json(result);
}));

export default router;
