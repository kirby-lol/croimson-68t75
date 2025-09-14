import axios from 'axios';
import { TMDB_CONFIG } from '../config/constants';
import { Movie, TVShow, Episode } from '../types';

const api = axios.create({
  baseURL: TMDB_CONFIG.BASE_URL,
  params: {
    api_key: TMDB_CONFIG.API_KEY,
  },
});

export const tmdbService = {
  // Movies
  async getTrendingMovies(): Promise<Movie[]> {
    const response = await api.get('/trending/movie/week');
    return response.data.results;
  },

  async getPopularMovies(): Promise<Movie[]> {
    const response = await api.get('/movie/popular');
    return response.data.results;
  },

  async getMovieDetails(id: number): Promise<Movie> {
    const response = await api.get(`/movie/${id}`, {
      params: { append_to_response: 'external_ids' }
    });
    return response.data;
  },

  // TV Shows
  async getPopularTVShows(): Promise<TVShow[]> {
    const response = await api.get('/tv/popular');
    return response.data.results;
  },

  async getTVShowDetails(id: number): Promise<TVShow> {
    const response = await api.get(`/tv/${id}`, {
      params: { append_to_response: 'external_ids' }
    });
    return response.data;
  },

  async getTVSeasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
    const response = await api.get(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data.episodes;
  },

  // Search
  async searchMulti(query: string): Promise<(Movie | TVShow)[]> {
    const response = await api.get('/search/multi', {
      params: { query }
    });
    return response.data.results.filter((item: any) => 
      item.media_type === 'movie' || item.media_type === 'tv'
    );
  },

  // Helper functions
  getPosterUrl(path: string | null): string {
    if (!path) return TMDB_CONFIG.PLACEHOLDER_POSTER;
    return `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.POSTER_SIZE}${path}`;
  },

  getBackdropUrl(path: string | null): string {
    if (!path) return TMDB_CONFIG.PLACEHOLDER_BACKDROP;
    return `${TMDB_CONFIG.IMAGE_BASE_URL}/${TMDB_CONFIG.BACKDROP_SIZE}${path}`;
  }
};