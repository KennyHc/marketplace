import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const loggedIn = Boolean(data?.claims);

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">P</span>
          Pasillo
        </Link>
        {loggedIn && (
          <nav className="flex items-center gap-2">
            <Link href="/anuncios/nuevo" className="btn-primary px-3 py-2">
              + Publicar
            </Link>
            <Link href="/perfil" className="btn-secondary px-3 py-2">
              Perfil
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
