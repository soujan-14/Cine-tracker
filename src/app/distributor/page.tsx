'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';

const initialForm = { movieId: '', title: '', daily: '', weekend: '', collectionDate: new Date().toISOString().slice(0, 10), territory: '' };

export default function DistributorPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<Array<{ id: string; movieId: number; dailyCollection: number | null; weekendCollection: number | null; collectionDate: string; territory: string | null; verified: boolean; movie?: { title: string } }>>([]);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'DISTRIBUTOR')) router.replace('/');
  }, [isLoading, user, router]);

  async function loadRecords() {
    if (!token) return;
    try {
      const response = await fetch('/api/distributor/box-office', { headers: { Authorization: `Bearer ${token}` } });
      if (response.ok) setRecords(await response.json());
    } catch {
      // Dashboard remains usable if history cannot be loaded.
    }
  }

  useEffect(() => { if (user?.role === 'DISTRIBUTOR') void loadRecords(); }, [user?.role, token]);

  if (isLoading || !user || user.role !== 'DISTRIBUTOR') return <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">Checking access…</main>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('Updating…');
    try {
      const response = await fetch('/api/distributor/box-office', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ movieId: Number(form.movieId), title: form.title, dailyCollection: form.daily || null, weekendCollection: form.weekend || null, collectionDate: form.collectionDate, territory: form.territory }),
      });
      const data = await response.json();
      setMessage(response.ok ? (response.status === 200 ? 'Collection updated.' : 'Collection saved.') : data.error || 'Update failed.');
      if (response.ok) await loadRecords();
    } catch {
      setMessage('Network error.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4"><Logo size={46} /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">Cine Tracker</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Distributor Dashboard</h1><p className="mt-1 text-sm text-white/50">Publish daily and weekend collection updates.</p></div></div>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2">
          <label><span className="mb-2 block text-sm text-white/70">Movie ID</span><input required type="number" value={form.movieId} onChange={(e) => setForm({ ...form, movieId: e.target.value })} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label>
          <label><span className="mb-2 block text-sm text-white/70">Movie title (needed for a new association)</span><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label>
          <label><span className="mb-2 block text-sm text-white/70">Collection date</span><input required type="date" value={form.collectionDate} onChange={(e) => setForm({ ...form, collectionDate: e.target.value })} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label>
          <label><span className="mb-2 block text-sm text-white/70">Territory / region</span><input value={form.territory} onChange={(e) => setForm({ ...form, territory: e.target.value })} placeholder="India / Karnataka / Worldwide" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label>
          <label><span className="mb-2 block text-sm text-white/70">Daily collection</span><input min="0" step="0.01" type="number" value={form.daily} onChange={(e) => setForm({ ...form, daily: e.target.value })} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label>
          <label><span className="mb-2 block text-sm text-white/70">Weekend collection</span><input min="0" step="0.01" type="number" value={form.weekend} onChange={(e) => setForm({ ...form, weekend: e.target.value })} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label>
          <div className="flex flex-wrap items-center gap-4 md:col-span-2"><button disabled={saving} className="min-h-11 rounded-xl bg-[#E50914] px-6 py-3 font-bold hover:bg-[#b20710] disabled:opacity-60">{saving ? 'Saving…' : 'Update Box Office'}</button><span role="status" className="text-sm text-white/50">{message}</span></div>
        </form>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Recent submissions</h2><span className="text-xs text-white/40">Reported collections</span></div>
          <div className="overflow-x-auto">
            <table className="min-w-[720px] w-full text-left text-sm"><thead><tr className="border-b border-white/10 text-white/45"><th className="px-3 py-3">Movie</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Territory</th><th className="px-3 py-3">Daily</th><th className="px-3 py-3">Weekend</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{records.map((record) => <tr key={record.id} className="border-b border-white/5 text-white/75"><td className="px-3 py-3 font-medium">{record.movie?.title ?? `Movie ${record.movieId}`}</td><td className="px-3 py-3">{new Date(record.collectionDate).toLocaleDateString()}</td><td className="px-3 py-3">{record.territory ?? '—'}</td><td className="px-3 py-3">{record.dailyCollection ?? '—'}</td><td className="px-3 py-3">{record.weekendCollection ?? '—'}</td><td className="px-3 py-3">{record.verified ? 'Verified' : 'Reported'}</td></tr>)}</tbody></table>
            {!records.length && <p className="py-8 text-center text-sm text-white/40">No collection submissions yet.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
