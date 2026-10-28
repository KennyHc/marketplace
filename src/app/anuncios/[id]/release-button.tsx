"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { PackageCheck, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion, SPRING } from "@/components/ui/motion";
import SubmitButton from "./submit-button";

export default function ReleaseButton({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-primary btn-lg w-full">
        <PackageCheck size={18} strokeWidth={1.75} /> He recibido el artículo
      </button>
      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                className="fixed inset-0 z-50 grid place-items-end p-0 sm:place-items-center sm:p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <div className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" onClick={() => setOpen(false)} />
                <motion.div
                  role="dialog"
                  aria-modal="true"
                  className="relative w-full rounded-t-3xl border border-line bg-surface p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-lg sm:max-w-md sm:rounded-3xl"
                  initial={{ opacity: 0, scale: 0.94, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: 12 }}
                  transition={SPRING}
                >
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-brand">
                    <ShieldCheck size={22} strokeWidth={1.75} />
                  </span>
                  <h2 className="mt-4 text-lg font-semibold tracking-tight">¿Has recibido el artículo?</h2>
                  <p className="mt-1 text-sm text-muted">
                    Se liberará el pago al vendedor. Esta acción no se puede deshacer.
                  </p>
                  <form action="/api/orders/release" method="POST" className="mt-6 grid grid-cols-2 gap-2.5">
                    <input type="hidden" name="order_id" value={orderId} />
                    <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                      Cancelar
                    </button>
                    <SubmitButton className="btn-primary" pendingLabel="Liberando">
                      Confirmar
                    </SubmitButton>
                  </form>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
