"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGraphStore } from "@/store/graph.store";

export function RightPanel() {
  const selectedId = useGraphStore((s) => s.selectedNodeId);
  const nodes = useGraphStore((s) => s.nodes);
  const node = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("FUTURE");
  const [priority, setPriority] = useState("MEDIUM");

  useEffect(() => {
    if (!node) return;
    setTitle(node.data.db.title);
    setDescription(node.data.db.description ?? "");
    setStatus(node.data.db.status);
    setPriority(node.data.db.priority);
  }, [node]);

  const save = useCallback(async () => {
    if (!node) return;
    const res = await fetch(`/api/v1/nodes/${node.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        status,
        priority,
      }),
    });
    if (!res.ok) return;
    const { node: updated } = (await res.json()) as { node: typeof node.data.db };
    useGraphStore.getState().updateNodeDb(node.id, updated);
  }, [node, title, description, status, priority]);

  const remove = useCallback(async () => {
    if (!node) return;
    if (!confirm("Удалить узел и связанные рёбра?")) return;
    const res = await fetch(`/api/v1/nodes/${node.id}`, { method: "DELETE" });
    if (!res.ok) return;
    useGraphStore.setState((s) => ({
      nodes: s.nodes.filter((n) => n.id !== node.id),
      edges: s.edges.filter((e) => e.source !== node.id && e.target !== node.id),
      selectedNodeId: null,
    }));
  }, [node]);

  if (!node) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-white/10 bg-[#0D1220]/95 p-4 text-slate-400 text-sm">
        Выберите узел на графе, чтобы увидеть детали и редактировать поля.
      </aside>
    );
  }

  return (
    <aside className="w-[320px] shrink-0 border-l border-white/10 bg-[#0D1220]/95 backdrop-blur flex flex-col">
      <div className="p-4 border-b border-white/10">
        <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Узел</h2>
        <p className="text-lg font-semibold text-slate-100 mt-1">{node.data.db.category}</p>
      </div>
      <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
        <label className="text-xs text-slate-500">Заголовок</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
        />
        <label className="text-xs text-slate-500">Описание</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100 resize-none"
        />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-slate-500">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-xs text-slate-100"
            >
              {["FUTURE", "ACTIVE", "PAUSED", "BLOCKED", "COMPLETED"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Приоритет</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-xs text-slate-100"
            >
              {["LOW", "MEDIUM", "HIGH"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => void save()}
            className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Сохранить
          </button>
          <button
            type="button"
            onClick={() => void remove()}
            className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Удалить
          </button>
        </div>
      </div>
    </aside>
  );
}
