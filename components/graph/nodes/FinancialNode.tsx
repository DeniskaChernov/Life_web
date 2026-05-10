"use client";

import { memo, useMemo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LifeFlowNode } from "@/types/graph";
import {
  NODE_COLORS,
  NODE_ICONS,
  NODE_CATEGORY_LABELS,
  type NodeCategory,
} from "@/constants/node-categories";
import type { FinancialNodeData } from "@/types/financial.types";
import { useZoomPreset } from "@/hooks/useViewport";

function formatAmount(amount: number, currency: string): string {
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

function FinancialNodeImpl({ data, selected }: NodeProps<LifeFlowNode>) {
  const db = data.db;
  const cat = db.category as NodeCategory;
  const accent = db.color || NODE_COLORS[cat] || "#F59E0B";
  const { preset } = useZoomPreset();

  const fin = (db.financialData ?? null) as FinancialNodeData | null;
  const formatted = useMemo(() => {
    if (!fin) return null;
    return formatAmount(fin.amount, fin.currency || "RUB");
  }, [fin]);

  return (
    <div
      className={[
        "relative rounded-2xl px-3 py-2 min-w-[170px] max-w-[280px] backdrop-blur",
        "transition-all duration-200",
        selected ? "node-selected" : "",
      ].join(" ")}
      style={{
        background: `linear-gradient(180deg, rgba(15, 20, 36, 0.92) 0%, ${accent}15 100%)`,
        border: `1px solid ${accent}66`,
        boxShadow: selected
          ? `0 0 32px ${accent}88, 0 0 0 1px ${accent} inset`
          : `0 8px 28px rgba(0,0,0,0.45), 0 0 0 1px ${accent}33 inset`,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />

      {preset.showMeta ? (
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] font-semibold">
          <span style={{ color: accent }}>
            {NODE_ICONS[cat]} {NODE_CATEGORY_LABELS[cat] ?? db.category}
          </span>
          {fin?.cadence ? <span className="text-slate-500">{fin.cadence}</span> : null}
        </div>
      ) : null}

      {preset.showTitle ? (
        <div className="text-node-title text-slate-100 mt-1 leading-snug">{db.title}</div>
      ) : null}

      {preset.showDetail && formatted ? (
        <div className="font-mono text-fin-lg mt-1.5 tabular-nums" style={{ color: accent }}>
          {formatted}
        </div>
      ) : null}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-2 !h-2 !border-0"
      />
    </div>
  );
}

export const FinancialNode = memo(FinancialNodeImpl);
