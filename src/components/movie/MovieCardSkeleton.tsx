export function MovieCardSkeleton({ count = 8, fluid = false }: { count?: number; fluid?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={fluid ? 'w-full' : 'flex-shrink-0 w-[140px] sm:w-[170px] md:w-[180px]'}>
          <div className="flex h-full flex-col rounded-md bg-[#141414]">
            <div className="skeleton aspect-[2/3] w-full rounded-t-md" />
            <div className="flex flex-col gap-2 p-2 md:p-3">
              <div className="skeleton h-4 w-full rounded" />
              <div className="flex gap-2">
                <div className="skeleton h-3 w-12 rounded" />
                <div className="skeleton h-3 w-16 rounded" />
              </div>
              <div className="skeleton h-7 w-full rounded" />
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
