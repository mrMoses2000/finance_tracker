-- Increase precision of stored USD values to reduce rounding errors
ALTER TABLE "Category" ALTER COLUMN "limit" TYPE DECIMAL(18,4);
ALTER TABLE "Expense" ALTER COLUMN "amountUSD" TYPE DECIMAL(18,4);
ALTER TABLE "BudgetMonth" ALTER COLUMN "incomePlanned" TYPE DECIMAL(18,4);
ALTER TABLE "BudgetItem" ALTER COLUMN "plannedAmount" TYPE DECIMAL(18,4);
ALTER TABLE "Debt" ALTER COLUMN "principal" TYPE DECIMAL(18,4);
ALTER TABLE "Debt" ALTER COLUMN "balance" TYPE DECIMAL(18,4);
ALTER TABLE "ScheduleItem" ALTER COLUMN "amountUSD" TYPE DECIMAL(18,4);
