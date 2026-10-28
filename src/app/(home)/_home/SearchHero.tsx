"use client";

import { Search } from "lucide-react";
import { FadeIn } from "@/components/ui/motion";

export default function SearchHero({ org, q, cat }: { org: string; q: string; cat?: string }) {
  return (
    <section className="pb-6 pt-8 sm:pb-8 sm:pt-12">
      <FadeIn>
        <p className="eyebrow">{org}</p>
        <h1 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Encuentra algo bueno, a un pasillo de distancia
        </h1>
        <p className="mt-3 max-w-xl text-muted">
          El mercado de segunda mano de tu organización: compra y vende con compañeros de confianza.
        </p>
      </FadeIn>
      <FadeIn delay={0.1}>
        <form action="/" method="get" className="relative mt-6 max-w-2xl">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <Search
            size={20}
            strokeWidth={1.75}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle"
          />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Busca libros, muebles, electrónica…"
            aria-label="Buscar"
            className="h-14 w-full rounded-2xl border border-line bg-surface pl-12 pr-28 text-base shadow-md outline-none transition-[border-color,box-shadow] placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand/15"
          />
          <button type="submit" className="btn-primary absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-xl px-4">
            Buscar
          </button>
        </form>
      </FadeIn>
    </section>
  );
}
