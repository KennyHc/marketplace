"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion, EASE } from "@/components/ui/motion";

const ITEMS = [
  { q: "¿Los empleados pagan algo?", a: "No, nunca. La organización cubre la suscripción; para las personas de tu equipo Pasillo es siempre gratis." },
  { q: "¿Cómo se gestionan los pagos entre compañeros?", a: "En mano o por Bizum al entregar el artículo. Pasillo no cobra comisión por las ventas." },
  { q: "¿Qué datos necesitáis?", a: "Solo el dominio de email de tu organización. El SSO es opcional y está disponible en el plan Empresa." },
  { q: "¿Cumple con el RGPD?", a: "Sí. Los datos se alojan en la UE y el teléfono solo se muestra al pulsar “Ver teléfono”, quedando registrado cada acceso." },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
      {ITEMS.map((it, i) => {
        const isOpen = open === i;
        return (
          <div key={it.q}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition-colors hover:bg-brand-softer"
            >
              {it.q}
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25, ease: EASE }} className="text-muted">
                <ChevronDown size={18} strokeWidth={1.75} />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 text-sm leading-relaxed text-muted">{it.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
