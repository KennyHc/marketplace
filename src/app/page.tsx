import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { CATEGORIES, categoryLabel, formatPrice, type Category } from "@/lib/types";
import { timeAgo } from "@/lib/time";

type Row = { id: string; title: string; price: number; category: Category; photo_url: string; created_at: string };

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
  const { data, error } = await query;
  const listings = (data ?? []) as Row[];

  const chipHref = (c?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (c) p.set("cat", c);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const chip = (active: boolean) =>
    `shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
      active ? "border-brand bg-brand text-white" : "border-line bg-card hover:bg-stone-100"
    }`;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4">
      {!complete && (
        <Link
          href="/perfil?completar=1"
          className="mb-4 block rounded-xl bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800 hover:bg-amber-100"
        >
          Completa tu perfil (nombre y teléfono) para publicar y contactar con vendedores →
        </Link>
      )}

      <form action="/" method="get" className="mb-3 flex gap-2">
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar anuncios…"
          className="input"
          aria-label="Buscar"
        />
        <button type="submit" className="btn-primary shrink-0">
          Buscar
        </button>
      </form>

      <div className="-mx-4 mb-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        <Link href={chipHref()} className={chip(!cat)}>
          Todas
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.value} href={chipHref(c.value)} className={chip(cat === c.value)}>
            {c.emoji} {c.label}
          </Link>
        ))}
      </div>

      {error && <p className="error mb-4">No se pudieron cargar los anuncios. Inténtalo de nuevo.</p>}

      {listings.length === 0 && !error ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <div className="text-4xl">🛍️</div>
          <h2 className="text-lg font-semibold">
            {q || cat ? "No hay anuncios que coincidan" : "Todavía no hay anuncios"}
          </h2>
          <p className="text-sm text-muted">
            {q || cat ? "Prueba con otra búsqueda o categoría." : "Sé el primero en publicar algo."}
          </p>
          <Link href="/anuncios/nuevo" className="btn-primary mt-2">
            Publicar un anuncio
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
          {listings.map((l) => (
            <li key={l.id}>
              <Link
                href={`/anuncios/${l.id}`}
                className="card group block overflow-hidden transition hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-stone-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={l.photo_url}
                    alt={l.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="p-3">
                  <p className="text-lg font-bold leading-tight">{formatPrice(l.price)}</p>
                  <h3 className="mt-1 line-clamp-2 text-sm leading-snug">{l.title}</h3>
                  <p className="mt-2 truncate text-xs text-muted">
                    {categoryLabel(l.category)} · {timeAgo(l.created_at)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
