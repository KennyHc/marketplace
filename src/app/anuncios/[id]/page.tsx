import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Building2, ChevronRight, Clock, HandCoins, Lock, ShieldCheck } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { categoryLabel, formatPrice, type Listing, type Reputation } from "@/lib/types";
import { timeAgo } from "@/lib/time";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Rating } from "@/components/ui/Rating";
import { FadeIn, Stagger, StaggerItem } from "@/components/ui/motion";
import PhoneReveal from "./phone-reveal";
import SellerActions from "./seller-actions";
import RatingBox from "./rating-box";
import RatingGiven from "./rating-given";
import HeroImage from "./hero-image";
import PagoToast from "./pago-toast";
import BuyCard from "./buy-card";
import ReleaseButton from "./release-button";
import { getActiveOrder, syncCheckoutSession } from "@/lib/payments";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("listings").select("title").eq("id", id).maybeSingle();
  return { title: data?.title ?? "Anuncio" };
}

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ pago?: string; session_id?: string }>;
}) {
  const { id } = await params;
  const { pago, session_id } = await searchParams;
  const { supabase, user } = await requireUser();

  if (session_id) await syncCheckoutSession(session_id, user.id);

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle<Listing>();
  if (!listing) notFound();

  const isSeller = listing.seller_id === user.id;
  const isBuyer = listing.buyer_id === user.id;
  const sold = listing.status === "vendido";
  const reserved = listing.status === "reservado";

  const order = await getActiveOrder(id);
  const isOrderBuyer = !!order && order.buyer_id === user.id;
  let acceptsPayments = false;
  if (listing.status === "activo" && !isSeller) {
    const { data } = await supabase.rpc("seller_accepts_payments", { p_seller: listing.seller_id });
    acceptsPayments = data === true;
  }
  let orderBuyerName = "El comprador";
  if (reserved && isSeller && order) {
    const { data: b } = await supabase.from("profiles").select("name").eq("id", order.buyer_id).maybeSingle();
    orderBuyerName = b?.name ?? "El comprador";
  }
  const amount = order ? formatPrice(order.amount_cents / 100) : "";
  const canBuy = listing.status === "activo" && !isSeller && acceptsPayments;

  const [{ data: seller }, { data: rep }] = await Promise.all([
    supabase.from("profiles").select("id,name").eq("id", listing.seller_id).single<{ id: string; name: string | null }>(),
    supabase.from("user_reputation").select("*").eq("user_id", listing.seller_id).maybeSingle<Reputation>(),
  ]);
  const sellerName = seller?.name ?? "Vecino";

  // Vendedor: quién ha revelado el teléfono.
  let revealers: { id: string; name: string; at: string }[] = [];
  if (isSeller) {
    const { data: reveals } = await supabase
      .from("contact_reveals")
      .select("buyer_id,created_at")
      .eq("listing_id", id)
      .order("created_at", { ascending: false });
    const ids = (reveals ?? []).map((r) => r.buyer_id as string);
    if (ids.length) {
      const { data: people } = await supabase.from("profiles").select("id,name").in("id", ids);
      revealers = (reveals ?? []).map((r) => ({
        id: r.buyer_id as string,
        name: people?.find((p) => p.id === r.buyer_id)?.name ?? "Vecino",
        at: r.created_at as string,
      }));
    }
  }

  // Valoración tras la venta.
  let rating: React.ReactNode = null;
  if (sold && listing.buyer_id && (isSeller || isBuyer)) {
    const counterpartId = isSeller ? listing.buyer_id : listing.seller_id;
    let counterpartName = sellerName;
    if (isSeller) {
      const { data: b } = await supabase.from("profiles").select("name").eq("id", counterpartId).single();
      counterpartName = b?.name ?? "el comprador";
    }
    const { data: existing } = await supabase
      .from("ratings")
      .select("stars")
      .eq("listing_id", id)
      .eq("from_user", user.id)
      .maybeSingle();
    rating = existing ? (
      <RatingGiven stars={existing.stars} name={counterpartName} />
    ) : (
      <RatingBox listingId={id} toUser={counterpartId} toName={counterpartName} />
    );
  }

  const showNotice = sold && !isSeller && !isBuyer;

  return (
    <div className="pb-28 lg:pb-0">
      <PagoToast pago={pago} />
      <FadeIn y={6}>
        <Link href="/" className="btn-ghost btn-sm -ml-3 mb-4 inline-flex">
          <ArrowLeft size={16} strokeWidth={1.75} /> Volver
        </Link>
      </FadeIn>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:gap-10">
        <FadeIn y={10}>
          <HeroImage src={listing.photo_url} alt={listing.title} sold={sold} reserved={reserved} />
        </FadeIn>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <Stagger gap={0.07} delay={0.1} className="space-y-4">
            <StaggerItem>
              <span className="badge gap-1.5 bg-brand-soft px-3 py-1 text-brand">
                <CategoryIcon category={listing.category} size={14} />
                {categoryLabel(listing.category)}
              </span>
              <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">{listing.title}</h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="text-3xl font-semibold tabular-nums tracking-tight text-brand">
                  {formatPrice(listing.price)}
                </p>
                {sold && (
                  <span className="badge gap-1 bg-success-soft px-3 py-1 text-success">
                    <BadgeCheck size={14} strokeWidth={1.75} /> Vendido
                  </span>
                )}
              </div>
              <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted">
                <Clock size={14} strokeWidth={1.75} /> Publicado {timeAgo(listing.created_at)}
              </p>
            </StaggerItem>

            <StaggerItem className="card p-5">
              <p className="eyebrow mb-2">Descripción</p>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">{listing.description}</p>
            </StaggerItem>

            <StaggerItem>
              <Link
                href={`/usuarios/${listing.seller_id}`}
                className="card group flex items-center gap-3 p-4 transition-[border-color,box-shadow] duration-200 hover:border-line-strong hover:shadow-md"
              >
                <Avatar name={sellerName} size={46} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">{sellerName}</span>
                  <span className="mt-0.5 block">
                    <Rating avg={rep?.avg_stars ?? null} count={rep?.rating_count ?? 0} size="md" />
                  </span>
                  <span className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <ShieldCheck size={13} strokeWidth={1.75} className="text-success" />
                    Miembro verificado de Demo Org
                  </span>
                </span>
                <ChevronRight
                  size={18}
                  strokeWidth={1.75}
                  className="text-subtle transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </Link>
            </StaggerItem>

            <StaggerItem className="card divide-y divide-line">
              <p className="flex items-center gap-3 px-4 py-3 text-sm">
                <Building2 size={18} strokeWidth={1.75} className="text-brand" />
                Entrega en mano en el edificio
              </p>
              <p className="flex items-center gap-3 px-4 py-3 text-sm">
                <HandCoins size={18} strokeWidth={1.75} className="text-brand" />
                Pago en mano o Bizum
              </p>
            </StaggerItem>

            {reserved && isOrderBuyer && order && (
              <StaggerItem className="card border-success/25 bg-success-soft/40 p-5">
                <p className="flex items-center gap-2 font-semibold text-success">
                  <Lock size={18} strokeWidth={1.75} /> Pago retenido · {amount}
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  Tu dinero queda retenido y el vendedor no lo recibirá hasta que confirmes que tienes el artículo.
                  Contacta con el vendedor para quedar en el edificio.
                </p>
                <div className="mt-4">
                  <ReleaseButton orderId={order.id} />
                </div>
              </StaggerItem>
            )}
            {reserved && isSeller && order && (
              <StaggerItem className="card flex items-start gap-3 p-5">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
                  <Lock size={18} strokeWidth={1.75} />
                </span>
                <p className="text-sm text-muted">
                  <strong className="font-semibold text-foreground">Reservado</strong> — {orderBuyerName} ha pagado{" "}
                  {amount}. Recibirás el dinero cuando confirme la entrega.
                </p>
              </StaggerItem>
            )}
            {reserved && !isSeller && !isOrderBuyer && (
              <StaggerItem className="card flex items-center gap-3 bg-surface-2 p-4 text-sm text-muted shadow-none">
                <Lock size={18} strokeWidth={1.75} />
                Reservado
              </StaggerItem>
            )}
            {canBuy && (
              <StaggerItem>
                <BuyCard listingId={id} price={formatPrice(listing.price)} />
              </StaggerItem>
            )}
            {isSeller && listing.status === "activo" && (
              <StaggerItem>
                <SellerActions listingId={id} revealers={revealers} />
              </StaggerItem>
            )}
            {showNotice && (
              <StaggerItem className="card flex items-center gap-3 bg-surface-2 p-4 text-sm text-muted shadow-none">
                <BadgeCheck size={18} strokeWidth={1.75} />
                Este artículo ya se vendió
              </StaggerItem>
            )}
            {sold && order?.status === "liberado" && (
              <StaggerItem>
                <span className="badge gap-1.5 bg-success-soft px-3 py-1.5 text-success">
                  <ShieldCheck size={14} strokeWidth={1.75} /> Pagado con Pasillo
                </span>
              </StaggerItem>
            )}
            {rating && <StaggerItem>{rating}</StaggerItem>}
          </Stagger>

          {/* Kept outside Stagger: on mobile this is a fixed bar and transforms/filters would break `fixed`. */}
          {listing.status === "activo" && !isSeller && (
            <>
              {canBuy && <p className="mt-4 text-center text-xs text-muted">o contacta y paga en mano / Bizum</p>}
              <PhoneReveal listingId={id} inline={canBuy} />
            </>
          )}
          {reserved && isOrderBuyer && <PhoneReveal listingId={id} />}
        </div>
      </div>
    </div>
  );
}
