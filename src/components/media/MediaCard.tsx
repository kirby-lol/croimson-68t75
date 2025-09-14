import React from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Calendar } from 'lucide-react';
import { Movie, TVShow } from '../../types';
import { tmdbService } from '../../services/tmdb';

interface MediaCardProps {
  item: Movie | TVShow;
  onClick: () => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick }) => {
  const isMovie = 'title' in item;
  const title = isMovie ? item.title : item.name;
  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative overflow-hidden rounded-lg bg-gray-800 shadow-lg">
        <img
          src={tmdbService.getPosterUrl(item.poster_path)}
          alt={title}
          className="w-full h-96 object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-center justify-center mb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                className="bg-red-600 rounded-full p-3 shadow-lg"
              >
                <Play size={20} className="text-white ml-0.5" />
              </motion.div>
            </div>
          </div>
        </div>

        <div className="absolute top-2 right-2 bg-black bg-opacity-75 rounded-lg px-2 py-1 flex items-center space-x-1">
          <Star size={12} className="text-yellow-500 fill-current" />
          <span className="text-white text-xs font-medium">
            {item.vote_average.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        {year && (
          <div className="flex items-center text-gray-400 text-xs">
            <Calendar size={12} className="mr-1" />
            {year}
          </div>
        )}
      </div>
    </motion.div>
  );
};