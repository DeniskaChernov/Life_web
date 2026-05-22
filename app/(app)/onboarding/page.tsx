"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { NODE_CATEGORY_LABELS, NODE_ICONS, NODE_COLORS } from "@/constants/node-categories";
import { ANIMATION_CONFIG } from "@/constants/animations";

// ── Шаг 1: Имя ────────────────────────────────────────────────────────────────

function StepName({ onNext }: { onNext: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Как вас зовут?</h2>
        <p className="text-sm text-slate-400 mt-1">Это имя будет отображаться в вашем LIFE Map</p>
      </div>
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && name.trim() && onNext(name.trim())}
        placeholder="Ваше имя или псевдоним"
        maxLength={100}
        className="w-full rounded-xl bg-white/5 border border-white/10 px-5 py-3.5 text-lg text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-colors"
      />
      <button
        onClick={() => name.trim() && onNext(name.trim())}
        disabled={!name.trim()}
        className="w-full rounded-xl py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-colors"
      >
        Продолжить →
      </button>
    </div>
  );
}

// ── Шаг 2: Главные приоритеты ─────────────────────────────────────────────────

const PRIORITY_NODES = [
  "GOAL",
  "FINANCIAL",
  "HABIT",
  "RELATIONSHIP",
  "SKILL",
  "ASSET",
  "PROJECT",
  "INSIGHT",
] as const;

function StepPriorities({ onNext }: { onNext: (cats: string[]) => void }) {
  const [selected, setSelected] = useState<string[]>([]);

  function toggle(c: string) {
    setSelected((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Что для вас важнее всего?</h2>
        <p className="text-sm text-slate-400 mt-1">
          Выберите от 1 до 4 приоритетов — они станут первыми узлами вашего графа
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {PRIORITY_NODES.map((c) => {
          const active = selected.includes(c);
          return (
            <button
              key={c}
              type="button"
              onClick={() => toggle(c)}
              disabled={!active && selected.length >= 4}
              className={`flex items-center gap-3 rounded-xl p-3.5 text-left transition-all ${
                active ? "ring-1" : "opacity-60 hover:opacity-90 disabled:opacity-30"
              }`}
              style={
                active
                  ? {
                      background: `${NODE_COLORS[c]}14`,
                      borderColor: `${NODE_COLORS[c]}55`,
                    }
                  : { background: "rgba(255,255,255,0.04)" }
              }
            >
              <span className="text-xl" style={{ color: active ? NODE_COLORS[c] : undefined }}>
                {NODE_ICONS[c]}
              </span>
              <span className="text-sm font-medium text-slate-200">{NODE_CATEGORY_LABELS[c]}</span>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => selected.length > 0 && onNext(selected)}
        disabled={selected.length === 0}
        className="w-full rounded-xl py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-colors"
      >
        Продолжить → ({selected.length} выбрано)
      </button>
    </div>
  );
}

// ── Шаг 3: Финансовая цель ────────────────────────────────────────────────────

const FINANCIAL_GOALS = [
  { id: "independence", label: "Финансовая независимость", icon: "🏔" },
  { id: "passive_income", label: "Пассивный доход", icon: "📈" },
  { id: "debt_free", label: "Закрыть все долги", icon: "✓" },
  { id: "first_million", label: "Первый миллион", icon: "💎" },
  { id: "home", label: "Купить жильё", icon: "🏠" },
  { id: "startup", label: "Запустить бизнес", icon: "🚀" },
];

function StepFinancialGoal({ onFinish }: { onFinish: (goal: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100">Главная финансовая цель?</h2>
        <p className="text-sm text-slate-400 mt-1">
          Это поможет AI давать более точные рекомендации
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2.5">
        {FINANCIAL_GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            onClick={() => setSelected(g.id)}
            className={`flex items-center gap-3 rounded-xl p-3.5 text-left transition-all ${
              selected === g.id
                ? "ring-1 ring-indigo-500/60 bg-indigo-500/10"
                : "bg-white/[0.04] opacity-70 hover:opacity-100"
            }`}
          >
            <span className="text-xl">{g.icon}</span>
            <span className="text-sm font-medium text-slate-200">{g.label}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onFinish("none")}
          className="flex-1 rounded-xl py-3 text-sm font-medium border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
        >
          Пропустить
        </button>
        <button
          onClick={() => selected && onFinish(selected)}
          disabled={!selected}
          className="flex-[2] rounded-xl py-3 text-base font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white transition-colors"
        >
          Начать работу →
        </button>
      </div>
    </div>
  );
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const STEPS = ["name", "priorities", "goal"] as const;
  const totalSteps = STEPS.length;

  async function finish(financialGoal: string) {
    setSaving(true);
    try {
      await fetch("/api/v1/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name || undefined,
          onboardingCompleted: true,
          settings: { priorities, financialGoal },
        }),
      });
    } catch {
      // non-blocking
    }
    router.push("/life");
  }

  return (
    <div className="min-h-screen bg-[#05060B] flex flex-col items-center justify-center p-6">
      {/* Прогресс */}
      <div className="w-full max-w-md mb-8">
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{
                background: i <= step ? "#6366F1" : "rgba(255,255,255,0.1)",
              }}
            />
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-widest">
          Шаг {step + 1} из {totalSteps}
        </p>
      </div>

      {/* Карточка */}
      <div className="w-full max-w-md glass-panel-strong rounded-2xl p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={ANIMATION_CONFIG.tween.base}
          >
            {step === 0 && (
              <StepName
                onNext={(n) => {
                  setName(n);
                  setStep(1);
                }}
              />
            )}
            {step === 1 && (
              <StepPriorities
                onNext={(cats) => {
                  setPriorities(cats);
                  setStep(2);
                }}
              />
            )}
            {step === 2 && <StepFinancialGoal onFinish={(g) => void finish(g)} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Логотип */}
      <div className="mt-8 text-center">
        <div className="text-slate-600 text-sm font-mono">LIFE · стратегия как система</div>
      </div>

      {saving && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass-panel-strong rounded-2xl px-8 py-6 text-slate-300 text-sm">
            Настраиваю ваш граф…
          </div>
        </div>
      )}
    </div>
  );
}
