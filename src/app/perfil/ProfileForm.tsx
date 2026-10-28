"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileState } from "./actions";

export function ProfileForm({ name, phone }: { name: string; phone: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, {});
  return (
    <form action={action} className="card space-y-4 p-4">
      <div>
        <label htmlFor="name" className="label">Nombre</label>
        <input id="name" name="name" required defaultValue={name} className="input" autoComplete="name" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Teléfono</label>
        <input id="phone" name="phone" type="tel" required defaultValue={phone} className="input" autoComplete="tel" />
        <p className="mt-1 text-xs text-muted">Solo se comparte con quien compre o venda contigo.</p>
      </div>
      {state.error && <div className="error" role="alert">{state.error}</div>}
      {state.ok && <div className="rounded-xl bg-green-50 px-3.5 py-2.5 text-sm text-green-700">Perfil guardado.</div>}
      <button type="submit" className="btn-primary w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
