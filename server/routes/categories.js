import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { pickCategoryColor } from '../utils/category.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';

const router = Router();

router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user.id },
  });
  return res.json(categories);
}));

router.post('/categories', asyncHandler(async (req, res) => {
  const label = (req.body.label || '').trim();
  const type = req.body.type === 'income' ? 'income' : 'expense';
  const limit = Number.parseFloat(req.body.limit || 0);

  if (!label) {
    return res.status(400).json({ error: 'Label is required' });
  }

  const existing = await prisma.category.findMany({
    where: { userId: req.user.id },
  });
  const color = req.body.color || pickCategoryColor(existing.map((cat) => cat.color));

  try {
    const category = await prisma.category.create({
      data: {
        userId: req.user.id,
        label,
        color,
        limit: Number.isNaN(limit) ? 0 : limit,
        type,
      },
    });

    return res.json(category);
  } catch (e) {
    if (e.code === 'P2002') {
      return res.status(409).json({ error: 'Category already exists' });
    }
    throw e;
  }
}));

router.put('/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { label, color, limit, type } = req.body;

  await ensureCategoryOwnership(req.user.id, id);

  try {
    const updated = await prisma.category.update({
      where: { id },
      data: {
        label,
        color,
        limit: Number.isNaN(Number.parseFloat(limit)) ? 0 : Number.parseFloat(limit || 0),
        type,
      },
    });
    return res.json(updated);
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
  return res.json({ success: true });
}));

export default router;
