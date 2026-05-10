"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Ссылка недействительна — токен не найден.");
      return;
    }
    if (password.length < 8) {
      setError("Минимум 8 символов.");
      return;
    }
    if (password !== confirm) {
      setError("Пароли не совпадают.");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/v1/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    setLoading(false);

    if (!res.ok) {
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      const msg =
        j.error === "TOKEN_EXPIRED"
          ? "Ссылка устарела — запросите новую."
          : j.error === "TOKEN_USED"
            ? "Эта ссылка уже была использована."
            : j.error === "INVALID_TOKEN"
              ? "Ссылка недействительна."
              : "Не удалось сбросить пароль.";
      setError(msg);
      return;
    }

    setDone(true);
  }

  if (done) {
    return (
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1220]/90 p-8 shadow-2xl backdrop-blur">
        <h1 className="text-2xl font-bold text-slate-100">Готово</h1>
        <p className="text-sm text-slate-400 mt-2">Пароль обновлён. Можно войти.</p>
        <button
          type="button"
          onClick={() => {
            void signIn();
            router.push("/login");
          }}
          className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          Войти
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1220]/90 p-8 shadow-2xl backdrop-blur">
      <h1 className="text-2xl font-bold text-slate-100">Новый пароль</h1>
      <p className="text-sm text-slate-500 mt-1">Минимум 8 символов.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-xs text-slate-400">Новый пароль</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400">Подтвердите пароль</label>
          <input
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
        </div>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "…" : "Сохранить"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/login" className="text-indigo-400 hover:underline">
          ← Назад ко входу
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
