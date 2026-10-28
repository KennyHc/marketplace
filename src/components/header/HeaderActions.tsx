"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { motion, SPRING } from "@/components/ui/motion";
import { Avatar } from "@/components/ui/Avatar";

export function HeaderActions({ name }: { name: string | null }) {
  return (
    <nav className="flex items-center gap-2">
      <motion.div whileTap={{ scale: 0.96 }} transition={SPRING}>
        <Link href="/anuncios/nuevo" className="btn-primary btn-sm gap-1.5 sm:h-10 sm:px-4" aria-label="Publicar anuncio">
          <Plus size={18} strokeWidth={2} />
          <span className="hidden sm:inline">Publicar</span>
        </Link>
      </motion.div>
      <motion.div whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }} transition={SPRING}>
        <Link href="/perfil" aria-label="Mi perfil" className="grid h-10 w-10 place-items-center rounded-full transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25">
          <Avatar name={name} size={34} />
        </Link>
      </motion.div>
    </nav>
  );
}
