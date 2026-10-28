"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { categoryLabel, formatPrice, type Category } from "@/lib/types";
import { timeAgo } from "@/lib/time";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { HoverCard, Stagger, StaggerItem } from "@/components/ui/motion";

export type Row = { id: string; title: string; price: number; category: Category; photo_url: string; created_at: string };

export default function ListingGrid({ listings }: { listings: Row[] }) {
  return (
    <Stagger gap={0.04} className="grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 md:gap-x-5 lg:grid-cols-4">
      {listings.map((l) => (
        <StaggerItem key={l.id}>
          <HoverCard>
            <Link href={`/anuncios/${l.id}`} className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/25">
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-line bg-surface-2 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={l.photo_url}
                  alt={l.title}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-105"
                />
                <span className="absolute left-2.5 top-2.5 inline-flex max-w-[85%] items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-foreground shadow-xs backdrop-blur">
                  <CategoryIcon category={l.category} size={13} className="shrink-0 text-brand" />
                  <span className="truncate">{categoryLabel(l.category)}</span>
                </span>
              </div>
              <div className="px-0.5 pt-3">
                <p className="text-lg font-semibold tabular-nums tracking-tight">{formatPrice(l.price)}</p>
                <h3 className="mt-0.5 line-clamp-2 text-sm leading-snug text-foreground/90">{l.title}</h3>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-muted">
                  <Clock size={12} strokeWidth={1.75} />
                  {timeAgo(l.created_at)}
                </p>
              </div>
            </Link>
          </HoverCard>
        </StaggerItem>
      ))}
    </Stagger>
  );
}
