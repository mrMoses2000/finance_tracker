import { Prisma } from '@prisma/client';

export const toNumber = (value, fallback = 0) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number') return Number.isFinite(value) ? value : fallback;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (value instanceof Prisma.Decimal) {
    const parsed = Number.parseFloat(value.toString());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  if (typeof value?.valueOf === 'function') {
    const parsed = Number.parseFloat(value.valueOf());
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
};

export const toDecimal = (value, fallback = 0) => {
  if (value instanceof Prisma.Decimal) return value;
  if (value === null || value === undefined || value === '') {
    return new Prisma.Decimal(String(fallback));
  }
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) {
    return new Prisma.Decimal(String(fallback));
  }
  return new Prisma.Decimal(String(parsed));
};

export const parseDecimalInput = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed)) return null;
  return new Prisma.Decimal(String(parsed));
};
