"use client";

import Link from "next/link";
import { useState } from "react";
import { Check } from "lucide-react";
import { AnimatePresence, motion, SPRING, EASE } from "@/components/ui/motion";

type Cycle = "monthly" | "annual";

const MAIL = "mailto:hola@pasillo.app?subject=";

const COMMUNITY = ["Hasta 50 personas", "1 dominio de email", "Anuncios ilimitados", "Reputación y valoraciones"];
const COMPANY = [
  "Todo lo de Comunidad",
  "SSO con Google Workspace y Microsoft Entra",
  "Panel de administración y moderación",
  "Varias sedes y puntos de entrega",
  "Informe de impacto trimestral (CO₂, residuos, artículos reutilizados)",
  "Marca personalizada",
];
const CORPORATE = [
  "Todo lo de Empresa",
  "Varios dominios y organizaciones",
  "Venta de activos de la empresa a empleados (mobiliario, portátiles)",
  "Integración con HRIS",
  "Informes CSRD exportables",
  "Soporte prioritario y SLA",
];

function Features({ items, highlight }: { items: string[]; highlight?: boolean }) {
  return (
    <ul className="mt-6 space-y-3 text-sm">
      {items.map((f) => (
        <li key={f} className="flex items-start gap-2.5">
          <span
            className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ${
              highlight ? "bg-brand text-white" : "bg-brand-soft text-brand"
            }`}
          >
            <Check size={12} strokeWidth={2.5} />
          </span>
          <span className="text-foreground/90">{f}</span>
        </li>
      ))}
    </ul>
  );
}

function Price({ value, suffix, cycle }: { value: string; suffix: string; cycle: Cycle }) {
  return (
    <div className="mt-5 flex items-baseline gap-1.5">
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={value + cycle}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            className="block text-4xl font-semibold tracking-tight tabular-nums"
          >
            {value}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="text-sm text-muted">{suffix}</span>
    </div>
  );
}

export function Pricing() {
  const [cycle, setCycle] = useState<Cycle>("monthly");
  const annual = cycle === "annual";

  const card = "relative flex flex-col rounded-2xl border bg-surface p-6 sm:p-7";

  return (
    <div>
      <div className="flex justify-center">
        <div role="group" aria-label="Periodo de facturación" className="relative inline-flex rounded-full border border-line bg-surface p-1 shadow-xs">
          {(
            [
              ["monthly", "Mensual"],
              ["annual", "Anual"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setCycle(id)}
              aria-pressed={cycle === id}
              className={`relative z-0 flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition-colors ${
                cycle === id ? "text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {cycle === id && (
                <motion.span layoutId="billing-pill" transition={SPRING} className="absolute inset-0 -z-10 rounded-full bg-brand shadow-brand" />
              )}
              {label}
              {id === "annual" && (
                <span className={`badge px-2 py-0 ${cycle === id ? "bg-white/20 text-white" : "bg-success-soft text-success"}`}>-17%</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-muted">Con el plan anual tienes 2 meses gratis.</p>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-80px" }}
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        className="mt-10 grid gap-5 lg:grid-cols-3 lg:items-center"
      >
        {[0, 1, 2].map((i) => {
          const popular = i === 1;
          return (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
              }}
              className={popular ? "lg:scale-[1.04]" : ""}
            >
              <div
                className={`${card} h-full ${
                  popular ? "border-brand shadow-brand ring-4 ring-brand/10" : "border-line shadow-sm"
                }`}
              >
                {popular && (
                  <span className="badge absolute -top-3 left-6 bg-brand text-white shadow-brand">Más popular</span>
                )}
                {i === 0 && (
                  <>
                    <h3 className="text-lg font-semibold tracking-tight">Comunidad</h3>
                    <p className="mt-1 text-sm text-muted">Para asociaciones y equipos pequeños</p>
                    <Price value="0 €" suffix="para siempre" cycle={cycle} />
                    <Features items={COMMUNITY} />
                    <div className="mt-8 flex-1" />
                    <Link href="/login" className="btn-secondary w-full">Empezar gratis</Link>
                  </>
                )}
                {i === 1 && (
                  <>
                    <h3 className="text-lg font-semibold tracking-tight">Empresa</h3>
                    <p className="mt-1 text-sm text-muted">Para empresas de 50 a 2.000 personas</p>
                    <Price value={annual ? "1,25 €" : "1,50 €"} suffix="por persona / mes" cycle={cycle} />
                    <p className="mt-1 h-4 text-xs text-muted">{annual ? "Facturado anualmente" : "Facturado mensualmente"}</p>
                    <Features items={COMPANY} highlight />
                    <div className="mt-8 flex-1" />
                    <a href={`${MAIL}Solicitar%20demo%20de%20Pasillo`} className="btn-primary w-full">Solicitar demo</a>
                  </>
                )}
                {i === 2 && (
                  <>
                    <h3 className="text-lg font-semibold tracking-tight">Universidad / Corporate</h3>
                    <p className="mt-1 text-sm text-muted">Campus y grupos con varias sedes</p>
                    <Price value="A medida" suffix="" cycle={cycle} />
                    <Features items={CORPORATE} />
                    <div className="mt-8 flex-1" />
                    <a href={`${MAIL}Hablar%20con%20ventas%20de%20Pasillo`} className="btn-secondary w-full">Hablar con ventas</a>
                  </>
                )}
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
