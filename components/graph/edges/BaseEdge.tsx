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

function BaseEdgeImpl(props: EdgeProps<LifeFlowEdge>) {
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

  const edgeType = (data?.db.type ?? "RELATED") as EdgeType;
  const style = EDGE_STYLES[edgeType] ?? EDGE_STYLES.RELATED;
  const { preset } = useZoomPreset();

  return (
    <>
      <RFBaseEdge
        id={id}
        path={path}
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? style.strokeWidth + 1 : style.strokeWidth,
          strokeDasharray: style.dashArray,
          opacity: selected ? Math.min(1, style.opacity + 0.2) : style.opacity,
          filter: selected ? `drop-shadow(0 0 6px ${style.stroke})` : undefined,
        }}
      />
      {preset.showEdgeLabel && label ? (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: "rgba(15,20,36,0.85)",
              color: style.stroke,
              padding: "2px 6px",
              borderRadius: 6,
              fontSize: 10,
              fontWeight: 600,
              border: `1px solid ${style.stroke}55`,
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

export const BaseEdgeRenderer = memo(BaseEdgeImpl);
