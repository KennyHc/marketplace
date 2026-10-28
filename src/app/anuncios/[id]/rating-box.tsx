"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, CircleCheck, Loader2, Star } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatePresence, motion, SPRING } from "@/components/ui/motion";

const LABELS = ["", "Mala", "Regular", "Bien", "Muy bien", "Excelente"];

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
      toast.error(error.message);
      return;
    }
    toast.success("Valoración enviada");
    setDone(true);
    // Let the success state show before the server re-render swaps in the "given" view.
    setTimeout(() => router.refresh(), 1800);
  }

  const shown = hover || stars;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {done ? (
        <motion.div
          key="done"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={SPRING}
          className="card flex flex-col items-center gap-2 p-6 text-center"
        >
          <motion.span
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.1 }}
            className="grid h-14 w-14 place-items-center rounded-full bg-success-soft text-success"
          >
            <CircleCheck size={30} strokeWidth={1.75} />
          </motion.span>
          <p className="font-semibold">Gracias por tu valoración</p>
          <p className="text-sm text-muted">Ayuda a que Pasillo sea un lugar de confianza.</p>
        </motion.div>
      ) : (
        <motion.div key="form" exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.15 }} className="card p-5 text-center">
          <div className="flex items-center justify-center gap-2.5">
            <Avatar name={toName} size={36} />
            <p className="text-left font-semibold leading-snug">¿Qué tal fue con {toName}?</p>
          </div>

          <div className="mt-4 flex justify-center gap-1" onMouseLeave={() => setHover(0)}>
            {[1, 2, 3, 4, 5].map((n) => {
              const on = n <= shown;
              return (
                <motion.button
                  key={n}
                  type="button"
                  aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  onMouseEnter={() => setHover(n)}
                  onClick={() => setStars(n)}
                  whileHover={{ scale: 1.18 }}
                  whileTap={{ scale: 0.85 }}
                  animate={{ scale: on && n === stars ? 1.1 : 1 }}
                  transition={SPRING}
                  className="rounded-xl p-1.5 outline-none focus-visible:ring-4 focus-visible:ring-brand/25"
                >
                  <Star
                    size={38}
                    strokeWidth={1.75}
                    className={`transition-colors duration-150 ${on ? "fill-warning text-warning" : "text-line-strong"}`}
                  />
                </motion.button>
              );
            })}
          </div>

          <div className="relative h-6">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={shown}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-x-0 text-sm font-medium text-muted"
              >
                {LABELS[shown] || "Toca una estrella"}
              </motion.p>
            </AnimatePresence>
          </div>

          <button onClick={submit} disabled={!stars || busy} className="btn-primary mt-4 w-full">
            {busy && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
            {busy ? "Enviando" : "Enviar valoración"}
          </button>
          {error && (
            <p className="error mt-3 text-left">
              <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
              {error}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
