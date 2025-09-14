import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Calendar, Clock, ArrowLeft, Info } from 'lucide-react';
import { Movie } from '../types';
import { tmdbService } from '../services/tmdb';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const MoviePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const autoplay = searchParams.get('autoplay') === 'true';
  
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(autoplay);

  useEffect(() => {
    const loadMovie = async () => {
      if (!id) return;
      
      try {
        const movieData = await tmdbService.getMovieDetails(Number(id));
        setMovie(movieData);
        
        if (autoplay) {
          setShowPlayer(true);
        }
      } catch (error) {
        console.error('Failed to load movie:', error);
      } finally {
        setLoading(false);
      }
    };

    loadMovie();
  }, [id, autoplay]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Movie not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const year = movie.release_date ? new Date(movie.release_date).getFullYear() : null;
  const runtime = movie.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-black"
      >
        {/* Hero Section */}
        <div className="relative h-[70vh] overflow-hidden">
          <img
            src={tmdbService.getBackdropUrl(movie.backdrop_path)}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-7xl mx-auto px-4 w-full">
              <div className="max-w-2xl">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="mb-4 flex items-center space-x-2"
                >
                  <ArrowLeft size={20} />
                  <span>Back</span>
                </Button>
                
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                  {movie.title}
                </h1>
                
                <div className="flex items-center space-x-4 mb-4 text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span>{movie.vote_average.toFixed(1)}</span>
                  </div>
                  {year && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{year}</span>
                    </div>
                  )}
                  {runtime && (
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{runtime}</span>
                    </div>
                  )}
                </div>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {movie.overview}
                </p>

                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    onClick={() => setShowPlayer(true)}
                    className="flex items-center space-x-2"
                  >
                    <Play size={20} className="ml-0.5" />
                    <span>Play Now</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold text-white mb-4">About</h2>
              <p className="text-gray-300 leading-relaxed">{movie.overview}</p>
              
              {movie.genres && movie.genres.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Genres</h3>
                  <div className="flex flex-wrap gap-2">
                    {movie.genres.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <img
                src={tmdbService.getPosterUrl(movie.poster_path)}
                alt={movie.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {movie && (
        <VideoPlayer
          isOpen={showPlayer}
          onClose={() => setShowPlayer(false)}
          item={movie}
          mediaType="movie"
        />
      )}
    </>
  );
};