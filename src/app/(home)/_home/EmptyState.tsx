"use client";

import Link from "next/link";
import { PackageSearch, Plus } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export default function EmptyState({ filtered }: { filtered: boolean }) {
  return (
    <FadeIn className="card flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-brand-soft text-brand">
        <PackageSearch size={28} strokeWidth={1.75} />
      </div>
      <h2 className="mt-5 text-lg font-semibold tracking-tight">
        {filtered ? "No hay anuncios que coincidan" : "Todavía no hay anuncios"}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-muted">
        {filtered ? "Prueba con otra búsqueda o quita los filtros." : "Sé el primero en publicar algo para tus compañeros."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {filtered && (
          <Link href="/" className="btn-secondary">
            Quitar filtros
          </Link>
        )}
        <Link href="/anuncios/nuevo" className="btn-primary">
          <Plus size={18} strokeWidth={1.75} />
          Publicar anuncio
        </Link>
      </div>
    </FadeIn>
  );
}
