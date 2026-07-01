"use client";

import { useCallback, useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { ScenarioParameters, ScenarioResults } from "@/types/scenario.types";

interface Scenario {
  id: string;
  name: string;
  description: string | null;
  type: string;
  parameters: ScenarioParameters;
  results: ScenarioResults | null;
  isActive: boolean;
  color: string | null;
}

const PRESETS = [
  {
    name: "+20% дохода",
    type: "INCOME_CHANGE",
    parameters: { incomeDeltaPercent: 20, horizonMonths: 12 },
  },
  {
    name: "−10% дохода",
    type: "INCOME_CHANGE",
    parameters: { incomeDeltaPercent: -10, horizonMonths: 12 },
  },
  {
    name: "Ставка +2%",
    type: "RATE_CHANGE",
    parameters: { interestRateDelta: 2, horizonMonths: 24 },
  },
] as const;

export function ScenarioPanel() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [activeResult, setActiveResult] = useState<ScenarioResults | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/scenarios");
      const data = (await res.json()) as { scenarios?: Scenario[] };
      setScenarios(data.scenarios ?? []);
    } catch {
      setScenarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function createPreset(preset: (typeof PRESETS)[number]) {
    const res = await fetch("/api/v1/scenarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: preset.name,
        type: preset.type,
        parameters: preset.parameters,
      }),
    });
    if (res.ok) await load();
  }

  async function runScenario(id: string) {
    setRunningId(id);
    try {
      const res = await fetch(`/api/v1/scenarios/${id}/run`, { method: "POST" });
      const data = (await res.json()) as { results?: ScenarioResults };
      if (data.results) setActiveResult(data.results);
      await load();
    } finally {
      setRunningId(null);
    }
  }

  return (
    <section className="glass-panel rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Сценарии «что если»</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Прогноз Net Worth при изменении дохода или ставки
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.name}
            type="button"
            onClick={() => void createPreset(p)}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5 transition-colors"
          >
            + {p.name}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-xs text-slate-500 animate-pulse">Загрузка сценариев…</p>
      ) : scenarios.length === 0 ? (
        <p className="text-sm text-slate-500">Создайте сценарий из пресета выше.</p>
      ) : (
        <ul className="space-y-2">
          {scenarios.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] border border-white/8 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm text-slate-200 truncate">{s.name}</p>
                {s.results?.summary ? (
                  <p className="text-[11px] text-slate-500 truncate">{s.results.summary}</p>
                ) : null}
              </div>
              <button
                type="button"
                disabled={runningId === s.id}
                onClick={() => void runScenario(s.id)}
                className="shrink-0 rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {runningId === s.id ? "…" : "Запустить"}
              </button>
            </li>
          ))}
        </ul>
      )}

      {activeResult?.series && activeResult.series.length > 0 ? (
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeResult.series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(148,163,184,0.1)" strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fill: "#94A3B8", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={48}
              />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.95)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="netWorth"
                stroke="#A78BFA"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </section>
  );
}
