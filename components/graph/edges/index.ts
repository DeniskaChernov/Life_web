import type { EdgeTypes } from "@xyflow/react";
import { BaseEdgeRenderer } from "./BaseEdge";
import { FundsEdge } from "./FundsEdge";
import { RisksEdge } from "./RisksEdge";

export const edgeTypes: EdgeTypes = {
  base: BaseEdgeRenderer,
  funds: FundsEdge,
  risks: RisksEdge,
};

export { BaseEdgeRenderer, FundsEdge, RisksEdge };
