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
            className="mt-6 w-full inline-flex items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/[0.06] py-2.5 text-sm font-semibold text-slate-100 hover:bg-white/10 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="#EA4335"
                d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
              />
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z"
              />
              <path
                fill="#FBBC05"
                d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"
              />
            </svg>
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
          <div className="flex items-center justify-between">
            <label className="text-xs text-slate-400">Пароль</label>
            <Link href="/forgot-password" className="text-xs text-slate-500 hover:text-indigo-400">
              Забыли пароль?
            </Link>
          </div>
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
