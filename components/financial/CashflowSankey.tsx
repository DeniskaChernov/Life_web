"use client";

import { useMemo } from "react";
import { CASHFLOW_CATEGORY_LABELS, type CashflowCategory } from "@/types/financial.types";
import type { CashflowRow } from "./CashflowList";

const INCOME_TYPES = new Set(["income", "investment"]);
const EXPENSE_TYPES = new Set(["expense", "transfer"]);

function formatShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(Math.round(n));
}

export function CashflowSankey({ entries }: { entries: CashflowRow[] }) {
  const { incomeGroups, expenseGroups, totalIn, totalOut } = useMemo(() => {
    const income = new Map<string, number>();
    const expense = new Map<string, number>();
    for (const e of entries) {
      const key = e.category;
      if (INCOME_TYPES.has(e.type)) {
        income.set(key, (income.get(key) ?? 0) + e.amount);
      } else if (EXPENSE_TYPES.has(e.type)) {
        expense.set(key, (expense.get(key) ?? 0) + e.amount);
      }
    }
    const incomeGroups = [...income.entries()]
      .map(([cat, amount]) => ({ cat, amount }))
      .sort((a, b) => b.amount - a.amount);
    const expenseGroups = [...expense.entries()]
      .map(([cat, amount]) => ({ cat, amount }))
      .sort((a, b) => b.amount - a.amount);
    const totalIn = incomeGroups.reduce((s, g) => s + g.amount, 0);
    const totalOut = expenseGroups.reduce((s, g) => s + g.amount, 0);
    return { incomeGroups, expenseGroups, totalIn, totalOut };
  }, [entries]);

  if (totalIn === 0 && totalOut === 0) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-slate-500">
        Недостаточно данных для диаграммы потоков.
      </div>
    );
  }

  const maxSide = Math.max(totalIn, totalOut, 1);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch min-h-[12rem]">
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-emerald-500/80 font-semibold mb-2">
            Поступления
          </p>
          {incomeGroups.map(({ cat, amount }) => (
            <div key={cat} className="flex items-center gap-2">
              <div className="flex-1 min-w-0 text-right">
                <p className="text-[11px] text-slate-400 truncate">
                  {CASHFLOW_CATEGORY_LABELS[cat as CashflowCategory] ?? cat}
                </p>
                <p className="text-xs font-mono text-emerald-300">{formatShort(amount)}</p>
              </div>
              <div
                className="h-2 rounded-full bg-emerald-500/60"
                style={{ width: `${Math.max(8, (amount / maxSide) * 72)}px` }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center justify-center px-2">
          <div className="w-px flex-1 bg-gradient-to-b from-emerald-500/40 via-indigo-400/30 to-rose-400/40 min-h-[4rem]" />
          <div className="my-2 text-center">
            <p className="text-[10px] text-slate-500">баланс</p>
            <p
              className={`text-sm font-mono font-semibold ${
                totalIn - totalOut >= 0 ? "text-indigo-300" : "text-rose-300"
              }`}
            >
              {formatShort(totalIn - totalOut)}
            </p>
          </div>
          <div className="w-px flex-1 bg-gradient-to-b from-indigo-400/30 to-rose-400/40 min-h-[4rem]" />
        </div>

        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-wider text-rose-400/80 font-semibold mb-2">
            Расходы
          </p>
          {expenseGroups.map(({ cat, amount }) => (
            <div key={cat} className="flex items-center gap-2">
              <div
                className="h-2 rounded-full bg-rose-400/60"
                style={{ width: `${Math.max(8, (amount / maxSide) * 72)}px` }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-400 truncate">
                  {CASHFLOW_CATEGORY_LABELS[cat as CashflowCategory] ?? cat}
                </p>
                <p className="text-xs font-mono text-rose-300">{formatShort(amount)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
