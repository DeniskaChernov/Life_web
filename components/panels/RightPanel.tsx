"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGraphStore } from "@/store/graph.store";
import { deleteEdge, deleteNode, patchNode } from "@/services/graph.service";

function targetDateToLocalInput(d: Date | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

export function RightPanel() {
  const selectedId = useGraphStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const node = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);
  const edge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("FUTURE");
  const [priority, setPriority] = useState("MEDIUM");
  const [targetDateLocal, setTargetDateLocal] = useState("");

  useEffect(() => {
    if (!node) return;
    setTitle(node.data.db.title);
    setDescription(node.data.db.description ?? "");
    setStatus(node.data.db.status);
    setPriority(node.data.db.priority);
    setTargetDateLocal(targetDateToLocalInput(node.data.db.targetDate));
  }, [node]);

  const save = useCallback(async () => {
    if (!node) return;
    try {
      const targetDate =
        targetDateLocal.trim() === "" ? null : new Date(targetDateLocal).toISOString();
      const { node: updated } = await patchNode(node.id, {
        title,
        description: description || null,
        status,
        priority,
        targetDate,
      });
      useGraphStore.getState().updateNodeDb(node.id, updated);
    } catch {
      /* ignore */
    }
  }, [node, title, description, status, priority, targetDateLocal]);

  const remove = useCallback(async () => {
    if (!node) return;
    if (!confirm("Удалить узел и связанные рёбра?")) return;
    try {
      await deleteNode(node.id);
      useGraphStore.setState((s) => ({
        nodes: s.nodes.filter((n) => n.id !== node.id),
        edges: s.edges.filter((e) => e.source !== node.id && e.target !== node.id),
        selectedNodeId: null,
        selectedEdgeId: null,
      }));
    } catch {
      /* ignore */
    }
  }, [node]);

  const removeEdge = useCallback(async () => {
    if (!edge) return;
    if (!confirm("Удалить связь между узлами?")) return;
    try {
      await deleteEdge(edge.id);
      useGraphStore.getState().removeEdge(edge.id);
    } catch {
      /* ignore */
    }
  }, [edge]);

  const sourceTitle = useMemo(() => {
    if (!edge) return "";
    const n = nodes.find((x) => x.id === edge.source);
    return n?.data.db.title ?? edge.source;
  }, [edge, nodes]);

  const targetTitle = useMemo(() => {
    if (!edge) return "";
    const n = nodes.find((x) => x.id === edge.target);
    return n?.data.db.title ?? edge.target;
  }, [edge, nodes]);

  if (edge && !node) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-white/10 bg-[#0D1220]/95 backdrop-blur flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Связь</h2>
          <p className="text-sm text-slate-300 mt-1">
            {sourceTitle} → {targetTitle}
          </p>
          {edge.label ? (
            <p className="text-xs text-slate-500 mt-2">Метка: {String(edge.label)}</p>
          ) : null}
        </div>
        <div className="p-4 mt-auto">
          <button
            type="button"
            onClick={() => void removeEdge()}
            className="w-full rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
          >
            Удалить связь
          </button>
        </div>
      </aside>
    );
  }

  if (!node) {
    return (
      <aside className="w-[320px] shrink-0 border-l border-white/10 bg-[#0D1220]/95 p-4 text-slate-400 text-sm">
        Выберите узел или связь на графе, чтобы увидеть детали и редактировать.
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
        <label className="text-xs text-slate-500">Целевая дата</label>
        <input
          type="datetime-local"
          value={targetDateLocal}
          onChange={(e) => setTargetDateLocal(e.target.value)}
          className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
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
