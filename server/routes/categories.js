import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pickCategoryColor } from '../utils/category.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';
import { toDecimal } from '../utils/money.js';
import { formatCategory } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';
import { resolveAmountBase } from '../services/currencyService.js';

const router = Router();

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
  });
  return res.json(categories.map(formatCategory));
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const label = (req.body.label || '').trim();
  const type = req.body.type === 'income' ? 'income' : 'expense';
  const limitInput = req.body.limit;
  const currency = req.body.currency;

  if (!label) {
    return res.status(400).json({ error: 'Label is required' });
  }

  const existing = await prisma.category.findMany({
    where: { userId: req.user.id },
  });
  const color = req.body.color || pickCategoryColor(existing.map((cat) => cat.color));

  try {
    const { amountBase } = await resolveAmountBase({
      userId: req.user.id,
      amount: limitInput,
      currency,
    });
    const limitValue = Number.isNaN(Number(amountBase)) ? toDecimal(0) : toDecimal(amountBase);

    const category = await prisma.category.create({
      data: {
        userId: req.user.id,
        label,
        color,
        limit: limitValue,
        type,
      },
    });

    await logAudit({
      req,
      userId: req.user.id,
      action: 'create',
      entity: 'category',
      entityId: category.id,
      metadata: { label, type },
    });

    return res.json(formatCategory(category));
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    throw e;
  }
}));

router.put('/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { label, color, limit, type, currency } = req.body;

  await ensureCategoryOwnership(req.user.id, id);

  const limitProvided = limit !== undefined;
  let limitValue;
  if (limitProvided) {
    const { amountBase } = await resolveAmountBase({
      userId: req.user.id,
      amount: limit,
      currency,
    });
    limitValue = Number.isNaN(Number(amountBase)) ? toDecimal(0) : toDecimal(amountBase);
  }

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        label,
        color,
        limit: limitValue,
        type,
      },
    });

    await logAudit({
      req,
      userId: req.user.id,
      action: 'update',
      entity: 'category',
      entityId: id,
      metadata: { label, type },
    });

    return res.json(formatCategory(updated));
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    throw e;
  }
}));

router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await ensureCategoryOwnership(req.user.id, id);

  const [expensesCount, scheduleCount, budgetCount] = await Promise.all([
    prisma.expense.count({ where: { userId: req.user.id, categoryId: id } }),
    prisma.scheduleItem.count({ where: { userId: req.user.id, categoryId: id } }),
    prisma.budgetItem.count({
      where: {
        categoryId: id,
        budgetMonth: { userId: req.user.id },
      },
    }),
  ]);

  if (expensesCount > 0 || scheduleCount > 0 || budgetCount > 0) {
    return res.status(409).json({ error: 'Category is in use' });
  }

  await prisma.category.delete({ where: { id } });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'delete',
    entity: 'category',
    entityId: id,
  });

  return res.json({ success: true });
}));

export default router;
