import { Router } from 'express';
import prisma from '../db/prisma.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { normalizeCurrency } from '../utils/currency.js';
import { convertAmount, getLatestRates } from '../services/exchangeRates.js';
import { toDecimal, toNumber } from '../utils/money.js';

const router = Router();

router.get('/me', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  return res.json({ name: user.name, email: user.email, currency: user.currency });
}));

router.put('/me', asyncHandler(async (req, res) => {
  const { currency, name } = req.body || {};
  const nextCurrency = currency ? normalizeCurrency(currency) : undefined;
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.sendStatus(404);
  }

  const currentCurrency = normalizeCurrency(user.currency);
  const shouldConvert = nextCurrency && nextCurrency !== currentCurrency;

  if (shouldConvert) {
    const ratesData = await getLatestRates();
    const base = ratesData.base;
    const rates = ratesData.rates || {};
    if (currentCurrency !== base && !rates[currentCurrency]) {
      return res.status(400).json({ error: `No FX rate for ${currentCurrency}` });
    }
    if (nextCurrency !== base && !rates[nextCurrency]) {
      return res.status(400).json({ error: `No FX rate for ${nextCurrency}` });
    }

    const convertValue = (value) => {
      const parsed = toNumber(value, 0);
      const result = convertAmount(parsed, currentCurrency, nextCurrency, ratesData);
      return toDecimal(result.amount);
    };

    await prisma.$transaction(async (tx) => {
      const categories = await tx.category.findMany({ where: { userId: user.id } });
      const expenses = await tx.expense.findMany({ where: { userId: user.id } });
      const scheduleItems = await tx.scheduleItem.findMany({ where: { userId: user.id } });
      const budgetMonths = await tx.budgetMonth.findMany({ where: { userId: user.id } });
      const budgetItems = await tx.budgetItem.findMany({
        where: { budgetMonth: { userId: user.id } },
      });
      const debts = await tx.debt.findMany({ where: { userId: user.id } });

      for (const cat of categories) {
        await tx.category.update({
          where: { id: cat.id },
          data: { limit: convertValue(cat.limit) },
        });
      }

      for (const exp of expenses) {
        await tx.expense.update({
          where: { id: exp.id },
          data: {
            amountUSD: convertValue(exp.amountUSD),
            currency: nextCurrency,
          },
        });
      }

      for (const item of scheduleItems) {
        await tx.scheduleItem.update({
          where: { id: item.id },
          data: { amountUSD: convertValue(item.amountUSD) },
        });
      }

      for (const bm of budgetMonths) {
        await tx.budgetMonth.update({
          where: { id: bm.id },
          data: { incomePlanned: convertValue(bm.incomePlanned) },
        });
      }

      for (const bi of budgetItems) {
        await tx.budgetItem.update({
          where: { id: bi.id },
          data: { plannedAmount: convertValue(bi.plannedAmount) },
        });
      }

      for (const debt of debts) {
        await tx.debt.update({
          where: { id: debt.id },
          data: {
            principal: convertValue(debt.principal),
            balance: convertValue(debt.balance),
          },
        });
      }

      await tx.user.update({
        where: { id: user.id },
        data: { currency: nextCurrency, name: name ?? undefined },
      });
    });

    const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
    return res.json({ name: updatedUser.name, email: updatedUser.email, currency: updatedUser.currency });
  }

  const updated = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      currency: nextCurrency,
      name: name ?? undefined,
    },
  });
  return res.json({ name: updated.name, email: updated.email, currency: updated.currency });
}));

export default router;
