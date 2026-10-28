import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { formatPrice, type Listing, type Reputation } from "@/lib/types";
import { ProfileForm } from "./ProfileForm";
import { logout } from "./actions";

type Row = Pick<Listing, "id" | "title" | "price" | "status" | "photo_url">;

function Badge({ status }: { status: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status === "activo" ? "bg-green-100 text-green-700" : "bg-stone-200 text-stone-600"}`}>
      {status === "activo" ? "Activo" : "Vendido"}
    </span>
  );
}

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ completar?: string }> }) {
  const { completar } = await searchParams;
  const { supabase, user, profile, phone, complete } = await requireUser();

  const [{ data: rep }, { data: mine }, { data: bought }] = await Promise.all([
    supabase.from("user_reputation").select("*").eq("user_id", user.id).maybeSingle<Reputation>(),
    supabase.from("listings").select("id,title,price,status,photo_url").eq("seller_id", user.id).order("created_at", { ascending: false }).returns<Row[]>(),
    supabase.from("listings").select("id,title,price,status,photo_url").eq("buyer_id", user.id).order("sold_at", { ascending: false }).returns<Row[]>(),
  ]);

  const count = rep?.rating_count ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-6">
      {(completar === "1" || !complete) && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Completa tu nombre y teléfono para publicar y ver contactos
        </div>
      )}

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Mi perfil</h1>
            <p className="text-sm text-muted">{profile.email}</p>
          </div>
          {count > 0 ? (
            <span className="text-sm font-medium">★ {Number(rep?.avg_stars).toFixed(1)} ({count} {count === 1 ? "valoración" : "valoraciones"})</span>
          ) : (
            <span className="rounded-full bg-brand/10 px-2.5 py-1 text-xs font-semibold text-brand">Nuevo</span>
          )}
        </div>
        <ProfileForm name={profile.name ?? ""} phone={phone ?? ""} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mis anuncios</h2>
        {mine?.length ? (
          <ul className="space-y-2">
            {mine.map((l) => (
              <li key={l.id} className="card flex items-center gap-3 p-2.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={l.photo_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <Link href={`/anuncios/${l.id}`} className="min-w-0 flex-1">
                  <p className="truncate font-medium">{l.title}</p>
                  <p className="text-sm text-muted">{formatPrice(l.price)}</p>
                </Link>
                <div className="flex flex-col items-end gap-1">
                  <Badge status={l.status} />
                  {l.status === "activo" && (
                    <Link href={`/anuncios/${l.id}/editar`} className="text-xs font-medium text-brand">Editar</Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Aún no has publicado nada.</p>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Mis compras</h2>
        {bought?.length ? (
          <ul className="space-y-2">
            {bought.map((l) => (
              <li key={l.id}>
                <Link href={`/anuncios/${l.id}`} className="card flex items-center gap-3 p-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.photo_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.title}</p>
                    <p className="text-sm text-muted">{formatPrice(l.price)}</p>
                  </div>
                  <span className="text-xs font-medium text-brand">Ver / valorar</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted">Todavía no has comprado nada.</p>
        )}
      </section>

      <form action={logout}>
        <button type="submit" className="btn-secondary w-full">Cerrar sesión</button>
      </form>
    </div>
  );
}
