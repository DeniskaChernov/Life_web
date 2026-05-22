"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#05060B] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel-strong rounded-2xl p-10 max-w-sm w-full">
        <div className="text-3xl mb-3">⚠</div>
        <h1 className="text-lg font-semibold text-slate-200 mb-1">Что-то пошло не так</h1>
        <p className="text-sm text-slate-500 mb-6">
          Произошла непредвиденная ошибка. Попробуйте обновить страницу.
        </p>
        <button
          onClick={reset}
          className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          Попробовать снова
        </button>
      </div>
    </div>
  );
}
