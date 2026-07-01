"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { NetWorthChart } from "./NetWorthChart";
import { ScenarioPanel } from "./ScenarioPanel";
import { CashflowSankey } from "./CashflowSankey";

// ── Types ─────────────────────────────────────────────────────────────────────

interface NetWorthSnapshot {
  id: string;
  date: string | Date;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  notes?: string | null;
}

interface CashflowEntry {
  id: string;
  date: string | Date;
  type: string;
  amount: number;
  currency: string;
  category: string;
  subcategory?: string | null;
  description?: string | null;
}

interface Props {
  snapshots: NetWorthSnapshot[];
  entries: CashflowEntry[];
  embedded?: boolean;
}

// ── Formatters ────────────────────────────────────────────────────────────────

const rubFmt = new Intl.NumberFormat("ru-RU", {
  style: "currency",
  currency: "RUB",
  maximumFractionDigits: 0,
});
const dateFmt = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatRub(n: number) {
  return rubFmt.format(n);
}

function formatDate(d: string | Date) {
  return dateFmt.format(new Date(d));
}

// ── Mortgage calculator ───────────────────────────────────────────────────────

function calcMortgage(principal: number, annualRate: number, years: number): number {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  const r = annualRate / 100 / 12;
  const n = years * 12;
  return (principal * (r * Math.pow(1 + r, n))) / (Math.pow(1 + r, n) - 1);
}

// ── Add Transaction Modal ─────────────────────────────────────────────────────

const CASHFLOW_CATEGORIES = [
  { value: "SALARY", label: "Зарплата" },
  { value: "BUSINESS_INCOME", label: "Доход от бизнеса" },
  { value: "RENTAL_INCOME", label: "Аренда" },
  { value: "INVESTMENT_INCOME", label: "Инвестиционный доход" },
  { value: "HOUSING", label: "Жильё" },
  { value: "FOOD", label: "Питание" },
  { value: "TRANSPORT", label: "Транспорт" },
  { value: "EDUCATION", label: "Образование" },
  { value: "HEALTHCARE", label: "Здоровье" },
  { value: "ENTERTAINMENT", label: "Развлечения" },
  { value: "SAVINGS", label: "Сбережения" },
  { value: "DEBT_PAYMENT", label: "Погашение долга" },
  { value: "INVESTMENT_OUT", label: "Инвестиции" },
  { value: "BUSINESS_EXPENSE", label: "Расход бизнеса" },
  { value: "OTHER", label: "Прочее" },
];

interface TransactionFormData {
  date: string;
  type: "income" | "expense" | "transfer" | "investment";
  amount: string;
  category: string;
  description: string;
}

function AddTransactionModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [form, setForm] = useState<TransactionFormData>({
    date: new Date().toISOString().slice(0, 10),
    type: "income",
    amount: "",
    category: "SALARY",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      const amount = parseFloat(form.amount);
      if (!amount || amount <= 0) {
        setError("Введите корректную сумму");
        return;
      }
      setSaving(true);
      try {
        const res = await fetch("/api/v1/financial/cashflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: new Date(form.date).toISOString(),
            type: form.type,
            amount,
            currency: "RUB",
            category: form.category,
            description: form.description || undefined,
          }),
        });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? "Ошибка сохранения");
          return;
        }
        router.refresh();
        onClose();
      } catch {
        setError("Сетевая ошибка");
      } finally {
        setSaving(false);
      }
    },
    [form, router, onClose],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel-strong rounded-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-base font-semibold text-slate-100 mb-5">Новая транзакция</h2>
        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Тип</label>
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    type: e.target.value as TransactionFormData["type"],
                  }))
                }
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
              >
                <option value="income">Доход</option>
                <option value="expense">Расход</option>
                <option value="transfer">Перевод</option>
                <option value="investment">Инвестиция</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Дата</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Сумма, руб.</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Категория</label>
            <select
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            >
              {CASHFLOW_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Описание</label>
            <input
              type="text"
              placeholder="Необязательно"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg px-4 py-2 text-sm text-slate-400 border border-white/10 hover:bg-white/5 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors text-white"
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Mortgage Calculator ───────────────────────────────────────────────────────

function MortgageCalculator() {
  const [principal, setPrincipal] = useState("5000000");
  const [rate, setRate] = useState("12");
  const [years, setYears] = useState("20");

  const P = parseFloat(principal) || 0;
  const R = parseFloat(rate) || 0;
  const Y = parseFloat(years) || 0;
  const monthly = calcMortgage(P, R, Y);
  const total = monthly * Y * 12;
  const overpay = total - P;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-slate-200 mb-4">Калькулятор ипотеки</h3>
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1">Сумма кредита, руб.</label>
          <input
            type="number"
            min="0"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Ставка, % год.</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-400 mb-1">Срок, лет</label>
            <input
              type="number"
              min="1"
              max="50"
              value={years}
              onChange={(e) => setYears(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>
        {monthly > 0 && (
          <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Платёж в месяц</span>
              <span className="text-sm font-semibold text-indigo-300">{formatRub(monthly)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Итого выплат</span>
              <span className="text-xs text-slate-300">{formatRub(total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400">Переплата</span>
              <span className="text-xs text-red-400">{formatRub(overpay)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export function FinancialDashboard({ snapshots, entries, embedded }: Props) {
  const [showAddModal, setShowAddModal] = useState(false);

  const chartData = useMemo(
    () =>
      snapshots.map((s) => ({
        date:
          typeof s.date === "string"
            ? s.date.slice(0, 10)
            : new Date(s.date).toISOString().slice(0, 10),
        netWorth: s.netWorth,
      })),
    [snapshots],
  );

  const latestSnapshot = snapshots.length > 0 ? snapshots[snapshots.length - 1] : null;
  const prevSnapshot = snapshots.length > 1 ? snapshots[snapshots.length - 2] : null;

  const netWorthDelta =
    latestSnapshot && prevSnapshot ? latestSnapshot.netWorth - prevSnapshot.netWorth : null;

  // Current month income/expense
  const now = new Date();
  const currentMonthEntries = entries.filter((e) => {
    const d = new Date(e.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  });
  const monthIncome = currentMonthEntries
    .filter((e) => e.type === "income")
    .reduce((sum, e) => sum + e.amount, 0);
  const monthExpense = currentMonthEntries
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0);

  const categoryLabel = (cat: string) =>
    CASHFLOW_CATEGORIES.find((c) => c.value === cat)?.label ?? cat;

  const typeLabel = (t: string) => {
    const map: Record<string, string> = {
      income: "Доход",
      expense: "Расход",
      transfer: "Перевод",
      investment: "Инвестиция",
    };
    return map[t] ?? t;
  };

  const typeColor = (t: string) => {
    const map: Record<string, string> = {
      income: "text-emerald-400",
      expense: "text-red-400",
      transfer: "text-blue-400",
      investment: "text-violet-400",
    };
    return map[t] ?? "text-slate-400";
  };

  return (
    <div className={embedded ? "space-y-6" : "flex-1 overflow-y-auto p-6 space-y-6"}>
      {showAddModal && <AddTransactionModal onClose={() => setShowAddModal(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Финансы</h1>
          <p className="text-xs text-slate-500 mt-0.5">Чистый капитал и денежный поток</p>
        </div>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 transition-colors text-white"
        >
          + Транзакция
        </button>
      </div>

      {/* Top row: Net Worth + Month Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Net Worth Card */}
        <div className="glass-panel-strong rounded-2xl p-5 md:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Чистый капитал</p>
              {latestSnapshot ? (
                <>
                  <p
                    className={`text-3xl font-bold mt-1 ${
                      latestSnapshot.netWorth >= 0 ? "text-slate-100" : "text-red-400"
                    }`}
                  >
                    {formatRub(latestSnapshot.netWorth)}
                  </p>
                  {netWorthDelta !== null && (
                    <p
                      className={`text-xs mt-1 ${
                        netWorthDelta >= 0 ? "text-emerald-400" : "text-red-400"
                      }`}
                    >
                      {netWorthDelta >= 0 ? "+" : ""}
                      {formatRub(netWorthDelta)} к предыдущему периоду
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">
                    на {formatDate(latestSnapshot.date)}
                  </p>
                </>
              ) : (
                <p className="text-2xl font-bold mt-1 text-slate-500">Нет данных</p>
              )}
            </div>
            {latestSnapshot && (
              <div className="text-right space-y-1">
                <div>
                  <p className="text-xs text-slate-400">Активы</p>
                  <p className="text-sm font-medium text-emerald-400">
                    {formatRub(latestSnapshot.totalAssets)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Обязательства</p>
                  <p className="text-sm font-medium text-red-400">
                    {formatRub(latestSnapshot.totalLiabilities)}
                  </p>
                </div>
              </div>
            )}
          </div>

          <NetWorthChart data={chartData} />
        </div>

        {/* Month Summary */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">Текущий месяц</p>
          <div className="space-y-3 flex-1">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 mb-0.5">Доходы</p>
              <p className="text-lg font-semibold text-emerald-300">{formatRub(monthIncome)}</p>
            </div>
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 mb-0.5">Расходы</p>
              <p className="text-lg font-semibold text-red-300">{formatRub(monthExpense)}</p>
            </div>
            <div
              className={`p-3 rounded-xl border ${
                monthIncome - monthExpense >= 0
                  ? "bg-indigo-500/10 border-indigo-500/20"
                  : "bg-red-500/10 border-red-500/20"
              }`}
            >
              <p className="text-xs text-slate-400 mb-0.5">Баланс</p>
              <p
                className={`text-lg font-semibold ${
                  monthIncome - monthExpense >= 0 ? "text-indigo-300" : "text-red-300"
                }`}
              >
                {monthIncome - monthExpense >= 0 ? "+" : ""}
                {formatRub(monthIncome - monthExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row: Recent Transactions + Mortgage Calculator */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="glass-panel rounded-2xl p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-200">Последние транзакции</h3>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              + добавить
            </button>
          </div>

          {entries.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm text-slate-500">Транзакций пока нет</p>
              <p className="text-xs text-slate-600 mt-1">
                Нажмите &quot;+ Транзакция&quot; чтобы добавить первую запись
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-md ${
                        entry.type === "income"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : entry.type === "expense"
                            ? "bg-red-500/15 text-red-400"
                            : entry.type === "investment"
                              ? "bg-violet-500/15 text-violet-400"
                              : "bg-blue-500/15 text-blue-400"
                      }`}
                    >
                      {typeLabel(entry.type)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 truncate">
                        {categoryLabel(entry.category)}
                      </p>
                      {entry.description && (
                        <p className="text-xs text-slate-500 truncate">{entry.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-medium ${typeColor(entry.type)}`}>
                      {entry.type === "expense" ? "-" : "+"}
                      {formatRub(entry.amount)}
                    </p>
                    <p className="text-xs text-slate-500">{formatDate(entry.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mortgage Calculator */}
        <MortgageCalculator />
      </div>

      <section className="glass-panel rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-4">Потоки денег</h2>
        <CashflowSankey
          entries={entries.map((e) => ({
            ...e,
            date: typeof e.date === "string" ? e.date : e.date.toISOString().slice(0, 10),
            description: e.description ?? null,
          }))}
        />
      </section>

      <ScenarioPanel />

      {/* Empty state hint when no snapshots */}
      {snapshots.length === 0 && (
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-sm font-medium text-slate-300 mb-1">
            Добавьте первый снапшот чистого капитала
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Снапшоты позволяют отслеживать динамику ваших активов, обязательств и чистого капитала
            во времени.
          </p>
          <p className="text-xs text-slate-600 mt-3">
            Используйте API{" "}
            <code className="text-indigo-400">POST /api/v1/financial/net-worth</code> для добавления
            данных.
          </p>
        </div>
      )}
    </div>
  );
}
