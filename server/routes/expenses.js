import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';
import { convertToUSD, normalizeCurrency } from '../utils/currency.js';

const router = Router();

router.get('/data', asyncHandler(async (req, res) => {
  const expenses = await prisma.expense.findMany({
    where: { userId: req.user.id },
    include: { category: true },
  });
  return res.json({ expenses });
}));

const resolveAmountUSD = ({ amountUSD, amountLocal, currency }) => {
  let parsedAmount = Number.parseFloat(amountUSD);
  if (!Number.isFinite(parsedAmount)) {
    if (amountLocal !== undefined) {
      parsedAmount = convertToUSD(amountLocal, currency);
    }
  }
  return parsedAmount;
};

router.post('/expenses', asyncHandler(async (req, res) => {
  const { amountUSD, amountLocal, description, categoryId, date, type, currency } = req.body || {};

  if (!categoryId) {
    return res.status(400).json({ error: 'categoryId is required' });
  }

  await ensureCategoryOwnership(req.user.id, categoryId);

  const parsedAmount = resolveAmountUSD({ amountUSD, amountLocal, currency });
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amountUSD is required' });
  }

  const expense = await prisma.expense.create({
    data: {
      userId: req.user.id,
      amountUSD: parsedAmount,
      description: description || '',
      categoryId,
      date: date ? new Date(date) : new Date(),
      type: type || 'expense',
      currency: normalizeCurrency(currency || 'USD'),
    },
  });
  return res.json(expense);
}));

router.put('/expenses/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amountUSD, amountLocal, description, categoryId, date, type, currency } = req.body || {};

  const expense = await prisma.expense.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!expense) {
    return res.sendStatus(404);
  }

  if (categoryId) {
    await ensureCategoryOwnership(req.user.id, categoryId);
  }

  const parsedAmount = resolveAmountUSD({ amountUSD, amountLocal, currency });

  const updated = await prisma.expense.update({
    where: { id },
    data: {
      amountUSD: Number.isFinite(parsedAmount) ? parsedAmount : expense.amountUSD,
      description: description ?? expense.description,
      categoryId: categoryId || expense.categoryId,
      date: date ? new Date(date) : expense.date,
      type: type || expense.type,
      currency: currency ? normalizeCurrency(currency) : expense.currency,
    },
  });
  return res.json(updated);
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
  return res.json({ success: true });
}));

export default router;
