import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toMonthStart, toMonthKey } from '../utils/date.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';

const router = Router();

router.get('/budgets', asyncHandler(async (req, res) => {
  const monthStart = toMonthStart(req.query.month);
  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
    include: { items: { include: { category: true } } },
  });

  if (!budgetMonth) {
    return res.json({
      id: null,
      month: toMonthKey(monthStart),
      incomePlanned: 0,
      items: [],
    });
  }

  return res.json({
    id: budgetMonth.id,
    month: toMonthKey(monthStart),
    incomePlanned: budgetMonth.incomePlanned,
    items: budgetMonth.items,
  });
}));

router.put('/budgets/income', asyncHandler(async (req, res) => {
  const { month, incomePlanned } = req.body || {};
  const monthStart = toMonthStart(month);

  const parsedIncome = Number.parseFloat(incomePlanned || 0);

  const budgetMonth = await prisma.budgetMonth.upsert({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
    update: { incomePlanned: Number.isNaN(parsedIncome) ? 0 : parsedIncome },
    create: {
      userId: req.user.id,
      month: monthStart,
      incomePlanned: Number.isNaN(parsedIncome) ? 0 : parsedIncome,
    },
  });

  return res.json({
    id: budgetMonth.id,
    month: toMonthKey(monthStart),
    incomePlanned: budgetMonth.incomePlanned,
  });
}));

router.put('/budgets/item', asyncHandler(async (req, res) => {
  const { month, categoryId, plannedAmount } = req.body || {};
  const monthStart = toMonthStart(month);

  if (!categoryId) {
    return res.status(400).json({ error: 'categoryId is required' });
  }

  await ensureCategoryOwnership(req.user.id, categoryId);

  const budgetMonth = await prisma.budgetMonth.upsert({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
    update: {},
    create: {
      userId: req.user.id,
      month: monthStart,
      incomePlanned: 0,
    },
  });

  const parsedAmount = Number.parseFloat(plannedAmount || 0);

  const updatedItem = await prisma.budgetItem.upsert({
    where: {
      budgetMonthId_categoryId: {
        budgetMonthId: budgetMonth.id,
        categoryId,
      },
    },
    update: { plannedAmount: Number.isNaN(parsedAmount) ? 0 : parsedAmount },
    create: {
      budgetMonthId: budgetMonth.id,
      categoryId,
      plannedAmount: Number.isNaN(parsedAmount) ? 0 : parsedAmount,
    },
    include: { category: true },
  });

  return res.json(updatedItem);
}));

router.delete('/budgets/item', asyncHandler(async (req, res) => {
  const { month, categoryId } = req.body || {};
  if (!month || !categoryId) {
    return res.status(400).json({ error: 'Month and categoryId are required' });
  }

  await ensureCategoryOwnership(req.user.id, categoryId);

  const monthStart = toMonthStart(month);
  const budgetMonth = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
  });

  if (!budgetMonth) {
    return res.json({ success: true });
  }

  try {
    await prisma.budgetItem.delete({
      where: {
        budgetMonthId_categoryId: {
          budgetMonthId: budgetMonth.id,
          categoryId,
        },
      },
    });
  } catch (e) {
    if (e.code !== 'P2025') {
      throw e;
    }
  }

  return res.json({ success: true });
}));

export default router;
