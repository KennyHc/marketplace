import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { formatPrice, type Listing, type Reputation } from "@/lib/types";

export default async function UsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const { data: person } = await supabase.from("profiles").select("id,name").eq("id", id).maybeSingle<{ id: string; name: string | null }>();
  if (!person) notFound();

  const [{ data: rep }, { data: listings }] = await Promise.all([
    supabase.from("user_reputation").select("*").eq("user_id", id).maybeSingle<Reputation>(),
    supabase.from("listings").select("id,title,price,photo_url").eq("seller_id", id).eq("status", "activo").order("created_at", { ascending: false }).returns<Pick<Listing, "id" | "title" | "price" | "photo_url">[]>(),
  ]);
  const count = rep?.rating_count ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{person.name?.trim() || "Usuario"}</h1>
        {count > 0 ? (
          <span className="text-sm font-medium">★ {Number(rep?.avg_stars).toFixed(1)} ({count} {count === 1 ? "valoración" : "valoraciones"})</span>
        ) : (
          <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">Nuevo</span>
        )}
      </div>

      <h2 className="mb-3 mt-6 text-lg font-semibold">Anuncios activos</h2>
      {listings?.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {listings.map((l) => (
            <Link key={l.id} href={`/anuncios/${l.id}`} className="card overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={l.photo_url} alt={l.title} className="aspect-square w-full object-cover" />
              <div className="p-2.5">
                <p className="truncate text-sm font-medium">{l.title}</p>
                <p className="font-semibold text-brand">{formatPrice(l.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">No tiene anuncios activos.</p>
      )}
    </div>
  );
}
