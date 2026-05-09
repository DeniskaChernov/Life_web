import { applyEdgeChanges, applyNodeChanges, type EdgeChange, type NodeChange } from "@xyflow/react";
import { create } from "zustand";
import type { LifeFlowEdge, LifeFlowNode } from "@/types/graph";

type GraphState = {
  graphId: string | null;
  graphName: string;
  nodes: LifeFlowNode[];
  edges: LifeFlowEdge[];
  selectedNodeId: string | null;
  reset: (graphId: string, graphName: string, nodes: LifeFlowNode[], edges: LifeFlowEdge[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange<LifeFlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<LifeFlowEdge>[]) => void;
  addEdgeLocal: (edge: LifeFlowEdge) => void;
  removeEdge: (edgeId: string) => void;
  updateNodeDb: (nodeId: string, patch: Partial<LifeFlowNode["data"]["db"]>) => void;
};

export const useGraphStore = create<GraphState>((set) => ({
  graphId: null,
  graphName: "",
  nodes: [],
  edges: [],
  selectedNodeId: null,

  reset: (graphId, graphName, nodes, edges) =>
    set({ graphId, graphName, nodes, edges, selectedNodeId: null }),

  setSelectedNodeId: (id) => set({ selectedNodeId: id }),

  onNodesChange: (changes) => {
    set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) as LifeFlowNode[] }));
  },

  onEdgesChange: (changes) => {
    set((s) => ({ edges: applyEdgeChanges(changes, s.edges) }));
  },

  addEdgeLocal: (edge) =>
    set((s) => ({
      edges: [...s.edges, edge],
    })),

  removeEdge: (edgeId) =>
    set((s) => ({
      edges: s.edges.filter((e) => e.id !== edgeId),
    })),

  updateNodeDb: (nodeId, patch) =>
    set((s) => ({
      nodes: s.nodes.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              position:
                patch.positionX !== undefined || patch.positionY !== undefined
                  ? {
                      x: (patch.positionX as number | undefined) ?? n.position.x,
                      y: (patch.positionY as number | undefined) ?? n.position.y,
                    }
                  : n.position,
              data: {
                db: { ...n.data.db, ...patch },
              },
            }
          : n,
      ),
    })),
}));
