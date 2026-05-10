"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ANIMATION_CONFIG } from "@/constants/animations";

interface Props {
  isAuthenticated: boolean;
}

const FEATURES = [
  {
    title: "Граф вместо списка",
    body: "Жизнь — это не to-do. Цели, активы, привычки и риски связаны. Видишь весь скелет стратегии, а не плоскую очередь задач.",
    icon: "◆",
    color: "#6366F1",
  },
  {
    title: "Финансы как часть карты",
    body: "Зарплата, недвижимость, инвестиции, расходы — узлы графа с реальными суммами. Видно куда текут деньги и какие цели они питают.",
    icon: "₽",
    color: "#10B981",
  },
  {
    title: "AI-стратег с контекстом",
    body: "Помощник видит весь твой граф целиком — связи, прогресс, дедлайны — и даёт совет, который имеет смысл именно для тебя.",
    icon: "✦",
    color: "#E879F9",
  },
];

const PRINCIPLES = [
  "Никаких телепортаций — все переходы плавные и кинематографичные",
  "Уровни детализации: от орбиты к поверхности в один скролл",
  "Hover-фокус: подсвечивается только то, что связано с выбранным узлом",
  "Cmd+K для всего — мгновенный поиск и команды",
];

export function Landing({ isAuthenticated }: Props) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-bg-base text-slate-100">
      {/* radial backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 600px at 50% -10%, rgba(99,102,241,0.18), transparent 60%), radial-gradient(700px 500px at 80% 110%, rgba(16,185,129,0.12), transparent 65%)",
        }}
      />

      {/* nav */}
      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-display font-bold tracking-tight text-lg">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-900"
            style={{
              background: "radial-gradient(circle at 30% 25%, #fff, #c7d2fe 60%, #6366F1 100%)",
              boxShadow: "0 0 20px rgba(99,102,241,0.5)",
            }}
          >
            ★
          </span>
          <span>LIFE</span>
        </div>
        <nav className="flex items-center gap-2 text-sm">
          {isAuthenticated ? (
            <Link
              href="/life"
              className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
            >
              Открыть мой граф →
            </Link>
          ) : (
            <>
              <Link href="/login" className="rounded-lg px-4 py-2 text-slate-300 hover:text-white">
                Войти
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-500"
              >
                Начать бесплатно
              </Link>
            </>
          )}
        </nav>
      </header>

      {/* hero */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-12 pb-20 text-center md:pt-20 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={ANIMATION_CONFIG.spring.soft}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          MVP в разработке · бесплатно
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ANIMATION_CONFIG.spring.soft, delay: 0.05 }}
          className="mt-6 font-display text-4xl font-bold tracking-tight md:text-6xl"
        >
          Стратегия как{" "}
          <span
            className="bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(120deg, #c7d2fe 0%, #818cf8 35%, #34d399 70%, #fbbf24 100%)",
            }}
          >
            живая система
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ANIMATION_CONFIG.spring.soft, delay: 0.12 }}
          className="mx-auto mt-5 max-w-2xl text-lg text-slate-400 md:text-xl"
        >
          Жизнь — это не плоский список задач. Это граф взаимосвязей: цели, активы, привычки, риски,
          отношения. LIFE даёт тебе карту, на которой видно всё сразу и где видно, как одно влияет
          на другое.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...ANIMATION_CONFIG.spring.soft, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          {isAuthenticated ? (
            <Link
              href="/life"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-glow-md hover:bg-indigo-500"
            >
              Открыть мой граф →
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-glow-md hover:bg-indigo-500"
              >
                Начать бесплатно →
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 py-3 text-base font-semibold text-slate-100 hover:bg-white/[0.08]"
              >
                У меня есть аккаунт
              </Link>
            </>
          )}
        </motion.div>
      </section>

      {/* features */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-4 md:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ ...ANIMATION_CONFIG.spring.soft, delay: 0.05 * i }}
              className="glass-panel rounded-2xl p-6"
              style={{
                boxShadow: `0 18px 60px -16px rgba(0,0,0,0.7), inset 0 0 0 1px ${f.color}22`,
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-xl font-bold"
                style={{
                  color: f.color,
                  background: `${f.color}1a`,
                  border: `1px solid ${f.color}55`,
                }}
              >
                {f.icon}
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* principles */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24">
        <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          Кинематографичный UX, а не админка
        </h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <motion.li
              key={p}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ ...ANIMATION_CONFIG.spring.soft, delay: 0.04 * i }}
              className="flex items-start gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 text-sm text-slate-300"
            >
              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-[11px] font-bold text-indigo-300">
                ✓
              </span>
              <span>{p}</span>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* final CTA */}
      <section className="relative z-10 mx-auto max-w-4xl px-6 pb-24 text-center">
        <div className="glass-panel-strong rounded-3xl p-10">
          <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
            Соберите карту своей жизни
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Бесплатный демо-граф готов в первую минуту после регистрации: ядро «Я», цели, активы,
            доходы и привычки уже связаны.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {isAuthenticated ? (
              <Link
                href="/life"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
              >
                К моему графу →
              </Link>
            ) : (
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white hover:bg-indigo-500"
              >
                Начать бесплатно →
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-slate-600">
        LIFE · MVP · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
