import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Server-side: returns the logged-in user's profile, redirecting to /login if absent.
export async function requireUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  const { data: contact } = await supabase.from("contact_info").select("phone").eq("user_id", user.id).maybeSingle();
  const complete = Boolean(profile?.name?.trim() && contact?.phone);
  return { supabase, user, profile: profile!, phone: contact?.phone ?? null, complete };
}

// Same, but also sends users with an incomplete profile to /perfil (PRD story 2).
export async function requireCompleteProfile() {
  const ctx = await requireUser();
  if (!ctx.complete) redirect("/perfil?completar=1");
  return ctx;
}
