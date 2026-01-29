import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toMonthStart, toMonthKey } from '../utils/date.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';
import { toDecimal } from '../utils/money.js';
import { formatBudgetItem, formatBudgetMonth } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';
import { resolveAmountBase } from '../services/currencyService.js';

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

  const formatted = formatBudgetMonth(budgetMonth);
  return res.json({
    id: formatted.id,
    month: toMonthKey(monthStart),
    incomePlanned: formatted.incomePlanned,
    items: formatted.items,
  });
}));

router.put('/budgets/income', asyncHandler(async (req, res) => {
  const { month, incomePlanned, currency } = req.body || {};
  const monthStart = toMonthStart(month);

  const { amountBase } = await resolveAmountBase({
    userId: req.user.id,
    amount: incomePlanned,
    currency,
  });
  const incomeValue = Number.isNaN(Number(amountBase)) ? toDecimal(0) : toDecimal(amountBase);

  const budgetMonth = await prisma.budgetMonth.upsert({
    where: { userId_month: { userId: req.user.id, month: monthStart } },
    update: { incomePlanned: incomeValue },
    create: {
      userId: req.user.id,
      month: monthStart,
      incomePlanned: incomeValue,
    },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'update',
    entity: 'budgetMonth',
    entityId: budgetMonth.id,
    metadata: { month: toMonthKey(monthStart) },
  });

  return res.json({
    id: budgetMonth.id,
    month: toMonthKey(monthStart),
    incomePlanned: formatBudgetMonth(budgetMonth).incomePlanned,
  });
}));

router.put('/budgets/item', asyncHandler(async (req, res) => {
  const { month, categoryId, plannedAmount, currency } = req.body || {};
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

  const { amountBase } = await resolveAmountBase({
    userId: req.user.id,
    amount: plannedAmount,
    currency,
  });
  const amountValue = Number.isNaN(Number(amountBase)) ? toDecimal(0) : toDecimal(amountBase);

  const updatedItem = await prisma.budgetItem.upsert({
    where: {
      budgetMonthId_categoryId: {
        budgetMonthId: budgetMonth.id,
        categoryId,
      },
    },
    update: { plannedAmount: amountValue },
    create: {
      budgetMonthId: budgetMonth.id,
      categoryId,
      plannedAmount: amountValue,
    },
    include: { category: true },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'update',
    entity: 'budgetItem',
    entityId: updatedItem.id,
    metadata: { month: toMonthKey(monthStart), categoryId },
  });

  return res.json(formatBudgetItem(updatedItem));
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

  await logAudit({
    req,
    userId: req.user.id,
    action: 'delete',
    entity: 'budgetItem',
    metadata: { month: toMonthKey(monthStart), categoryId },
  });

  return res.json({ success: true });
}));

export default router;
