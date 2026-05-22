import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#05060B] flex flex-col items-center justify-center p-6 text-center">
      <div className="glass-panel-strong rounded-2xl p-10 max-w-sm w-full">
        <div className="text-5xl font-bold text-slate-700 font-mono mb-2">404</div>
        <h1 className="text-lg font-semibold text-slate-200 mb-1">Страница не найдена</h1>
        <p className="text-sm text-slate-500 mb-6">
          Возможно, она была удалена или вы перешли по неверной ссылке.
        </p>
        <Link
          href="/life"
          className="inline-block rounded-xl bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
