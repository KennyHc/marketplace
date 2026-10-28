"use client";

import { useActionState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Loader2, Phone, UserRound } from "lucide-react";
import { motion, AnimatePresence, SPRING } from "@/components/ui/motion";
import { toast } from "@/components/ui/Toaster";
import { saveProfile, type ProfileState } from "./actions";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {});
  useEffect(() => {
    if (state.ok) toast.success("Perfil actualizado");
  }, [state]);
  return (
    <form action={action} className="card space-y-5 p-5 sm:p-6">
      <div>
        <h2 className="text-base font-semibold tracking-tight">Tus datos</h2>
        <p className="mt-0.5 text-sm text-muted">Así te verán tus compañeros.</p>
      </div>
      <div>
        <label htmlFor="name" className="label">Nombre</label>
        <div className="relative">
          <UserRound size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input id="name" name="name" required defaultValue={name} className="input pl-10" autoComplete="name" />
        </div>
      </div>
      <div>
        <label htmlFor="phone" className="label">Teléfono</label>
        <div className="relative">
          <Phone size={18} strokeWidth={1.75} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
          <input id="phone" name="phone" type="tel" required defaultValue={phone} className="input pl-10" autoComplete="tel" />
        </div>
        <p className="hint">Solo se comparte con quien compre o venda contigo.</p>
      </div>
      <AnimatePresence initial={false}>
        {state.error && (
          <motion.div key="err" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="error" role="alert">
            <AlertCircle size={16} strokeWidth={1.75} className="mt-0.5 shrink-0" />
            {state.error}
          </motion.div>
        )}
        {state.ok && !pending && (
          <motion.div key="ok" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center gap-2 rounded-xl border border-success/20 bg-success-soft px-3.5 py-2.5 text-sm font-medium text-success" role="status">
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={SPRING} className="inline-flex">
              <CheckCircle2 size={18} strokeWidth={1.75} />
            </motion.span>
            Perfil guardado
          </motion.div>
        )}
      </AnimatePresence>
      <button type="submit" className="btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" /> Guardando…</> : "Guardar cambios"}
      </button>
    </form>
  );
}
