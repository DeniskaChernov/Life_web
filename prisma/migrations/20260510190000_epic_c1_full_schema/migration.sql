-- Epic C1: full schema per LIFE_MASTER_BLUEPRINT.md section 11

-- User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "timezone" TEXT NOT NULL DEFAULT 'UTC';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'RUB';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "settings" JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Graph
ALTER TABLE "Graph" ADD COLUMN IF NOT EXISTS "parentNodeId" TEXT;
CREATE INDEX IF NOT EXISTS "Graph_parentNodeId_idx" ON "Graph"("parentNodeId");

-- Node
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "subCategory" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "parentId" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "subgraphId" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "depth" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "progress" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "timeHorizon" TEXT NOT NULL DEFAULT 'MONTH';
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "energy" TEXT NOT NULL DEFAULT 'STEADY';
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3);
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "completedAt" TIMESTAMP(3);
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "icon" TEXT;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "size" TEXT NOT NULL DEFAULT 'MD';
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "isPinned" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "isCollapsed" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "aiScore" DOUBLE PRECISION;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "aiInsights" JSONB;
ALTER TABLE "Node" ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Node_parentId_fkey') THEN
    ALTER TABLE "Node" ADD CONSTRAINT "Node_parentId_fkey"
      FOREIGN KEY ("parentId") REFERENCES "Node"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Node_progress_range') THEN
    ALTER TABLE "Node" ADD CONSTRAINT "Node_progress_range" CHECK ("progress" >= 0 AND "progress" <= 100);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Node_parentId_idx" ON "Node"("parentId");
CREATE INDEX IF NOT EXISTS "Node_category_idx" ON "Node"("category");
CREATE INDEX IF NOT EXISTS "Node_status_idx" ON "Node"("status");
CREATE INDEX IF NOT EXISTS "Node_timeHorizon_idx" ON "Node"("timeHorizon");

-- Edge
ALTER TABLE "Edge" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Edge" ADD COLUMN IF NOT EXISTS "strength" DOUBLE PRECISION NOT NULL DEFAULT 0.5;
ALTER TABLE "Edge" ADD COLUMN IF NOT EXISTS "direction" TEXT NOT NULL DEFAULT 'FORWARD';
ALTER TABLE "Edge" ADD COLUMN IF NOT EXISTS "isAnimated" BOOLEAN NOT NULL DEFAULT false;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Edge_strength_range') THEN
    ALTER TABLE "Edge" ADD CONSTRAINT "Edge_strength_range" CHECK ("strength" >= 0 AND "strength" <= 1);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "Edge_type_idx" ON "Edge"("type");

-- NodeSnapshot
CREATE TABLE IF NOT EXISTS "NodeSnapshot" (
  "id"        TEXT PRIMARY KEY,
  "nodeId"    TEXT NOT NULL,
  "userId"    TEXT NOT NULL,
  "version"   INTEGER NOT NULL,
  "snapshot"  JSONB NOT NULL,
  "reason"    TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "NodeSnapshot_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "NodeSnapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "NodeSnapshot_nodeId_idx" ON "NodeSnapshot"("nodeId");
CREATE INDEX IF NOT EXISTS "NodeSnapshot_userId_idx" ON "NodeSnapshot"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "NodeSnapshot_nodeId_version_key" ON "NodeSnapshot"("nodeId", "version");

-- AiInteraction
CREATE TABLE IF NOT EXISTS "AiInteraction" (
  "id"            TEXT PRIMARY KEY,
  "userId"        TEXT NOT NULL,
  "kind"          TEXT NOT NULL,
  "contextNodeId" TEXT,
  "prompt"        TEXT,
  "response"      JSONB,
  "accepted"      BOOLEAN,
  "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "AiInteraction_userId_idx" ON "AiInteraction"("userId");
CREATE INDEX IF NOT EXISTS "AiInteraction_contextNodeId_idx" ON "AiInteraction"("contextNodeId");
