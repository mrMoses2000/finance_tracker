import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureCategoryOwnership, ensureDebtOwnership } from '../utils/ownership.js';
import { getMonthRange, toMonthStart } from '../utils/date.js';

const router = Router();

router.get('/schedules', asyncHandler(async (req, res) => {
  const { month, status, from, to } = req.query;
  const where = { userId: req.user.id };

  if (status) where.status = status;

  if (month) {
    const monthStart = toMonthStart(month);
    const { start, end } = getMonthRange(monthStart);
    where.dueDate = { gte: start, lt: end };
  } else if (from || to) {
    where.dueDate = {};
    if (from) where.dueDate.gte = new Date(from);
    if (to) where.dueDate.lt = new Date(to);
  }

  const items = await prisma.scheduleItem.findMany({
    where,
    include: { category: true, debt: true },
    orderBy: { dueDate: 'asc' },
  });
  return res.json(items);
}));

router.post('/schedules', asyncHandler(async (req, res) => {
  const { title, amountUSD, type, dueDate, recurrence, categoryId, debtId, status } = req.body || {};

  if (categoryId) {
    await ensureCategoryOwnership(req.user.id, categoryId);
  }
  if (debtId) {
    await ensureDebtOwnership(req.user.id, debtId);
  }

  const parsedAmount = Number.parseFloat(amountUSD || 0);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    return res.status(400).json({ error: 'amountUSD is required' });
  }

  const item = await prisma.scheduleItem.create({
    data: {
      userId: req.user.id,
      title,
      amountUSD: parsedAmount,
      type: type || 'expense',
      dueDate: new Date(dueDate),
      recurrence: recurrence || 'once',
      status: status || 'pending',
      categoryId: categoryId || null,
      debtId: debtId || null,
    },
  });
  return res.json(item);
}));

router.put('/schedules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, amountUSD, type, dueDate, recurrence, categoryId, debtId, status } = req.body || {};

  const existing = await prisma.scheduleItem.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.sendStatus(404);

  if (categoryId) {
    await ensureCategoryOwnership(req.user.id, categoryId);
  }
  if (debtId) {
    await ensureDebtOwnership(req.user.id, debtId);
  }

  const parsedAmount = amountUSD !== undefined ? Number.parseFloat(amountUSD) : existing.amountUSD;

  const updated = await prisma.scheduleItem.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      amountUSD: Number.isFinite(parsedAmount) ? parsedAmount : existing.amountUSD,
      type: type || existing.type,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      recurrence: recurrence || existing.recurrence,
      status: status || existing.status,
      categoryId: categoryId === '' ? null : categoryId ?? existing.categoryId,
      debtId: debtId === '' ? null : debtId ?? existing.debtId,
    },
  });
  return res.json(updated);
}));

router.delete('/schedules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.scheduleItem.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.sendStatus(404);

  await prisma.scheduleItem.delete({ where: { id } });
  return res.json({ success: true });
}));

export default router;
