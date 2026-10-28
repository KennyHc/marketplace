import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createOnboardingLink } from "@/lib/payments";
import { siteUrl } from "@/lib/stripe";

// Starts (or resumes) Stripe Connect onboarding for the logged-in seller.
// GET is also used by Stripe as the refresh_url when a link expires.
async function handle(request: Request) {
  const origin = siteUrl(request);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(`${origin}/login`, 303);

  const { data: profile } = await supabase.from("profiles").select("name, email").eq("id", user.id).single();
  try {
    const url = await createOnboardingLink({ id: user.id, email: profile?.email ?? user.email!, name: profile?.name ?? null }, origin);
    return NextResponse.redirect(url, 303);
  } catch (e) {
    console.error("stripe connect onboarding failed", e);
    return NextResponse.redirect(`${origin}/perfil?cobros=error`, 303);
  }
}

export const GET = handle;
export const POST = handle;
