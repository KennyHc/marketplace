"use client";

import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import { CATEGORIES, type Category } from "@/lib/types";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { motion, SPRING } from "@/components/ui/motion";

export default function CategoryChips({ q, cat }: { q: string; cat?: string }) {
  const href = (c?: string) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (c) p.set("cat", c);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const items = [{ value: undefined as string | undefined, label: "Todas" }, ...CATEGORIES];
  return (
    <div className="relative -mx-4 sm:mx-0">
      <div className="flex gap-2 overflow-x-auto px-4 py-1 [scrollbar-width:none] sm:px-0 [&::-webkit-scrollbar]:hidden">
        {items.map((c) => {
          const active = (cat ?? undefined) === c.value;
          return (
            <Link
              key={c.value ?? "all"}
              href={href(c.value)}
              scroll={false}
              aria-current={active ? "true" : undefined}
              className={`relative inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "border-transparent text-white"
                  : "border-line bg-surface text-muted hover:border-line-strong hover:text-foreground"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="cat-pill"
                  transition={SPRING}
                  className="absolute inset-0 rounded-full bg-brand shadow-brand"
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {c.value ? (
                  <CategoryIcon category={c.value as Category} size={16} />
                ) : (
                  <LayoutGrid size={16} strokeWidth={1.75} />
                )}
                {c.label}
              </span>
            </Link>
          );
        })}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-4 bg-gradient-to-r from-background to-transparent sm:hidden" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background to-transparent sm:hidden" />
    </div>
  );
}
