import type { LifeFlowEdge, LifeFlowNode } from "@/types/graph";

/** Returns ids of nodes within `hops` undirected edges from `focusedId` (inclusive). */
export function nodesWithinHops(
  nodes: LifeFlowNode[],
  edges: LifeFlowEdge[],
  focusedId: string,
  hops: number,
): Set<string> {
  const adj = new Map<string, Set<string>>();
  for (const e of edges) {
    if (!adj.has(e.source)) adj.set(e.source, new Set());
    if (!adj.has(e.target)) adj.set(e.target, new Set());
    adj.get(e.source)!.add(e.target);
    adj.get(e.target)!.add(e.source);
  }
  const out = new Set<string>([focusedId]);
  let frontier: string[] = [focusedId];
  for (let step = 0; step < hops; step++) {
    const next: string[] = [];
    for (const id of frontier) {
      const neigh = adj.get(id);
      if (!neigh) continue;
      for (const nb of neigh) {
        if (!out.has(nb)) {
          out.add(nb);
          next.push(nb);
        }
      }
    }
    if (next.length === 0) break;
    frontier = next;
  }
  // Make sure the focused node is also included even if isolated.
  if (nodes.some((n) => n.id === focusedId)) out.add(focusedId);
  return out;
}

/** Edges connecting two nodes both inside the focus set (used to highlight ray). */
export function edgesInsideSet(edges: LifeFlowEdge[], set: Set<string>): Set<string> {
  const out = new Set<string>();
  for (const e of edges) {
    if (set.has(e.source) && set.has(e.target)) out.add(e.id);
  }
  return out;
}
