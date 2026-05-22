"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useGraphStore } from "@/store/graph.store";
import { ANIMATION_CONFIG } from "@/constants/animations";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function send() {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, nodeId: selectedNodeId ?? undefined }),
      });
      const data = (await res.json()) as { response?: string; error?: string };
      if (data.response) {
        setMessages((m) => [...m, { role: "assistant", content: data.response! }]);
      } else {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Ошибка: ${data.error ?? "unknown"}` },
        ]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Не удалось подключиться к AI." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* FAB button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-16 right-4 z-30 w-11 h-11 rounded-full glass-panel-strong flex items-center justify-center text-lg hover:scale-105 transition-transform"
        title="AI Стратег"
      >
        ✦
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            key="ai-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={ANIMATION_CONFIG.spring.snappy}
            className="fixed bottom-32 right-4 z-30 w-[min(400px,92vw)] h-[480px] glass-panel-strong rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <div className="text-sm font-semibold text-slate-100">AI Стратег</div>
                <div className="text-[10px] text-slate-500">
                  {selectedNodeId ? "Контекст: выбранный узел" : "Контекст: весь граф"}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-slate-500 hover:text-slate-200 text-lg"
              >
                ×
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 ? (
                <div className="text-slate-500 text-sm text-center mt-8">
                  <div className="text-2xl mb-2">✦</div>
                  <div>Задайте стратегический вопрос</div>
                  <div className="text-xs mt-1 text-slate-600">
                    AI видит ваш граф и даёт конкретные советы
                  </div>
                </div>
              ) : null}
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-xl px-3 py-2 text-sm max-w-[85%] leading-relaxed ${
                      msg.role === "user"
                        ? "bg-indigo-600/80 text-white"
                        : "bg-white/6 text-slate-200 border border-white/8"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="rounded-xl px-3 py-2 text-sm bg-white/6 border border-white/8 text-slate-400">
                    <span className="animate-pulse">Анализирую граф…</span>
                  </div>
                </div>
              ) : null}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 pb-3 pt-2 border-t border-white/10">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      void send();
                    }
                  }}
                  placeholder="Задайте вопрос…"
                  className="flex-1 rounded-lg bg-black/30 border border-white/10 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50"
                />
                <button
                  type="button"
                  onClick={() => void send()}
                  disabled={loading || !input.trim()}
                  className="rounded-lg bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-500 disabled:opacity-40"
                >
                  →
                </button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
