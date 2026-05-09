"use client";

import Link from "next/link";
import { useGraphStore } from "@/store/graph.store";

export function BreadcrumbNav({ graphId }: { graphId: string }) {
  const graphName = useGraphStore((s) => s.graphName);

  return (
    <nav className="flex items-center gap-2 text-xs text-slate-400 px-4 py-2 border-b border-white/10 bg-black/20">
      <Link href="/life" className="hover:text-slate-200">
        LIFE
      </Link>
      <span className="opacity-40">/</span>
      <span className="text-slate-200 font-medium truncate max-w-[200px]">{graphName || "…"}</span>
      <span className="opacity-30 font-mono text-[10px] truncate max-w-[120px]">{graphId.slice(0, 8)}…</span>
    </nav>
  );
}
