import { Button } from '@/components/ui/button';

export function SiteHeader() {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 px-6 py-4">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Cine Tracker</p>
          <p className="text-sm text-slate-400">Box office analytics dashboard</p>
        </div>
        <Button>Explore</Button>
      </div>
    </header>
  );
}
