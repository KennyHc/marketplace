"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "motion/react";
import { PackageCheck, Leaf, Timer, type LucideIcon } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

const fmt = (n: number, decimals: number) =>
  n.toLocaleString("es-ES", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

function CountUp({ to, decimals = 0, suffix = "" }: { to: number; decimals?: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: setValue });
    return () => controls.stop();
  }, [inView, to]);

  return (
    <span ref={ref} className="tabular-nums">
      {fmt(value, decimals)}
      {suffix}
    </span>
  );
}

const STATS: { icon: LucideIcon; to: number; decimals?: number; suffix: string; label: string }[] = [
  { icon: PackageCheck, to: 1200, suffix: "+", label: "artículos reutilizados" },
  { icon: Leaf, to: 8.4, decimals: 1, suffix: " t", label: "de CO₂ evitadas" },
  { icon: Timer, to: 92, suffix: "%", label: "de ventas en menos de 1 semana" },
];

export function Impact() {
  return (
    <FadeIn className="overflow-hidden rounded-3xl border border-line bg-surface p-6 shadow-md sm:p-10">
      <div className="text-center">
        <p className="eyebrow">Impacto</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Resultados que caben en tu informe</h2>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {STATS.map(({ icon: Icon, to, decimals, suffix, label }) => (
          <div key={label} className="rounded-2xl bg-brand-softer p-5 text-center">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon size={20} strokeWidth={1.75} />
            </span>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-brand">
              <CountUp to={to} decimals={decimals} suffix={suffix} />
            </p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-xs text-subtle">
        Ejemplo ilustrativo para una organización de 1.000 personas. No son datos reales.
      </p>
    </FadeIn>
  );
}
