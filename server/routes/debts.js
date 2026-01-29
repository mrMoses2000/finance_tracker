import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ensureCategoryOwnership } from '../utils/ownership.js';
import { toDecimal } from '../utils/money.js';
import { formatDebt } from '../utils/serializers.js';
import { logAudit } from '../services/auditLog.js';
import { resolveAmountBase } from '../services/currencyService.js';

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
    currency,
    interestRate,
    startDate,
    termMonths,
    nextPaymentDate,
    monthlyPayment,
    categoryId,
  } = req.body || {};

  const principalConverted = await resolveAmountBase({
    userId: req.user.id,
    amount: principal,
    currency,
  });
  const balanceConverted = balance !== undefined && balance !== ''
    ? await resolveAmountBase({ userId: req.user.id, amount: balance, currency })
    : principalConverted;

  if (!Number.isFinite(principalConverted.amountBase) || principalConverted.amountBase <= 0) {
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
      principal: toDecimal(principalConverted.amountBase),
      balance: Number.isFinite(balanceConverted.amountBase)
        ? toDecimal(balanceConverted.amountBase)
        : toDecimal(principalConverted.amountBase),
      interestRate: toDecimal(Number.parseFloat(interestRate || 0)),
      startDate: startDate ? new Date(startDate) : new Date(),
      termMonths: termMonths ? Number.parseInt(termMonths, 10) : null,
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
      status: 'active',
    },
  });

  const monthlyConverted = monthlyPayment !== undefined && monthlyPayment !== ''
    ? await resolveAmountBase({ userId: req.user.id, amount: monthlyPayment, currency })
    : null;
  if (monthlyConverted && Number.isFinite(monthlyConverted.amountBase) && monthlyConverted.amountBase > 0 && nextPaymentDate) {
    await prisma.scheduleItem.create({
      data: {
        userId: req.user.id,
        title: `${name} \u043f\u043b\u0430\u0442\u0435\u0436`,
        amountUSD: toDecimal(monthlyConverted.amountBase),
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
    currency,
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

  const principalConverted = principal !== undefined && principal !== ''
    ? await resolveAmountBase({ userId: req.user.id, amount: principal, currency })
    : { amountBase: existing.principal };
  const balanceConverted = balance !== undefined && balance !== ''
    ? await resolveAmountBase({ userId: req.user.id, amount: balance, currency })
    : { amountBase: existing.balance };
  const parsedRate = interestRate !== undefined && interestRate !== '' ? Number.parseFloat(interestRate) : existing.interestRate;

  const updated = await prisma.debt.update({
    where: { id },
    data: {
      name: name ?? existing.name,
      type: type ?? existing.type,
      principal: toDecimal(principalConverted.amountBase),
      balance: toDecimal(balanceConverted.amountBase),
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
