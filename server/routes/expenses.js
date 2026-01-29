import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';
import { normalizeCurrency } from '../utils/currency.js';
import { toDecimal } from '../utils/money.js';
import { formatExpense } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';
import { resolveAmountBase } from '../services/currencyService.js';

const router = Router();

router.get('/data', asyncHandler(async (req, res) => {
  const expenses = await prisma.expense.findMany({
    where: { userId: req.user.id },
    include: { category: true },
  });
  return res.json({ expenses: expenses.map(formatExpense) });
}));

router.post('/expenses', asyncHandler(async (req, res) => {
  const { amountUSD, amountLocal, amount, description, categoryId, date, type, currency } = req.body || {};

  if (!categoryId) {
    return res.status(400).json({ error: 'categoryId is required' });
  }

  await ensureCategoryOwnership(req.user.id, categoryId);

  const { amountBase, baseCurrency } = await resolveAmountBase({
    userId: req.user.id,
    amount,
    amountLocal,
    amountUSD,
    currency,
  });
  if (!Number.isFinite(amountBase) || amountBase <= 0) {
    return res.status(400).json({ error: 'amount is required' });
  }

  const expense = await prisma.expense.create({
    data: {
      userId: req.user.id,
      amountUSD: toDecimal(amountBase),
      description: description || '',
      categoryId,
      date: date ? new Date(date) : new Date(),
      type: type || 'expense',
      currency: normalizeCurrency(currency || baseCurrency),
    },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'create',
    entity: 'expense',
    entityId: expense.id,
    metadata: { categoryId, type: type || 'expense' },
  });

  return res.json(formatExpense(expense));
}));

router.put('/expenses/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amountUSD, amountLocal, amount, description, categoryId, date, type, currency } = req.body || {};

  const expense = await prisma.expense.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!expense) {
    return res.sendStatus(404);
  }

  if (categoryId) {
    await ensureCategoryOwnership(req.user.id, categoryId);
  }

  const { amountBase, baseCurrency } = await resolveAmountBase({
    userId: req.user.id,
    amount,
    amountLocal,
    amountUSD,
    currency,
  });

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      amountUSD: Number.isFinite(amountBase) ? toDecimal(amountBase) : expense.amountUSD,
      description: description ?? expense.description,
      categoryId: categoryId || expense.categoryId,
      date: date ? new Date(date) : expense.date,
      type: type || expense.type,
      currency: currency ? normalizeCurrency(currency || baseCurrency) : expense.currency,
    },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'update',
    entity: 'expense',
    entityId: id,
    metadata: { categoryId: categoryId || expense.categoryId },
  });

  return res.json(formatExpense(updated));
}));

router.delete('/expenses/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const expense = await prisma.expense.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!expense) {
    return res.sendStatus(404);
  }

  await prisma.expense.delete({ where: { id } });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'delete',
    entity: 'expense',
    entityId: id,
  });

  return res.json({ success: true });
}));

export default router;
