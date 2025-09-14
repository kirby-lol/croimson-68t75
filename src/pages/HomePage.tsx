import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '../types';
import { tmdbService } from '../services/tmdb';
import { HeroCarousel } from '../components/media/HeroCarousel';
import { MediaGrid } from '../components/media/MediaGrid';
import { LastWatchedWidget } from '../components/media/LastWatchedWidget';

interface HomePageProps {
  onItemClick: (item: Movie | TVShow) => void;
  onPlayClick: (item: Movie | TVShow) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onItemClick, onPlayClick }) => {
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [popularTVShows, setPopularTVShows] = useState<TVShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [trending, movies, tvShows] = await Promise.all([
          tmdbService.getTrendingMovies(),
          tmdbService.getPopularMovies(),
          tmdbService.getPopularTVShows()
        ]);

        setTrendingMovies(trending);
        setPopularMovies(movies);
        setPopularTVShows(tvShows);
      } catch (error) {
        console.error('Failed to load home page data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleResumeClick = (item: any) => {
    // Convert LastWatched back to Movie/TVShow and trigger play
    const mediaItem = {
      id: item.tmdb_id,
      [item.item_type === 'movie' ? 'title' : 'name']: item.title,
      poster_path: item.poster_path,
      // Add other required fields with defaults
      overview: '',
      backdrop_path: null,
      vote_average: 0,
      [item.item_type === 'movie' ? 'release_date' : 'first_air_date']: '',
    } as Movie | TVShow;

    onPlayClick(mediaItem);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black"
    >
      {/* Hero Section */}
      {trendingMovies.length > 0 && (
        <HeroCarousel
          movies={trendingMovies.slice(0, 5)}
          onPlayClick={onPlayClick}
          onInfoClick={onItemClick}
        />
      )}

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {/* Continue Watching */}
        <LastWatchedWidget onResumeClick={handleResumeClick} />

        {/* Popular Movies */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular Movies</h2>
          <MediaGrid
            items={popularMovies}
            onItemClick={onItemClick}
            loading={loading}
          />
        </section>

        {/* Popular TV Shows */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular TV Shows</h2>
          <MediaGrid
            items={popularTVShows}
            onItemClick={onItemClick}
            loading={loading}
          />
        </section>
      </div>
    </motion.div>
  );
};