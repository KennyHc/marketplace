"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";

export default function PagoToast({ pago }: { pago?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (!pago || fired.current) return;
    fired.current = true;
    switch (pago) {
      case "ok":
        toast.success("Pago completado", "El importe queda retenido hasta la entrega");
        break;
      case "entregado":
        toast.success("Entrega confirmada", "El vendedor ha recibido el pago");
        break;
      case "cancelado":
        toast.info("Pago cancelado");
        break;
      case "no-disponible":
        toast.error("Este artículo ya no está disponible");
        break;
      case "vendedor-sin-cobros":
        toast.error("El vendedor aún no acepta pago protegido");
        break;
      case "importe-minimo":
        toast.error("Importe mínimo 0,50 €");
        break;
      case "ya-liberado":
        toast.info("El pago ya se había liberado");
        break;
      default:
        toast.error("No se pudo completar la operación");
    }
    router.replace(pathname, { scroll: false });
  }, [pago, pathname, router]);

  return null;
}
