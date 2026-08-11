'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/ui/Logo';

interface MovieForm {
  id: string;
  tmdbId: string;
  title: string;
  originalTitle: string;
  poster: string;
  backdrop: string;
  trailer: string;
  overview: string;
  cast: string;
  crew: string;
  genres: string;
  releaseDate: string;
  runtime: string;
  language: string;
  budget: string;
  boxOffice: string;
}

const emptyForm: MovieForm = {
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

function parseJsonList(value: unknown): string {
  if (!Array.isArray(value)) return '';

  return value
    .map((item) =>
      typeof item === 'string'
        ? item
        : String((item as { name?: string })?.name ?? ''),
    )
    .filter(Boolean)
    .join(', ');
}

export default function AdminMovieEditPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const [form, setForm] = useState<MovieForm>(emptyForm);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'ADMIN')) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!token || !user || user.role !== 'ADMIN' || !params.id) {
      return;
    }

    const load = async () => {
      setLoading(true);

      try {
        const response = await fetch(
          `/api/admin/movies/${encodeURIComponent(params.id)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: 'no-store',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load movie.');
        }

        setForm({
          id: String(data.id),
          tmdbId: data.tmdbId ? String(data.tmdbId) : '',
          title: data.title ?? '',
          originalTitle: data.originalTitle ?? '',
          poster: data.customPoster ?? '',
          backdrop: data.customBackdrop ?? '',
          trailer: data.customTrailer ?? '',
          overview: data.overview ?? '',
          cast: parseJsonList(data.customCast),
          crew: parseJsonList(data.customCrew),
          genres: parseJsonList(data.customGenres),
          releaseDate: data.releaseDate
            ? new Date(data.releaseDate).toISOString().slice(0, 10)
            : '',
          runtime: data.runtime != null ? String(data.runtime) : '',
          language: data.language ?? '',
          budget: data.budget != null ? String(data.budget) : '',
          boxOffice:
            data.customBoxOffice != null
              ? String(data.customBoxOffice)
              : '',
        });
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : 'Failed to load movie.',
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.id, token, user]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">
        Checking access…
      </main>
    );
  }

  const set = (key: keyof MovieForm, value: string) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  };

  async function submit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage('Saving…');

    try {
      const response = await fetch(
        `/api/admin/movies/${encodeURIComponent(params.id)}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            tmdbId: form.tmdbId || undefined,
            title: form.title,
            originalTitle: form.originalTitle,
            customPoster: form.poster || null,
            customBackdrop: form.backdrop || null,
            customTrailer: form.trailer || null,
            overview: form.overview,

            customCast: form.cast
              .split(',')
              .map((value) => ({
                name: value.trim(),
              }))
              .filter((value) => value.name),

            customCrew: form.crew
              .split(',')
              .map((value) => ({
                name: value.trim(),
              }))
              .filter((value) => value.name),

            customGenres: form.genres
              .split(',')
              .map((value) => ({
                name: value.trim(),
              }))
              .filter((value) => value.name),

            releaseDate: form.releaseDate || null,
            runtime: form.runtime || null,
            language: form.language,
            budget: form.budget || null,
            customBoxOffice: form.boxOffice || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update movie.');
      }

      setMessage(
        data.title
          ? `Movie “${data.title}” updated successfully.`
          : 'Movie updated successfully.',
      );

      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Update failed.',
      );
    } finally {
      setSaving(false);
    }
  }

  const movieFields = [
    ['tmdbId', 'TMDB Movie ID (optional)', 'number'],
    ['title', 'Movie title', 'text'],
    ['originalTitle', 'Original title', 'text'],
    ['poster', 'Poster URL', 'url'],
    ['backdrop', 'Backdrop URL', 'url'],
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

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">
                CINE TRACKER
              </p>

              <h1 className="mt-1 text-3xl font-black sm:text-4xl">
                Edit Movie
              </h1>

              <p className="mt-1 text-sm text-white/50">
                Update the existing movie record without creating a duplicate.
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        {loading ? (
          <p className="py-12 text-center text-white/50">
            Loading movie…
          </p>
        ) : (
          <form
            onSubmit={submit}
            className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2"
          >
            {movieFields.map(([key, label, type]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-white/70">
                  {label}
                </span>

                <input
                  required={key === 'title'}
                  type={type}
                  value={form[key]}
                  onChange={(event) => set(key, event.target.value)}
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-[#E50914]/60"
                />
              </label>
            ))}

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-white/70">
                Description / overview
              </span>

              <textarea
                value={form.overview}
                onChange={(event) =>
                  set('overview', event.target.value)
                }
                rows={5}
                className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60"
              />
            </label>

            {(
              [
                ['cast', 'Cast (comma separated)'],
                ['crew', 'Crew (comma separated)'],
                ['genres', 'Genres (comma separated)'],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="block">
                <span className="mb-2 block text-sm font-medium text-white/70">
                  {label}
                </span>

                <input
                  value={form[key]}
                  onChange={(event) =>
                    set(key, event.target.value)
                  }
                  className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60"
                />
              </label>
            ))}

            <div className="flex flex-wrap items-center gap-4 md:col-span-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#E50914] px-6 py-3 font-bold transition hover:bg-[#b20710] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving…' : 'Save Changes'}
              </button>

              <Link
                href="/admin"
                className="inline-flex min-h-11 items-center rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
              >
                Cancel
              </Link>

              <span
                role="status"
                className="text-sm text-white/50"
              >
                {message}
              </span>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}


