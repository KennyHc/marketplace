"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Revealer = { id: string; name: string };

export default function SellerActions({
  listingId,
  revealers,
}: {
  listingId: string;
  revealers: Revealer[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<string>(revealers.length ? revealers[0].id : "fuera");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm("¿Borrar este anuncio? No se puede deshacer.")) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    router.push("/");
    router.refresh();
  }

  async function markSold() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.rpc("mark_sold", {
      p_listing_id: listingId,
      p_buyer_id: choice === "fuera" ? null : choice,
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setOpen(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted">
        {revealers.length === 1
          ? "1 persona ha visto tu teléfono"
          : `${revealers.length} personas han visto tu teléfono`}
      </p>

      <button onClick={() => setOpen((o) => !o)} className="btn-primary w-full py-3 text-base">
        ✅ Marcar como vendido
      </button>

      {open && (
        <div className="card space-y-3 p-4">
          <p className="font-semibold">¿A quién se lo vendiste?</p>
          {revealers.length === 0 && (
            <p className="text-sm text-muted">
              Nadie ha visto tu teléfono todavía. Solo se puede elegir a quien lo haya visto; si lo vendiste por
              otra vía, usa la opción de abajo.
            </p>
          )}
          <div className="space-y-2">
            {revealers.map((r) => (
              <label key={r.id} className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
                <input type="radio" name="buyer" checked={choice === r.id} onChange={() => setChoice(r.id)} />
                <span>{r.name}</span>
              </label>
            ))}
            <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line p-3 has-[:checked]:border-brand has-[:checked]:bg-brand/5">
              <input type="radio" name="buyer" checked={choice === "fuera"} onChange={() => setChoice("fuera")} />
              <span>Lo vendí fuera de Pasillo</span>
            </label>
          </div>
          <button onClick={markSold} disabled={busy} className="btn-primary w-full">
            {busy ? "Guardando…" : "Confirmar venta"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <Link href={`/anuncios/${listingId}/editar`} className="btn-secondary text-center">✏️ Editar</Link>
        <button onClick={remove} disabled={busy} className="btn-danger">🗑 Borrar</button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
