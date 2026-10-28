import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";
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
        </div>
      </div>
    </div>
    </>
  );
}
