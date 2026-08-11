'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';

interface FormState { collectionDate: string; daily: string; weekend: string; territory: string; }
const initial: FormState = { collectionDate: '', daily: '', weekend: '', territory: '' };

export default function AdminBoxOfficeEditPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [form, setForm] = useState(initial);
  const [movieTitle, setMovieTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (!isLoading && (!user || user.role !== 'ADMIN')) router.replace('/'); }, [isLoading, user, router]);
  useEffect(() => {
    if (!token || user?.role !== 'ADMIN' || !params.id) return;
    const load = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/distributor/box-office/${encodeURIComponent(params.id)}`, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to load collection.');
        setMovieTitle(data.movie?.title ?? `Movie ${data.movieId}`);
        setForm({ collectionDate: new Date(data.collectionDate).toISOString().slice(0, 10), daily: data.dailyCollection != null ? String(data.dailyCollection) : '', weekend: data.weekendCollection != null ? String(data.weekendCollection) : '', territory: data.territory ?? '' });
      } catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to load collection.'); }
      finally { setLoading(false); }
    };
    void load();
  }, [params.id, token, user?.role]);

  if (isLoading || !user || user.role !== 'ADMIN') return <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">Checking access…</main>;
  const set = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage('Saving…');
    try {
      const response = await fetch(`/api/distributor/box-office/${encodeURIComponent(params.id)}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ collectionDate: form.collectionDate, dailyCollection: form.daily || null, weekendCollection: form.weekend || null, territory: form.territory || null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update collection.');
      setMessage('Collection updated successfully.'); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Update failed.'); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8 lg:px-16"><div className="mx-auto max-w-4xl"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div className="flex items-center gap-4"><Logo size={46} showText={false} /><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">CINE TRACKER</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Edit Box Office</h1><p className="mt-1 text-sm text-white/50">{movieTitle || 'Collection record'}</p></div></div><Link href="/admin" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Dashboard</Link></div>{loading ? <p className="py-12 text-center text-white/50">Loading collection…</p> : <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2"><label className="md:col-span-2"><span className="mb-2 block text-sm text-white/70">Movie</span><input value={movieTitle} disabled className="min-h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white/60" /></label><label><span className="mb-2 block text-sm text-white/70">Collection date</span><input required type="date" value={form.collectionDate} onChange={(e)=>set('collectionDate',e.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Territory / region</span><input value={form.territory} onChange={(e)=>set('territory',e.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Daily collection</span><input min="0" step="0.01" type="number" value={form.daily} onChange={(e)=>set('daily',e.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Weekend collection</span><input min="0" step="0.01" type="number" value={form.weekend} onChange={(e)=>set('weekend',e.target.value)} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><div className="flex flex-wrap items-center gap-4 md:col-span-2"><button disabled={saving} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E50914] px-6 py-3 font-bold hover:bg-[#b20710] disabled:opacity-60"><Save className="h-4 w-4" />{saving ? 'Saving…' : 'Save Changes'}</button><span role="status" className="text-sm text-white/50">{message}</span></div></form>}</div></main>;
}
