"use client";

import { useStore } from "@xyflow/react";
import { useMemo } from "react";
import { getZoomPreset, type ZoomPreset } from "@/constants/zoom-levels";

/** Reactive zoom value from React Flow viewport. */
export function useViewportZoom(): number {
  return useStore((s) => s.transform[2]);
}

export function useZoomPreset(): { zoom: number; preset: ZoomPreset } {
  const zoom = useViewportZoom();
  return useMemo(() => ({ zoom, preset: getZoomPreset(zoom) }), [zoom]);
}
