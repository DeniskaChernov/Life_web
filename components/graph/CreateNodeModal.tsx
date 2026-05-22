"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  NODE_CATEGORY_VALUES,
  NODE_CATEGORY_LABELS,
  NODE_ICONS,
  NODE_COLORS,
  type NodeCategory,
} from "@/constants/node-categories";
import { ANIMATION_CONFIG } from "@/constants/animations";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (title: string, category: NodeCategory, description: string) => void | Promise<void>;
}

export function CreateNodeModal({ open, onClose, onConfirm }: Props) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<NodeCategory>("GOAL");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || loading) return;
    setLoading(true);
    await onConfirm(title.trim(), category, description.trim());
    setLoading(false);
    setTitle("");
    setDescription("");
    setCategory("GOAL");
    onClose();
  }

  // Exclude SELF from the picker — there should only be one self node
  const selectableCategories = NODE_CATEGORY_VALUES.filter((c) => c !== "SELF").slice(0, 12);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="create-node-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={ANIMATION_CONFIG.tween.fast}
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <motion.form
            key="create-node-form"
            onSubmit={(e) => void handleSubmit(e)}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={ANIMATION_CONFIG.spring.snappy}
            className="relative glass-panel-strong rounded-2xl p-6 w-[min(480px,95vw)] space-y-5"
          >
            <div>
              <h2 className="text-base font-bold text-slate-100">Новый узел</h2>
              <p className="text-xs text-slate-500 mt-0.5">Добавьте элемент в свой граф жизни</p>
            </div>

            {/* Category selector */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                Категория
              </label>
              <div className="mt-2 grid grid-cols-4 gap-1.5">
                {selectableCategories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`flex flex-col items-center gap-1 rounded-xl p-2 text-center transition-all ${
                      category === c ? "ring-1" : "opacity-50 hover:opacity-80"
                    }`}
                    style={
                      category === c
                        ? {
                            background: `${NODE_COLORS[c]}18`,
                            borderColor: `${NODE_COLORS[c]}66`,
                          }
                        : { background: "rgba(255,255,255,0.04)" }
                    }
                  >
                    <span
                      className="text-base"
                      style={{ color: category === c ? NODE_COLORS[c] : undefined }}
                    >
                      {NODE_ICONS[c]}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium leading-none">
                      {NODE_CATEGORY_LABELS[c]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                Название
              </label>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`Например: ${NODE_CATEGORY_LABELS[category]} 2026`}
                maxLength={200}
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
              />
            </div>

            {/* Description */}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">
                Описание (необязательно)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Краткий контекст…"
                className="mt-2 w-full rounded-xl bg-black/30 border border-white/10 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 resize-none"
              />
            </div>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm text-slate-400 hover:bg-white/5 transition-colors"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={!title.trim() || loading}
                className="flex-1 rounded-xl py-2.5 text-sm font-semibold text-white disabled:opacity-40 transition-colors"
                style={{ background: `${NODE_COLORS[category]}cc` }}
              >
                {loading ? "…" : `Создать ${NODE_CATEGORY_LABELS[category]}`}
              </button>
            </div>
          </motion.form>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
