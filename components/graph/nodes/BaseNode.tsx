"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { LifeFlowNode } from "@/types/graph";
import {
  NODE_COLORS,
  NODE_ICONS,
  NODE_CATEGORY_LABELS,
  type NodeCategory,
  type NodeStatus,
  type NodePriority,
} from "@/constants/node-categories";
import { useZoomPreset } from "@/hooks/useViewport";

function ProgressBar({ value, accent }: { value: number; accent: string }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="mt-2 h-1 w-full rounded-full bg-white/8 overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${v}%`, background: accent }}
      />
    </div>
  );
}

function StatusDot({ status }: { status: NodeStatus }) {
  const map: Record<NodeStatus, string> = {
    FUTURE: "#A78BFA",
    ACTIVE: "#34D399",
    PAUSED: "#FBBF24",
    BLOCKED: "#F87171",
    COMPLETED: "#60A5FA",
    ARCHIVED: "#64748B",
  };
  return (
    <span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ background: map[status] }}
      aria-label={status}
    />
  );
}

function BaseNodeImpl({ data, selected }: NodeProps<LifeFlowNode>) {
  const db = data.db;
  const cat = db.category as NodeCategory;
  const accent = db.color || NODE_COLORS[cat] || "#64748B";
  const status = (db.status || "FUTURE") as NodeStatus;
  const priority = (db.priority || "MEDIUM") as NodePriority;
  const { preset } = useZoomPreset();

  const glowAlpha =
    priority === "CRITICAL" ? "AA" : priority === "HIGH" ? "77" : selected ? "55" : "33";

  const isCritical = priority === "CRITICAL" && status === "ACTIVE";

  return (
    <div
      className={[
        "relative rounded-2xl px-3 py-2 min-w-[150px] max-w-[260px] backdrop-blur",
        "transition-all duration-200 will-change-transform",
        selected ? "node-selected" : "",
        isCritical ? "node-critical" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={
        {
          background: "rgba(15, 20, 36, 0.78)",
          border: `1px solid ${accent}55`,
          boxShadow: selected
            ? `0 0 28px ${accent}${glowAlpha}, 0 0 0 1px ${accent}99 inset`
            : `0 8px 24px rgba(0,0,0,0.45), 0 0 0 1px ${accent}22 inset`,
          ["--node-glow" as string]: `${accent}${glowAlpha}`,
        } as React.CSSProperties
      }
    >
      <Handle type="target" position={Position.Top} className="!bg-slate-400 !w-2 !h-2 !border-0" />

      {preset.showMeta ? (
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] font-semibold opacity-90">
          <span style={{ color: accent }}>
            {NODE_ICONS[cat]} {NODE_CATEGORY_LABELS[cat] ?? db.category}
          </span>
          <StatusDot status={status} />
        </div>
      ) : null}

      {preset.showTitle ? (
        <div className="text-node-title text-slate-100 mt-1 leading-snug">{db.title}</div>
      ) : null}

      {preset.showDetail && db.description ? (
        <p className="text-[11px] text-slate-400 mt-1 line-clamp-3">{db.description}</p>
      ) : null}

      {preset.showDetail && db.progress > 0 ? (
        <>
          <ProgressBar value={db.progress} accent={accent} />
          <div className="text-[10px] text-slate-500 mt-1">{db.progress}%</div>
        </>
      ) : null}

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-slate-400 !w-2 !h-2 !border-0"
      />
    </div>
  );
}

export const BaseNode = memo(BaseNodeImpl);
