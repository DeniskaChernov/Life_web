"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  timezone: string;
  currency: string;
}

const CURRENCIES = ["RUB", "USD", "EUR", "GBP", "CNY", "AED"];
const TIMEZONES = [
  "UTC",
  "Europe/Moscow",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Dubai",
  "Asia/Almaty",
  "Asia/Tashkent",
  "Asia/Tokyo",
];

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [currency, setCurrency] = useState("RUB");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/v1/user")
      .then((r) => r.json() as Promise<{ user?: UserProfile }>)
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name ?? "");
          setTimezone(data.user.timezone);
          setCurrency(data.user.currency);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/v1/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name || undefined, timezone, currency }),
      });
      if (!res.ok) {
        const d = (await res.json()) as { error?: string };
        setError(d.error ?? "Ошибка сохранения");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError("Сетевая ошибка");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-lg">
          <div className="mb-6">
            <h1 className="text-xl font-bold text-slate-100">Настройки</h1>
            <p className="text-sm text-slate-500 mt-0.5">Профиль и параметры аккаунта</p>
          </div>

          {loading ? (
            <div className="glass-panel rounded-xl p-8 text-center text-slate-500 text-sm">
              Загрузка…
            </div>
          ) : (
            <form onSubmit={(e) => void save(e)} className="space-y-4">
              {/* Email (read-only) */}
              <div className="glass-panel rounded-xl p-5 space-y-4">
                <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Профиль
                </h2>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Email</label>
                  <div className="rounded-lg bg-black/20 border border-white/5 px-3 py-2.5 text-sm text-slate-500 select-all">
                    {profile?.email}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Имя</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={100}
                    placeholder="Ваше имя"
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* Regional */}
              <div className="glass-panel rounded-xl p-5 space-y-4">
                <h2 className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                  Региональные настройки
                </h2>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Валюта</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Часовой пояс</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full rounded-lg bg-black/30 border border-white/10 px-3 py-2.5 text-sm text-slate-100 outline-none focus:border-indigo-500/60"
                  >
                    {TIMEZONES.map((tz) => (
                      <option key={tz} value={tz}>
                        {tz}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="rounded-xl px-5 py-2.5 text-sm font-medium border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white transition-colors"
                >
                  {saved ? "✓ Сохранено" : saving ? "Сохранение…" : "Сохранить"}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </AppShell>
  );
}
