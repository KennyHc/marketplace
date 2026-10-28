"use client";

import { BadgeCheck, CreditCard, Handshake, ShieldCheck } from "lucide-react";
import SubmitButton from "./submit-button";

const STEPS = [
  { Icon: CreditCard, label: "Pagas con tarjeta" },
  { Icon: Handshake, label: "Recoges en el edificio" },
  { Icon: BadgeCheck, label: "Confirmas y el vendedor cobra" },
];

function BuyForm({ listingId, price }: { listingId: string; price: string }) {
  return (
    <form action="/api/checkout" method="POST">
      <input type="hidden" name="listing_id" value={listingId} />
      <SubmitButton className="btn-primary btn-lg w-full" pendingLabel="Redirigiendo a Stripe">
        <ShieldCheck size={18} strokeWidth={1.75} /> Comprar por {price}
      </SubmitButton>
    </form>
  );
}

export default function BuyCard({ listingId, price }: { listingId: string; price: string }) {
  return (
    <>
      <div className="card border-brand/20 bg-brand-softer p-5">
        <p className="eyebrow flex items-center gap-1.5 text-brand">
          <ShieldCheck size={14} strokeWidth={1.75} /> Pago protegido
        </p>
        <ul className="mt-3 space-y-2.5">
          {STEPS.map(({ Icon, label }, i) => (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface text-brand shadow-sm">
                <Icon size={16} strokeWidth={1.75} />
              </span>
              <span>
                <span className="mr-1.5 tabular-nums text-subtle">{i + 1}.</span>
                {label}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-4 hidden lg:block">
          <BuyForm listingId={listingId} price={price} />
        </div>
        <p className="mt-3 text-xs text-muted">Pago de prueba (Stripe test mode)</p>
      </div>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden">
        <BuyForm listingId={listingId} price={price} />
      </div>
    </>
  );
}
