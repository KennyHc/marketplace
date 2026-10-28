import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { categoryLabel, formatPrice, type Listing, type Reputation } from "@/lib/types";
import PhoneReveal from "./phone-reveal";
import SellerActions from "./seller-actions";
import RatingBox from "./rating-box";

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase, user } = await requireUser();

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle<Listing>();
  if (!listing) notFound();

  const isSeller = listing.seller_id === user.id;
  const isBuyer = listing.buyer_id === user.id;
  const sold = listing.status === "vendido";

  const [{ data: seller }, { data: rep }] = await Promise.all([
    supabase.from("profiles").select("id,name").eq("id", listing.seller_id).single<{ id: string; name: string | null }>(),
    supabase.from("user_reputation").select("*").eq("user_id", listing.seller_id).maybeSingle<Reputation>(),
  ]);
  const sellerName = seller?.name ?? "Vecino";

  // Vendedor: quién ha revelado el teléfono.
  let revealers: { id: string; name: string }[] = [];
  if (isSeller) {
    const { data: reveals } = await supabase.from("contact_reveals").select("buyer_id").eq("listing_id", id);
    const ids = (reveals ?? []).map((r) => r.buyer_id as string);
    if (ids.length) {
      const { data: people } = await supabase.from("profiles").select("id,name").in("id", ids);
      revealers = ids.map((bid) => ({
        id: bid,
        name: people?.find((p) => p.id === bid)?.name ?? "Vecino",
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
      <div className="card p-4 text-center">
        <p>
          Ya valoraste a <strong>{counterpartName}</strong>:{" "}
          <span className="text-amber-400">{"★".repeat(existing.stars)}</span>
          <span className="text-line">{"★".repeat(5 - existing.stars)}</span>
        </p>
      </div>
    ) : (
      <RatingBox listingId={id} toUser={counterpartId} toName={counterpartName} />
    );
  }

  const date = new Date(listing.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <main className="mx-auto max-w-2xl space-y-4 pb-24">
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={listing.photo_url}
          alt={listing.title}
          className={`aspect-square w-full bg-line object-cover sm:rounded-2xl ${sold ? "opacity-70" : ""}`}
        />
        {sold && (
          <span className="absolute left-3 top-3 rounded-full bg-foreground px-3 py-1 text-sm font-bold text-white">
            Vendido
          </span>
        )}
      </div>

      <div className="space-y-4 px-4">
        <div>
          <p className="text-3xl font-extrabold text-brand">{formatPrice(listing.price)}</p>
          <h1 className="mt-1 text-xl font-semibold">{listing.title}</h1>
          <p className="mt-1 text-sm text-muted">
            {categoryLabel(listing.category)} · Publicado el {date}
          </p>
        </div>

        <p className="whitespace-pre-line leading-relaxed">{listing.description}</p>

        <Link href={`/usuarios/${listing.seller_id}`} className="card flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-lg font-bold text-brand">
            {sellerName.charAt(0).toUpperCase()}
          </span>
          <span className="flex-1">
            <span className="block font-semibold">{sellerName}</span>
            <span className="block text-sm text-muted">Vendedor</span>
          </span>
          {rep && rep.rating_count > 0 ? (
            <span className="text-sm font-medium">
              <span className="text-amber-400">★</span> {rep.avg_stars} · {rep.rating_count}{" "}
              {rep.rating_count === 1 ? "valoración" : "valoraciones"}
            </span>
          ) : (
            <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">Nuevo</span>
          )}
        </Link>

        <p className="text-sm text-muted">🤝 Entrega en mano dentro del edificio · Pago en mano o Bizum</p>

        {!sold && !isSeller && <PhoneReveal listingId={id} />}
        {!sold && isSeller && <SellerActions listingId={id} revealers={revealers} />}
        {sold && (
          <p className="rounded-xl bg-line/60 p-3 text-center text-sm text-muted">Este artículo ya se vendió.</p>
        )}

        {rating}
      </div>
    </main>
  );
}
