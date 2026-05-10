"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGraphStore } from "@/store/graph.store";
import { useCameraControls } from "@/hooks/useCameraControls";
import { ANIMATION_CONFIG } from "@/constants/animations";
import { NODE_ICONS, NODE_CATEGORY_LABELS, type NodeCategory } from "@/constants/node-categories";

type CmdItem =
  | { kind: "node"; id: string; title: string; category: NodeCategory; description?: string }
  | { kind: "command"; id: string; title: string; hint: string; run: () => void };

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);

  const nodes = useGraphStore((s) => s.nodes);
  const setSelected = useGraphStore((s) => s.setSelectedNodeId);
  const { flyToNode, flyToHome, overview } = useCameraControls();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
        setActiveIdx(0);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = useMemo<CmdItem[]>(() => {
    const list: CmdItem[] = [];

    const q = query.trim().toLowerCase();
    const matchNode = (title: string, desc?: string, tags?: readonly string[]) => {
      if (!q) return true;
      return (
        title.toLowerCase().includes(q) ||
        (desc?.toLowerCase().includes(q) ?? false) ||
        (tags?.some((t) => t.toLowerCase().includes(q)) ?? false)
      );
    };

    for (const n of nodes) {
      const db = n.data.db;
      if (!matchNode(db.title, db.description ?? undefined, db.tags as readonly string[])) continue;
      list.push({
        kind: "node",
        id: db.id,
        title: db.title,
        category: db.category as NodeCategory,
        description: db.description ?? undefined,
      });
    }

    const commands: CmdItem[] = [
      {
        kind: "command",
        id: "cmd:home",
        title: "Полёт к ЯДРУ",
        hint: "Я",
        run: () => flyToHome(),
      },
      {
        kind: "command",
        id: "cmd:overview",
        title: "Обзор всей карты",
        hint: "fitView",
        run: () => overview(),
      },
    ];
    return [...list.slice(0, 30), ...commands];
  }, [nodes, query, flyToHome, overview]);

  useEffect(() => {
    setActiveIdx(0);
  }, [query, open]);

  function execute(item: CmdItem) {
    if (item.kind === "node") {
      setSelected(item.id);
      flyToNode(item.id, 1.6);
    } else {
      item.run();
    }
    setOpen(false);
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="cmd-backdrop"
          className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ANIMATION_CONFIG.tween.fast}
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px]" />
          <motion.div
            key="cmd-panel"
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={ANIMATION_CONFIG.spring.snappy}
            onClick={(e) => e.stopPropagation()}
            className="relative w-[min(560px,92vw)] glass-panel-strong rounded-2xl overflow-hidden"
            role="dialog"
            aria-modal
          >
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setActiveIdx((i) => Math.min(items.length - 1, i + 1));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setActiveIdx((i) => Math.max(0, i - 1));
                } else if (e.key === "Enter") {
                  e.preventDefault();
                  const item = items[activeIdx];
                  if (item) execute(item);
                }
              }}
              placeholder="Поиск узла или команды… (↑↓ для навигации, Enter — выбрать)"
              className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 px-4 py-3 outline-none border-b border-white/10"
            />
            <ul className="max-h-[50vh] overflow-y-auto py-1">
              {items.length === 0 ? (
                <li className="px-4 py-3 text-sm text-slate-500">Ничего не найдено</li>
              ) : null}
              {items.map((item, i) => {
                const active = i === activeIdx;
                return (
                  <li key={item.kind + ":" + item.id}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => execute(item)}
                      className={[
                        "w-full text-left px-4 py-2 flex items-center gap-3",
                        active ? "bg-white/10" : "hover:bg-white/5",
                      ].join(" ")}
                    >
                      {item.kind === "node" ? (
                        <>
                          <span className="text-base w-5 text-center">
                            {NODE_ICONS[item.category]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-100 truncate">{item.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              {NODE_CATEGORY_LABELS[item.category]}
                              {item.description ? " · " + item.description : ""}
                            </div>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="text-base w-5 text-center">⌘</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-slate-100">{item.title}</div>
                            <div className="text-[11px] text-slate-500">{item.hint}</div>
                          </div>
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
