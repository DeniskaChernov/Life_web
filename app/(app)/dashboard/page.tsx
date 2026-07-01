import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import Link from "next/link";

function formatDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "#34D399",
  FUTURE: "#A78BFA",
  COMPLETED: "#60A5FA",
  BLOCKED: "#F87171",
  PAUSED: "#FBBF24",
  ARCHIVED: "#64748B",
};

const CATEGORY_ICONS: Record<string, string> = {
  SELF: "★",
  GOAL: "◆",
  PROJECT: "▣",
  TASK: "✓",
  HABIT: "↻",
  ASSET: "◉",
  FINANCIAL: "₽",
  INCOME: "↗",
  EXPENSE: "↘",
  RISK: "!",
  OPPORTUNITY: "✧",
  RELATIONSHIP: "♥",
  SKILL: "⚡",
  EVENT: "◷",
  INSIGHT: "✦",
  NOTE: "≡",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const since = new Date();
  since.setDate(since.getDate() - 90);

  const rootGraph = await prisma.graph.findFirst({
    where: { userId, isRoot: true },
    select: { id: true, name: true },
  });

  const [allNodes, recentNodes, upcomingNodes, edgeCount, snapshots, cashflowEntries] =
    await Promise.all([
      prisma.node.findMany({
        where: { userId },
        select: {
          id: true,
          category: true,
          status: true,
          progress: true,
          title: true,
          updatedAt: true,
          targetDate: true,
        },
      }),
      prisma.node.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        take: 8,
        select: { id: true, title: true, category: true, status: true, updatedAt: true },
      }),
      prisma.node.findMany({
        where: {
          userId,
          targetDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          status: { not: "COMPLETED" },
        },
        orderBy: { targetDate: "asc" },
        take: 6,
        select: { id: true, title: true, category: true, status: true, targetDate: true },
      }),
      prisma.edge.count({ where: { userId } }),
      prisma.netWorthSnapshot.findMany({
        where: { userId },
        orderBy: { date: "asc" },
        take: 24,
      }),
      prisma.cashflowEntry.findMany({
        where: { userId, date: { gte: since } },
        orderBy: { date: "desc" },
        take: 50,
      }),
    ]);

  const totalNodes = allNodes.length;
  const activeNodes = allNodes.filter((n) => n.status === "ACTIVE").length;
  const completedNodes = allNodes.filter((n) => n.status === "COMPLETED").length;

  const categoryGroups: Record<string, number> = {};
  for (const n of allNodes) {
    categoryGroups[n.category] = (categoryGroups[n.category] ?? 0) + 1;
  }
  const topCategories = Object.entries(categoryGroups)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const avgProgress =
    totalNodes > 0
      ? Math.round(allNodes.reduce((sum, n) => sum + (n.progress ?? 0), 0) / totalNodes)
      : 0;

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-100">Dashboard</h1>
            <p className="text-sm text-slate-500 mt-0.5">{rootGraph?.name ?? "Мой LIFE Map"}</p>
          </div>
          <Link
            href={rootGraph ? `/life/${rootGraph.id}` : "/life"}
            className="rounded-lg bg-indigo-600/80 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 transition-colors"
          >
            Открыть граф →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Узлов", value: totalNodes, sub: `${edgeCount} связей` },
            { label: "Активных", value: activeNodes, color: "#34D399" },
            { label: "Завершено", value: completedNodes, color: "#60A5FA" },
            { label: "Прогресс", value: `${avgProgress}%`, sub: "средний" },
          ].map((m) => (
            <div key={m.label} className="glass-panel rounded-xl p-4">
              <div className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                {m.label}
              </div>
              <div
                className="text-2xl font-bold mt-1 font-mono"
                style={{ color: m.color ?? "#F8FAFC" }}
              >
                {m.value}
              </div>
              {m.sub ? <div className="text-[11px] text-slate-600 mt-0.5">{m.sub}</div> : null}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
              По категориям
            </h2>
            <div className="space-y-2">
              {topCategories.map(([cat, count]) => (
                <div key={cat} className="flex items-center gap-3">
                  <span className="text-base w-5 text-center">{CATEGORY_ICONS[cat] ?? "·"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-300 font-medium">{cat}</span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.08]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.round((count / Math.max(1, totalNodes)) * 100)}%`,
                          background: "#6366F1",
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
              {topCategories.length === 0 ? (
                <p className="text-sm text-slate-600">Нет узлов</p>
              ) : null}
            </div>
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
              По статусу
            </h2>
            <div className="space-y-2">
              {Object.entries(STATUS_COLORS).map(([status, color]) => {
                const count = allNodes.filter((n) => n.status === status).length;
                if (count === 0) return null;
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: color }}
                      />
                      <span className="text-xs text-slate-300">{status}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
              Дедлайны (30 дней)
            </h2>
            {upcomingNodes.length === 0 ? (
              <p className="text-sm text-slate-600">Нет приближающихся дедлайнов</p>
            ) : (
              <div className="space-y-2">
                {upcomingNodes.map((n) => (
                  <div key={n.id} className="flex items-center gap-3">
                    <span className="text-sm w-4 text-center">
                      {CATEGORY_ICONS[n.category] ?? "·"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 truncate">{n.title}</div>
                    </div>
                    <div className="text-xs text-slate-500 font-mono flex-shrink-0">
                      {formatDate(n.targetDate)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel rounded-xl p-4">
            <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold mb-3">
              Недавние изменения
            </h2>
            {recentNodes.length === 0 ? (
              <p className="text-sm text-slate-600">Нет изменений</p>
            ) : (
              <div className="space-y-2">
                {recentNodes.map((n) => (
                  <div key={n.id} className="flex items-center gap-3">
                    <span className="text-sm w-4 text-center">
                      {CATEGORY_ICONS[n.category] ?? "·"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-slate-200 truncate">{n.title}</div>
                    </div>
                    <div className="text-xs text-slate-500 flex-shrink-0">
                      {formatDate(n.updatedAt)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-2">
          <FinancialDashboard snapshots={snapshots} entries={cashflowEntries} />
        </div>
      </main>
    </AppShell>
  );
}
