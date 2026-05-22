export function SkeletonGrid() {
  return (
    <div className="columns-1 gap-4 px-5 sm:columns-2 sm:px-8 lg:columns-3 xl:columns-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="mb-4 break-inside-avoid overflow-hidden rounded-[2rem] border border-black/5 bg-white/45 p-3 shadow-xl shadow-black/5 backdrop-blur-2xl dark:border-white/8 dark:bg-white/7"
        >
          <div className="skeleton-shine aspect-[4/5] rounded-[1.55rem]" />
          <div className="mt-4 h-4 w-2/3 rounded-full bg-black/8 dark:bg-white/10" />
          <div className="mt-3 h-3 w-4/5 rounded-full bg-black/6 dark:bg-white/8" />
          <div className="mt-5 h-11 rounded-full bg-black/8 dark:bg-white/10" />
        </div>
      ))}
    </div>
  );
}
