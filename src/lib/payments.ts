import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";

export type OrderStatus = "pendiente" | "pagado" | "liberado" | "reembolsado" | "cancelado";

export type Order = {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  amount_cents: number;
  status: OrderStatus;
  paid_at: string | null;
  released_at: string | null;
};

/** Seller's Stripe payout account. Refreshes `ready` from Stripe while onboarding is unfinished. */
export async function getSellerPayout(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.from("seller_payouts").select("stripe_account_id, ready").eq("user_id", userId).maybeSingle();
  if (!data) return { accountId: null, ready: false };
  if (data.ready) return { accountId: data.stripe_account_id as string, ready: true };

  const account = await stripe.accounts.retrieve(data.stripe_account_id);
  const ready = account.capabilities?.transfers === "active";
  if (ready) {
    await admin.from("seller_payouts").update({ ready: true, updated_at: new Date().toISOString() }).eq("user_id", userId);
  }
  return { accountId: data.stripe_account_id as string, ready };
}

/** Creates (once) the seller's Connect account and returns a Stripe-hosted onboarding URL. */
export async function createOnboardingLink(user: { id: string; email: string; name: string | null }, origin: string) {
  const admin = createAdminClient();
  let { accountId } = await getSellerPayout(user.id);

  if (!accountId) {
    // Platform is configured with Stripe-managed losses, which requires Accounts v2.
    const account = await stripe.v2.core.accounts.create({
      contact_email: user.email,
      display_name: user.name ?? undefined,
      identity: { country: "es" },
      dashboard: "full",
      defaults: { responsibilities: { losses_collector: "stripe", fees_collector: "stripe" } },
      configuration: {
        merchant: { capabilities: { card_payments: { requested: true } } },
        recipient: { capabilities: { stripe_balance: { stripe_transfers: { requested: true } } } },
      },
    });
    accountId = account.id;
    await admin.from("seller_payouts").insert({ user_id: user.id, stripe_account_id: accountId });
  }

  // v1 account links work for v2 accounts with a full dashboard.
  const link = await stripe.accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: `${origin}/api/stripe/connect`,
    return_url: `${origin}/perfil?cobros=1`,
  });
  return link.url;
}

/** Latest live order for a listing (pending payment, paid or released). */
export async function getActiveOrder(listingId: string): Promise<Order | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select("id, listing_id, buyer_id, seller_id, amount_cents, status, paid_at, released_at")
    .eq("listing_id", listingId)
    .in("status", ["pagado", "liberado"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<Order>();
  return data;
}

/**
 * Marks an order paid after Checkout completes, reserves the listing and logs a contact
 * reveal (so the buyer can coordinate the handover). Idempotent: called by the webhook
 * and again when the buyer lands back on the success URL.
 */
export async function markCheckoutPaid(session: Stripe.Checkout.Session) {
  if (session.payment_status !== "paid") return;
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, listing_id, buyer_id, status")
    .eq("stripe_checkout_session_id", session.id)
    .maybeSingle();
  if (!order || order.status !== "pendiente") return;

  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
  const pi = paymentIntentId ? await stripe.paymentIntents.retrieve(paymentIntentId) : null;
  const chargeId = typeof pi?.latest_charge === "string" ? pi.latest_charge : pi?.latest_charge?.id ?? null;

  // Reserve only if still available; if someone else got there first, refund this buyer.
  const { data: reserved } = await admin
    .from("listings")
    .update({ status: "reservado" })
    .eq("id", order.listing_id)
    .eq("status", "activo")
    .select("id");

  if (!reserved?.length) {
    if (paymentIntentId) await stripe.refunds.create({ payment_intent: paymentIntentId });
    await admin.from("orders").update({ status: "reembolsado", stripe_payment_intent_id: paymentIntentId }).eq("id", order.id);
    return;
  }

  await admin
    .from("orders")
    .update({ status: "pagado", paid_at: new Date().toISOString(), stripe_payment_intent_id: paymentIntentId, stripe_charge_id: chargeId })
    .eq("id", order.id);
  await admin
    .from("contact_reveals")
    .upsert({ listing_id: order.listing_id, buyer_id: order.buyer_id }, { onConflict: "listing_id,buyer_id", ignoreDuplicates: true });
}

export async function markCheckoutExpired(session: Stripe.Checkout.Session) {
  const admin = createAdminClient();
  await admin.from("orders").update({ status: "cancelado" }).eq("stripe_checkout_session_id", session.id).eq("status", "pendiente");
}

/** Success-URL fallback: confirm the buyer's own Checkout session without waiting for the webhook. */
export async function syncCheckoutSession(sessionId: string, userId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("buyer_id")
    .eq("stripe_checkout_session_id", sessionId)
    .maybeSingle();
  if (!order || order.buyer_id !== userId) return;
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  await markCheckoutPaid(session);
}
