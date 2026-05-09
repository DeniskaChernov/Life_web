import type { Prisma } from "@prisma/client";

/** Демо-граф для нового пользователя (регистрация и первый вход через Google). */
export async function seedDemoGraphForUser(
  tx: Prisma.TransactionClient,
  userId: string,
): Promise<void> {
  const graph = await tx.graph.create({
    data: {
      userId,
      name: "Мой LIFE Map",
      description: "Корневой граф стратегии",
      isRoot: true,
    },
  });

  const n1 = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/goal-1`,
      title: "Финансовая независимость",
      category: "GOAL",
      status: "ACTIVE",
      positionX: 120,
      positionY: 80,
      color: "#6366F1",
      tags: [],
    },
  });

  const n2 = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/asset-1`,
      title: "Накопления",
      category: "ASSET",
      status: "FUTURE",
      positionX: 420,
      positionY: 200,
      color: "#10B981",
      tags: [],
    },
  });

  await tx.edge.create({
    data: {
      graphId: graph.id,
      userId,
      sourceId: n1.id,
      targetId: n2.id,
      type: "RELATED",
      label: "питает",
    },
  });
}
