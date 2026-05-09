import { AppShell } from "@/components/layout/AppShell";

export default function DashboardPage() {
  return (
    <AppShell>
      <main className="p-8 text-slate-400 text-sm max-w-xl">
        <h1 className="text-xl font-semibold text-slate-200 mb-2">Dashboard</h1>
        <p>
          Заглушка: метрики и виджеты по дорожной карте блюпринта. Основной экран —{" "}
          <span className="text-slate-300">Life Map</span>.
        </p>
      </main>
    </AppShell>
  );
}
