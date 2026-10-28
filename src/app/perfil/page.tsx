import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Info, Lock, LogOut, PencilLine, Plus, ShoppingBag, Package, Wallet } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { formatPrice, type Listing, type Reputation } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Rating } from "@/components/ui/Rating";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import { ProfileForm } from "./ProfileForm";
import { logout } from "./actions";
import { getSellerPayout } from "@/lib/payments";
import CobrosToast from "./cobros-toast";
import ConnectButton from "./connect-button";

type Row = Pick<Listing, "id" | "title" | "price" | "status" | "photo_url">;

function StatusBadge({ status }: { status: string }) {
  return status === "activo" ? (
    <span className="badge bg-success-soft text-success">Activo</span>
  ) : status === "reservado" ? (
    <span className="badge bg-brand-soft text-brand">Reservado</span>
  ) : (
    <span className="badge bg-surface-2 text-muted">Vendido</span>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-xl bg-surface-2 px-3 py-2.5 text-center sm:px-4">
      <p className="text-xl font-semibold tabular-nums tracking-tight">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function Empty({ icon: Icon, title, text, cta }: { icon: typeof Package; title: string; text: string; cta?: { href: string; label: string } }) {
  return (
    <div className="card flex flex-col items-center px-6 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
        <Icon size={22} strokeWidth={1.75} />
      </span>
      <p className="mt-4 font-semibold tracking-tight">{title}</p>
      <p className="mt-1 text-sm text-muted">{text}</p>
      {cta && (
        <Link href={cta.href} className="btn-primary btn-sm mt-5">
          <Plus size={16} strokeWidth={1.75} /> {cta.label}
        </Link>
      )}
    </div>
  );
}

function Thumb({ src }: { src: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" loading="lazy" decoding="async" className="h-16 w-16 shrink-0 rounded-xl bg-surface-2 object-cover" />
  );
}

export const metadata: Metadata = { title: "Mi perfil" };

export default async function PerfilPage({ searchParams }: { searchParams: Promise<{ completar?: string; cobros?: string }> }) {
  const { completar, cobros } = await searchParams;
  const { supabase, user, profile, phone, complete } = await requireUser();

  const [{ data: rep }, { data: mine }, { data: bought }] = await Promise.all([
    supabase.from("user_reputation").select("*").eq("user_id", user.id).maybeSingle<Reputation>(),
    supabase.from("listings").select("id,title,price,status,photo_url").eq("seller_id", user.id).order("created_at", { ascending: false }).returns<Row[]>(),
    supabase.from("listings").select("id,title,price,status,photo_url").eq("buyer_id", user.id).order("sold_at", { ascending: false }).returns<Row[]>(),
  ]);

  const payout = await getSellerPayout(user.id).catch(() => ({ accountId: null as string | null, ready: false }));

  const { data: openOrders } = await supabase
    .from("orders")
    .select("id,listing_id,amount_cents")
    .eq("buyer_id", user.id)
    .eq("status", "pagado")
    .returns<{ id: string; listing_id: string; amount_cents: number }[]>();
  const orderListingIds = (openOrders ?? []).map((o) => o.listing_id);
  const { data: orderListings } = orderListingIds.length
    ? await supabase.from("listings").select("id,title,price,status,photo_url").in("id", orderListingIds).returns<Row[]>()
    : { data: [] as Row[] };
  const pending = (openOrders ?? []).flatMap((o) => {
    const l = orderListings?.find((x) => x.id === o.listing_id);
    return l ? [{ ...l, amount: o.amount_cents / 100 }] : [];
  });

  const count = rep?.rating_count ?? 0;
  const active = mine?.filter((l) => l.status === "activo").length ?? 0;
  const sold = mine?.filter((l) => l.status === "vendido").length ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {(completar === "1" || !complete) && (
        <FadeIn>
          <div className="flex items-start gap-3 rounded-2xl border border-brand/15 bg-brand-soft px-4 py-3.5 text-sm text-brand-active">
            <Info size={20} strokeWidth={1.75} className="mt-0.5 shrink-0 text-brand" />
            <p className="font-medium">Completa tu nombre y teléfono para publicar y ver contactos</p>
          </div>
        </FadeIn>
      )}

      <FadeIn delay={0.05}>
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar name={profile.name || profile.email} size={72} />
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{profile.name?.trim() || "Mi perfil"}</h1>
              <p className="truncate text-sm text-muted">{profile.email}</p>
              <div className="mt-1.5"><Rating avg={rep?.avg_stars ?? null} count={count} size="md" /></div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
            <Stat value={active} label="Anuncios activos" />
            <Stat value={sold} label="Vendidos" />
            <Stat value={bought?.length ?? 0} label="Compras" />
          </div>
        </section>
      </FadeIn>

      <FadeIn delay={0.1}>
        <ProfileForm name={profile.name ?? ""} phone={phone ?? ""} />
      </FadeIn>

      <CobrosToast cobros={cobros} ready={payout.ready} />

      <FadeIn delay={0.12}>
        <section className="card p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
              <Wallet size={18} strokeWidth={1.75} />
            </span>
            <h2 className="text-lg font-semibold tracking-tight">Cobros</h2>
            {payout.ready && (
              <span className="badge ml-auto gap-1 bg-success-soft text-success">
                <BadgeCheck size={14} strokeWidth={1.75} /> Pago protegido activado
              </span>
            )}
          </div>
          {payout.ready ? (
            <p className="mt-3 text-sm text-muted">
              Tus compradores pueden pagarte con tarjeta. Recibes el dinero cuando confirman la entrega.
            </p>
          ) : payout.accountId ? (
            <>
              <p className="mt-3 text-sm text-muted">Completa tu alta en Stripe para empezar a recibir pagos con tarjeta.</p>
              <form action="/api/stripe/connect" method="POST" className="mt-4">
                <ConnectButton label="Continuar en Stripe" variant="secondary" />
              </form>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted">
                Activa el pago protegido para que tus compradores te paguen con tarjeta. El dinero se te libera cuando
                confirman que han recibido el artículo.
              </p>
              <form action="/api/stripe/connect" method="POST" className="mt-4">
                <ConnectButton label="Activar cobros con Stripe" variant="primary" />
              </form>
              <p className="mt-3 text-xs text-muted">Modo de prueba: puedes usar datos ficticios</p>
            </>
          )}
        </section>
      </FadeIn>

      {pending.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Pedidos en curso</h2>
          <Stagger className="space-y-2.5" gap={0.04}>
            {pending.map((l) => (
              <StaggerItem key={l.id}>
                <Link href={`/anuncios/${l.id}`} className="card flex items-center gap-3 p-2.5 transition-shadow hover:shadow-md">
                  <Thumb src={l.photo_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.title}</p>
                    <p className="mt-0.5 font-semibold tabular-nums">{formatPrice(l.amount)}</p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-brand">
                      <Lock size={12} strokeWidth={1.75} /> Pago retenido · confirma la entrega
                    </p>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Mis anuncios</h2>
        {mine?.length ? (
          <Stagger className="space-y-2.5" gap={0.04}>
            {mine.map((l) => (
              <StaggerItem key={l.id}>
                <div className="card flex items-center gap-3 p-2.5 transition-shadow hover:shadow-md">
                  <Link href={`/anuncios/${l.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Thumb src={l.photo_url} />
                    <div className="min-w-0">
                      <p className="truncate font-medium">{l.title}</p>
                      <p className="mt-0.5 font-semibold tabular-nums">{formatPrice(l.price)}</p>
                      <div className="mt-1"><StatusBadge status={l.status} /></div>
                    </div>
                  </Link>
                  {l.status === "activo" && (
                    <Link href={`/anuncios/${l.id}/editar`} aria-label={`Editar ${l.title}`} className="btn-ghost h-10 w-10 shrink-0 rounded-full px-0">
                      <PencilLine size={18} strokeWidth={1.75} />
                    </Link>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Empty icon={Package} title="Aún no has publicado nada" text="Vende lo que ya no usas a tus compañeros." cta={{ href: "/anuncios/nuevo", label: "Publicar anuncio" }} />
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Mis compras</h2>
        {bought?.length ? (
          <Stagger className="space-y-2.5" gap={0.04}>
            {bought.map((l) => (
              <StaggerItem key={l.id}>
                <Link href={`/anuncios/${l.id}`} className="card flex items-center gap-3 p-2.5 transition-shadow hover:shadow-md">
                  <Thumb src={l.photo_url} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{l.title}</p>
                    <p className="mt-0.5 font-semibold tabular-nums">{formatPrice(l.price)}</p>
                  </div>
                  <span className="badge shrink-0 bg-brand-soft text-brand"><BadgeCheck size={14} strokeWidth={1.75} /> Ver / valorar</span>
                </Link>
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          <Empty icon={ShoppingBag} title="Todavía no has comprado nada" text="Cuando compres a un compañero, aparecerá aquí para valorarlo." />
        )}
      </section>

      <form action={logout}>
        <button type="submit" className="btn-ghost">
          <LogOut size={16} strokeWidth={1.75} /> Cerrar sesión
        </button>
      </form>
    </div>
  );
}
