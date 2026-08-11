'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Eye, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';

const initialForm = { movieId: '', title: '', daily: '', weekend: '', collectionDate: new Date().toISOString().slice(0, 10), territory: '' };
type RecordItem = { id: string; movieId: number; dailyCollection: number | null; weekendCollection: number | null; collectionDate: string; territory: string | null; verified: boolean; createdAt: string; updatedAt: string; movie?: { id: number; title: string }; distributor?: { name: string; email: string } };

function money(value: number | null) {
  return value == null ? '—' : `₹${Number(value).toLocaleString('en-IN')}`;
}

function total(record: RecordItem) {
  return (record.dailyCollection ?? 0) + (record.weekendCollection ?? 0);
}

export default function DistributorPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [records, setRecords] = useState<RecordItem[]>([]);

  useEffect(() => { if (!isLoading && (!user || user.role !== 'DISTRIBUTOR')) router.replace('/'); }, [isLoading, user, router]);

  async function loadRecords() {
    if (!token) return;
    try {
      const response = await fetch('/api/distributor/box-office', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load collection records.');
      setRecords(await response.json());
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to load recent submissions.'); }
  }

  useEffect(() => { if (user?.role === 'DISTRIBUTOR' && token) void loadRecords(); }, [user?.role, token]);
  if (isLoading || !user || user.role !== 'DISTRIBUTOR') return <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">Checking access…</main>;

  async function submit(e: FormEvent) {
    e.preventDefault(); setSaving(true); setMessage('Saving…');
    try {
      const response = await fetch('/api/distributor/box-office', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ movieId: Number(form.movieId), title: form.title, dailyCollection: form.daily || null, weekendCollection: form.weekend || null, collectionDate: form.collectionDate, territory: form.territory }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Update failed.');
      setMessage(response.status === 200 ? 'Collection updated.' : 'Collection saved.');
      setForm(initialForm); await loadRecords();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Network error.'); }
    finally { setSaving(false); }
  }

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8 lg:px-16"><div className="mx-auto max-w-7xl"><div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6"><div className="flex min-w-0 items-center gap-3 sm:gap-4"><Logo size={42} textSize="sm" /><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">DISTRIBUTOR</p><h1 className="mt-1 text-2xl font-black sm:text-4xl">Distributor Dashboard</h1><p className="mt-1 text-sm text-white/50">Publish and maintain your box-office collection updates.</p></div></div><Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Home</Link></div>
    <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2"><div className="md:col-span-2"><h2 className="text-xl font-bold">Add / Update Collection</h2><p className="mt-1 text-sm text-white/45">Existing records for your movie/date/territory are updated instead of duplicated.</p></div><label><span className="mb-2 block text-sm text-white/70">Movie ID</span><input required type="number" value={form.movieId} onChange={(e)=>setForm({...form,movieId:e.target.value})} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Movie title (new association only)</span><input value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Collection date</span><input required type="date" value={form.collectionDate} onChange={(e)=>setForm({...form,collectionDate:e.target.value})} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Territory / region</span><input value={form.territory} onChange={(e)=>setForm({...form,territory:e.target.value})} placeholder="India / Karnataka / Worldwide" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Daily collection</span><input min="0" step="0.01" type="number" value={form.daily} onChange={(e)=>setForm({...form,daily:e.target.value})} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><label><span className="mb-2 block text-sm text-white/70">Weekend collection</span><input min="0" step="0.01" type="number" value={form.weekend} onChange={(e)=>setForm({...form,weekend:e.target.value})} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3" /></label><div className="flex flex-wrap items-center gap-4 md:col-span-2"><button disabled={saving} className="min-h-11 rounded-xl bg-[#E50914] px-6 py-3 font-bold disabled:opacity-60">{saving?'Saving…':'Save Collection'}</button><button type="button" onClick={()=>setForm(initialForm)} className="min-h-11 rounded-xl border border-white/10 px-6 py-3 font-semibold">Cancel</button><span role="status" className="text-sm text-white/50">{message}</span></div></form>
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"><div className="mb-4"><h2 className="text-xl font-bold">Recently Added Collections</h2><p className="mt-1 text-sm text-white/45">Only records owned by your authenticated distributor account are shown.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{records.slice(0,12).map((record)=><article key={record.id} className="rounded-xl border border-white/10 bg-black/20 p-4"><p className="font-semibold">{record.movie?.title ?? `Movie ${record.movieId}`}</p><p className="mt-1 text-sm text-white/50">Date: {new Date(record.collectionDate).toLocaleDateString()}</p><p className="mt-2 text-sm text-white/75">Daily: {money(record.dailyCollection)} · Weekend: {money(record.weekendCollection)}</p><p className="mt-1 text-xs text-white/40">Total: {money(total(record))} · {record.territory ?? 'Worldwide'} · {record.verified ? 'Verified' : 'Reported'}</p><p className="mt-1 text-[11px] text-white/30">Updated: {new Date(record.updatedAt).toLocaleDateString()}</p><div className="mt-3 flex flex-wrap gap-2"><Link href={`/movie/${record.movieId}`} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold"><Eye className="h-3.5 w-3.5" /> View</Link><Link href={`/distributor/box-office/${record.id}/edit`} className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold"><Pencil className="h-3.5 w-3.5" /> Edit</Link></div></article>)}{!records.length && <p className="py-8 text-center text-sm text-white/35 md:col-span-2 xl:col-span-3">No collection submissions yet.</p>}</div></section>
    <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6"><div className="mb-4"><h2 className="text-xl font-bold">All Collections</h2><p className="mt-1 text-sm text-white/45">Movie, date, daily, weekend, total, submitted by, and last updated.</p></div><div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/20">{records.map((record)=><div key={record.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div className="min-w-0"><p className="truncate font-semibold">{record.movie?.title ?? `Movie ${record.movieId}`}</p><p className="text-xs text-white/40">{new Date(record.collectionDate).toLocaleDateString()} · Daily {money(record.dailyCollection)} · Weekend {money(record.weekendCollection)} · Total {money(total(record))}</p><p className="text-xs text-white/40">Submitted by {record.distributor?.name ?? user.name} · Updated {new Date(record.updatedAt).toLocaleDateString()}</p></div><div className="flex flex-wrap gap-2"><Link href={`/movie/${record.movieId}`} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold">View</Link><Link href={`/distributor/box-office/${record.id}/edit`} className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold">Edit</Link></div></div>)}{!records.length && <p className="p-8 text-center text-sm text-white/35">No collections found.</p>}</div></section>
  </div></main>;
}