import "server-only";
import Stripe from "stripe";

// STRIPE1 = secret key (test mode). STRIPE2 (publishable) isn't needed: Checkout is Stripe-hosted.
export const stripe = new Stripe(process.env.STRIPE1!);

export function siteUrl(request: Request) {
  return process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
}
