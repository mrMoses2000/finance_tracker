import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';
import { toDecimal } from '../utils/money.js';
import { formatDebt } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';

const router = Router();

router.get('/debts', asyncHandler(async (req, res) => {
  const debts = await prisma.debt.findMany({
    where: { userId: req.user.id },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(debts.map(formatDebt));
}));

router.post('/debts', asyncHandler(async (req, res) => {
  const {
    name,
    type,
    principal,
    balance,
    interestRate,
    startDate,
    termMonths,
    nextPaymentDate,
    monthlyPaymentUSD,
    categoryId,
  } = req.body || {};

  const parsedPrincipal = Number.parseFloat(principal || 0);
  const parsedBalance = balance !== undefined && balance !== '' ? Number.parseFloat(balance) : parsedPrincipal;

  if (!Number.isFinite(parsedPrincipal) || parsedPrincipal <= 0) {
    return res.status(400).json({ error: 'principal is required' });
  }

  if (categoryId) {
    await ensureCategoryOwnership(req.user.id, categoryId);
  }

  const debt = await prisma.debt.create({
    data: {
      userId: req.user.id,
      name,
      type: type || 'debt',
      principal: toDecimal(parsedPrincipal),
      balance: Number.isFinite(parsedBalance) ? toDecimal(parsedBalance) : toDecimal(parsedPrincipal),
      interestRate: toDecimal(Number.parseFloat(interestRate || 0)),
      startDate: startDate ? new Date(startDate) : new Date(),
      termMonths: termMonths ? Number.parseInt(termMonths, 10) : null,
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
      status: 'active',
    },
  });

  const parsedMonthly = Number.parseFloat(monthlyPaymentUSD);
  if (Number.isFinite(parsedMonthly) && parsedMonthly > 0 && nextPaymentDate) {
    await prisma.scheduleItem.create({
      data: {
        userId: req.user.id,
        title: `${name} \u043f\u043b\u0430\u0442\u0435\u0436`,
        amountUSD: toDecimal(parsedMonthly),
        type: type === 'loan' ? 'income' : 'expense',
        dueDate: new Date(nextPaymentDate),
        recurrence: 'monthly',
        status: 'pending',
        categoryId: categoryId || null,
        debtId: debt.id,
      },
    });
  }

  await logAudit({
    req,
    userId: req.user.id,
    action: 'create',
    entity: 'debt',
    entityId: debt.id,
    metadata: { type: type || 'debt' },
  });

  return res.json(formatDebt(debt));
}));

router.put('/debts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    name,
    type,
    principal,
    balance,
    interestRate,
    startDate,
    termMonths,
    nextPaymentDate,
    status,
  } = req.body || {};

  const existing = await prisma.debt.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.sendStatus(404);

  const parsedPrincipal = principal !== undefined && principal !== '' ? Number.parseFloat(principal) : existing.principal;
  const parsedBalance = balance !== undefined && balance !== '' ? Number.parseFloat(balance) : existing.balance;
  const parsedRate = interestRate !== undefined && interestRate !== '' ? Number.parseFloat(interestRate) : existing.interestRate;

  const updated = await prisma.debt.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      type: type ?? existing.type,
      principal: toDecimal(parsedPrincipal),
      balance: toDecimal(parsedBalance),
      interestRate: toDecimal(parsedRate),
      startDate: startDate ? new Date(startDate) : existing.startDate,
      termMonths: termMonths ? Number.parseInt(termMonths, 10) : existing.termMonths,
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : existing.nextPaymentDate,
      status: status ?? existing.status,
    },
  });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'update',
    entity: 'debt',
    entityId: id,
    metadata: { status: status ?? existing.status },
  });

  return res.json(formatDebt(updated));
}));

router.delete('/debts/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existing = await prisma.debt.findFirst({
    where: { id, userId: req.user.id },
  });
  if (!existing) return res.sendStatus(404);

  await prisma.debt.delete({ where: { id } });

  await logAudit({
    req,
    userId: req.user.id,
    action: 'delete',
    entity: 'debt',
    entityId: id,
  });

  return res.json({ success: true });
}));

export default router;
