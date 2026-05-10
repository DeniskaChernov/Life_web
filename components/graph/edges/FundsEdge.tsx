"use client";

import { memo } from "react";
import {
  BaseEdge as RFBaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";
import type { LifeFlowEdge } from "@/types/graph";
import { EDGE_STYLES, type EdgeType } from "@/constants/edge-types";
import { useZoomPreset } from "@/hooks/useViewport";

function FundsEdgeImpl(props: EdgeProps<LifeFlowEdge>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    selected,
    data,
    label,
  } = props;

  const [path, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const edgeType = (data?.db.type ?? "FUNDS") as EdgeType;
  const style = EDGE_STYLES[edgeType] ?? EDGE_STYLES.FUNDS;
  const { preset } = useZoomPreset();

  return (
    <>
      <RFBaseEdge
        id={id}
        path={path}
        className="edge-animated"
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? style.strokeWidth + 1 : style.strokeWidth,
          opacity: selected ? Math.min(1, style.opacity + 0.15) : style.opacity,
          filter: selected
            ? `drop-shadow(0 0 8px ${style.stroke})`
            : `drop-shadow(0 0 4px ${style.stroke}88)`,
        }}
      />
      {preset.showEdgeLabel && label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "rgba(15,20,36,0.9)",
              color: style.stroke,
              padding: "3px 8px",
              borderRadius: 8,
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-mono)",
              border: `1px solid ${style.stroke}88`,
              boxShadow: `0 0 12px ${style.stroke}55`,
              pointerEvents: "all",
            }}
            className="nodrag nopan"
          >
            {String(label)}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
}

export const FundsEdge = memo(FundsEdgeImpl);
