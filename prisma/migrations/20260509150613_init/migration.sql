-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "name" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Graph" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isRoot" BOOLEAN NOT NULL DEFAULT true,
    "settings" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Graph_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "graphId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT NOT NULL DEFAULT '[]',
    "targetDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'FUTURE',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "positionX" REAL NOT NULL DEFAULT 0,
    "positionY" REAL NOT NULL DEFAULT 0,
    "color" TEXT,
    "financialData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Node_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "Graph" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Node_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "graphId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'RELATED',
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Edge_graphId_fkey" FOREIGN KEY ("graphId") REFERENCES "Graph" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Edge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Edge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Node" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Edge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Node" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Graph_userId_idx" ON "Graph"("userId");

-- CreateIndex
CREATE INDEX "Node_graphId_idx" ON "Node"("graphId");

-- CreateIndex
CREATE INDEX "Node_userId_idx" ON "Node"("userId");

-- CreateIndex
CREATE INDEX "Edge_graphId_idx" ON "Edge"("graphId");

-- CreateIndex
CREATE UNIQUE INDEX "Edge_sourceId_targetId_type_key" ON "Edge"("sourceId", "targetId", "type");
