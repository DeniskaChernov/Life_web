"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PROPERTY_LIFECYCLE_VALUES,
  PROPERTY_TYPE_VALUES,
  type PropertyAddress,
  type PropertyLifecycleStatus,
  type PropertyType,
} from "@/types/property.types";

interface PropertyRecord {
  id: string;
  nodeId: string;
  type: PropertyType;
  address: PropertyAddress;
  areaSqm: number | null;
  currentEstimatedValue: number | null;
  purchasePrice: number | null;
  lifecycleStatus: PropertyLifecycleStatus;
  mortgageData: { monthlyPayment?: number; rate?: number } | null;
}

function formatRub(n: number | null | undefined) {
  if (n == null) return "—";
  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatAddress(addr: PropertyAddress) {
  return [addr.city, addr.district, addr.street, addr.building].filter(Boolean).join(", ");
}

export function PropertyCard({ nodeId }: { nodeId: string }) {
  const [property, setProperty] = useState<PropertyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: "apartment" as PropertyType,
    city: "",
    street: "",
    areaSqm: "",
    currentEstimatedValue: "",
    lifecycleStatus: "OWNED" as PropertyLifecycleStatus,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/properties");
      const data = (await res.json()) as { properties?: PropertyRecord[] };
      const match = data.properties?.find((p) => p.nodeId === nodeId) ?? null;
      setProperty(match);
      setShowForm(!match);
    } catch {
      setProperty(null);
    } finally {
      setLoading(false);
    }
  }, [nodeId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/v1/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodeId,
          type: form.type,
          address: { city: form.city, street: form.street },
          areaSqm: form.areaSqm ? Number(form.areaSqm) : undefined,
          currentEstimatedValue: form.currentEstimatedValue
            ? Number(form.currentEstimatedValue)
            : undefined,
          lifecycleStatus: form.lifecycleStatus,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        await load();
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) {
    return <p className="text-xs text-slate-500 animate-pulse">Загрузка объекта…</p>;
  }

  if (property && !showForm) {
    const mortgage = property.mortgageData;
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            Объект недвижимости
          </span>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="text-[10px] text-indigo-400 hover:text-indigo-300"
          >
            редактировать
          </button>
        </div>
        <p className="text-sm text-slate-200">
          {formatAddress(property.address) || "Адрес не указан"}
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-slate-500">Оценка</span>
            <p className="font-mono text-emerald-300">
              {formatRub(property.currentEstimatedValue)}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Покупка</span>
            <p className="font-mono text-slate-300">{formatRub(property.purchasePrice)}</p>
          </div>
          {property.areaSqm ? (
            <div>
              <span className="text-slate-500">Площадь</span>
              <p className="text-slate-300">{property.areaSqm} м²</p>
            </div>
          ) : null}
          <div>
            <span className="text-slate-500">Статус</span>
            <p className="text-slate-300">{property.lifecycleStatus}</p>
          </div>
        </div>
        {mortgage?.monthlyPayment ? (
          <p className="text-xs text-slate-400">
            Ипотека: {formatRub(mortgage.monthlyPayment)}/мес
            {mortgage.rate != null ? ` · ${mortgage.rate}%` : ""}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleCreate(e)}
      className="rounded-xl border border-dashed border-white/15 p-3 space-y-2"
    >
      <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
        Карточка объекта
      </p>
      <select
        value={form.type}
        onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as PropertyType }))}
        className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-xs text-slate-100"
      >
        {PROPERTY_TYPE_VALUES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <input
        placeholder="Город"
        value={form.city}
        onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
        className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-xs text-slate-100"
      />
      <input
        placeholder="Улица, дом"
        value={form.street}
        onChange={(e) => setForm((f) => ({ ...f, street: e.target.value }))}
        className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-xs text-slate-100"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="м²"
          value={form.areaSqm}
          onChange={(e) => setForm((f) => ({ ...f, areaSqm: e.target.value }))}
          className="rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-xs text-slate-100"
        />
        <input
          type="number"
          placeholder="Оценка, ₽"
          value={form.currentEstimatedValue}
          onChange={(e) => setForm((f) => ({ ...f, currentEstimatedValue: e.target.value }))}
          className="rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-xs text-slate-100"
        />
      </div>
      <select
        value={form.lifecycleStatus}
        onChange={(e) =>
          setForm((f) => ({ ...f, lifecycleStatus: e.target.value as PropertyLifecycleStatus }))
        }
        className="w-full rounded-lg bg-black/30 border border-white/10 px-2 py-1.5 text-xs text-slate-100"
      >
        {PROPERTY_LIFECYCLE_VALUES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <div className="flex gap-2">
        {property ? (
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 rounded-lg border border-white/10 py-1.5 text-xs text-slate-400"
          >
            Отмена
          </button>
        ) : null}
        <button
          type="submit"
          disabled={creating || !form.city.trim()}
          className="flex-1 rounded-lg bg-indigo-600 py-1.5 text-xs font-medium text-white disabled:opacity-50"
        >
          {creating ? "…" : property ? "Обновить" : "Привязать объект"}
        </button>
      </div>
    </form>
  );
}
