'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Eye,
  Pencil,
  Search,
  Trash2,
} from 'lucide-react';
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

type Movie = {
  id: number;
  title: string;
  originalTitle?: string | null;
  customPoster?: string | null;
  customGenres?: unknown;
  releaseDate?: string | null;
  createdAt: string;
  updatedAt: string;
};

type BoxOfficeRecord = {
  id: string;
  movieId: number;
  collectionDate: string;
  dailyCollection: number | null;
  weekendCollection: number | null;
  territory: string | null;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
  movie?: {
    id: number;
    title: string;
  };
  distributor?: {
    name: string;
    email: string;
  };
};

function genreText(value: unknown) {
  if (!Array.isArray(value)) return '—';

  return (
    value
      .map((item) =>
        typeof item === 'string'
          ? item
          : String(
              (item as { name?: string })?.name ?? '',
            ),
      )
      .filter(Boolean)
      .join(', ') || '—'
  );
}

function money(value: number | null) {
  return value == null
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN')}`;
}

export default function AdminPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [boxOffice, setBoxOffice] = useState<
    BoxOfficeRecord[]
  >([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (
      !isLoading &&
      (!user || user.role !== 'ADMIN')
    ) {
      router.replace('/');
    }
  }, [isLoading, user, router]);

  async function loadDashboard() {
    if (!token) return;

    try {
      const [
        moviesResponse,
        boxOfficeResponse,
      ] = await Promise.all([
        fetch('/api/admin/movies', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
        fetch('/api/distributor/box-office', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        }),
      ]);

      if (!moviesResponse.ok) {
        throw new Error('Unable to load movies.');
      }

      if (!boxOfficeResponse.ok) {
        throw new Error(
          'Unable to load box-office records.',
        );
      }

      setMovies(await moviesResponse.json());
      setBoxOffice(await boxOfficeResponse.json());
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to refresh dashboard data.',
      );
    }
  }

  useEffect(() => {
    if (user?.role === 'ADMIN' && token) {
      void loadDashboard();
    }
  }, [user?.role, token]);

  const filteredMovies = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return movies;

    return movies.filter(
      (movie) =>
        movie.title
          .toLowerCase()
          .includes(query) ||
        genreText(movie.customGenres)
          .toLowerCase()
          .includes(query),
    );
  }, [movies, search]);

  if (
    isLoading ||
    !user ||
    user.role !== 'ADMIN'
  ) {
    return (
      <main className="min-h-screen bg-[#0B0B0B] p-8 text-white">
        Checking access…
      </main>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage('Saving…');

    try {
      const response = await fetch(
        '/api/admin/movies',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            id: form.id || undefined,
            tmdbId: form.tmdbId || undefined,
            title: form.title,
            originalTitle: form.originalTitle,
            customPoster: form.poster || null,
            customBackdrop: form.backdrop || null,
            customTrailer: form.trailer || null,
            overview: form.overview,

            customCast: form.cast
              ? form.cast
                  .split(',')
                  .map((value) => ({
                    name: value.trim(),
                  }))
                  .filter(
                    (value) => value.name,
                  )
              : [],

            customCrew: form.crew
              ? form.crew
                  .split(',')
                  .map((value) => ({
                    name: value.trim(),
                  }))
                  .filter(
                    (value) => value.name,
                  )
              : [],

            customGenres: form.genres
              ? form.genres
                  .split(',')
                  .map((value) => ({
                    name: value.trim(),
                  }))
                  .filter(
                    (value) => value.name,
                  )
              : [],

            releaseDate:
              form.releaseDate || null,
            runtime: form.runtime || null,
            language: form.language,
            budget: form.budget || null,
            customBoxOffice:
              form.boxOffice || null,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Save failed.',
        );
      }

      setMessage(
        `Saved ${data.title}. Movie ID: ${data.id}`,
      );

      setForm(initialForm);

      await loadDashboard();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Network error.',
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteMovie(id: number) {
    if (
      !window.confirm(
        'Delete this movie and its related box-office records?',
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/movies/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Delete failed.',
        );
      }

      setMessage('Movie deleted successfully.');

      await loadDashboard();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : 'Network error.',
      );
    }
  }

  const fields = [
    [
      'tmdbId',
      'TMDB Movie ID (optional)',
      'number',
    ],
    [
      'id',
      'Existing custom Movie ID (optional)',
      'number',
    ],
    ['title', 'Movie title', 'text'],
    [
      'originalTitle',
      'Original title',
      'text',
    ],
    ['poster', 'Poster URL', 'url'],
    ['backdrop', 'Backdrop URL', 'url'],
    ['trailer', 'Trailer URL', 'url'],
    [
      'releaseDate',
      'Release date',
      'date',
    ],
    [
      'runtime',
      'Runtime (minutes)',
      'number',
    ],
    ['language', 'Language', 'text'],
    ['budget', 'Budget', 'number'],
    [
      'boxOffice',
      'Approved box office total',
      'number',
    ],
  ] as const;

  return (
    <main className="min-h-screen bg-[#0B0B0B] px-4 py-6 text-white sm:px-8 lg:px-16">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <Logo
              size={42}
              textSize="sm"
            />

            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#E50914]">
                ADMIN
              </p>

              <h1 className="mt-1 text-2xl font-black sm:text-4xl">
                Admin Dashboard
              </h1>

              <p className="mt-1 text-sm text-white/50">
                Create and manage searchable movie metadata.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* STATS */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/45">
              Movies
            </p>
            <p className="mt-2 text-3xl font-black">
              {movies.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/45">
              Box-office records
            </p>
            <p className="mt-2 text-3xl font-black">
              {boxOffice.length}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-white/45">
              Verified updates
            </p>
            <p className="mt-2 text-3xl font-black">
              {
                boxOffice.filter(
                  (record) => record.verified,
                ).length
              }
            </p>
          </div>
        </section>

        {/* RECENTLY ADDED MOVIES */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold">
                Recently Added Movies
              </h2>

              <p className="mt-1 text-sm text-white/45">
                Existing Admin-created and catalog-linked records.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search movies"
                className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 text-sm text-white outline-none focus:border-[#E50914]/60"
              />
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            {filteredMovies
              .slice(0, 10)
              .map((movie) => (
                <article
                  key={movie.id}
                  className="flex min-w-0 gap-3 rounded-xl border border-white/10 bg-black/20 p-3"
                >
                  <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                    {movie.customPoster ? (
                      <img
                        src={movie.customPoster}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-[9px] text-white/30">
                        NO POSTER
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {movie.title}
                    </p>

                    <p className="mt-1 text-xs text-white/45">
                      Release:{' '}
                      {movie.releaseDate
                        ? new Date(
                            movie.releaseDate,
                          ).toLocaleDateString()
                        : '—'}
                    </p>

                    <p className="mt-1 line-clamp-1 text-xs text-white/40">
                      Genre:{' '}
                      {genreText(
                        movie.customGenres,
                      )}
                    </p>

                    <p className="mt-1 text-[11px] text-white/30">
                      Updated:{' '}
                      {new Date(
                        movie.updatedAt,
                      ).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col gap-2">
                    <Link
                      href={`/movie/${movie.id}`}
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/75 transition hover:bg-white/10"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </Link>

                    <Link
                      href={`/admin/movies/${movie.id}/edit`}
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold text-white/75 transition hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>

                    <button
                      type="button"
                      onClick={() =>
                        deleteMovie(movie.id)
                      }
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-red-500/20 px-3 text-xs font-semibold text-red-300 transition hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </div>
                </article>
              ))}

            {!filteredMovies.length && (
              <p className="py-8 text-center text-sm text-white/35 lg:col-span-2">
                No matching movies.
              </p>
            )}
          </div>
        </section>

        {/* ALL MOVIES */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              All Movies
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Search, view, edit, or preserve existing deletion behavior.
            </p>
          </div>

          <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-black/20">
            {filteredMovies.map((movie) => (
              <div
                key={movie.id}
                className="flex flex-wrap items-center justify-between gap-3 p-4"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {movie.title}
                  </p>

                  <p className="text-xs text-white/40">
                    ID {movie.id} ·{' '}
                    {genreText(
                      movie.customGenres,
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/movie/${movie.id}`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold transition hover:bg-white/10"
                  >
                    View
                  </Link>

                  <Link
                    href={`/admin/movies/${movie.id}/edit`}
                    className="inline-flex min-h-10 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold transition hover:bg-white/10"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            ))}

            {!filteredMovies.length && (
              <p className="p-8 text-center text-sm text-white/35">
                No movies found.
              </p>
            )}
          </div>
        </section>

        {/* BOX OFFICE */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold">
              Recent Box Office Updates
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Admin can review and correct distributor submissions.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {boxOffice
              .slice(0, 12)
              .map((record) => (
                <article
                  key={record.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <p className="font-semibold">
                    {record.movie?.title ??
                      `Movie ${record.movieId}`}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    Date:{' '}
                    {new Date(
                      record.collectionDate,
                    ).toLocaleDateString()}
                  </p>

                  <p className="mt-2 text-sm text-white/70">
                    Daily:{' '}
                    {money(record.dailyCollection)} · Weekend:{' '}
                    {money(record.weekendCollection)}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    {record.territory ??
                      'Worldwide'}{' '}
                    ·{' '}
                    {record.distributor?.name ??
                      'Unknown distributor'}{' '}
                    ·{' '}
                    {record.verified
                      ? 'Verified'
                      : 'Reported'}
                  </p>

                  <p className="mt-1 text-[11px] text-white/30">
                    Updated:{' '}
                    {new Date(
                      record.updatedAt,
                    ).toLocaleDateString()}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <Link
                      href={`/movie/${record.movieId}`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold transition hover:bg-white/10"
                    >
                      View
                    </Link>

                    <Link
                      href={`/admin/box-office/${record.id}/edit`}
                      className="inline-flex min-h-9 items-center gap-1 rounded-lg border border-white/10 px-3 text-xs font-semibold transition hover:bg-white/10"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </div>
                </article>
              ))}

            {!boxOffice.length && (
              <p className="py-8 text-center text-sm text-white/35 md:col-span-2 xl:col-span-3">
                No box-office updates yet.
              </p>
            )}
          </div>
        </section>

        {/* ADD MOVIE */}
        <form
          onSubmit={submit}
          className="mt-8 grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 md:grid-cols-2"
        >
          <div className="md:col-span-2">
            <h2 className="text-xl font-bold">
              Add Movie
            </h2>

            <p className="mt-1 text-sm text-white/45">
              Use this form for new or explicitly selected existing records.
            </p>
          </div>

          {fields.map(([key, label, type]) => (
            <label
              key={key}
              className="block"
            >
              <span className="mb-2 block text-sm font-medium text-white/70">
                {label}
              </span>

              <input
                required={key === 'title'}
                type={type}
                value={form[key]}
                onChange={(event) =>
                  setForm({
                    ...form,
                    [key]: event.target.value,
                  })
                }
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
                setForm({
                  ...form,
                  overview: event.target.value,
                })
              }
              rows={5}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none focus:border-[#E50914]/60"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/70">
              Cast
            </span>

            <input
              value={form.cast}
              onChange={(event) =>
                setForm({
                  ...form,
                  cast: event.target.value,
                })
              }
              className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-white/70">
              Crew
            </span>

            <input
              value={form.crew}
              onChange={(event) =>
                setForm({
                  ...form,
                  crew: event.target.value,
                })
              }
              className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-2 block text-sm font-medium text-white/70">
              Genres
            </span>

            <input
              value={form.genres}
              onChange={(event) =>
                setForm({
                  ...form,
                  genres: event.target.value,
                })
              }
              className="min-h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4 md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="min-h-11 rounded-xl bg-[#E50914] px-6 py-3 font-bold transition hover:bg-[#b20710] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving
                ? 'Saving…'
                : 'Save Movie'}
            </button>

            <button
              type="button"
              onClick={() => {
                setForm(initialForm);
                setMessage('');
              }}
              className="min-h-11 rounded-xl border border-white/10 px-6 py-3 font-semibold transition hover:bg-white/5"
            >
              Cancel
            </button>

            <span
              role="status"
              className="text-sm text-white/50"
            >
              {message}
            </span>
          </div>
        </form>
      </div>
    </main>
  );
}