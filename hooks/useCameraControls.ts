"use client";

import { useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import { useGraphStore } from "@/store/graph.store";
import { ANIMATION_CONFIG } from "@/constants/animations";

/** Cinematic camera moves — "no teleportation" principle (LIFE_MASTER_BLUEPRINT.md, section 5.2). */
export function useCameraControls() {
  const rf = useReactFlow();

  const flyToNode = useCallback(
    (nodeId: string, zoom = 1.5) => {
      const node = useGraphStore.getState().nodes.find((n) => n.id === nodeId);
      if (!node) return;
      rf.setCenter(node.position.x, node.position.y, {
        zoom,
        duration: ANIMATION_CONFIG.camera.flyToNode,
      });
    },
    [rf],
  );

  const flyToHome = useCallback(() => {
    const self = useGraphStore.getState().nodes.find((n) => n.data.db.category === "SELF");
    if (self) {
      rf.setCenter(self.position.x, self.position.y, {
        zoom: 1.2,
        duration: ANIMATION_CONFIG.camera.flyHome,
      });
    } else {
      rf.fitView({ duration: ANIMATION_CONFIG.camera.flyHome, padding: 0.2 });
    }
  }, [rf]);

  const overview = useCallback(() => {
    rf.fitView({ duration: ANIMATION_CONFIG.camera.overview, padding: 0.15 });
  }, [rf]);

  const zoomBy = useCallback(
    (factor: number) => {
      const z = rf.getZoom() * factor;
      rf.zoomTo(z, { duration: ANIMATION_CONFIG.camera.flyToNode });
    },
    [rf],
  );

  return { flyToNode, flyToHome, overview, zoomBy };
}
