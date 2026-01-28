import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getMonthRange, toMonthKey, toMonthStart } from '../utils/date.js';

const router = Router();

router.get('/overview', asyncHandler(async (req, res) => {
  const monthStart = toMonthStart(req.query.month);
  const { start, end } = getMonthRange(monthStart);

  const [transactions, categories, budgetMonth, scheduleItems] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: req.user.id, date: { gte: start, lt: end } },
      include: { category: true },
    }),
    prisma.category.findMany({
      where: { userId: req.user.id },
    }),
    prisma.budgetMonth.findUnique({
      where: { userId_month: { userId: req.user.id, month: monthStart } },
      include: { items: { include: { category: true } } },
    }),
    prisma.scheduleItem.findMany({
      where: { userId: req.user.id, dueDate: { gte: start, lt: end } },
      include: { category: true, debt: true },
      orderBy: { dueDate: 'asc' },
    }),
  ]);

  return res.json({
    month: toMonthKey(monthStart),
    transactions,
    categories,
    budget: budgetMonth
      ? {
          id: budgetMonth.id,
          month: toMonthKey(monthStart),
          incomePlanned: budgetMonth.incomePlanned,
          items: budgetMonth.items,
        }
      : {
          id: null,
          month: toMonthKey(monthStart),
          incomePlanned: 0,
          items: [],
        },
    schedule: scheduleItems,
  });
}));

export default router;
