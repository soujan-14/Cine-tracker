import { ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Newsletter() {
  return (
    <section>
      <Card className="overflow-hidden border border-cyan-400/15 bg-gradient-to-r from-cyan-500/10 via-slate-900/90 to-fuchsia-500/10 p-0">
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:items-center lg:p-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Stay ahead</p>
            <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              Get the weekly box office briefing in your inbox.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">
              Receive curated updates on breakout titles, weekend swings, and the next major releases shaping the market.
            </p>
          </div>

          <div className="rounded-[24px] border border-white/10 bg-slate-950/70 p-4">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-300">
              <Mail className="h-4 w-4 text-cyan-300" />
              <span>Enter your email</span>
            </div>
            <Button className="mt-4 w-full rounded-full bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-300">
              Subscribe <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="mt-3 text-xs text-slate-500">No spam. Just premium weekly insights.</p>
          </div>
        </div>
      </Card>
    </section>
  );
}
