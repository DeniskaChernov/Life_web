"use client";

import { motion } from "framer-motion";
import { useGraphStore } from "@/store/graph.store";
import { useCameraControls } from "@/hooks/useCameraControls";
import { useViewportZoom } from "@/hooks/useViewport";
import { ANIMATION_CONFIG } from "@/constants/animations";

export function BottomInfoBar() {
  const graphName = useGraphStore((s) => s.graphName);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedIds = useGraphStore((s) => s.selectedNodeIds);
  const zoom = useViewportZoom();
  const { flyToHome, overview } = useCameraControls();

  const isMac = typeof navigator !== "undefined" && /Mac/i.test(navigator.platform);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring.soft}
      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 glass-panel rounded-full px-4 py-2 flex items-center gap-4 text-[11px] text-slate-300 font-medium"
    >
      <span className="text-slate-200 font-semibold">{graphName || "LIFE Map"}</span>
      <span className="w-px h-3 bg-white/10" />
      <span>
        <span className="text-slate-500">Узлы:</span> {nodes.length}
      </span>
      <span>
        <span className="text-slate-500">Связи:</span> {edges.length}
      </span>
      {selectedIds.length > 0 ? (
        <span>
          <span className="text-slate-500">Выделено:</span> {selectedIds.length}
        </span>
      ) : null}
      <span>
        <span className="text-slate-500">Zoom:</span> {Math.round(zoom * 100)}%
      </span>
      <span className="w-px h-3 bg-white/10" />
      <button
        type="button"
        onClick={() => flyToHome()}
        className="px-2 py-1 rounded-md hover:bg-white/8 text-slate-200"
      >
        ⌂ Я
      </button>
      <button
        type="button"
        onClick={() => overview()}
        className="px-2 py-1 rounded-md hover:bg-white/8 text-slate-200"
      >
        ⛶ Обзор
      </button>
      <span className="text-slate-500">{isMac ? "⌘K" : "Ctrl+K"} — поиск</span>
    </motion.div>
  );
}
