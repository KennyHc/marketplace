import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/ui/Logo";
import { HeaderShell } from "@/components/header/HeaderShell";
import { HeaderActions } from "@/components/header/HeaderActions";

export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  let name: string | null = null;
  if (claims?.sub) {
    const { data: prof } = await supabase.from("profiles").select("name,email").eq("id", claims.sub).maybeSingle<{ name: string | null; email: string }>();
    name = prof?.name?.trim() || prof?.email || null;
  }

  return (
    <HeaderShell>
      <Link href="/" aria-label="Pasillo, inicio" className="rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25">
        <Logo />
      </Link>
      {claims && <HeaderActions name={name} />}
    </HeaderShell>
  );
}
