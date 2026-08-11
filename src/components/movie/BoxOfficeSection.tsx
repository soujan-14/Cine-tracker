import { BoxOfficeData } from '@/types/boxoffice';

interface Props {
  data: BoxOfficeData | undefined;
  isLoading: boolean;
}

function fmt(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

const STATUS_STYLES: Record<string, string> = {
  Blockbuster: 'bg-[#E50914]/20 text-[#E50914] border-[#E50914]/30',
  Hit: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Average: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Flop: 'bg-white/10 text-white/50 border-white/10',
};

const STATUS_ICONS: Record<string, string> = {
  Blockbuster: '🔥',
  Hit: '📈',
  Average: '📊',
  Flop: '📉',
};

export function BoxOfficeSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="space-y-3 animate-pulse">
        <div className="h-5 w-32 rounded bg-neutral-800" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-xl bg-neutral-800" />)}
        </div>
      </div>
    );
  }

  const hasAnyData = data && data.source !== 'none' && (data.worldwide || data.domestic || data.budget || data.openingWeekend);
  if (!hasAnyData) {
    return <div className="rounded-xl border border-white/10 bg-neutral-900/50 px-5 py-4"><p className="text-sm text-white/40">Box office data unavailable</p></div>;
  }

  const local = data.source === 'local';
  const stats = [
    data.worldwide && { label: local ? '💰 Reported Collection' : '💰 Worldwide', value: fmt(data.worldwide) },
    data.localDailyTotal ? { label: '📅 Daily Total', value: fmt(data.localDailyTotal) } : null,
    data.localWeekend ? { label: '🏆 Weekend', value: fmt(data.localWeekend) } : data.domestic ? { label: '🇺🇸 Domestic', value: fmt(data.domestic) } : null,
    data.budget ? { label: '🎬 Budget', value: fmt(data.budget) } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-bold text-white">Box Office</h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
          {local ? (data.verified ? 'Verified Collection' : 'Reported Collection') : `Source: ${data.source.toUpperCase()}`}
        </span>
        {data.status && <span className={`rounded-full border px-3 py-1 text-xs font-bold ${STATUS_STYLES[data.status]}`}>{STATUS_ICONS[data.status]} {data.status}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => <div key={stat.label} className="rounded-xl border border-white/10 bg-neutral-900 px-4 py-4"><p className="text-xs text-white/40">{stat.label}</p><p className="mt-1 text-lg font-black text-white">{stat.value}</p></div>)}
      </div>
    </div>
  );
}
