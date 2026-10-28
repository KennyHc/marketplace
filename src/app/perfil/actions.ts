"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ProfileState = { error?: string; ok?: boolean };

export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (!name) return { error: "Escribe tu nombre." };
  if (phone.replace(/\D/g, "").length < 6) return { error: "Escribe un teléfono válido (mínimo 6 dígitos)." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: before } = await supabase.from("contact_info").select("phone").eq("user_id", user.id).maybeSingle();
  const { data: prof } = await supabase.from("profiles").select("name").eq("id", user.id).single();
  const wasComplete = Boolean(prof?.name?.trim() && before?.phone);

  const { error: e1 } = await supabase.from("profiles").update({ name }).eq("id", user.id);
  if (e1) return { error: "No se pudo guardar tu nombre." };
  const { error: e2 } = await supabase.from("contact_info").upsert({ user_id: user.id, phone });
  if (e2) return { error: "No se pudo guardar tu teléfono." };

  revalidatePath("/", "layout");
  if (!wasComplete) redirect("/");
  return { ok: true };
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
