export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  API_KEY: 'e2c4d38dbb2255200d7e6f9856ff8d63',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  POSTER_SIZE: 'w500',
  BACKDROP_SIZE: 'original',
  PLACEHOLDER_POSTER: '/placeholder-image.jpg',
  PLACEHOLDER_BACKDROP: '/placeholder-backdrop.jpg'
};

export const VIDEO_SERVERS = {
  server_1: {
    id: 'server_1',
    name: 'VidSrc',
    movie: 'https://vidsrc.to/embed/movie/{imdbId}',
    tv: 'https://vidsrc.to/embed/tv/{imdbId}/{season}-{episode}'
  },
  server_2: {
    id: 'server_2',
    name: 'VidLink Pro',
    movie: 'https://vidlink.pro/movie/{tmdbId}',
    tv: 'https://vidlink.pro/tv/{tmdbId}/{season}/{episode}'
  },
  server_3: {
    id: 'server_3',
    name: 'VidSrc ICU',
    movie: 'https://vidsrc.icu/embed/movie/{tmdbId}',
    tv: 'https://vidsrc.icu/embed/tv/{tmdbId}/{season}/{episode}'
  },
  server_4: {
    id: 'server_4',
    name: 'MultiEmbed',
    movie: 'https://multiembed.mov/?video_id={imdbId}',
    tv: 'https://multiembed.mov/?video_id={imdbId}&s={season}&e={episode}'
  },
  server_5: {
    id: 'server_5',
    name: 'MoviesAPI',
    movie: 'https://moviesapi.club/movie/{tmdbId}',
    tv: 'https://moviesapi.club/tv/{tmdbId}-{season}-{episode}'
  }
};

export const COLORS = {
  primary: '#E6002B',
  background: '#0B0B0B',
  text: '#F3F4F6'
};