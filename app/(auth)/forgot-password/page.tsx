"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
    } catch {
      /* ignore — we always show same message */
    }
    setLoading(false);
    setSent(true);
  }

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1220]/90 p-8 shadow-2xl backdrop-blur">
      <h1 className="text-2xl font-bold text-slate-100">Сброс пароля</h1>
      <p className="text-sm text-slate-500 mt-1">
        Укажите email — пришлём ссылку для сброса (действует 1 час).
      </p>

      {sent ? (
        <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Если такой email зарегистрирован — мы отправили ссылку для сброса. Проверьте почту и папку
          «Спам».
        </div>
      ) : (
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
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? "…" : "Отправить ссылку"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link href="/login" className="text-indigo-400 hover:underline">
          ← Назад ко входу
        </Link>
      </p>
    </div>
  );
}
