import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../db/prisma.js';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories.js';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { toDecimal } from '../utils/money.js';
import { logAudit } from '../services/auditLog.js';

const router = Router();

router.post('/register', asyncHandler(async (req, res) => {
  const { email, password, name } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: 'User exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { email, passwordHash: hashedPassword, name },
  });

  await prisma.category.createMany({
    data: DEFAULT_CATEGORIES.map((cat) => ({
      userId: user.id,
      label: cat.label,
      labelKey: cat.labelKey,
      color: cat.color,
      limit: toDecimal(cat.limit),
      type: cat.type,
    })),
  });

  await logAudit({
    req,
    userId: user.id,
    action: 'register',
    entity: 'user',
    entityId: user.id,
  });

  return res.json({ message: 'User created' });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid password' });
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: 'JWT_SECRET is not configured' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  await logAudit({
    req,
    userId: user.id,
    action: 'login',
    entity: 'user',
    entityId: user.id,
  });

  return res.json({
    token,
    user: { name: user.name, email: user.email, currency: user.currency },
  });
}));

export default router;
