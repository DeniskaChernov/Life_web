"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useGraphStore } from "@/store/graph.store";
import { useCameraControls } from "@/hooks/useCameraControls";
import { ANIMATION_CONFIG } from "@/constants/animations";
import { deleteEdge, deleteNode } from "@/services/graph.service";

export function NodeContextMenu() {
  const menu = useGraphStore((s) => s.contextMenu);
  const close = useGraphStore((s) => s.closeContextMenu);
  const setSelected = useGraphStore((s) => s.setSelectedNodeId);
  const setSelectedEdge = useGraphStore((s) => s.setSelectedEdgeId);
  const removeEdge = useGraphStore((s) => s.removeEdge);
  const { flyToNode } = useCameraControls();

  if (!menu) return null;

  const onEdit = () => {
    if (menu.kind === "node") setSelected(menu.targetId);
    else setSelectedEdge(menu.targetId);
    close();
  };

  const onFly = () => {
    if (menu.kind === "node") flyToNode(menu.targetId, 1.6);
    close();
  };

  const onDelete = async () => {
    const confirmText = menu.kind === "node" ? "Удалить узел и связанные рёбра?" : "Удалить связь?";
    if (!confirm(confirmText)) return;
    try {
      if (menu.kind === "node") {
        await deleteNode(menu.targetId);
        useGraphStore.setState((s) => ({
          nodes: s.nodes.filter((n) => n.id !== menu.targetId),
          edges: s.edges.filter((e) => e.source !== menu.targetId && e.target !== menu.targetId),
          selectedNodeId: null,
        }));
      } else {
        await deleteEdge(menu.targetId);
        removeEdge(menu.targetId);
      }
    } catch {
      /* ignore */
    } finally {
      close();
    }
  };

  const items =
    menu.kind === "node"
      ? [
          { label: "Открыть детали", run: onEdit, hint: "Enter" },
          { label: "Полёт к узлу", run: onFly, hint: "F" },
          { label: "Удалить", run: onDelete, hint: "Del", danger: true },
        ]
      : [
          { label: "Открыть связь", run: onEdit, hint: "Enter" },
          { label: "Удалить связь", run: onDelete, hint: "Del", danger: true },
        ];

  return (
    <AnimatePresence>
      <motion.div
        key="ctx-backdrop"
        className="fixed inset-0 z-40"
        onClick={close}
        onContextMenu={(e) => {
          e.preventDefault();
          close();
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={ANIMATION_CONFIG.tween.fast}
      >
        <motion.ul
          className="absolute glass-panel-strong rounded-xl py-1 min-w-[200px] shadow-2xl"
          style={{ left: menu.x, top: menu.y }}
          initial={{ opacity: 0, scale: 0.95, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -4 }}
          transition={ANIMATION_CONFIG.spring.snappy}
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((it) => (
            <li key={it.label}>
              <button
                type="button"
                onClick={() => void it.run()}
                className={[
                  "w-full flex items-center justify-between px-3 py-2 text-sm",
                  it.danger
                    ? "text-red-300 hover:bg-red-500/10"
                    : "text-slate-200 hover:bg-white/8",
                ].join(" ")}
              >
                <span>{it.label}</span>
                <span className="text-[10px] text-slate-500">{it.hint}</span>
              </button>
            </li>
          ))}
        </motion.ul>
      </motion.div>
    </AnimatePresence>
  );
}
