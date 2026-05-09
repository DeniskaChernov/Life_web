"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { BaseNode } from "@/components/graph/nodes/BaseNode";
import { useGraphStore } from "@/store/graph.store";
import { toFlowEdge, toFlowNode } from "@/types/graph";
import type { Edge as DbEdge, Graph, Node as DbNode } from "@prisma/client";
import { NODE_CATEGORY_VALUES, type NodeCategory } from "@/constants/node-categories";

const nodeTypes = { life: BaseNode } as NodeTypes;

function LifeMapInner({ graphId }: { graphId: string }) {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const onNodesChange = useGraphStore((s) => s.onNodesChange);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);
  const reset = useGraphStore((s) => s.reset);
  const setSelected = useGraphStore((s) => s.setSelectedNodeId);
  const addEdgeLocal = useGraphStore((s) => s.addEdgeLocal);

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<NodeCategory>("GOAL");
  const dragTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const r = await fetch(`/api/v1/graphs/${graphId}`);
      if (!r.ok || cancelled) return;
      const data = (await r.json()) as { graph: Graph & { nodes: DbNode[]; edges: DbEdge[] } };
      const { graph } = data;
      reset(
        graph.id,
        graph.name,
        graph.nodes.map((n) => toFlowNode(n)),
        graph.edges.map((e) => toFlowEdge(e)),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [graphId, reset]);

  const flushPosition = useCallback(async (nodeId: string, x: number, y: number) => {
    await fetch(`/api/v1/nodes/${nodeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionX: x, positionY: y }),
    });
  }, []);

  const onNodeDragStop = useCallback(
    (_: unknown, node: { id: string; position: { x: number; y: number } }) => {
      if (dragTimer.current) clearTimeout(dragTimer.current);
      dragTimer.current = setTimeout(() => {
        void flushPosition(node.id, node.position.x, node.position.y);
      }, 400);
    },
    [flushPosition],
  );

  const onConnect = useCallback(
    async (c: Connection) => {
      if (!c.source || !c.target) return;
      const gid = useGraphStore.getState().graphId;
      if (!gid) return;
      const res = await fetch("/api/v1/edges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          graphId: gid,
          sourceId: c.source,
          targetId: c.target,
        }),
      });
      if (!res.ok) return;
      const body = (await res.json()) as { edge: DbEdge };
      addEdgeLocal(toFlowEdge(body.edge));
    },
    [addEdgeLocal],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: { id: string }) => {
      setSelected(node.id);
    },
    [setSelected],
  );

  const onPaneClick = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  const createNode = useCallback(async () => {
    const gid = useGraphStore.getState().graphId;
    if (!gid || !newTitle.trim()) return;
    const cx = 200 + Math.random() * 120;
    const cy = 120 + Math.random() * 120;
    const res = await fetch("/api/v1/nodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        graphId: gid,
        title: newTitle.trim(),
        category: newCategory,
        positionX: cx,
        positionY: cy,
      }),
    });
    if (!res.ok) return;
    const { node } = (await res.json()) as { node: DbNode };
    const flow = toFlowNode(node);
    useGraphStore.setState((s) => ({ nodes: [...s.nodes, flow] }));
    setNewTitle("");
    setCreating(false);
  }, [newTitle, newCategory]);

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-100 backdrop-blur border border-white/10 hover:bg-white/15"
        >
          {creating ? "Закрыть" : "+ Узел"}
        </button>
        {creating ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#0D1220]/95 px-3 py-2 backdrop-blur">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название"
              className="w-40 rounded bg-black/30 px-2 py-1 text-sm text-slate-100 outline-none ring-1 ring-white/10"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as NodeCategory)}
              className="rounded bg-black/30 px-2 py-1 text-xs text-slate-100 outline-none ring-1 ring-white/10"
            >
              {NODE_CATEGORY_VALUES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void createNode()}
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Создать
            </button>
          </div>
        ) : null}
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => void onConnect(c)}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.2}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="rgba(148,163,184,0.15)" />
        <Controls className="!bg-[#111827]/90 !border-white/10 !shadow-xl [&_button]:!text-slate-200" />
        <MiniMap
          className="!bg-[#0D1220]/90 !border !border-white/10 rounded-lg overflow-hidden"
          maskColor="rgba(8,11,20,0.65)"
        />
      </ReactFlow>
    </div>
  );
}

export function LifeMap({ graphId }: { graphId: string }) {
  return (
    <ReactFlowProvider>
      <LifeMapInner graphId={graphId} />
    </ReactFlowProvider>
  );
}
