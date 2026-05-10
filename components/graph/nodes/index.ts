import type { NodeTypes } from "@xyflow/react";
import { BaseNode } from "./BaseNode";
import { SelfNode } from "./SelfNode";
import { FinancialNode } from "./FinancialNode";

export const nodeTypes: NodeTypes = {
  base: BaseNode,
  self: SelfNode,
  financial: FinancialNode,
};

export { BaseNode, SelfNode, FinancialNode };
