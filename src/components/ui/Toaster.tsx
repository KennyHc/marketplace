"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AlertCircle, CircleCheck, Info, X } from "lucide-react";
import { AnimatePresence, motion, SPRING } from "@/components/ui/motion";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; title: string; description?: string };

const DURATION = 3500;
const MAX_VISIBLE = 4;

// Module-level store so toasts survive client navigations.
let items: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const EMPTY: ToastItem[] = [];

function emit() {
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function add(kind: ToastKind, title: string, description?: string) {
  items = [...items, { id: nextId++, kind, title, description }].slice(-MAX_VISIBLE);
  emit();
}
function dismiss(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

export const toast = {
  success: (title: string, description?: string) => add("success", title, description),
  error: (title: string, description?: string) => add("error", title, description),
  info: (title: string, description?: string) => add("info", title, description),
};

const STYLES: Record<ToastKind, { circle: string; bar: string; Icon: typeof Info }> = {
  success: { circle: "bg-success-soft text-success", bar: "bg-success", Icon: CircleCheck },
  error: { circle: "bg-danger-soft text-danger", bar: "bg-danger", Icon: AlertCircle },
  info: { circle: "bg-brand-soft text-brand", bar: "bg-brand", Icon: Info },
};

function ToastCard({ t }: { t: ToastItem }) {
  const [paused, setPaused] = useState(false);
  const remaining = useRef(DURATION);
  const startedAt = useRef(0);

  useEffect(() => {
    if (paused) return;
    startedAt.current = Date.now();
    const timer = setTimeout(() => dismiss(t.id), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (Date.now() - startedAt.current));
    };
  }, [paused, t.id]);

  const { circle, bar, Icon } = STYLES[t.kind];

  return (
    <motion.div
      layout
      role={t.kind === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: 24, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96, transition: { duration: 0.18 } }}
      transition={SPRING}
      onHoverStart={() => setPaused(true)}
      onHoverEnd={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="pointer-events-auto relative w-full overflow-hidden rounded-2xl border border-line bg-surface shadow-lg"
    >
      <div className="flex items-start gap-3 p-3.5 pr-10">
        <span className={`grid size-9 shrink-0 place-items-center rounded-full ${circle}`}>
          <Icon size={18} strokeWidth={1.75} />
        </span>
        <div className="min-w-0 pt-0.5">
          <p className="text-sm font-semibold leading-snug">{t.title}</p>
          {t.description && <p className="mt-0.5 text-sm leading-snug text-muted">{t.description}</p>}
        </div>
      </div>
      <button
        type="button"
        onClick={() => dismiss(t.id)}
        aria-label="Cerrar notificación"
        className="absolute right-2 top-2 grid size-7 place-items-center rounded-lg text-subtle transition-colors hover:bg-surface-2 hover:text-foreground"
      >
        <X size={16} strokeWidth={1.75} />
      </button>
      <div className="absolute inset-x-0 bottom-0 h-0.5 bg-line/50">
        <div
          className={`h-full origin-left ${bar} opacity-70`}
          style={{
            animation: `toast-progress ${DURATION}ms linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
        />
      </div>
    </motion.div>
  );
}

export function Toaster() {
  const list = useSyncExternalStore(subscribe, () => items, () => EMPTY);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2.5 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end sm:px-0"
    >
      <style>{`@keyframes toast-progress{from{transform:scaleX(1)}to{transform:scaleX(0)}}`}</style>
      <AnimatePresence initial={false}>
        {list.map((t) => (
          <div key={t.id} className="flex w-full max-w-sm justify-center sm:justify-end">
            <ToastCard t={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
