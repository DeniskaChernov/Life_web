"use client";

import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { LifeMap } from "@/components/graph/LifeMap";
import { RightPanel } from "@/components/panels/RightPanel";
import { BreadcrumbNav } from "@/components/graph/controls/BreadcrumbNav";

export default function LifeGraphPage() {
  const params = useParams();
  const graphId = params.graphId as string;

  return (
    <AppShell>
      <div className="flex flex-1 flex-col min-h-0">
        <BreadcrumbNav graphId={graphId} />
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 relative min-h-0">
            <LifeMap graphId={graphId} />
          </div>
          <RightPanel />
        </div>
      </div>
    </AppShell>
  );
}
