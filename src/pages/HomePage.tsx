import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Movie, TVShow } from '../types';
import { tmdbService } from '../services/tmdb';
import { HeroCarousel } from '../components/media/HeroCarousel';
import { MediaGrid } from '../components/media/MediaGrid';
import { LastWatchedWidget } from '../components/media/LastWatchedWidget';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
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

  const createSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleItemClick = (item: Movie | TVShow) => {
    const isMovie = 'title' in item;
    const title = isMovie ? item.title : item.name;
    const slug = createSlug(title);
    
    if (isMovie) {
      navigate(`/movie/${item.id}/${slug}`);
    } else {
      navigate(`/tv/${item.id}/${slug}`);
    }
  };

  const handlePlayClick = (item: Movie | TVShow) => {
    handleItemClick(item); // Navigate to the item page which will auto-play
  };

  const handleResumeClick = (item: any) => {
    const slug = createSlug(item.title);
    if (item.item_type === 'movie') {
      navigate(`/movie/${item.tmdb_id}/${slug}?autoplay=true`);
    } else {
      navigate(`/tv/${item.tmdb_id}/${slug}?autoplay=true&season=${item.season}&episode=${item.episode}`);
    }
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
          onPlayClick={handlePlayClick}
          onInfoClick={handleItemClick}
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
            onItemClick={handleItemClick}
            loading={loading}
          />
        </section>

        {/* Popular TV Shows */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular TV Shows</h2>
          <MediaGrid
            items={popularTVShows}
            onItemClick={handleItemClick}
            loading={loading}
          />
        </section>
      </div>
    </motion.div>
  );
};