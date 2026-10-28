import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripe, siteUrl } from "@/lib/stripe";
import { getSellerPayout } from "@/lib/payments";

// Form POST { order_id } by the BUYER once they have the item: transfers the held funds
// to the seller and closes the sale (listing → vendido with buyer_id, unlocking ratings).
export async function POST(request: Request) {
  const origin = siteUrl(request);
  const form = await request.formData();
  const orderId = String(form.get("order_id") ?? "");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`, 303);

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, listing_id, buyer_id, seller_id, amount_cents, status, stripe_charge_id")
    .eq("id", orderId)
    .maybeSingle();
  if (!order || order.buyer_id !== user.id) return NextResponse.redirect(`${origin}/`, 303);
  const back = (q: string) => NextResponse.redirect(`${origin}/anuncios/${order.listing_id}?pago=${q}`, 303);
  if (order.status !== "pagado") return back("ya-liberado");

  // Claim the order first so a double click can't transfer twice.
  const { data: claimed } = await admin
    .from("orders")
    .update({ status: "liberado", released_at: new Date().toISOString() })
    .eq("id", order.id)
    .eq("status", "pagado")
    .select("id");
  if (!claimed?.length) return back("ya-liberado");

  try {
    const { accountId } = await getSellerPayout(order.seller_id);
    const transfer = await stripe.transfers.create(
      {
        amount: order.amount_cents,
        currency: "eur",
        destination: accountId!,
        transfer_group: `listing_${order.listing_id}`,
        // Lets the transfer go out before the charge settles (instant in test mode).
        source_transaction: order.stripe_charge_id ?? undefined,
        metadata: { order_id: order.id },
      },
      { idempotencyKey: `release_${order.id}` },
    );
    await admin.from("orders").update({ stripe_transfer_id: transfer.id }).eq("id", order.id);
  } catch (e) {
    console.error("transfer failed", e);
    await admin.from("orders").update({ status: "pagado", released_at: null }).eq("id", order.id);
    return back("error-transferencia");
  }

  await admin
    .from("listings")
    .update({ status: "vendido", buyer_id: order.buyer_id, sold_at: new Date().toISOString() })
    .eq("id", order.listing_id);

  return back("entregado");
}
