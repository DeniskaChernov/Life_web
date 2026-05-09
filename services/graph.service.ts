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

export async function patchNode(
  nodeId: string,
  body: Record<string, unknown>,
): Promise<{ node: DbNode }> {
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

export async function createNode(body: {
  graphId: string;
  title: string;
  category: string;
  positionX: number;
  positionY: number;
}): Promise<{ node: DbNode }> {
  const res = await fetch("/api/v1/nodes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createNode: ${res.status}`);
  return parseJson<{ node: DbNode }>(res);
}

export async function createEdge(body: {
  graphId: string;
  sourceId: string;
  targetId: string;
}): Promise<{ edge: DbEdge }> {
  const res = await fetch("/api/v1/edges", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`createEdge: ${res.status}`);
  return parseJson<{ edge: DbEdge }>(res);
}

export async function deleteEdge(edgeId: string): Promise<void> {
  const res = await fetch(`/api/v1/edges/${edgeId}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`deleteEdge: ${res.status}`);
}
