"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "@/components/ui/Toaster";

export default function CobrosToast({ cobros, ready }: { cobros?: string; ready: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (!cobros || fired.current) return;
    fired.current = true;
    if (cobros === "1") {
      if (ready) toast.success("Cobros actualizados");
      else toast.info("Alta en Stripe pendiente");
    } else {
      toast.error("No se pudo completar la operación");
    }
    router.replace(pathname, { scroll: false });
  }, [cobros, ready, pathname, router]);

  return null;
}
