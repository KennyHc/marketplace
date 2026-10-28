// Full-viewport animated gradient backdrop: large blurred colour fields that slowly
// pulse and drift ("breathe"). Pure CSS so it costs no JS; honours reduced motion.
const BLOBS = [
  { color: "#5167FC", className: "-left-[10%] -top-[15%] h-[55vmax] w-[55vmax]", duration: "17s", delay: "0s" },
  { color: "#7C5CFC", className: "-right-[15%] top-[10%] h-[50vmax] w-[50vmax]", duration: "21s", delay: "-6s" },
  { color: "#38BDF8", className: "-bottom-[25%] left-[15%] h-[48vmax] w-[48vmax]", duration: "19s", delay: "-11s" },
  { color: "#C4B5FD", className: "-bottom-[10%] -right-[5%] h-[38vmax] w-[38vmax]", duration: "23s", delay: "-3s" },
];

export function BreathingBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-background">
      {BLOBS.map((b) => (
        <div
          key={b.color}
          className={`absolute rounded-full blur-[70px] animate-breathe will-change-transform ${b.className}`}
          style={{
            background: `radial-gradient(circle at center, ${b.color} 0%, transparent 68%)`,
            animationDuration: b.duration,
            animationDelay: b.delay,
          }}
        />
      ))}
      {/* soft white veil keeps text contrast high, plus a faint grain-like dot grid */}
      <div className="absolute inset-0 bg-background/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgb(15_18_34/0.05)_1px,transparent_0)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
    </div>
  );
}
