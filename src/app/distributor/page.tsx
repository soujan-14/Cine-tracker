'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DistributorPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ movieId: '', title: '', daily: '', weekend: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'DISTRIBUTOR')) router.replace('/');
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'DISTRIBUTOR') return <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">Checking access…</main>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('Updating…');
    try {
      const response = await fetch('/api/distributor/box-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: Number(form.movieId), title: form.title, dailyCollection: form.daily || null, weekendCollection: form.weekend || null }),
      });
      const data = await response.json();
      setMessage(response.ok ? 'Box office updated.' : data.error || 'Update failed.');
    } catch { setMessage('Network error.'); }
  }

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-10 text-white sm:px-8 lg:px-16"><div className="mx-auto max-w-4xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E50914]">Cine Tracker</p><h1 className="mt-2 text-4xl font-black">Distributor Dashboard</h1><p className="mt-2 text-white/50">Publish daily and weekend collection updates.</p><form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2"><label><span className="mb-2 block text-sm text-white/70">TMDB Movie ID</span><input required type="number" value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Movie title</span><input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Daily collection</span><input type="number" value={form.daily} onChange={(e) => setForm({ ...form, daily: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Weekend collection</span><input type="number" value={form.weekend} onChange={(e) => setForm({ ...form, weekend: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><div className="md:col-span-2 flex items-center gap-4"><button className="rounded-xl bg-[#E50914] px-6 py-3 font-bold hover:bg-[#b20710]">Update Box Office</button><span className="text-sm text-white/50">{message}</span></div></form></div></main>;
}
