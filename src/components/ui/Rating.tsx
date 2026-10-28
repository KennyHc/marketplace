import { Star } from "lucide-react";

// Compact reputation display: "4.5 · 3 valoraciones" or a "Nuevo" badge.
export function Rating({ avg, count, size = "sm" }: { avg: number | null; count: number; size?: "sm" | "md" }) {
  if (!count) {
    return <span className="badge bg-brand-soft text-brand">Nuevo</span>;
  }
  const icon = size === "md" ? 16 : 14;
  return (
    <span className={`inline-flex items-center gap-1.5 ${size === "md" ? "text-sm" : "text-[0.8125rem]"}`}>
      <Star size={icon} className="fill-warning text-warning" strokeWidth={0} />
      <span className="font-semibold text-foreground">{Number(avg).toFixed(1)}</span>
      <span className="text-muted">· {count} {count === 1 ? "valoración" : "valoraciones"}</span>
    </span>
  );
}
