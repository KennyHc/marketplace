"use client";

import { Building2, ShieldCheck, Star, Laptop, BookOpen, Sofa } from "lucide-react";
import { motion, FadeIn } from "@/components/ui/motion";

const PROPS = [
  { icon: ShieldCheck, text: "Solo compañeros verificados" },
  { icon: Building2, text: "Entrega en el mismo edificio" },
  { icon: Star, text: "Reputación visible" },
];

const CARDS = [
  { icon: Laptop, title: "Monitor 27 pulgadas", price: "120 €", className: "right-2 top-0 rotate-3", delay: 0 },
  { icon: BookOpen, title: "Apuntes de contabilidad", price: "15 €", className: "right-24 top-24 -rotate-2", delay: 1.2 },
  { icon: Sofa, title: "Silla de oficina", price: "45 €", className: "right-0 top-48 rotate-2", delay: 0.6 },
];

export function BrandPanel() {
  return (
    <div className="relative overflow-hidden bg-brand px-6 py-8 text-white sm:px-10 lg:flex lg:flex-col lg:justify-between lg:py-12">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-[#7c5cfc]/70 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(255_255_255/0.12)_1px,transparent_0)] [background-size:22px_22px]" />
      </div>

      <div className="relative">
        <FadeIn>
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            Pasillo
          </span>
          <h1 className="mt-4 max-w-md text-balance text-2xl font-semibold leading-tight tracking-tight sm:text-3xl lg:mt-6 lg:text-4xl">
            El mercado de segunda mano de tu organización
          </h1>
        </FadeIn>
        <ul className="mt-6 hidden space-y-3 sm:block lg:mt-10">
          {PROPS.map(({ icon: Icon, text }, i) => (
            <motion.li
              key={text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 text-[0.9375rem] font-medium"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
                <Icon size={18} strokeWidth={1.75} />
              </span>
              {text}
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="relative mt-10 hidden h-72 lg:block" aria-hidden>
        {CARDS.map(({ icon: Icon, title, price, className, delay }) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: [0, -8, 0] }}
            transition={{
              opacity: { duration: 0.6, delay: 0.5 + delay * 0.2 },
              y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
            }}
            className={`absolute flex w-60 items-center gap-3 rounded-2xl bg-white p-3 text-foreground shadow-lg ${className}`}
          >
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-brand-soft text-brand">
              <Icon size={22} strokeWidth={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium">{title}</span>
              <span className="block text-sm font-semibold tabular-nums">{price}</span>
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
