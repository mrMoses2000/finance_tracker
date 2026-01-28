-- AlterTable
ALTER TABLE "BudgetItem" ALTER COLUMN "plannedAmount" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "BudgetMonth" ALTER COLUMN "incomePlanned" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "limit" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "Debt" ALTER COLUMN "principal" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "balance" SET DATA TYPE DECIMAL(18,2),
ALTER COLUMN "interestRate" SET DATA TYPE DECIMAL(7,4);

-- AlterTable
ALTER TABLE "Expense" ALTER COLUMN "amountUSD" SET DATA TYPE DECIMAL(18,2);

-- AlterTable
ALTER TABLE "ScheduleItem" ALTER COLUMN "amountUSD" SET DATA TYPE DECIMAL(18,2);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_createdAt_idx" ON "AuditLog"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
