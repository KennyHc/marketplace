import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircle, ArrowRight, Building2 } from "lucide-react";
import { LoginForm } from "./LoginForm";
import { BrandPanel } from "./BrandPanel";
import { BreathingBackground } from "@/components/ui/BreathingBackground";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  return (
    <>
    <BreathingBackground />
    <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-white/60 bg-surface/80 shadow-lg backdrop-blur-xl lg:min-h-[640px] lg:grid-cols-[1.05fr_1fr]">
      <BrandPanel />
      <div className="flex flex-col justify-center px-5 py-8 sm:px-10 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          {error && (
            <div className="error mb-4" role="alert">
              <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              El enlace no es válido o ha caducado. Inténtalo de nuevo.
            </div>
          )}
          <LoginForm />
          <Link
            href="/empresas"
            className="group mt-6 flex items-center gap-3 rounded-2xl border border-line bg-surface/70 p-3.5 text-sm transition-colors hover:border-brand/40 hover:bg-brand-softer"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
              <Building2 size={18} strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block font-medium">¿Tu organización aún no usa Pasillo?</span>
              <span className="text-muted">Planes para empresas y universidades</span>
            </span>
            <ArrowRight size={16} strokeWidth={1.75} className="text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand" />
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}
