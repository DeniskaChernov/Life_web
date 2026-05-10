"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const links = [
  { href: "/life", label: "Life Map" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-white/10 bg-[#080B14] flex flex-col">
      <div className="p-4 border-b border-white/10">
        <div className="text-lg font-bold tracking-tight text-slate-100">LIFE</div>
        <div className="text-[11px] text-slate-500 mt-0.5">стратегия как система</div>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((l) => {
          const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-white/10 text-white"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-2 border-t border-white/10">
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/login" })}
          className="w-full rounded-lg px-3 py-2 text-left text-sm text-slate-400 hover:bg-white/5 hover:text-slate-200"
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
