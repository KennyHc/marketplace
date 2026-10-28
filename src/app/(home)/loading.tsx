export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="pb-8 pt-12">
        <div className="skeleton h-3 w-20" />
        <div className="skeleton mt-3 h-9 w-full max-w-xl" />
        <div className="skeleton mt-3 h-5 w-full max-w-md" />
        <div className="skeleton mt-6 h-14 w-full max-w-2xl rounded-2xl" />
      </div>
      <div className="flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-10 w-28 shrink-0 rounded-full" />
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i}>
            <div className="skeleton aspect-square w-full rounded-2xl" />
            <div className="skeleton mt-3 h-5 w-1/3" />
            <div className="skeleton mt-2 h-4 w-4/5" />
            <div className="skeleton mt-2 h-3 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
