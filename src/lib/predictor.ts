import type { Movie, MovieDetails } from '@/types/tmdb';

export type PredictionVerdict = 'Blockbuster' | 'Hit' | 'Flop';

export interface MoviePrediction {
  score: number;
  verdict: PredictionVerdict;
  estimatedRevenue: string;
  confidence: number;
  confidenceLabel: 'High' | 'Medium' | 'Low';
}

export function predictMovieSuccess(movie: Partial<Movie> | Partial<MovieDetails>): MoviePrediction {
  const voteAverage = Number(movie.vote_average ?? 0);
  const popularity = Number(movie.popularity ?? 0);
  const voteCount = Number(movie.vote_count ?? 0);
  const releaseDate = movie.release_date ?? '';

  let score = voteAverage * 2 + popularity / 10 + voteCount / 1000;

  if (releaseDate) {
    const parsedDate = new Date(`${releaseDate}T00:00:00`);
    if (!Number.isNaN(parsedDate.getTime())) {
      const now = new Date();
      const ageInMonths = (now.getTime() - parsedDate.getTime()) / (1000 * 60 * 60 * 24 * 30);

      if (ageInMonths < 6) {
        score += 6;
      } else if (ageInMonths > 24) {
        score -= 4;
      }
    }
  }

  let verdict: PredictionVerdict = 'Flop';
  let estimatedRevenue = '< $100M';

  if (score > 80) {
    verdict = 'Blockbuster';
    estimatedRevenue = '$500M+';
  } else if (score > 50) {
    verdict = 'Hit';
    estimatedRevenue = '$100M–$500M';
  }

  const signalCount = [voteAverage > 0, popularity > 0, voteCount > 0, Boolean(releaseDate)].filter(Boolean).length;
  const confidence = Math.min(95, 55 + signalCount * 10 + (voteAverage > 7 ? 8 : 0) + (voteCount > 10000 ? 7 : 0));

  let confidenceLabel: MoviePrediction['confidenceLabel'] = 'Low';
  if (confidence >= 80) confidenceLabel = 'High';
  else if (confidence >= 65) confidenceLabel = 'Medium';

  return {
    score: Number(score.toFixed(1)),
    verdict,
    estimatedRevenue,
    confidence,
    confidenceLabel,
  };
}
