import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { markCheckoutExpired, markCheckoutPaid } from "@/lib/payments";

// Stripe → us. Signature-verified; handlers are idempotent.
export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !secret) return NextResponse.json({ error: "missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await request.text(), signature, secret);
  } catch {
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      await markCheckoutPaid(event.data.object);
      break;
    case "checkout.session.expired":
      await markCheckoutExpired(event.data.object);
      break;
  }
  return NextResponse.json({ received: true });
}
