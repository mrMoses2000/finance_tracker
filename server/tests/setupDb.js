import prisma from '../db/prisma.js';

export const resetDb = async () => {
  await prisma.scheduleItem.deleteMany();
  await prisma.budgetItem.deleteMany();
  await prisma.budgetMonth.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
};

export const disconnectDb = async () => {
  await prisma.$disconnect();
};
