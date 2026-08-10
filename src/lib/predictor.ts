import { Movie, MovieDetails } from '@/types/tmdb';

type Verdict = 'Blockbuster' | 'Hit' | 'Flop';

export interface MoviePrediction {
  verdict: Verdict;
  confidence: number;
  confidenceLabel: string;
  estimatedRevenue: string;
  score: number;
  breakdown: {
    rating: number;
    votes: number;
    popularity: number;
    recency: number;
    budgetFactor: number;
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function recencyBonus(releaseDate: string | undefined | null): number {
  if (!releaseDate) return 0.5;
  const d = new Date(releaseDate);
  if (isNaN(d.getTime())) return 0.5;
  const now = new Date();
  const daysAgo = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
  if (daysAgo < 30) return 1;
  if (daysAgo < 90) return 0.92;
  if (daysAgo < 180) return 0.82;
  if (daysAgo < 365 * 1) return 0.7;
  if (daysAgo < 365 * 5) return 0.55;
  if (daysAgo < 365 * 20) return 0.42;
  return 0.3;
}

function budgetFactor(budget: number | undefined, revenue: number | undefined): number {
  if (typeof revenue === 'number' && revenue > 0 && typeof budget === 'number' && budget > 0) {
    const roi = revenue / budget;
    if (roi >= 5) return 1;
    if (roi >= 3) return 0.9;
    if (roi >= 2) return 0.78;
    if (roi >= 1.2) return 0.6;
    if (roi >= 0.8) return 0.4;
    return 0.22;
  }
  if (typeof revenue === 'number' && revenue > 0) {
    if (revenue >= 500_000_000) return 1;
    if (revenue >= 100_000_000) return 0.82;
    if (revenue >= 30_000_000) return 0.62;
    if (revenue >= 10_000_000) return 0.48;
    return 0.35;
  }
  if (typeof budget === 'number' && budget > 0) {
    if (budget >= 150_000_000) return 0.72;
    if (budget >= 70_000_000) return 0.6;
    if (budget >= 20_000_000) return 0.5;
    return 0.4;
  }
  return 0.5;
}

export function predictMovieSuccess(movie: Movie | MovieDetails | Partial<MovieDetails>): MoviePrediction {
  const m = movie || ({} as Partial<MovieDetails>);
  const voteAverage = typeof m.vote_average === 'number' ? m.vote_average : 0;
  const voteCount = typeof m.vote_count === 'number' ? m.vote_count : 0;
  const popularity = typeof m.popularity === 'number' ? m.popularity : 0;

  const ratingScore = clamp((voteAverage / 10) * 1.1, 0, 1);
  const votesScore = voteCount >= 20_000 ? 1 : voteCount >= 5000 ? 0.88 : voteCount >= 1000 ? 0.72 : voteCount >= 200 ? 0.55 : voteCount >= 50 ? 0.38 : 0.22;
  const popularityScore = popularity >= 800 ? 1 : popularity >= 250 ? 0.9 : popularity >= 80 ? 0.78 : popularity >= 30 ? 0.62 : popularity >= 10 ? 0.48 : 0.3;
  const recencyScore = recencyBonus(m.release_date);
  const budgetScore = budgetFactor(
    (m as MovieDetails).budget as number | undefined,
    (m as MovieDetails).revenue as number | undefined,
  );

  const weights = {
    rating: 0.3,
    votes: 0.25,
    popularity: 0.2,
    recency: 0.15,
    budget: 0.1,
  };

  const score =
    ratingScore * weights.rating +
    votesScore * weights.votes +
    popularityScore * weights.popularity +
    recencyScore * weights.recency +
    budgetScore * weights.budget;

  const weightedScore = clamp(score * 100, 0, 100);

  let verdict: Verdict;
  if (weightedScore >= 72) verdict = 'Blockbuster';
  else if (weightedScore >= 50) verdict = 'Hit';
  else verdict = 'Flop';

  const confidence = Math.round(
    clamp(
      40 +
        (voteCount > 1000 ? 25 : voteCount > 200 ? 18 : voteCount > 50 ? 10 : 0) +
        (weightedScore >= 82 || weightedScore <= 38 ? 15 : weightedScore >= 72 || weightedScore <= 48 ? 9 : 4),
      45,
      98,
    ),
  );

  let confidenceLabel: string;
  if (confidence >= 85) confidenceLabel = 'Very High';
  else if (confidence >= 70) confidenceLabel = 'High';
  else if (confidence >= 55) confidenceLabel = 'Moderate';
  else confidenceLabel = 'Low';

  const revenue = (m as MovieDetails).revenue as number | undefined;
  const budget = (m as MovieDetails).budget as number | undefined;

  let estimatedUsd: number;
  if (typeof revenue === 'number' && revenue > 0) {
    estimatedUsd = revenue;
  } else {
    const base =
      verdict === 'Blockbuster' ? 350_000_000 : verdict === 'Hit' ? 65_000_000 : 8_000_000;
    const popMul = clamp(0.5 + popularityScore, 0.55, 1.4);
    const voteMul = clamp(0.6 + votesScore, 0.65, 1.3);
    estimatedUsd = Math.round(base * popMul * voteMul * (0.85 + weightedScore / 300));
    if (typeof budget === 'number' && budget > 0) {
      estimatedUsd = Math.max(estimatedUsd, Math.round(budget * (verdict === 'Flop' ? 0.5 : verdict === 'Hit' ? 1.6 : 3)));
    }
  }

  let estimatedRevenue: string;
  if (estimatedUsd >= 1_000_000_000) {
    estimatedRevenue = `$${(estimatedUsd / 1_000_000_000).toFixed(2)}B`;
  } else if (estimatedUsd >= 1_000_000) {
    estimatedRevenue = `$${Math.round(estimatedUsd / 1_000_000).toLocaleString('en-US')}M`;
  } else {
    estimatedRevenue = `$${Math.round(estimatedUsd / 1_000).toLocaleString('en-US')}K`;
  }

  return {
    verdict,
    confidence,
    confidenceLabel,
    estimatedRevenue,
    score: Math.round(weightedScore),
    breakdown: {
      rating: Math.round(ratingScore * 100),
      votes: Math.round(votesScore * 100),
      popularity: Math.round(popularityScore * 100),
      recency: Math.round(recencyScore * 100),
      budgetFactor: Math.round(budgetScore * 100),
    },
  };
}
