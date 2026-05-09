"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LifeFlowNode } from "@/types/graph";
import { NODE_COLORS, type NodeCategory } from "@/constants/node-categories";

function BaseNodeImpl({ data, selected }: NodeProps<LifeFlowNode>) {
  const cat = data.db.category as NodeCategory;
  const accent = NODE_COLORS[cat] ?? "#64748B";

  return (
    <div
      className={`rounded-xl border px-3 py-2 min-w-[140px] max-w-[240px] shadow-lg transition-shadow ${
        selected ? "ring-2 ring-white/40" : ""
      }`}
      style={{
        borderColor: accent,
        background: "rgba(8, 11, 20, 0.94)",
        boxShadow: selected ? `0 0 20px ${accent}44` : "0 8px 24px rgba(0,0,0,0.35)",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />
      <div
        className="text-[10px] uppercase tracking-wider font-semibold opacity-80"
        style={{ color: accent }}
      >
        {data.db.category}
      </div>
      <div className="text-sm font-semibold text-slate-100 leading-snug mt-1">{data.db.title}</div>
      {data.db.description ? (
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{data.db.description}</p>
      ) : null}
      <Handle type="source" position={Position.Bottom} className="!bg-slate-400 !w-2 !h-2 !border-0" />
    </div>
  );
}

export const BaseNode = memo(BaseNodeImpl);
