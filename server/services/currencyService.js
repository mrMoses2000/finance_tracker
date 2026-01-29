import prisma from '../db/prisma.js';
import { normalizeCurrency } from '../utils/currency.js';
import { convertAmountToBase } from './exchangeRates.js';
import { toNumber } from '../utils/money.js';

export const getUserCurrency = async (userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return normalizeCurrency(user?.currency || 'USD');
};

export const resolveAmountBase = async ({
  userId,
  amount,
  amountLocal,
  amountUSD,
  currency,
}) => {
  const baseCurrency = await getUserCurrency(userId);
  const inputAmount = amount ?? amountLocal ?? amountUSD;
  const parsed = toNumber(inputAmount, NaN);
  if (!Number.isFinite(parsed)) {
    return { amountBase: NaN, baseCurrency };
  }

  const inputCurrency = normalizeCurrency(currency || baseCurrency);

  if (inputCurrency === baseCurrency) {
    return { amountBase: parsed, baseCurrency, fxRate: 1 };
  }

  const converted = await convertAmountToBase(parsed, inputCurrency, baseCurrency);
  return { amountBase: Number(converted.amount), baseCurrency, fxRate: converted.rate };
};
