import Link from "next/link";
import { ArrowRight, UserRound, X } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, categoryLabel } from "@/lib/types";
import SearchHero from "./_home/SearchHero";
import CategoryChips from "./_home/CategoryChips";
import ListingGrid, { type Row } from "./_home/ListingGrid";
import EmptyState from "./_home/EmptyState";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; cat?: string | string[] }>;
}) {
  const sp = await searchParams;
  const rawQ = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const rawCat = Array.isArray(sp.cat) ? sp.cat[0] : sp.cat;
  const q = (rawQ ?? "").replace(/[,()%*\\]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);
  const cat = CATEGORIES.find((c) => c.value === rawCat)?.value;

  const { supabase, complete } = await requireUser();
  let query = supabase
    .from("listings")
    .select("id,title,price,category,photo_url,created_at")
    .eq("status", "activo")
    .order("created_at", { ascending: false })
    .limit(100);
  if (q) query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  if (cat) query = query.eq("category", cat);
  const [{ data, error }, orgRes] = await Promise.all([
    query,
    supabase.from("organizations").select("name").limit(1).maybeSingle<{ name: string }>(),
  ]);
  const listings = (data ?? []) as Row[];
  const org = orgRes.data?.name ?? "Demo Org";
  const filtered = Boolean(q || cat);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16">
      <SearchHero org={org} q={q} cat={cat} />

      {!complete && (
        <Link
          href="/perfil?completar=1"
          className="group mb-6 flex items-center gap-3 rounded-2xl border border-brand/15 bg-brand-soft px-4 py-3 text-sm text-brand-active transition-colors hover:bg-brand-softer"
        >
          <UserRound size={18} strokeWidth={1.75} className="shrink-0" />
          <span className="flex-1">Completa tu perfil (nombre y teléfono) para publicar y contactar con vendedores.</span>
          <ArrowRight size={18} strokeWidth={1.75} className="shrink-0 transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <CategoryChips q={q} cat={cat} />

      <div className="mb-5 mt-6 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted">
          <span className="tabular-nums text-foreground">{listings.length}</span>{" "}
          {listings.length === 1 ? "anuncio" : "anuncios"}
          {cat && <> en {categoryLabel(cat)}</>}
          {q && <> para “{q}”</>}
        </p>
        {filtered && (
          <Link href="/" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:text-brand-hover">
            <X size={16} strokeWidth={1.75} />
            Quitar filtros
          </Link>
        )}
      </div>

      {error && <p className="error mb-4">No se pudieron cargar los anuncios. Inténtalo de nuevo.</p>}

      {listings.length === 0 && !error ? <EmptyState filtered={filtered} /> : <ListingGrid listings={listings} />}
    </div>
  );
}
