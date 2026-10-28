"use client";

import { useFormStatus } from "react-dom";
import { ArrowUpRight, Loader2 } from "lucide-react";

export default function ConnectButton({ label, variant }: { label: string; variant: "primary" | "secondary" }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={`btn-${variant} w-full sm:w-auto`}>
      {pending ? <Loader2 size={16} strokeWidth={1.75} className="animate-spin" /> : <ArrowUpRight size={16} strokeWidth={1.75} />}
      {pending ? "Abriendo Stripe" : label}
    </button>
  );
}
