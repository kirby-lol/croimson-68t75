export interface Movie {
  id: number;
  imdb_id?: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  runtime?: number;
  genres?: Genre[];
}

export interface TVShow {
  id: number;
  imdb_id?: string;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  number_of_seasons?: number;
  seasons?: Season[];
  genres?: Genre[];
}

export interface Season {
  id: number;
  season_number: number;
  episode_count: number;
  episodes?: Episode[];
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface LastWatched {
  id?: string;
  item_type: 'movie' | 'tv';
  tmdb_id: number;
  imdb_id?: string;
  server_id: string;
  season?: number;
  episode?: number;
  progress_seconds: number;
  runtime_seconds: number;
  poster_path: string | null;
  title: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface VideoServer {
  id: string;
  name: string;
  movie: string;
  tv: string;
}

export type MediaType = 'movie' | 'tv';