import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Building2, Leaf, ShieldCheck } from "lucide-react";
import { BreathingBackground } from "@/components/ui/BreathingBackground";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { Pricing } from "./Pricing";
import { Impact } from "./Impact";
import { Faq } from "./Faq";

export const metadata: Metadata = {
  title: "Para empresas",
  description: "El mercado de segunda mano de tu organización: un beneficio para tus empleados y un impacto medible.",
};

const DEMO = "mailto:hola@pasillo.app?subject=Solicitar%20demo%20de%20Pasillo";

const VALUES = [
  { icon: ShieldCheck, title: "Solo tu organización", text: "Verificación por dominio de email: únicamente las personas de tu empresa o universidad entran." },
  { icon: Building2, title: "Sin envíos ni desplazamientos", text: "La entrega se hace en el mismo edificio, entre compañeros, en el pasillo o en la cafetería." },
  { icon: Leaf, title: "Impacto medible", text: "Artículos reutilizados, CO₂ y residuos evitados, listos para tu informe ESG/CSRD." },
];

export default function EmpresasPage() {
  return (
    <>
      <BreathingBackground />
      <div className="mx-auto max-w-6xl space-y-20 pb-16 sm:space-y-28">
        <section className="pt-6 text-center sm:pt-12">
          <Stagger className="mx-auto max-w-3xl" delay={0.1}>
            <StaggerItem>
              <span className="badge border border-brand/20 bg-brand-soft text-brand">
                <span className="eyebrow">Para empresas y universidades</span>
              </span>
            </StaggerItem>
            <StaggerItem>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                El mercado de segunda mano de tu organización, listo en un día
              </h1>
            </StaggerItem>
            <StaggerItem>
              <p className="mx-auto mt-5 max-w-2xl text-pretty text-base text-muted sm:text-lg">
                Un beneficio que tus empleados usan cada semana y un impacto de economía circular que puedes medir y
                reportar. Ellos nunca pagan: la organización contrata Pasillo.
              </p>
            </StaggerItem>
            <StaggerItem>
              <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <a href={DEMO} className="btn-primary btn-lg">
                  Solicitar demo
                  <ArrowRight size={18} strokeWidth={1.75} />
                </a>
                <Link href="/login" className="btn-secondary btn-lg">Probar gratis</Link>
              </div>
            </StaggerItem>
          </Stagger>
        </section>

        <section>
          <Stagger gap={0.1} className="grid gap-4 md:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, text }) => (
              <StaggerItem key={title} className="card bg-surface/90 p-6 backdrop-blur">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Icon size={22} strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 text-lg font-semibold tracking-tight">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
              </StaggerItem>
            ))}
          </Stagger>
        </section>

        <section id="precios" className="scroll-mt-20">
          <div className="mb-10 text-center">
            <p className="eyebrow">Precios</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Un plan para cada organización</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted">Sin permanencia. Los empleados siempre usan Pasillo gratis.</p>
          </div>
          <Pricing />
        </section>

        <section>
          <Impact />
        </section>

        <section className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <p className="eyebrow">Preguntas frecuentes</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">Lo que suelen preguntarnos</h2>
          </div>
          <Faq />
        </section>

        <section>
          <FadeIn className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand via-[#6a5cfc] to-[#7C5CFC] px-6 py-12 text-center text-white shadow-brand sm:px-12 sm:py-16">
            <div aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
            <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Lleva Pasillo a tu organización</h2>
            <p className="relative mx-auto mt-3 max-w-xl text-white/85">
              Te lo configuramos en un día: dominio verificado, puntos de entrega y comunicación para tu equipo.
            </p>
            <a href={DEMO} className="btn btn-lg relative mt-8 bg-white text-brand shadow-lg hover:bg-brand-softer">
              Solicitar demo
              <ArrowRight size={18} strokeWidth={1.75} />
            </a>
          </FadeIn>
        </section>
      </div>
    </>
  );
}
