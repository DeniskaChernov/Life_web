"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      setError(j.error === "EMAIL_TAKEN" ? "Email уже занят" : "Ошибка регистрации");
      return;
    }
    const sign = await signIn("credentials", { email, password, redirect: false });
    if (sign?.error) {
      setError("Аккаунт создан, но вход не удался — войдите вручную.");
      return;
    }
    router.push("/life");
    router.refresh();
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1220]/90 p-8 shadow-2xl backdrop-blur">
      <h1 className="text-2xl font-bold text-slate-100">Регистрация</h1>
      <p className="text-sm text-slate-500 mt-1">Создаётся корневой граф с примерами узлов</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-slate-400">Имя (необязательно)</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Пароль (мин. 8 символов)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "…" : "Создать аккаунт"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Уже есть аккаунт?{" "}
        <Link href="/login" className="text-indigo-400 hover:underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
