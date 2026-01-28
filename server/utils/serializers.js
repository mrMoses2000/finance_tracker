import { toNumber } from './money.js';

export const formatCategory = (category) => {
  if (!category) return category;
  return {
    ...category,
    limit: toNumber(category.limit),
  };
};

export const formatExpense = (expense) => {
  if (!expense) return expense;
  return {
    ...expense,
    amountUSD: toNumber(expense.amountUSD),
    category: formatCategory(expense.category),
  };
};

export const formatBudgetItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    plannedAmount: toNumber(item.plannedAmount),
    category: formatCategory(item.category),
  };
};

export const formatBudgetMonth = (budgetMonth) => {
  if (!budgetMonth) return budgetMonth;
  return {
    ...budgetMonth,
    incomePlanned: toNumber(budgetMonth.incomePlanned),
    items: (budgetMonth.items || []).map(formatBudgetItem),
  };
};

export const formatDebt = (debt) => {
  if (!debt) return debt;
  return {
    ...debt,
    principal: toNumber(debt.principal),
    balance: toNumber(debt.balance),
    interestRate: toNumber(debt.interestRate),
  };
};

export const formatScheduleItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    amountUSD: toNumber(item.amountUSD),
    category: formatCategory(item.category),
    debt: formatDebt(item.debt),
  };
};
