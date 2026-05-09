"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { showGoogle: boolean };

export function LoginForm({ showGoogle }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Неверный email или пароль");
      return;
    }
    router.push("/life");
    router.refresh();
  }

  async function onGoogle() {
    setError(null);
    setLoading(true);
    await signIn("google", { callbackUrl: "/life" });
    setLoading(false);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1220]/90 p-8 shadow-2xl backdrop-blur">
      <h1 className="text-2xl font-bold text-slate-100">Вход</h1>
      <p className="text-sm text-slate-500 mt-1">LIFE — ваш стратегический граф</p>
      {showGoogle ? (
        <>
          <button
            type="button"
            disabled={loading}
            onClick={() => void onGoogle()}
            className="mt-6 w-full rounded-lg border border-white/15 bg-white/[0.06] py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/10 disabled:opacity-50"
          >
            Войти через Google
          </button>
          <p className="mt-4 text-center text-xs text-slate-500">или email и пароль</p>
        </>
      ) : null}
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
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
          <label className="text-xs text-slate-400">Пароль</label>
          <input
            type="password"
            required
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
          {loading ? "…" : "Войти"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        Нет аккаунта?{" "}
        <Link href="/register" className="text-indigo-400 hover:underline">
          Регистрация
        </Link>
      </p>
    </div>
  );
}
