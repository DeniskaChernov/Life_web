"use client";

import { Sidebar } from "@/components/layout/Sidebar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen min-h-0 w-full overflow-hidden bg-[#080B14] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-0">{children}</div>
    </div>
  );
}
