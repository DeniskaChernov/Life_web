/**
 * One-off repair for Railway P3009 after failed 20260510220000_epic_c2_financial_system.
 *
 * 1. Copy DATABASE_PUBLIC_URL from Railway Postgres → Variables
 * 2. Run:
 *      $env:DATABASE_URL="postgresql://..."; npx tsx scripts/repair-failed-migration.ts
 * 3. Push latest main and redeploy life-web
 */
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";

const FAILED_MIGRATION = "20260510220000_epic_c2_financial_system";

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set. Use Railway Postgres DATABASE_PUBLIC_URL.");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const failed = await prisma.$queryRaw<
      { migration_name: string; finished_at: Date | null; rolled_back_at: Date | null }[]
    >`
      SELECT migration_name, finished_at, rolled_back_at
      FROM "_prisma_migrations"
      WHERE migration_name = ${FAILED_MIGRATION}
    `;

    if (failed.length === 0) {
      console.log(`Запись ${FAILED_MIGRATION} не найдена — сброс не нужен.`);
    } else if (failed[0].finished_at && !failed[0].rolled_back_at) {
      console.log(`${FAILED_MIGRATION} уже помечена как applied.`);
    } else {
      console.log(`Сбрасываем failed-миграцию: ${FAILED_MIGRATION}`);
      execSync(`npx prisma migrate resolve --rolled-back "${FAILED_MIGRATION}"`, {
        stdio: "inherit",
        env: process.env,
      });
    }

    console.log("\nГотово. Задеплойте life-web — применится 20260522110000_epic_c2_property.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
