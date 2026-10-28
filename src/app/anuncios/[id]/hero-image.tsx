"use client";

import { BadgeCheck } from "lucide-react";
import { motion, EASE } from "@/components/ui/motion";

export default function HeroImage({ src, alt, sold }: { src: string; alt: string; sold: boolean }) {
  return (
    <div className="relative aspect-square max-h-[62vh] w-full overflow-hidden rounded-3xl border border-line bg-surface-2 shadow-md sm:aspect-[4/3] lg:max-h-none">
      <motion.div
        className="h-full w-full"
        initial={{ scale: 1.06, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.9, ease: EASE }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={`h-full w-full object-cover ${sold ? "opacity-70 saturate-50" : ""}`} />
      </motion.div>
      {sold && (
        <span className="badge absolute left-4 top-4 gap-1.5 bg-foreground px-3 py-1.5 text-sm text-white shadow-md">
          <BadgeCheck size={16} strokeWidth={1.75} /> Vendido
        </span>
      )}
    </div>
  );
}
