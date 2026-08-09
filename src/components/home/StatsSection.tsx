'use client';

import { motion } from 'framer-motion';
import { BarChart3, CircleDollarSign, Film, Users } from 'lucide-react';

const stats = [
  { title: 'Movies tracked', value: '1,240+', detail: 'across 72 regions', icon: Film, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { title: 'Weekly revenue', value: '$84.3M', detail: 'projected average', icon: CircleDollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  { title: 'Audience reach', value: '92M', detail: 'monthly active viewers', icon: Users, color: 'text-violet-400', bg: 'bg-violet-400/10' },
  { title: 'Forecast accuracy', value: '93%', detail: 'with live updates', icon: BarChart3, color: 'text-amber-400', bg: 'bg-amber-400/10' },
];

export function StatsSection() {
  return (
    <section>
      <div className="mb-6">
        <p className="section-label">Performance at a glance</p>
        <h2 className="section-title">A pulse view of the market</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
              className="glass rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:glow-cyan-sm"
            >
              <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${item.bg} ${item.color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-white">{item.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-300">{item.title}</p>
              <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
