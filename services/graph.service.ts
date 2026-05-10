import type { Edge as DbEdge, Graph, Node as DbNode } from "@prisma/client";

async function parseJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  if (!text) throw new Error("Empty response");
  return JSON.parse(text) as T;
}

export async function fetchGraph(
  graphId: string,
): Promise<Graph & { nodes: DbNode[]; edges: DbEdge[] }> {
  const res = await fetch(`/api/v1/graphs/${graphId}`);
  if (!res.ok) throw new Error(`fetchGraph: ${res.status}`);
  const data = await parseJson<{ graph: Graph & { nodes: DbNode[]; edges: DbEdge[] } }>(res);
  return data.graph;
}

export interface PatchNodePayload {
  title?: string;
  description?: string | null;
  category?: string;
  subCategory?: string | null;
  status?: string;
  priority?: string;
  timeHorizon?: string;
  energy?: string;
  size?: string;
  icon?: string | null;
  color?: string | null;
  tags?: string[];
  progress?: number;
  isPinned?: boolean;
  isCollapsed?: boolean;
  targetDate?: string | null;
  startDate?: string | null;
  positionX?: number;
  positionY?: number;
  financialData?: unknown;
  parentId?: string | null;
}

export async function patchNode(nodeId: string, body: PatchNodePayload): Promise<{ node: DbNode }> {
  const res = await fetch(`/api/v1/nodes/${nodeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`patchNode: ${res.status}`);
  return parseJson<{ node: DbNode }>(res);
}

export async function deleteNode(nodeId: string): Promise<void> {
  const res = await fetch(`/api/v1/nodes/${nodeId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteNode: ${res.status}`);
}

export interface CreateNodePayload {
  graphId: string;
  title: string;
  category: string;
  subCategory?: string;
  description?: string;
  status?: string;
  priority?: string;
  timeHorizon?: string;
  energy?: string;
  size?: string;
  icon?: string;
  color?: string;
  tags?: string[];
  positionX: number;
  positionY: number;
  parentId?: string;
  targetDate?: string;
  startDate?: string;
  financialData?: unknown;
}

export async function createNode(body: CreateNodePayload): Promise<{ node: DbNode }> {
  const res = await fetch("/api/v1/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createNode: ${res.status}`);
  return parseJson<{ node: DbNode }>(res);
}

export interface CreateEdgePayload {
  graphId: string;
  sourceId: string;
  targetId: string;
  type?: string;
  label?: string;
  description?: string;
  strength?: number;
  direction?: string;
}

export async function createEdge(body: CreateEdgePayload): Promise<{ edge: DbEdge }> {
  const res = await fetch("/api/v1/edges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createEdge: ${res.status}`);
  return parseJson<{ edge: DbEdge }>(res);
}

export interface PatchEdgePayload {
  type?: string;
  label?: string | null;
  description?: string | null;
  strength?: number;
  direction?: string;
  isAnimated?: boolean;
}

export async function patchEdge(edgeId: string, body: PatchEdgePayload): Promise<{ edge: DbEdge }> {
  const res = await fetch(`/api/v1/edges/${edgeId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`patchEdge: ${res.status}`);
  return parseJson<{ edge: DbEdge }>(res);
}

export async function deleteEdge(edgeId: string): Promise<void> {
  const res = await fetch(`/api/v1/edges/${edgeId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteEdge: ${res.status}`);
}
