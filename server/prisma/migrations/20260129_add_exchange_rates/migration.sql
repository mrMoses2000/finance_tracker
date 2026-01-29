CREATE TABLE "ExchangeRate" (
    "id" TEXT NOT NULL,
    "baseCurrency" TEXT NOT NULL,
    "quoteCurrency" TEXT NOT NULL,
    "rate" DECIMAL(18,8) NOT NULL,
    "asOfDate" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExchangeRate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ExchangeRate_baseCurrency_quoteCurrency_asOfDate_source_key" ON "ExchangeRate"("baseCurrency", "quoteCurrency", "asOfDate", "source");
CREATE INDEX "ExchangeRate_baseCurrency_asOfDate_idx" ON "ExchangeRate"("baseCurrency", "asOfDate");
