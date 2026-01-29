import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureCategoryOwnership, ensureDebtOwnership } from '../utils/ownership.js';
import { getMonthRange, toMonthStart } from '../utils/date.js';
import { toDecimal } from '../utils/money.js';
import { formatScheduleItem } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';
import { resolveAmountBase } from '../services/currencyService.js';

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
  return res.json(items.map(formatScheduleItem));
}));

router.post('/schedules', asyncHandler(async (req, res) => {
  const { title, amountUSD, amountLocal, amount, currency, type, dueDate, recurrence, categoryId, debtId, status } = req.body || {};

  if (categoryId) {
    await ensureCategoryOwnership(req.user.id, categoryId);
  }
  if (debtId) {
    await ensureDebtOwnership(req.user.id, debtId);
  }

  const { amountBase } = await resolveAmountBase({
    userId: req.user.id,
    amount,
    amountLocal,
    amountUSD,
    currency,
  });
  if (!Number.isFinite(amountBase) || amountBase <= 0) {
    return res.status(400).json({ error: 'amount is required' });
  }

  const item = await prisma.scheduleItem.create({
    data: {
      userId: req.user.id,
      title,
      amountUSD: toDecimal(amountBase),
      type: type || 'expense',
      dueDate: new Date(dueDate),
      recurrence: recurrence || 'once',
      status: status || 'pending',
      categoryId: categoryId || null,
      debtId: debtId || null,
    },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'create',
    entity: 'scheduleItem',
    entityId: item.id,
    metadata: { status: status || 'pending' },
  });

  return res.json(formatScheduleItem(item));
}));

router.put('/schedules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, amountUSD, amountLocal, amount, currency, type, dueDate, recurrence, categoryId, debtId, status } = req.body || {};

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

  const { amountBase } = await resolveAmountBase({
    userId: req.user.id,
    amount,
    amountLocal,
    amountUSD,
    currency,
  });

  const updated = await prisma.scheduleItem.update({
    where: { id },
    data: {
      title: title ?? existing.title,
      amountUSD: Number.isFinite(amountBase) ? toDecimal(amountBase) : existing.amountUSD,
      type: type || existing.type,
      dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      recurrence: recurrence || existing.recurrence,
      status: status || existing.status,
      categoryId: categoryId === '' ? null : categoryId ?? existing.categoryId,
      debtId: debtId === '' ? null : debtId ?? existing.debtId,
    },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'update',
    entity: 'scheduleItem',
    entityId: id,
    metadata: { status: status || existing.status },
  });

  return res.json(formatScheduleItem(updated));
}));

router.delete('/schedules/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.scheduleItem.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.sendStatus(404);

  await prisma.scheduleItem.delete({ where: { id } });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'delete',
    entity: 'scheduleItem',
    entityId: id,
  });

  return res.json({ success: true });
}));

export default router;
