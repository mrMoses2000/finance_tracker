import prisma from '../db/prisma.js';

export const ensureCategoryOwnership = async (userId, categoryId) => {
  if (!categoryId) return null;
  const category = await prisma.category.findFirst({
    where: { id: categoryId, userId },
  });
  if (!category) {
    const err = new Error('Category not found');
    err.statusCode = 404;
    throw err;
  }
  return category;
};

export const ensureDebtOwnership = async (userId, debtId) => {
  if (!debtId) return null;
  const debt = await prisma.debt.findFirst({
    where: { id: debtId, userId },
  });
  if (!debt) {
    const err = new Error('Debt not found');
    err.statusCode = 404;
    throw err;
  }
  return debt;
};
