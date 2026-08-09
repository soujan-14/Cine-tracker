'use client';

import { motion } from 'framer-motion';
import { Newspaper, ArrowRight } from 'lucide-react';

const newsItems = [
  {
    tag: 'Box Office',
    title: 'Theaters report stronger weekday attendance',
    summary: 'Regional chains see renewed momentum heading into late summer.',
    color: 'text-cyan-400 bg-cyan-400/10',
  },
  {
    tag: 'Streaming',
    title: 'Streaming-exclusive debuts reshape weekend comparisons',
    summary: 'Analysts note a more fragmented release cycle across major markets.',
    color: 'text-violet-400 bg-violet-400/10',
  },
  {
    tag: 'Marketing',
    title: 'International marketing pushes gain traction',
    summary: 'Several mid-budget titles are benefiting from premium brand campaigns.',
    color: 'text-amber-400 bg-amber-400/10',
  },
];

export function LatestNewsSection() {
  return (
    <section>
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="section-label">Latest news</p>
          <h2 className="section-title">What changed across the market</h2>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {newsItems.map((item, i) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: i * 0.08 }}
            className="glass group cursor-pointer rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${item.color}`}>
                <Newspaper className="h-3 w-3" />
                {item.tag}
              </span>
            </div>
            <h3 className="mt-3 text-sm font-semibold leading-snug text-slate-100 transition-colors group-hover:text-white">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.summary}</p>
            <div className="mt-4 flex items-center gap-1 text-xs font-medium text-slate-500 transition-colors group-hover:text-cyan-400">
              Read recap <ArrowRight className="h-3 w-3" />
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
