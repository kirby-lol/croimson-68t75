import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Movie } from '../../types';
import { tmdbService } from '../../services/tmdb';
import { Button } from '../ui/Button';

interface HeroCarouselProps {
  movies: Movie[];
  onPlayClick: (movie: Movie) => void;
  onInfoClick: (movie: Movie) => void;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({
  movies,
  onPlayClick,
  onInfoClick
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentMovie = movies[currentIndex];

  useEffect(() => {
    if (movies.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [movies.length]);

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  if (!currentMovie) return null;

  return (
    <div className="relative h-[70vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0"
        >
          <img
            src={tmdbService.getBackdropUrl(currentMovie.backdrop_path)}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 text-white transition-all duration-200"
      >
        <ChevronLeft size={24} />
      </button>
      
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-2 text-white transition-all duration-200"
      >
        <ChevronRight size={24} />
      </button>

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <motion.div
            key={`content-${currentMovie.id}`}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {currentMovie.title}
            </h1>
            
            <div className="flex items-center space-x-4 mb-4 text-gray-300">
              <div className="flex items-center space-x-1">
                <Star size={16} className="text-yellow-500 fill-current" />
                <span>{currentMovie.vote_average.toFixed(1)}</span>
              </div>
              {currentMovie.release_date && (
                <span>{new Date(currentMovie.release_date).getFullYear()}</span>
              )}
              {currentMovie.runtime && (
                <span>{Math.floor(currentMovie.runtime / 60)}h {currentMovie.runtime % 60}m</span>
              )}
            </div>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed line-clamp-3">
              {currentMovie.overview}
            </p>

            <div className="flex space-x-4">
              <Button
                size="lg"
                onClick={() => onPlayClick(currentMovie)}
                className="flex items-center space-x-2"
              >
                <Play size={20} className="ml-0.5" />
                <span>Play Now</span>
              </Button>
              
              <Button
                variant="secondary"
                size="lg"
                onClick={() => onInfoClick(currentMovie)}
                className="flex items-center space-x-2"
              >
                <Info size={20} />
                <span>More Info</span>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex ? 'bg-red-600 w-8' : 'bg-gray-600'
            }`}
          />
        ))}
      </div>
    </div>
  );
};