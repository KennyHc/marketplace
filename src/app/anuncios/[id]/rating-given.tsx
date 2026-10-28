"use client";

import { Star } from "lucide-react";
import { motion, SPRING } from "@/components/ui/motion";

export default function RatingGiven({ stars, name }: { stars: number; name: string }) {
  return (
    <div className="card flex flex-col items-center gap-3 p-5 text-center">
      <div className="flex gap-1" role="img" aria-label={`${stars} de 5 estrellas`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <motion.span
            key={n}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ...SPRING, delay: 0.05 * n }}
          >
            <Star
              size={26}
              strokeWidth={1.75}
              className={n <= stars ? "fill-warning text-warning" : "text-line-strong"}
            />
          </motion.span>
        ))}
      </div>
      <p className="text-sm text-muted">
        Valoraste a <strong className="font-semibold text-foreground">{name}</strong>
      </p>
    </div>
  );
}
