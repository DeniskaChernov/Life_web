// LIFE_MASTER_BLUEPRINT.md — section 4.1 (16 node categories)

export const NODE_CATEGORY_VALUES = [
  "SELF",
  "GOAL",
  "PROJECT",
  "TASK",
  "HABIT",
  "ASSET",
  "FINANCIAL",
  "INCOME",
  "EXPENSE",
  "RISK",
  "OPPORTUNITY",
  "RELATIONSHIP",
  "SKILL",
  "EVENT",
  "INSIGHT",
  "NOTE",
] as const;
export type NodeCategory = (typeof NODE_CATEGORY_VALUES)[number];

export const NODE_STATUS_VALUES = [
  "FUTURE",
  "ACTIVE",
  "PAUSED",
  "BLOCKED",
  "COMPLETED",
  "ARCHIVED",
] as const;
export type NodeStatus = (typeof NODE_STATUS_VALUES)[number];

export const NODE_PRIORITY_VALUES = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "IDEA"] as const;
export type NodePriority = (typeof NODE_PRIORITY_VALUES)[number];

export const NODE_SIZE_VALUES = ["XS", "SM", "MD", "LG", "XL"] as const;
export type NodeSize = (typeof NODE_SIZE_VALUES)[number];

export const TIME_HORIZON_VALUES = [
  "DAY",
  "WEEK",
  "MONTH",
  "QUARTER",
  "YEAR",
  "DECADE",
  "LIFE",
] as const;
export type TimeHorizon = (typeof TIME_HORIZON_VALUES)[number];

export const NODE_ENERGY_VALUES = ["BURST", "STEADY", "DRAIN", "NEUTRAL"] as const;
export type NodeEnergy = (typeof NODE_ENERGY_VALUES)[number];

export const NODE_COLORS: Record<NodeCategory, string> = {
  SELF: "#FFFFFF",
  GOAL: "#6366F1",
  PROJECT: "#3B82F6",
  TASK: "#0EA5E9",
  HABIT: "#22D3EE",
  ASSET: "#10B981",
  FINANCIAL: "#F59E0B",
  INCOME: "#34D399",
  EXPENSE: "#FB7185",
  RISK: "#EF4444",
  OPPORTUNITY: "#A78BFA",
  RELATIONSHIP: "#F472B6",
  SKILL: "#FACC15",
  EVENT: "#FB923C",
  INSIGHT: "#E879F9",
  NOTE: "#94A3B8",
};

export const NODE_ICONS: Record<NodeCategory, string> = {
  SELF: "★",
  GOAL: "◆",
  PROJECT: "▣",
  TASK: "✓",
  HABIT: "↻",
  ASSET: "◉",
  FINANCIAL: "₽",
  INCOME: "↗",
  EXPENSE: "↘",
  RISK: "!",
  OPPORTUNITY: "✧",
  RELATIONSHIP: "♥",
  SKILL: "⚡",
  EVENT: "◷",
  INSIGHT: "✦",
  NOTE: "≡",
};

export const NODE_CATEGORY_LABELS: Record<NodeCategory, string> = {
  SELF: "Я",
  GOAL: "Цель",
  PROJECT: "Проект",
  TASK: "Задача",
  HABIT: "Привычка",
  ASSET: "Актив",
  FINANCIAL: "Финансы",
  INCOME: "Доход",
  EXPENSE: "Расход",
  RISK: "Риск",
  OPPORTUNITY: "Возможность",
  RELATIONSHIP: "Отношения",
  SKILL: "Навык",
  EVENT: "Событие",
  INSIGHT: "Инсайт",
  NOTE: "Заметка",
};

export const NODE_CATEGORY_GROUPS: Record<string, NodeCategory[]> = {
  Core: ["SELF", "GOAL", "PROJECT", "TASK", "HABIT"],
  Money: ["ASSET", "FINANCIAL", "INCOME", "EXPENSE"],
  People: ["RELATIONSHIP"],
  Future: ["OPPORTUNITY", "RISK", "EVENT"],
  Knowledge: ["SKILL", "INSIGHT", "NOTE"],
};

export const NODE_STATUS_LABELS: Record<NodeStatus, string> = {
  FUTURE: "Будущее",
  ACTIVE: "Активно",
  PAUSED: "Пауза",
  BLOCKED: "Блок",
  COMPLETED: "Готово",
  ARCHIVED: "Архив",
};

export const NODE_PRIORITY_LABELS: Record<NodePriority, string> = {
  CRITICAL: "Критично",
  HIGH: "Высокий",
  MEDIUM: "Средний",
  LOW: "Низкий",
  IDEA: "Идея",
};

export const TIME_HORIZON_LABELS: Record<TimeHorizon, string> = {
  DAY: "День",
  WEEK: "Неделя",
  MONTH: "Месяц",
  QUARTER: "Квартал",
  YEAR: "Год",
  DECADE: "Декада",
  LIFE: "Жизнь",
};

export const NODE_ENERGY_LABELS: Record<NodeEnergy, string> = {
  BURST: "Импульс",
  STEADY: "Ровно",
  DRAIN: "Истощение",
  NEUTRAL: "Нейтрально",
};
