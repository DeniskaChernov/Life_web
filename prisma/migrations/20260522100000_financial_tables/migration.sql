-- NetWorthSnapshot
CREATE TABLE "NetWorthSnapshot" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "assets" JSONB NOT NULL,
  "liabilities" JSONB NOT NULL,
  "totalAssets" DOUBLE PRECISION NOT NULL,
  "totalLiabilities" DOUBLE PRECISION NOT NULL,
  "netWorth" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NetWorthSnapshot_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "NetWorthSnapshot_userId_date_key" ON "NetWorthSnapshot"("userId", "date");
CREATE INDEX "NetWorthSnapshot_userId_idx" ON "NetWorthSnapshot"("userId");
ALTER TABLE "NetWorthSnapshot" ADD CONSTRAINT "NetWorthSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CashflowEntry
CREATE TABLE "CashflowEntry" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "linkedNodeId" TEXT,
  "date" TIMESTAMP(3) NOT NULL,
  "type" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'RUB',
  "category" TEXT NOT NULL,
  "subcategory" TEXT,
  "description" TEXT,
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  "recurringConfig" JSONB,
  "isActual" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "CashflowEntry_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CashflowEntry_userId_idx" ON "CashflowEntry"("userId");
CREATE INDEX "CashflowEntry_userId_date_idx" ON "CashflowEntry"("userId", "date" DESC);
ALTER TABLE "CashflowEntry" ADD CONSTRAINT "CashflowEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Scenario
CREATE TABLE "Scenario" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "type" TEXT NOT NULL DEFAULT 'CUSTOM',
  "parameters" JSONB NOT NULL,
  "results" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT false,
  "color" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Scenario_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Scenario_userId_idx" ON "Scenario"("userId");
ALTER TABLE "Scenario" ADD CONSTRAINT "Scenario_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
