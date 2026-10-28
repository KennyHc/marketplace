import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireCompleteProfile } from "@/lib/auth";
import ListingForm from "@/components/ListingForm";
import { FadeIn } from "@/components/ui/motion";

export default async function NuevoAnuncio() {
  await requireCompleteProfile();
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-foreground">
        <ArrowLeft size={16} strokeWidth={1.75} />
        Volver
      </Link>
      <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">Publicar anuncio</h1>
      <p className="mt-1.5 text-muted">Sube una foto y cuéntale a tus compañeros qué vendes.</p>
      <FadeIn delay={0.08} className="card mt-6 p-5 sm:p-7">
        <ListingForm />
      </FadeIn>
    </div>
  );
}
