"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AlertCircle, CircleCheck, Eye, Loader2, PencilLine, Trash2, X } from "lucide-react";
import { toast } from "@/components/ui/Toaster";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/time";
import { Avatar } from "@/components/ui/Avatar";
import { AnimatePresence, motion, SPRING } from "@/components/ui/motion";

type Revealer = { id: string; name: string; at: string };

function Modal({ onClose, children, busy }: { onClose: () => void; children: React.ReactNode; busy: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  // Portal: ancestors with filter/transform would otherwise break `fixed`.
  return createPortal(
    <motion.div
      className="fixed inset-0 z-50 grid place-items-end p-0 sm:place-items-center sm:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => !busy && onClose()} />
      <motion.div
        role="dialog"
        aria-modal="true"
        className="relative max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-line bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg sm:max-w-md sm:rounded-3xl"
        initial={{ opacity: 0, scale: 0.94, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={SPRING}
      >
        {children}
      </motion.div>
    </motion.div>,
    document.body,
  );
}

export default function SellerActions({
  listingId,
  revealers,
}: {
  listingId: string;
  revealers: Revealer[];
}) {
  const router = useRouter();
  const [modal, setModal] = useState<null | "sold" | "delete">(null);
  const [choice, setChoice] = useState<string>(revealers.length ? revealers[0].id : "fuera");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setModal(null);
    setError(null);
  };

  async function remove() {
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) {
      setBusy(false);
      setError(error.message);
      toast.error(error.message);
      return;
    }
    toast.success("Anuncio eliminado");
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
      toast.error(error.message);
      return;
    }
    toast.success("Marcado como vendido", "Ya podéis valoraros");
    setModal(null);
    router.refresh();
  }

  const errorBox = error && (
    <p className="error mt-4">
      <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
      {error}
    </p>
  );

  const options = [
    ...revealers.map((r) => ({ id: r.id, name: r.name, sub: `vio tu teléfono ${timeAgo(r.at)}` })),
    { id: "fuera", name: "Lo vendí fuera de Pasillo", sub: null as string | null },
  ];

  return (
    <div className="card space-y-4 p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft text-brand">
          <Eye size={18} strokeWidth={1.75} />
        </span>
        <p className="text-sm text-muted">
          <motion.strong
            key={revealers.length}
            initial={{ scale: 1.3 }}
            animate={{ scale: 1 }}
            transition={SPRING}
            className="inline-block text-base font-semibold tabular-nums text-foreground"
          >
            {revealers.length}
          </motion.strong>{" "}
          {revealers.length === 1 ? "persona ha visto tu teléfono" : "personas han visto tu teléfono"}
        </p>
      </div>

      <button onClick={() => setModal("sold")} className="btn-primary btn-lg w-full">
        <CircleCheck size={18} strokeWidth={1.75} /> Marcar como vendido
      </button>

      <div className="grid grid-cols-2 gap-2.5">
        <Link href={`/anuncios/${listingId}/editar`} className="btn-secondary">
          <PencilLine size={16} strokeWidth={1.75} /> Editar
        </Link>
        <button onClick={() => setModal("delete")} className="btn-danger">
          <Trash2 size={16} strokeWidth={1.75} /> Borrar
        </button>
      </div>

      <AnimatePresence>
        {modal === "delete" && (
          <Modal onClose={close} busy={busy}>
            <span className="grid h-12 w-12 place-items-center rounded-full bg-danger-soft text-danger">
              <Trash2 size={22} strokeWidth={1.75} />
            </span>
            <h2 className="mt-4 text-lg font-semibold tracking-tight">¿Borrar este anuncio?</h2>
            <p className="mt-1 text-sm text-muted">Desaparecerá para todos y no se puede deshacer.</p>
            {errorBox}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button onClick={close} disabled={busy} className="btn-secondary">
                Cancelar
              </button>
              <button
                onClick={remove}
                disabled={busy}
                className="btn bg-danger text-white hover:bg-danger/90 focus-visible:ring-danger/25"
              >
                {busy ? <Loader2 size={16} strokeWidth={1.75} className="animate-spin" /> : <Trash2 size={16} strokeWidth={1.75} />}
                Borrar
              </button>
            </div>
          </Modal>
        )}

        {modal === "sold" && (
          <Modal onClose={close} busy={busy}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">¿A quién se lo vendiste?</h2>
                <p className="mt-1 text-sm text-muted">
                  {revealers.length === 0
                    ? "Nadie ha visto tu teléfono todavía. Si lo vendiste por otra vía, elige la opción de abajo."
                    : "Elige a quien vio tu teléfono para que pueda valorarte."}
                </p>
              </div>
              <button onClick={close} disabled={busy} aria-label="Cerrar" className="btn-ghost -mr-2 -mt-1 h-9 w-9 shrink-0 px-0">
                <X size={18} strokeWidth={1.75} />
              </button>
            </div>

            <div className="mt-5 space-y-2" role="radiogroup">
              {options.map((o) => {
                const active = choice === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setChoice(o.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-[border-color,background-color] duration-200 ${
                      active ? "border-brand bg-brand-softer" : "border-line hover:border-line-strong"
                    }`}
                  >
                    {o.id === "fuera" ? (
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-2 text-muted">
                        <CircleCheck size={18} strokeWidth={1.75} />
                      </span>
                    ) : (
                      <Avatar name={o.name} size={36} />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{o.name}</span>
                      {o.sub && <span className="block text-xs text-muted">{o.sub}</span>}
                    </span>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 transition-colors duration-200 ${
                        active ? "border-brand" : "border-line-strong"
                      }`}
                    >
                      <AnimatePresence>
                        {active && (
                          <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={SPRING}
                            className="h-2.5 w-2.5 rounded-full bg-brand"
                          />
                        )}
                      </AnimatePresence>
                    </span>
                  </button>
                );
              })}
            </div>

            {errorBox}
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <button onClick={close} disabled={busy} className="btn-secondary">
                Cancelar
              </button>
              <button onClick={markSold} disabled={busy} className="btn-primary">
                {busy && <Loader2 size={16} strokeWidth={1.75} className="animate-spin" />}
                Confirmar venta
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
