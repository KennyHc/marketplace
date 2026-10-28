// Initials avatar with a stable tinted background derived from the name.
const TINTS = ["#5167FC", "#7C5CFC", "#12A37F", "#E5484D", "#F2A516", "#0EA5E9", "#D946EF"];

export function Avatar({ name, size = 40 }: { name: string | null | undefined; size?: number }) {
  const label = (name ?? "?").trim() || "?";
  const initials = label.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");
  const tint = TINTS[[...label].reduce((a, c) => a + c.charCodeAt(0), 0) % TINTS.length];
  return (
    <span
      className="inline-grid shrink-0 place-items-center rounded-full font-semibold text-white ring-2 ring-surface"
      style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${tint}, ${tint}cc)` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
