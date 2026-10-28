"use client";

import { motion } from "motion/react";
import { EASE } from "@/components/ui/motion";

// Soft fade-up on every route change. Only opacity + translate (no filter), and the
// transform resolves to `none`, so position: fixed descendants keep working once it settles.
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transitionEnd: { transform: "none" } }}
      transition={{ duration: 0.4, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
