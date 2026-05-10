"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  type Connection,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { nodeTypes } from "@/components/graph/nodes";
import { edgeTypes } from "@/components/graph/edges";
import { useGraphStore } from "@/store/graph.store";
import { toFlowEdge, toFlowNode, type LifeFlowEdge, type LifeFlowNode } from "@/types/graph";
import {
  NODE_CATEGORY_VALUES,
  type NodeCategory,
  type TimeHorizon,
} from "@/constants/node-categories";
import { EDGE_CULLING_PRIORITY_TYPES, type EdgeType } from "@/constants/edge-types";
import { EDGE_CULLING_ZOOM_THRESHOLD, isCategoryVisibleAtPreset } from "@/constants/zoom-levels";
import { useZoomPreset } from "@/hooks/useViewport";
import { createEdge, createNode, fetchGraph, patchNode } from "@/services/graph.service";

function LifeMapInner({ graphId }: { graphId: string }) {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const selectedEdgeId = useGraphStore((s) => s.selectedEdgeId);
  const timeHorizonFilter = useGraphStore((s) => s.timeHorizonFilter);
  const onNodesChange = useGraphStore((s) => s.onNodesChange);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);
  const reset = useGraphStore((s) => s.reset);
  const setSelected = useGraphStore((s) => s.setSelectedNodeId);
  const setSelectedEdge = useGraphStore((s) => s.setSelectedEdgeId);
  const addEdgeLocal = useGraphStore((s) => s.addEdgeLocal);

  const { zoom, preset } = useZoomPreset();

  const filteredNodes = useMemo<LifeFlowNode[]>(() => {
    return nodes.filter((n) => {
      const cat = n.data.db.category as NodeCategory;
      if (!isCategoryVisibleAtPreset(cat, preset)) return false;
      if (timeHorizonFilter !== "ALL") {
        const h = (n.data.db.timeHorizon || "MONTH") as TimeHorizon;
        if (h !== timeHorizonFilter) return false;
      }
      return true;
    });
  }, [nodes, preset, timeHorizonFilter]);

  const visibleNodeIds = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes]);

  const filteredEdges = useMemo<LifeFlowEdge[]>(() => {
    return edges
      .filter((e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target))
      .filter((e) => {
        if (zoom >= EDGE_CULLING_ZOOM_THRESHOLD) return true;
        const t = (e.data?.db.type as EdgeType | undefined) ?? "RELATED";
        return EDGE_CULLING_PRIORITY_TYPES.has(t);
      })
      .map((e) => ({ ...e, selected: e.id === selectedEdgeId }));
  }, [edges, visibleNodeIds, zoom, selectedEdgeId]);

  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<NodeCategory>("GOAL");
  const dragTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const graph = await fetchGraph(graphId);
        if (cancelled) return;
        reset(
          graph.id,
          graph.name,
          graph.nodes.map((n) => toFlowNode(n)),
          graph.edges.map((e) => toFlowEdge(e)),
        );
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [graphId, reset]);

  const flushPosition = useCallback(async (nodeId: string, x: number, y: number) => {
    try {
      await patchNode(nodeId, { positionX: x, positionY: y });
    } catch {
      /* ignore */
    }
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
      try {
        const { edge } = await createEdge({
          graphId: gid,
          sourceId: c.source,
          targetId: c.target,
        });
        addEdgeLocal(toFlowEdge(edge));
      } catch {
        /* ignore */
      }
    },
    [addEdgeLocal],
  );

  const onNodeClick = useCallback(
    (_: unknown, node: { id: string }) => {
      setSelected(node.id);
    },
    [setSelected],
  );

  const onEdgeClick = useCallback(
    (_: unknown, edge: { id: string }) => {
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge],
  );

  const onPaneClick = useCallback(() => {
    setSelected(null);
  }, [setSelected]);

  const createNodeAction = useCallback(async () => {
    const gid = useGraphStore.getState().graphId;
    if (!gid || !newTitle.trim()) return;
    const cx = 200 + Math.random() * 120;
    const cy = 120 + Math.random() * 120;
    try {
      const { node } = await createNode({
        graphId: gid,
        title: newTitle.trim(),
        category: newCategory,
        positionX: cx,
        positionY: cy,
      });
      const flow = toFlowNode(node);
      useGraphStore.setState((s) => ({ nodes: [...s.nodes, flow] }));
      setNewTitle("");
      setCreating(false);
    } catch {
      /* ignore */
    }
  }, [newTitle, newCategory]);

  return (
    <div className="relative w-full h-full min-h-0 flex flex-col">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-lg glass-panel px-3 py-1.5 text-sm font-medium text-slate-100 hover:bg-white/15"
        >
          {creating ? "Закрыть" : "+ Узел"}
        </button>
        {creating ? (
          <div className="flex items-center gap-2 rounded-lg glass-panel-strong px-3 py-2">
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
              onClick={() => void createNodeAction()}
              className="rounded bg-indigo-600 px-2 py-1 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Создать
            </button>
          </div>
        ) : null}
      </div>

      <ReactFlow
        nodes={filteredNodes}
        edges={filteredEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={(c) => void onConnect(c)}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.2}
        maxZoom={2.4}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1}
          color="rgba(148,163,184,0.12)"
        />
        <Controls />
        <MiniMap
          maskColor="rgba(8,11,20,0.7)"
          nodeStrokeColor={() => "rgba(255,255,255,0.4)"}
          nodeColor={(n) => {
            const node = n as unknown as LifeFlowNode;
            return node.data.db.color || "#475569";
          }}
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
