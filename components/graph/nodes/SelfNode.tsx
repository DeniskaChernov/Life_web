"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LifeFlowNode } from "@/types/graph";

function SelfNodeImpl({ data, selected }: NodeProps<LifeFlowNode>) {
  const initial = data.db.title?.trim().charAt(0).toUpperCase() || data.db.icon || "Я";

  return (
    <div
      className={[
        "relative flex items-center justify-center rounded-full",
        "w-[88px] h-[88px] backdrop-blur transition-all duration-300",
        selected ? "scale-105" : "",
      ].join(" ")}
      style={{
        background:
          "radial-gradient(circle at 30% 25%, rgba(255,255,255,0.95), rgba(226,232,240,0.6) 55%, rgba(99,102,241,0.4) 85%)",
        border: "1px solid rgba(255,255,255,0.55)",
        boxShadow: selected
          ? "0 0 64px rgba(255,255,255,0.55), 0 0 0 2px rgba(255,255,255,0.6) inset"
          : "0 0 48px rgba(255,255,255,0.32), 0 0 0 1px rgba(255,255,255,0.35) inset",
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-white/60 !w-2 !h-2 !border-0" />
      <span className="text-[28px] font-display font-bold text-slate-900 select-none">
        {initial}
      </span>
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-white/60 !w-2 !h-2 !border-0"
      />
    </div>
  );
}

export const SelfNode = memo(SelfNodeImpl);
