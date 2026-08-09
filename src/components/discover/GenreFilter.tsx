'use client';

interface Genre {
  id: number;
  name: string;
}

const GENRES: Genre[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

interface Props {
  value: string;
  onChange: (genreId: string) => void;
}

export function GenreFilter({ value, onChange }: Props) {
  return (
    <div>
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/50">Genre</p>
      <div className="flex flex-wrap gap-2">
        {GENRES.map((g) => {
          const active = value === String(g.id);
          return (
            <button
              key={g.id}
              onClick={() => onChange(active ? '' : String(g.id))}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-all duration-200 ${
                active
                  ? 'border-[#E50914]/60 bg-[#E50914]/15 text-white'
                  : 'border-white/10 bg-white/5 text-white/50 hover:border-white/20 hover:text-white'
              }`}
            >
              {g.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
