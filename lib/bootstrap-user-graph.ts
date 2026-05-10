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

  const self = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/self`,
      title: "Я",
      category: "SELF",
      status: "ACTIVE",
      priority: "CRITICAL",
      timeHorizon: "LIFE",
      energy: "STEADY",
      size: "XL",
      depth: 0,
      positionX: 0,
      positionY: 0,
      icon: "★",
      color: "#FFFFFF",
    },
  });

  const goal = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/goal-1`,
      title: "Финансовая независимость",
      category: "GOAL",
      status: "ACTIVE",
      priority: "HIGH",
      timeHorizon: "DECADE",
      energy: "STEADY",
      size: "LG",
      parentId: self.id,
      depth: 1,
      progress: 12,
      positionX: 320,
      positionY: -120,
      color: "#6366F1",
    },
  });

  const asset = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/asset-1`,
      title: "Накопления",
      category: "ASSET",
      status: "ACTIVE",
      priority: "HIGH",
      timeHorizon: "YEAR",
      energy: "STEADY",
      size: "MD",
      parentId: self.id,
      depth: 1,
      positionX: 320,
      positionY: 120,
      color: "#10B981",
      financialData: { amount: 250000, currency: "RUB", category: "Liquid" },
    },
  });

  const income = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/income-1`,
      title: "Зарплата",
      category: "INCOME",
      status: "ACTIVE",
      priority: "HIGH",
      timeHorizon: "MONTH",
      energy: "BURST",
      size: "MD",
      parentId: self.id,
      depth: 1,
      positionX: -320,
      positionY: 0,
      color: "#34D399",
      financialData: { amount: 180000, currency: "RUB", cadence: "MONTHLY" },
    },
  });

  const habit = await tx.node.create({
    data: {
      graphId: graph.id,
      userId,
      path: `/root/${graph.id}/habit-1`,
      title: "Откладывать 20%",
      category: "HABIT",
      status: "ACTIVE",
      priority: "MEDIUM",
      timeHorizon: "MONTH",
      energy: "STEADY",
      size: "SM",
      parentId: self.id,
      depth: 1,
      positionX: 0,
      positionY: 220,
      color: "#22D3EE",
    },
  });

  await tx.edge.createMany({
    data: [
      {
        graphId: graph.id,
        userId,
        sourceId: income.id,
        targetId: asset.id,
        type: "FUNDS",
        label: "20%",
        strength: 0.8,
        isAnimated: true,
      },
      {
        graphId: graph.id,
        userId,
        sourceId: asset.id,
        targetId: goal.id,
        type: "SUPPORTS",
        strength: 0.9,
      },
      {
        graphId: graph.id,
        userId,
        sourceId: habit.id,
        targetId: asset.id,
        type: "GENERATES",
        label: "+",
        strength: 0.7,
        isAnimated: true,
      },
    ],
  });
}
