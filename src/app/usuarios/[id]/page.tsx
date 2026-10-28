import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Package } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { categoryLabel, formatPrice, type Listing, type Reputation } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { FadeIn, Stagger, StaggerItem, HoverCard } from "@/components/ui/motion";

type Card = Pick<Listing, "id" | "title" | "price" | "photo_url" | "category">;

export default async function UsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireUser();

  const { data: person } = await supabase.from("profiles").select("id,name,created_at").eq("id", id).maybeSingle<{ id: string; name: string | null; created_at: string }>();
  if (!person) notFound();

  const [{ data: rep }, { data: listings }] = await Promise.all([
    supabase.from("user_reputation").select("*").eq("user_id", id).maybeSingle<Reputation>(),
    supabase.from("listings").select("id,title,price,photo_url,category").eq("seller_id", id).eq("status", "activo").order("created_at", { ascending: false }).returns<Card[]>(),
  ]);
  const count = rep?.rating_count ?? 0;
  const display = person.name?.trim() || "Usuario";
  const since = new Intl.DateTimeFormat("es-ES", { month: "long", year: "numeric" }).format(new Date(person.created_at));

  return (
    <div className="space-y-8">
      <FadeIn>
        <section className="card flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <Avatar name={display} size={88} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{display}</h1>
            <div className="mt-2 flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
              <Rating avg={rep?.avg_stars ?? null} count={count} size="md" />
              <span className="inline-flex items-center gap-1.5 text-sm text-muted">
                <CalendarDays size={16} strokeWidth={1.75} /> Miembro desde {since}
              </span>
            </div>
          </div>
        </section>
      </FadeIn>

      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Anuncios activos</h2>
        {listings?.length ? (
          <Stagger className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4" gap={0.04}>
            {listings.map((l) => (
              <StaggerItem key={l.id}>
                <HoverCard>
                  <Link href={`/anuncios/${l.id}`} className="group block">
                    <div className="aspect-square overflow-hidden rounded-2xl bg-surface-2 shadow-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={l.photo_url} alt={l.title} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105" />
                    </div>
                    <p className="mt-2.5 font-semibold tabular-nums">{formatPrice(l.price)}</p>
                    <p className="truncate text-sm">{l.title}</p>
                    <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                      <CategoryIcon category={l.category} size={14} /> {categoryLabel(l.category)}
                    </p>
                  </Link>
                </HoverCard>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <div className="card flex flex-col items-center px-6 py-10 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand"><Package size={22} strokeWidth={1.75} /></span>
            <p className="mt-4 font-semibold tracking-tight">Sin anuncios activos</p>
            <p className="mt-1 text-sm text-muted">Este usuario no tiene nada a la venta ahora mismo.</p>
          </div>
        )}
      </section>
    </div>
  );
}
