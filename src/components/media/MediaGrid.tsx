import React from 'react';
import { motion } from 'framer-motion';
import { Movie, TVShow } from '../../types';
import { MediaCard } from './MediaCard';

interface MediaGridProps {
  items: (Movie | TVShow)[];
  onItemClick: (item: Movie | TVShow) => void;
  loading?: boolean;
}

export const MediaGrid: React.FC<MediaGridProps> = ({ items, onItemClick, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse bg-gray-800 rounded-lg h-96"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
    >
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <MediaCard
            item={item}
            onClick={() => onItemClick(item)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
};