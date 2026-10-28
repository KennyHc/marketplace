import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, siteUrl } from "@/lib/stripe";
import { getSellerPayout } from "@/lib/payments";

// Form POST { listing_id } → creates a pending order and redirects to Stripe Checkout.
export async function POST(request: Request) {
  const origin = siteUrl(request);
  const form = await request.formData();
  const listingId = String(form.get("listing_id") ?? "");
  const back = (q: string) => NextResponse.redirect(`${origin}/anuncios/${listingId}?pago=${q}`, 303);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`, 303);

  const { data: complete } = await supabase.rpc("is_profile_complete");
  if (!complete) return NextResponse.redirect(`${origin}/perfil?completar=1`, 303);

  // RLS scopes this read to the buyer's organization.
  const { data: listing } = await supabase
    .from("listings")
    .select("id, org_id, seller_id, title, price, photo_url, status")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return NextResponse.redirect(`${origin}/`, 303);
  if (listing.seller_id === user.id || listing.status !== "activo") return back("no-disponible");

  const payout = await getSellerPayout(listing.seller_id);
  if (!payout.ready) return back("vendedor-sin-cobros");

  const amount = Math.round(Number(listing.price) * 100);
  if (amount < 50) return back("importe-minimo");

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .insert({ org_id: listing.org_id, listing_id: listing.id, buyer_id: user.id, seller_id: listing.seller_id, amount_cents: amount })
    .select("id")
    .single();
  if (error || !order) return back("error");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: user.email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: amount,
          product_data: { name: listing.title, images: listing.photo_url?.startsWith("https://") ? [listing.photo_url] : undefined },
        },
      },
    ],
    // Funds stay on the platform; transferred to the seller when the buyer confirms delivery.
    payment_intent_data: { transfer_group: `listing_${listing.id}`, metadata: { order_id: order.id, listing_id: listing.id } },
    metadata: { order_id: order.id, listing_id: listing.id },
    expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    success_url: `${origin}/anuncios/${listing.id}?pago=ok&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/anuncios/${listing.id}?pago=cancelado`,
  });

  await admin.from("orders").update({ stripe_checkout_session_id: session.id }).eq("id", order.id);
  return NextResponse.redirect(session.url!, 303);
}
