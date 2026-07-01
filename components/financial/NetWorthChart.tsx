"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Point {
  date: string;
  netWorth: number;
}

export function NetWorthChart({ data }: { data: Point[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-slate-500">
        Нет снимков Net Worth — добавьте первый через API или форму ниже.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "#94A3B8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1_000_000
                ? `${(v / 1_000_000).toFixed(1)}M`
                : v >= 1_000
                  ? `${(v / 1_000).toFixed(0)}k`
                  : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              background: "rgba(15,20,36,0.95)",
              border: "1px solid rgba(148,163,184,0.2)",
              borderRadius: 8,
              color: "#E2E8F0",
            }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : Number(value ?? 0);
              return [
                new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                  maximumFractionDigits: 0,
                }).format(n),
                "Net Worth",
              ];
            }}
          />
          <Line
            type="monotone"
            dataKey="netWorth"
            stroke="#6366F1"
            strokeWidth={2}
            dot={{ r: 3, fill: "#6366F1" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
