export function MovieCardSkeleton({ count = 8, fluid = false }: { count?: number; fluid?: boolean }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={fluid ? 'w-full' : 'flex-shrink-0 w-[140px] sm:w-[160px]'}>
          <div className="skeleton aspect-[2/3] w-full rounded-md" />
          <div className="mt-2 skeleton h-3 w-3/4 rounded" />
        </div>
      ))}
    </>
  );
}
