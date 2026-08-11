export interface BoxOfficeData {
  /** Domestic box office from OMDb (parsed to number) */
  domestic: number | null;
  /** Worldwide gross from TMDB revenue or verified local collection */
  worldwide: number | null;
  /** Production budget from TMDB or admin metadata */
  budget: number | null;
  /** Latest stored weekend collection */
  openingWeekend: number | null;
  /** Derived performance label */
  status: 'Blockbuster' | 'Hit' | 'Average' | 'Flop' | null;
  /** Source of data */
  source: 'local' | 'tmdb+omdb' | 'tmdb' | 'omdb' | 'none';
  /** Whether the local value has been explicitly verified by an admin */
  verified?: boolean;
  /** Total daily collections stored locally */
  localDailyTotal?: number | null;
  /** Latest weekend collection stored locally */
  localWeekend?: number | null;
}

export interface OmdbResponse {
  Title: string;
  BoxOffice?: string;
  Response: 'True' | 'False';
  Error?: string;
}
