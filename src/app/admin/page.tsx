'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';

const initialForm = {
  id: '',
  tmdbId: '',
  title: '',
  originalTitle: '',
  poster: '',
  backdrop: '',
  trailer: '',
  overview: '',
  cast: '',
  crew: '',
  genres: '',
  releaseDate: '',
  runtime: '',
  language: '',
  budget: '',
  boxOffice: '',
};

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) router.replace('/');
  }, [isLoading, user, router]);

  if (isLoading || !user || user.role !== 'ADMIN') return <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">Checking access…</main>;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage('Saving…');
    try {
      const response = await fetch('/api/admin/movies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: form.id || undefined,
          tmdbId: form.tmdbId || undefined,
          title: form.title,
          originalTitle: form.originalTitle,
          customPoster: form.poster || null,
          customBackdrop: form.backdrop || null,
          customTrailer: form.trailer || null,
          overview: form.overview,
          customCast: form.cast ? form.cast.split(',').map((value) => ({ name: value.trim() })).filter((value) => value.name) : [],
          customCrew: form.crew ? form.crew.split(',').map((value) => ({ name: value.trim() })).filter((value) => value.name) : [],
          customGenres: form.genres ? form.genres.split(',').map((value) => ({ name: value.trim() })).filter((value) => value.name) : [],
          releaseDate: form.releaseDate || null,
          runtime: form.runtime || null,
          language: form.language,
          budget: form.budget || null,
          customBoxOffice: form.boxOffice || null,
        }),
      });
      const data = await response.json();
      setMessage(response.ok ? `Saved ${data.title}. Movie ID: ${data.id}` : data.error || 'Save failed.');
    } catch {
      setMessage('Network error.');
    } finally {
      setSaving(false);
    }
  }

  const fields = [
    ['tmdbId', 'TMDB Movie ID (optional)', 'number'],
    ['id', 'Existing custom Movie ID (optional)', 'number'],
    ['title', 'Movie title', 'text'],
    ['originalTitle', 'Original title', 'text'],
    ['poster', 'Poster URL or image data URL', 'url'],
    ['backdrop', 'Backdrop URL or image data URL', 'url'],
    ['trailer', 'Trailer URL', 'url'],
    ['releaseDate', 'Release date', 'date'],
    ['runtime', 'Runtime (minutes)', 'number'],
    ['language', 'Language', 'text'],
    ['budget', 'Budget', 'number'],
    ['boxOffice', 'Approved box office total', 'number'],
  ] as const;

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8 lg:px-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <Logo size={46} showText={false} />
            <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">CINE TRACKER</p><h1 className="mt-1 text-3xl font-black sm:text-4xl">Admin Dashboard</h1><p className="mt-1 text-sm text-white/50">Create and manage searchable movie metadata.</p></div>
          </div>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to Home</Link>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2">
          {fields.map(([key, label, type]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-medium text-white/70">{label}</span>
              <input required={key === 'title'} type={type} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#E50914]/60" />
            </label>
          ))}
          <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-white/70">Description / overview</span><textarea value={form.overview} onChange={(e) => setForm({ ...form, overview: e.target.value })} rows={5} className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-white/70">Cast (comma separated)</span><input value={form.cast} onChange={(e) => setForm({ ...form, cast: e.target.value })} placeholder="Actor 1, Actor 2" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60" /></label>
          <label className="block"><span className="mb-2 block text-sm font-medium text-white/70">Crew (comma separated)</span><input value={form.crew} onChange={(e) => setForm({ ...form, crew: e.target.value })} placeholder="Director, Writer" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60" /></label>
          <label className="block md:col-span-2"><span className="mb-2 block text-sm font-medium text-white/70">Genres (comma separated)</span><input value={form.genres} onChange={(e) => setForm({ ...form, genres: e.target.value })} placeholder="Action, Drama" className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60" /></label>
          <div className="flex flex-wrap items-center gap-4 md:col-span-2">
            <button disabled={saving} className="min-h-11 rounded-xl bg-[#E50914] px-6 py-3 font-bold transition hover:bg-[#b20710] disabled:cursor-not-allowed disabled:opacity-60">{saving ? 'Saving…' : 'Save Movie'}</button>
            <span role="status" className="text-sm text-white/50">{message}</span>
          </div>
        </form>
      </div>
    </main>
  );
}
