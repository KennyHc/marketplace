// Wordmark: a rounded "doorway" glyph (the hallway) + name.
export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-[10px] bg-brand shadow-brand">
        <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" aria-hidden>
          <path d="M6 20V9a6 6 0 0 1 12 0v11" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
          <path d="M3.5 20h17" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="14.5" cy="14" r="1.25" fill="white" />
        </svg>
      </span>
      <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">Pasillo</span>
    </span>
  );
}
