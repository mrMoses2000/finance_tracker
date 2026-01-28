import bcrypt from 'bcrypt';
import prisma from '../db/prisma.js';
import { toMonthStart, getMonthRange } from '../utils/date.js';
import { DEFAULT_CATEGORIES } from '../data/defaultCategories.js';
import { CATEGORY_CONFIG, BASE_TRANSACTIONS, FEBRUARY_EXTRA, SEED_DEBTS } from '../data/seedData.js';
import { SEED_ADMIN_EMAIL, SEED_ADMIN_NAME, SEED_ADMIN_PASSWORD } from '../config/env.js';

const FEBRUARY_PLAN = [...BASE_TRANSACTIONS, ...FEBRUARY_EXTRA];

const buildCategoryMap = async (userId) => {
  const categoryMap = {};

  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    const existing = await prisma.category.findFirst({
      where: { userId, label: config.label },
    });

    if (existing) {
      categoryMap[key] = existing.id;
      continue;
    }

    const created = await prisma.category.create({
      data: {
        userId,
        label: config.label,
        color: config.color,
        limit: config.limit,
        type: config.type,
      },
    });
    categoryMap[key] = created.id;
  }

  return categoryMap;
};

const sumByCategoryKey = (items) => {
  return items.reduce((acc, item) => {
    if (item.type !== 'expense') return acc;
    if (!acc[item.categoryKey]) acc[item.categoryKey] = 0;
    acc[item.categoryKey] += item.amountUSD;
    return acc;
  }, {});
};

const sumIncome = (items) => {
  return items.reduce((acc, item) => acc + (item.type === 'income' ? item.amountUSD : 0), 0);
};

const seedMonthlyTransactions = async (userId, categoryMap) => {
  const monthStart = toMonthStart();
  const { start, end } = getMonthRange(monthStart);
  const existingCount = await prisma.expense.count({
    where: { userId, date: { gte: start, lt: end } },
  });
  if (existingCount > 0) return;

  for (const item of BASE_TRANSACTIONS) {
    const expenseDate = new Date(Date.UTC(
      monthStart.getUTCFullYear(),
      monthStart.getUTCMonth(),
      item.day || 1,
    ));

    await prisma.expense.create({
      data: {
        userId,
        amountUSD: item.amountUSD,
        description: item.name,
        date: expenseDate,
        categoryId: categoryMap[item.categoryKey],
        type: item.type,
      },
    });
  }
};

const seedFebruaryBudget = async (userId, categoryMap) => {
  const febYear = new Date().getUTCFullYear();
  const febStart = new Date(Date.UTC(febYear, 1, 1));
  const existingBudget = await prisma.budgetMonth.findUnique({
    where: { userId_month: { userId, month: febStart } },
  });
  if (existingBudget) return;

  const totals = sumByCategoryKey(FEBRUARY_PLAN);
  const incomePlanned = sumIncome(FEBRUARY_PLAN);

  const budgetMonth = await prisma.budgetMonth.create({
    data: {
      userId,
      month: febStart,
      incomePlanned,
    },
  });

  const items = [];
  for (const [key, config] of Object.entries(CATEGORY_CONFIG)) {
    if (config.type !== 'expense') continue;
    const categoryId = categoryMap[key];
    if (!categoryId) continue;
    const plannedAmount = totals[key] ?? config.limit ?? 0;
    items.push({
      budgetMonthId: budgetMonth.id,
      categoryId,
      plannedAmount,
    });
  }

  if (items.length) {
    await prisma.budgetItem.createMany({ data: items });
  }
};

const seedDebts = async (userId) => {
  const debtMap = {};

  for (const debt of SEED_DEBTS) {
    const existing = await prisma.debt.findFirst({
      where: { userId, name: debt.name },
    });

    if (existing) {
      debtMap[debt.key] = existing.id;
      continue;
    }

    const monthStart = toMonthStart();
    const nextPaymentDate = debt.nextPaymentDay
      ? new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth(), debt.nextPaymentDay))
      : null;

    const created = await prisma.debt.create({
      data: {
        userId,
        name: debt.name,
        type: debt.type,
        principal: debt.principal,
        balance: debt.balance,
        interestRate: debt.interestRate,
        startDate: debt.startDate,
        termMonths: debt.termMonths,
        nextPaymentDate,
        status: 'active',
      },
    });
    debtMap[debt.key] = created.id;
  }

  return debtMap;
};

const seedScheduleItems = async (userId, categoryMap, debtMap) => {
  const existingCount = await prisma.scheduleItem.count({
    where: { userId },
  });
  if (existingCount > 0) return;

  const monthStart = toMonthStart();
  const monthYear = monthStart.getUTCFullYear();
  const monthIndex = monthStart.getUTCMonth();
  const scheduleItems = [];

  for (const item of BASE_TRANSACTIONS) {
    if (!item.recurring || !item.day) continue;
    const dueDate = new Date(Date.UTC(monthYear, monthIndex, item.day));
    scheduleItems.push({
      userId,
      title: item.name,
      amountUSD: item.amountUSD,
      type: item.type,
      dueDate,
      recurrence: 'monthly',
      status: 'pending',
      categoryId: categoryMap[item.categoryKey],
      debtId: item.debtKey ? debtMap[item.debtKey] : null,
    });
  }

  const loanItem = SEED_DEBTS.find((item) => item.key === 'client');
  if (loanItem) {
    const dueDate = new Date(Date.UTC(monthYear, monthIndex, loanItem.nextPaymentDay));
    scheduleItems.push({
      userId,
      title: `${loanItem.name} \u043f\u043b\u0430\u0442\u0435\u0436`,
      amountUSD: loanItem.monthlyPaymentUSD,
      type: loanItem.type === 'loan' ? 'income' : 'expense',
      dueDate,
      recurrence: 'monthly',
      status: 'pending',
      categoryId: categoryMap[loanItem.categoryKey] || null,
      debtId: debtMap[loanItem.key],
    });
  }

  if (scheduleItems.length) {
    await prisma.scheduleItem.createMany({
      data: scheduleItems,
    });
  }
};

const seedDefaultCategories = async (userId) => {
  for (const cat of DEFAULT_CATEGORIES) {
    await prisma.category.create({
      data: {
        userId,
        label: cat.label,
        labelKey: cat.labelKey,
        color: cat.color,
        limit: cat.limit,
        type: cat.type,
      },
    });
  }
};

export const seedAdminUser = async () => {
  if (!SEED_ADMIN_EMAIL || !SEED_ADMIN_PASSWORD) {
    throw new Error('SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD are required to seed admin user.');
  }

  const email = SEED_ADMIN_EMAIL;
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    const passwordHash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 10);
    user = await prisma.user.create({
      data: {
        email,
        name: SEED_ADMIN_NAME,
        passwordHash,
      },
    });
    await seedDefaultCategories(user.id);
  }

  const categoryMap = await buildCategoryMap(user.id);
  await seedMonthlyTransactions(user.id, categoryMap);
  await seedFebruaryBudget(user.id, categoryMap);
  const debtMap = await seedDebts(user.id);
  await seedScheduleItems(user.id, categoryMap, debtMap);
};
