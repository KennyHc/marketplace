"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

function whatsappUrl(phone: string) {
  let d = phone.replace(/\D/g, "");
  if (d.length === 9) d = "34" + d;
  return `https://wa.me/${d}`;
}

export default function PhoneReveal({ listingId }: { listingId: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsProfile, setNeedsProfile] = useState(false);
  const [loading, setLoading] = useState(false);

  async function reveal() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("reveal_phone", { p_listing_id: listingId });
    setLoading(false);
    if (error) {
      if (error.message.includes("Completa tu perfil")) setNeedsProfile(true);
      else setError(error.message);
      return;
    }
    setPhone(data as string);
  }

  if (phone) {
    return (
      <div className="card space-y-3 p-4">
        <p className="label">Teléfono del vendedor</p>
        <a href={`tel:${phone}`} className="block text-2xl font-bold tracking-wide text-brand">
          {phone}
        </a>
        <div className="grid grid-cols-2 gap-2">
          <a href={`tel:${phone}`} className="btn-secondary text-center">📞 Llamar</a>
          <a href={whatsappUrl(phone)} target="_blank" rel="noopener noreferrer" className="btn-primary text-center">
            💬 WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button onClick={reveal} disabled={loading || needsProfile} className="btn-primary w-full py-3 text-base">
        {loading ? "Cargando…" : "📞 Ver teléfono"}
      </button>
      {needsProfile && (
        <p className="error">
          Completa tu perfil para ver el teléfono.{" "}
          <Link href="/perfil?completar=1" className="font-semibold underline">Ir a mi perfil</Link>
        </p>
      )}
      {error && <p className="error">{error}</p>}
    </div>
  );
}
