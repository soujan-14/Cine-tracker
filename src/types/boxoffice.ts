export interface BoxOfficeData {
  /** Domestic box office from OMDb (e.g. "$47,338,502") — parsed to number */
  domestic: number | null;
  /** Worldwide gross from TMDB revenue field */
  worldwide: number | null;
  /** Production budget from TMDB */
  budget: number | null;
  /** Opening weekend — OMDb doesn't expose this; kept for future use */
  openingWeekend: number | null;
  /** Derived performance label */
  status: 'Blockbuster' | 'Hit' | 'Average' | 'Flop' | null;
  /** Source of data */
  source: 'tmdb+omdb' | 'tmdb' | 'omdb' | 'none';
}

export interface OmdbResponse {
  Title: string;
  BoxOffice?: string;
  Response: 'True' | 'False';
  Error?: string;
}
