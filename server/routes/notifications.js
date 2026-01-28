import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

router.get('/notifications/upcoming', asyncHandler(async (req, res) => {
  const days = Number.parseInt(req.query.days, 10) || 7;
  const now = new Date();
  const end = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  const items = await prisma.scheduleItem.findMany({
    where: {
      userId: req.user.id,
      status: 'pending',
      dueDate: { gte: now, lte: end },
    },
    include: { category: true, debt: true },
    orderBy: { dueDate: 'asc' },
  });

  return res.json({ days, items });
}));

export default router;
