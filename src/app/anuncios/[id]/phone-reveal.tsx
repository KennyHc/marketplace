"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertCircle, Loader2, MessageCircle, Phone, ShieldCheck } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion, SPRING } from "@/components/ui/motion";

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
      else {
        setError(error.message);
        toast.error(error.message);
      }
      return;
    }
    setPhone(data as string);
    toast.info("Teléfono visible", "El vendedor sabrá que te interesa");
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {phone ? (
        <motion.div
          key="revealed"
          initial={{ opacity: 0, scale: 0.92, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={SPRING}
          className="relative mt-4 overflow-hidden rounded-2xl border border-brand/20 bg-brand-softer p-5 shadow-md"
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
            initial={{ left: "-35%" }}
            animate={{ left: "120%" }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
          />
          <p className="eyebrow flex items-center gap-1.5">
            <ShieldCheck size={14} strokeWidth={1.75} /> Teléfono del vendedor
          </p>
          <a
            href={`tel:${phone}`}
            className="mt-2 block text-3xl font-semibold tabular-nums tracking-tight text-foreground"
          >
            {phone}
          </a>
          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <a href={`tel:${phone}`} className="btn-secondary btn-lg">
              <Phone size={18} strokeWidth={1.75} /> Llamar
            </a>
            <a href={whatsappUrl(phone)} target="_blank" rel="noopener noreferrer" className="btn-primary btn-lg">
              <MessageCircle size={18} strokeWidth={1.75} /> WhatsApp
            </a>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="cta"
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:static lg:mt-4 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
        >
          <AnimatePresence initial={false}>
            {(needsProfile || error) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <p className="error mb-2.5">
                  <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
                  {needsProfile ? (
                    <span>
                      Completa tu perfil para ver el teléfono.{" "}
                      <Link href="/perfil?completar=1" className="font-semibold underline">
                        Ir a mi perfil
                      </Link>
                    </span>
                  ) : (
                    <span>{error}</span>
                  )}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={reveal} disabled={loading || needsProfile} className="btn-primary btn-lg w-full">
            {loading ? (
              <Loader2 size={18} strokeWidth={1.75} className="animate-spin" />
            ) : (
              <Phone size={18} strokeWidth={1.75} />
            )}
            {loading ? "Cargando" : "Ver teléfono"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
