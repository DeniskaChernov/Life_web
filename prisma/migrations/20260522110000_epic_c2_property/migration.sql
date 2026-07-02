-- Epic C2: Property + CashflowEntry → Node FK (after financial_tables)

CREATE TABLE IF NOT EXISTS "Property" (
  "id"                    TEXT PRIMARY KEY,
  "nodeId"                TEXT NOT NULL,
  "userId"                TEXT NOT NULL,
  "type"                  TEXT NOT NULL,
  "address"               JSONB NOT NULL,
  "areaSqm"               DOUBLE PRECISION,
  "floor"                 INTEGER,
  "totalFloors"           INTEGER,
  "yearBuilt"             INTEGER,
  "purchasePrice"         DOUBLE PRECISION,
  "purchaseDate"          DATE,
  "currentEstimatedValue" DOUBLE PRECISION,
  "lastValuationDate"     DATE,
  "mortgageData"          JSONB,
  "rentalData"            JSONB,
  "monthlyExpenses"       JSONB,
  "improvements"          JSONB NOT NULL DEFAULT '[]'::jsonb,
  "districtAnalysis"      JSONB,
  "lifecycleStatus"       TEXT NOT NULL DEFAULT 'PLANNING',
  "createdAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"             TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Property_nodeId_key" UNIQUE ("nodeId"),
  CONSTRAINT "Property_nodeId_fkey"
    FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Property_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "Property_userId_idx" ON "Property"("userId");

-- Orphan linkedNodeId breaks FK; null them before adding constraint.
UPDATE "CashflowEntry"
SET "linkedNodeId" = NULL
WHERE "linkedNodeId" IS NOT NULL
  AND "linkedNodeId" NOT IN (SELECT id FROM "Node");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CashflowEntry_linkedNodeId_fkey'
  ) THEN
    ALTER TABLE "CashflowEntry"
      ADD CONSTRAINT "CashflowEntry_linkedNodeId_fkey"
      FOREIGN KEY ("linkedNodeId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CashflowEntry_category_idx" ON "CashflowEntry"("category");
