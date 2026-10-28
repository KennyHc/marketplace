"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const LABELS = ["", "Mal", "Regular", "Bien", "Muy bien", "¡Excelente!"];

export default function RatingBox({
  listingId,
  toUser,
  toName,
}: {
  listingId: string;
  toUser: string;
  toName: string;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit() {
    if (!stars) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("ratings").insert({ listing_id: listingId, to_user: toUser, stars });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    router.refresh();
  }

  const shown = hover || stars;

  if (done) {
    return (
      <div className="card p-5 text-center">
        <p className="text-4xl">🎉</p>
        <p className="mt-1 font-semibold">¡Gracias por tu valoración!</p>
      </div>
    );
  }

  return (
    <div className="card space-y-3 p-5 text-center">
      <p className="font-semibold">¿Qué tal fue la operación con {toName}?</p>
      <div className="flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            onMouseEnter={() => setHover(n)}
            onClick={() => setStars(n)}
            className={`p-1 text-5xl leading-none transition-transform active:scale-90 ${
              n <= shown ? "scale-110 text-amber-400" : "text-line"
            }`}
          >
            ★
          </button>
        ))}
      </div>
      <p className="h-5 text-sm text-muted">{LABELS[shown]}</p>
      <button onClick={submit} disabled={!stars || busy} className="btn-primary w-full disabled:opacity-50">
        {busy ? "Enviando…" : "Enviar valoración"}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
