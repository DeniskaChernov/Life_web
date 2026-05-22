import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";

export default async function FinancialPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const [snapshots, entries] = await Promise.all([
    prisma.netWorthSnapshot.findMany({
      where: { userId },
      orderBy: { date: "asc" },
      take: 24,
    }),
    prisma.cashflowEntry.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: 20,
    }),
  ]);

  return (
    <AppShell>
      <FinancialDashboard snapshots={snapshots} entries={entries} />
    </AppShell>
  );
}
