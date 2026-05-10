"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGraphStore } from "@/store/graph.store";
import { ANIMATION_CONFIG } from "@/constants/animations";
import { createEdge, deleteNode, patchNode } from "@/services/graph.service";
import { toFlowEdge } from "@/types/graph";
import {
  NODE_STATUS_VALUES,
  NODE_STATUS_LABELS,
  type NodeStatus,
} from "@/constants/node-categories";

export function FloatingToolbar() {
  const ids = useGraphStore((s) => s.selectedNodeIds);
  const addEdgeLocal = useGraphStore((s) => s.addEdgeLocal);
  const updateNodeDb = useGraphStore((s) => s.updateNodeDb);

  if (ids.length < 2) return null;

  async function chain() {
    const gid = useGraphStore.getState().graphId;
    if (!gid) return;
    for (let i = 0; i < ids.length - 1; i++) {
      try {
        const { edge } = await createEdge({
          graphId: gid,
          sourceId: ids[i],
          targetId: ids[i + 1],
          type: "RELATED",
        });
        addEdgeLocal(toFlowEdge(edge));
      } catch {
        /* ignore */
      }
    }
  }

  async function setStatusAll(status: NodeStatus) {
    for (const id of ids) {
      try {
        const { node } = await patchNode(id, { status });
        updateNodeDb(id, node);
      } catch {
        /* ignore */
      }
    }
  }

  async function deleteAll() {
    if (!confirm(`Удалить ${ids.length} узлов и связанные рёбра?`)) return;
    for (const id of ids) {
      try {
        await deleteNode(id);
      } catch {
        /* ignore */
      }
    }
    useGraphStore.setState((s) => ({
      nodes: s.nodes.filter((n) => !ids.includes(n.id)),
      edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
      selectedNodeId: null,
      selectedNodeIds: [],
    }));
  }

  return (
    <AnimatePresence>
      <motion.div
        key="floating-toolbar"
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.95 }}
        transition={ANIMATION_CONFIG.spring.snappy}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 glass-panel-strong rounded-2xl px-3 py-2 z-30 flex items-center gap-2 text-sm"
      >
        <span className="text-slate-400 text-xs px-2">Выделено: {ids.length}</span>
        <span className="w-px h-5 bg-white/10" />
        <button
          type="button"
          onClick={() => void chain()}
          className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-500 text-white text-xs font-semibold"
        >
          Связать цепью
        </button>
        <select
          onChange={(e) => {
            if (e.target.value) void setStatusAll(e.target.value as NodeStatus);
            e.target.value = "";
          }}
          defaultValue=""
          className="bg-black/30 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-slate-100"
        >
          <option value="" disabled>
            Сменить статус…
          </option>
          {NODE_STATUS_VALUES.map((s) => (
            <option key={s} value={s}>
              {NODE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => void deleteAll()}
          className="px-3 py-1.5 rounded-lg border border-red-400/40 text-red-300 hover:bg-red-500/10 text-xs font-semibold"
        >
          Удалить
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
