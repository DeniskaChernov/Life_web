import {
  applyEdgeChanges,
  applyNodeChanges,
  type EdgeChange,
  type NodeChange,
} from "@xyflow/react";
import type { Edge as DbEdge, Node as DbNode } from "@prisma/client";
import { create } from "zustand";
import { type LifeFlowEdge, type LifeFlowNode, toFlowNode, toFlowEdge } from "@/types/graph";
import type { TimeHorizon } from "@/constants/node-categories";

export interface ContextMenuState {
  x: number;
  y: number;
  kind: "node" | "edge";
  targetId: string;
}

type GraphState = {
  graphId: string | null;
  graphName: string;
  nodes: LifeFlowNode[];
  edges: LifeFlowEdge[];
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  selectedNodeIds: string[];
  hoveredNodeId: string | null;
  timeHorizonFilter: TimeHorizon | "ALL";
  contextMenu: ContextMenuState | null;

  reset: (graphId: string, graphName: string, nodes: LifeFlowNode[], edges: LifeFlowEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedEdgeId: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setHoveredNodeId: (id: string | null) => void;
  setTimeHorizonFilter: (h: TimeHorizon | "ALL") => void;
  openContextMenu: (m: ContextMenuState) => void;
  closeContextMenu: () => void;

  onNodesChange: (changes: NodeChange<LifeFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<LifeFlowEdge>[]) => void;
  addEdgeLocal: (edge: LifeFlowEdge) => void;
  removeEdge: (edgeId: string) => void;
  updateNodeDb: (nodeId: string, db: DbNode) => void;
  updateEdgeDb: (edgeId: string, db: DbEdge) => void;
};

export const useGraphStore = create<GraphState>((set) => ({
  graphId: null,
  graphName: "",
  nodes: [],
  edges: [],
  selectedNodeId: null,
  selectedEdgeId: null,
  selectedNodeIds: [],
  hoveredNodeId: null,
  timeHorizonFilter: "ALL",
  contextMenu: null,

  reset: (graphId, graphName, nodes, edges) =>
    set({
      graphId,
      graphName,
      nodes,
      edges,
      selectedNodeId: null,
      selectedEdgeId: null,
      selectedNodeIds: [],
      hoveredNodeId: null,
      contextMenu: null,
    }),

  setSelectedNodeId: (id) =>
    set((s) => ({
      selectedNodeId: id,
      selectedEdgeId: null,
      selectedNodeIds: id ? [id] : [],
      contextMenu: null,
      // ReactFlow visual selection sync
      nodes: s.nodes.map((n) => ({ ...n, selected: n.id === id })),
      edges: s.edges.map((e) => ({ ...e, selected: false })),
    })),

  setSelectedEdgeId: (id) =>
    set((s) => ({
      selectedEdgeId: id,
      selectedNodeId: null,
      selectedNodeIds: [],
      contextMenu: null,
      nodes: s.nodes.map((n) => ({ ...n, selected: false })),
      edges: s.edges.map((e) => ({ ...e, selected: e.id === id })),
    })),

  setSelectedNodeIds: (ids) =>
    set((s) => ({
      selectedNodeIds: ids,
      selectedNodeId: ids.length === 1 ? ids[0] : null,
      selectedEdgeId: null,
      contextMenu: null,
      nodes: s.nodes.map((n) => ({ ...n, selected: ids.includes(n.id) })),
    })),

  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),

  setTimeHorizonFilter: (h) => set({ timeHorizonFilter: h }),

  openContextMenu: (m) => set({ contextMenu: m }),
  closeContextMenu: () => set({ contextMenu: null }),

  onNodesChange: (changes) => {
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as LifeFlowNode[] }));
  },

  onEdgesChange: (changes) => {
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) as LifeFlowEdge[] }));
  },

  addEdgeLocal: (edge) =>
    set((s) => ({
      edges: [...s.edges, edge],
    })),

  removeEdge: (edgeId) =>
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: s.selectedEdgeId === edgeId ? null : s.selectedEdgeId,
    })),

  updateNodeDb: (nodeId, db) =>
    set((s) => ({
      nodes: s.nodes.map((n) => {
        if (n.id !== nodeId) return n;
        const next = toFlowNode(db);
        // preserve transient ReactFlow fields
        return {
          ...next,
          selected: n.selected,
          dragging: n.dragging,
        };
      }),
    })),

  updateEdgeDb: (edgeId, db) =>
    set((s) => ({
      edges: s.edges.map((e) => {
        if (e.id !== edgeId) return e;
        const next = toFlowEdge(db);
        return { ...next, selected: e.selected };
      }),
    })),
}));
