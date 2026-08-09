import { BoxOfficeData } from '@/types/boxoffice';

interface Props {
  data: BoxOfficeData | undefined;
  isLoading?: boolean;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${Math.round(n / 1_000_000)}M`;
  if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${n}`;
}

export function BoxOfficeBadge({ data, isLoading }: Props) {
  if (isLoading) {
    return <div className="mt-1 h-3 w-16 animate-pulse rounded bg-white/10" />;
  }

  const gross = data?.worldwide ?? data?.domestic;
  if (!gross) return null;

  return (
    <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#E50914]">
      💰 {fmt(gross)}
    </p>
  );
}
