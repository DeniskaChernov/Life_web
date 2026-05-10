"use client";

import { motion } from "framer-motion";
import { useGraphStore } from "@/store/graph.store";
import {
  TIME_HORIZON_VALUES,
  TIME_HORIZON_LABELS,
  type TimeHorizon,
} from "@/constants/node-categories";
import { ANIMATION_CONFIG } from "@/constants/animations";

const OPTIONS: ("ALL" | TimeHorizon)[] = ["ALL", ...TIME_HORIZON_VALUES];

export function TimeHorizonBar() {
  const value = useGraphStore((s) => s.timeHorizonFilter);
  const set = useGraphStore((s) => s.setTimeHorizonFilter);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={ANIMATION_CONFIG.spring.soft}
      className="absolute top-3 left-1/2 -translate-x-1/2 z-20 glass-panel rounded-full px-1 py-1 flex items-center gap-1"
    >
      {OPTIONS.map((opt) => {
        const label = opt === "ALL" ? "Всё" : TIME_HORIZON_LABELS[opt];
        const active = value === opt;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => set(opt)}
            className={[
              "relative px-3 py-1 rounded-full text-[11px] font-semibold transition-colors",
              active ? "text-slate-900" : "text-slate-300 hover:text-white",
            ].join(" ")}
          >
            {active ? (
              <motion.span
                layoutId="time-horizon-pill"
                transition={ANIMATION_CONFIG.spring.snappy}
                className="absolute inset-0 bg-white rounded-full"
              />
            ) : null}
            <span className="relative">{label}</span>
          </button>
        );
      })}
    </motion.div>
  );
}
