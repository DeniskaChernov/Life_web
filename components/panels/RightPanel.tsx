"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useGraphStore } from "@/store/graph.store";
import { deleteEdge, deleteNode, patchEdge, patchNode } from "@/services/graph.service";
import {
  NODE_CATEGORY_VALUES,
  NODE_CATEGORY_LABELS,
  NODE_STATUS_VALUES,
  NODE_STATUS_LABELS,
  NODE_PRIORITY_VALUES,
  NODE_PRIORITY_LABELS,
  TIME_HORIZON_VALUES,
  TIME_HORIZON_LABELS,
  NODE_ENERGY_VALUES,
  NODE_ENERGY_LABELS,
  NODE_ICONS,
  type NodeCategory,
  type NodeStatus,
  type NodePriority,
  type TimeHorizon,
  type NodeEnergy,
} from "@/constants/node-categories";
import {
  EDGE_TYPE_VALUES,
  EDGE_TYPE_LABELS,
  EDGE_DIRECTION_VALUES,
  type EdgeType,
  type EdgeDirection,
} from "@/constants/edge-types";
import { PropertyCard } from "@/components/financial/PropertyCard";

function dateToLocalInput(d: Date | null | undefined): string {
  if (!d) return "";
  const x = new Date(d);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-[10px] uppercase tracking-[0.08em] text-slate-500 font-semibold">
      {children}
    </label>
  );
}

export function RightPanel() {
  const selectedId = useGraphStore((s) => s.selectedNodeId);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const updateNodeDb = useGraphStore((s) => s.updateNodeDb);
  const updateEdgeDb = useGraphStore((s) => s.updateEdgeDb);

  const node = useMemo(() => nodes.find((n) => n.id === selectedId), [nodes, selectedId]);
  const edge = useMemo(() => edges.find((e) => e.id === selectedEdgeId), [edges, selectedEdgeId]);
  const dbEdge = edge?.data?.db;

  // Node fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<NodeCategory>("GOAL");
  const [status, setStatus] = useState<NodeStatus>("FUTURE");
  const [priority, setPriority] = useState<NodePriority>("MEDIUM");
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>("MONTH");
  const [energy, setEnergy] = useState<NodeEnergy>("STEADY");
  const [progress, setProgress] = useState(0);
  const [targetDateLocal, setTargetDateLocal] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  // History tab
  const [tab, setTab] = useState<"edit" | "history">("edit");
  const [snapshots, setSnapshots] = useState<
    { id: string; version: number; createdAt: string; snapshot: Record<string, unknown> }[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Edge fields
  const [edgeType, setEdgeType] = useState<EdgeType>("RELATED");
  const [edgeLabel, setEdgeLabel] = useState("");
  const [edgeDescription, setEdgeDescription] = useState("");
  const [edgeStrength, setEdgeStrength] = useState(0.5);
  const [edgeDirection, setEdgeDirection] = useState<EdgeDirection>("FORWARD");

  useEffect(() => {
    if (!node) return;
    const db = node.data.db;
    setTitle(db.title);
    setDescription(db.description ?? "");
    setCategory(db.category as NodeCategory);
    setStatus(db.status as NodeStatus);
    setPriority(db.priority as NodePriority);
    setTimeHorizon((db.timeHorizon as TimeHorizon) || "MONTH");
    setEnergy((db.energy as NodeEnergy) || "STEADY");
    setProgress(db.progress ?? 0);
    setTargetDateLocal(dateToLocalInput(db.targetDate));
    setTags(db.tags ?? []);
    setTagInput("");
    setIsPinned(db.isPinned ?? false);
    setTab("edit");
    setSnapshots([]);
  }, [node]);

  useEffect(() => {
    if (!dbEdge) return;
    setEdgeType((dbEdge.type as EdgeType) || "RELATED");
    setEdgeLabel(dbEdge.label ?? "");
    setEdgeDescription(dbEdge.description ?? "");
    setEdgeStrength(dbEdge.strength ?? 0.5);
    setEdgeDirection((dbEdge.direction as EdgeDirection) || "FORWARD");
  }, [dbEdge]);

  const saveNode = useCallback(async () => {
    if (!node) return;
    try {
      const targetDate =
        targetDateLocal.trim() === "" ? null : new Date(targetDateLocal).toISOString();
      const { node: updated } = await patchNode(node.id, {
        title,
        description: description || null,
        category,
        status,
        priority,
        timeHorizon,
        energy,
        progress,
        targetDate,
        tags,
        isPinned,
      });
      updateNodeDb(node.id, updated);
    } catch {
      /* ignore */
    }
  }, [
    node,
    title,
    description,
    category,
    status,
    priority,
    timeHorizon,
    energy,
    progress,
    targetDateLocal,
    tags,
    isPinned,
    updateNodeDb,
  ]);

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
        selectedNodeIds: [],
      }));
    } catch {
      /* ignore */
    }
  }, [node]);

  const saveEdge = useCallback(async () => {
    if (!edge) return;
    try {
      const { edge: updated } = await patchEdge(edge.id, {
        type: edgeType,
        label: edgeLabel || null,
        description: edgeDescription || null,
        strength: edgeStrength,
        direction: edgeDirection,
      });
      updateEdgeDb(edge.id, updated);
    } catch {
      /* ignore */
    }
  }, [edge, edgeType, edgeLabel, edgeDescription, edgeStrength, edgeDirection, updateEdgeDb]);

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
      <aside className="w-[340px] shrink-0 border-l border-white/10 glass-panel-strong flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h2 className="text-[10px] uppercase tracking-[0.08em] text-slate-500 font-semibold">
            Связь
          </h2>
          <p className="text-sm text-slate-200 mt-1 truncate">
            {sourceTitle} → {targetTitle}
          </p>
        </div>
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
          <FieldLabel>Тип</FieldLabel>
          <select
            value={edgeType}
            onChange={(e) => setEdgeType(e.target.value as EdgeType)}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
          >
            {EDGE_TYPE_VALUES.map((t) => (
              <option key={t} value={t}>
                {EDGE_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
          <FieldLabel>Метка</FieldLabel>
          <input
            value={edgeLabel}
            onChange={(e) => setEdgeLabel(e.target.value)}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
          />
          <FieldLabel>Описание</FieldLabel>
          <textarea
            value={edgeDescription}
            onChange={(e) => setEdgeDescription(e.target.value)}
            rows={2}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100 resize-none"
          />
          <FieldLabel>Сила: {Math.round(edgeStrength * 100)}%</FieldLabel>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={edgeStrength}
            onChange={(e) => setEdgeStrength(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />
          <FieldLabel>Направление</FieldLabel>
          <select
            value={edgeDirection}
            onChange={(e) => setEdgeDirection(e.target.value as EdgeDirection)}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
          >
            {EDGE_DIRECTION_VALUES.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => void saveEdge()}
              className="flex-1 rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={() => void removeEdge()}
              className="rounded-lg border border-red-500/40 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
            >
              Удалить
            </button>
          </div>
        </div>
      </aside>
    );
  }

  if (!node) {
    return (
      <aside className="w-[340px] shrink-0 border-l border-white/10 glass-panel-strong p-4 text-slate-400 text-sm">
        Выберите узел или связь на графе, чтобы увидеть детали и редактировать.
      </aside>
    );
  }

  function loadHistory() {
    if (!node || historyLoading) return;
    setHistoryLoading(true);
    fetch(`/api/v1/nodes/${node.id}/snapshots`)
      .then((r) => r.json() as Promise<{ snapshots?: typeof snapshots }>)
      .then((d) => {
        if (d.snapshots) setSnapshots(d.snapshots);
      })
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }

  return (
    <aside className="w-[340px] shrink-0 border-l border-white/10 glass-panel-strong flex flex-col">
      <div className="px-4 pt-4 pb-0 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <span>{NODE_ICONS[category]}</span>
            <span className="truncate">{NODE_CATEGORY_LABELS[category]}</span>
          </p>
          <button
            type="button"
            title={isPinned ? "Открепить" : "Закрепить"}
            onClick={() => setIsPinned((v) => !v)}
            className={`text-base transition-colors ${isPinned ? "text-amber-400" : "text-slate-600 hover:text-slate-300"}`}
          >
            📌
          </button>
        </div>
        <div className="flex gap-1 -mb-px">
          {(["edit", "history"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t);
                if (t === "history" && snapshots.length === 0) loadHistory();
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-t-lg border-b-2 transition-colors ${
                tab === t
                  ? "border-indigo-500 text-indigo-300"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {t === "edit" ? "Редактор" : "История"}
            </button>
          ))}
        </div>
      </div>

      {tab === "history" ? (
        <div className="p-4 flex-1 overflow-y-auto">
          {historyLoading ? (
            <p className="text-xs text-slate-500 animate-pulse">Загрузка…</p>
          ) : snapshots.length === 0 ? (
            <p className="text-xs text-slate-500">
              История изменений пуста. Сохраните узел, чтобы создать первый снапшот.
            </p>
          ) : (
            <div className="space-y-2">
              {snapshots.map((s) => {
                const snap = s.snapshot;
                return (
                  <div
                    key={s.id}
                    className="rounded-xl bg-white/[0.04] border border-white/8 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-indigo-400">v{s.version}</span>
                      <span className="text-[10px] text-slate-500">
                        {new Date(s.createdAt).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium truncate">
                      {String(snap.title ?? "")}
                    </div>
                    <div className="flex gap-2 text-[10px] text-slate-500">
                      <span>{String(snap.status ?? "")}</span>
                      <span>·</span>
                      <span>{String(snap.progress ?? 0)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4 flex flex-col gap-3 flex-1 overflow-y-auto">
          <FieldLabel>Заголовок</FieldLabel>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
          />

          <FieldLabel>Описание</FieldLabel>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100 resize-none"
          />

          <FieldLabel>Категория</FieldLabel>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as NodeCategory)}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
          >
            {NODE_CATEGORY_VALUES.map((c) => (
              <option key={c} value={c}>
                {NODE_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <FieldLabel>Статус</FieldLabel>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NodeStatus)}
                className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-xs text-slate-100"
              >
                {NODE_STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {NODE_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Приоритет</FieldLabel>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NodePriority)}
                className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-xs text-slate-100"
              >
                {NODE_PRIORITY_VALUES.map((p) => (
                  <option key={p} value={p}>
                    {NODE_PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Горизонт</FieldLabel>
              <select
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(e.target.value as TimeHorizon)}
                className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-xs text-slate-100"
              >
                {TIME_HORIZON_VALUES.map((h) => (
                  <option key={h} value={h}>
                    {TIME_HORIZON_LABELS[h]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <FieldLabel>Энергия</FieldLabel>
              <select
                value={energy}
                onChange={(e) => setEnergy(e.target.value as NodeEnergy)}
                className="mt-1 w-full rounded-lg bg-black/30 border border-white/10 px-2 py-2 text-xs text-slate-100"
              >
                {NODE_ENERGY_VALUES.map((eg) => (
                  <option key={eg} value={eg}>
                    {NODE_ENERGY_LABELS[eg]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <FieldLabel>Прогресс: {progress}%</FieldLabel>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-indigo-500"
          />

          <FieldLabel>Целевая дата</FieldLabel>
          <input
            type="datetime-local"
            value={targetDateLocal}
            onChange={(e) => setTargetDateLocal(e.target.value)}
            className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100"
          />

          {category === "ASSET" ? <PropertyCard nodeId={node.id} /> : null}

          <FieldLabel>Теги</FieldLabel>
          <div className="rounded-lg bg-black/30 border border-white/10 px-3 py-2 flex flex-wrap gap-1.5 min-h-[38px]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1 rounded-md bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 text-xs text-indigo-300"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => setTags((t) => t.filter((x) => x !== tag))}
                  className="text-indigo-400 hover:text-red-300 leading-none"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === ",") && tagInput.trim()) {
                  e.preventDefault();
                  const t = tagInput.trim().replace(/,$/, "");
                  if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
                  setTagInput("");
                } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
                  setTags((prev) => prev.slice(0, -1));
                }
              }}
              placeholder={tags.length === 0 ? "Добавить тег…" : ""}
              className="flex-1 min-w-[80px] bg-transparent text-xs text-slate-300 outline-none placeholder:text-slate-600"
            />
          </div>

          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => void saveNode()}
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
      )}
    </aside>
  );
}
