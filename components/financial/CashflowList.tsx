"use client";

import { CASHFLOW_CATEGORY_LABELS, type CashflowCategory } from "@/types/financial.types";

export interface CashflowRow {
  id: string;
  date: string;
  type: string;
  amount: number;
  currency: string;
  category: string;
  description: string | null;
  linkedNode?: { title: string } | null;
}

function formatMoney(amount: number, currency: string) {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString("ru-RU")} ${currency}`;
  }
}

export function CashflowList({ entries }: { entries: CashflowRow[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm text-slate-500 py-8 text-center">
        Нет записей cashflow за последние 90 дней.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-white/5">
      {entries.map((e) => {
        const isIncome = e.type === "income" || e.type === "investment";
        const cat = e.category as CashflowCategory;
        return (
          <li key={e.id} className="flex items-center justify-between gap-3 py-3 text-sm">
            <div className="min-w-0">
              <div className="text-slate-200 truncate">
                {CASHFLOW_CATEGORY_LABELS[cat] ?? e.category}
                {e.linkedNode ? ` · ${e.linkedNode.title}` : ""}
              </div>
              <div className="text-[11px] text-slate-500">
                {e.date}
                {e.description ? ` · ${e.description}` : ""}
              </div>
            </div>
            <span
              className={`font-mono font-semibold tabular-nums shrink-0 ${
                isIncome ? "text-emerald-400" : "text-rose-300"
              }`}
            >
              {isIncome ? "+" : "−"}
              {formatMoney(e.amount, e.currency)}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
