'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ id: '', title: '', poster: '', trailer: '', cast: '', boxOffice: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) router.replace('/');
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') return <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">Checking access…</main>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('Saving…');
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ id: Number(form.id), title: form.title, customPoster: form.poster || null, customTrailer: form.trailer || null, customCast: form.cast ? form.cast.split(',').map((v) => v.trim()) : [], customBoxOffice: form.boxOffice || null }),
      });
      const data = await response.json();
      setMessage(response.ok ? `Saved ${data.title}.` : data.error || 'Save failed.');
    } catch { setMessage('Network error.'); }
  }

  return <main className="min-h-screen bg-[#0B0B0B] px-4 py-10 text-white sm:px-8 lg:px-16"><div className="mx-auto max-w-5xl"><div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#E50914]">Cine Tracker</p><h1 className="mt-2 text-4xl font-black">Admin Dashboard</h1><p className="mt-2 text-white/50">Manage custom movie metadata and box-office values.</p></div>
    <form onSubmit={submit} className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 md:grid-cols-2">
      {([['id','TMDB Movie ID','number'],['title','Movie title','text'],['poster','Poster URL or small image data URL','text'],['trailer','Trailer URL','url'],['cast','Cast names, comma separated','text'],['boxOffice','Custom box office','number']] as const).map(([key,label,type]) => <label key={key} className="block"><span className="mb-2 block text-sm font-medium text-white/70">{label}</span><input required={key==='id'||key==='title'} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60" /></label>)}
      <div className="md:col-span-2 flex items-center gap-4"><button className="rounded-xl bg-[#E50914] px-6 py-3 font-bold hover:bg-[#b20710]">Save Movie</button><span className="text-sm text-white/50">{message}</span></div>
    </form>
  </div></main>;
}
