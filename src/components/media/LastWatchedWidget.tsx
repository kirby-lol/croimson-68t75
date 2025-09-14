import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, X } from 'lucide-react';
import { LastWatched } from '../../types';
import { lastWatchedService } from '../../services/lastWatched';
import { useAuth } from '../../contexts/AuthContext';
import { tmdbService } from '../../services/tmdb';
import { Button } from '../ui/Button';

interface LastWatchedWidgetProps {
  onResumeClick: (item: LastWatched) => void;
}

export const LastWatchedWidget: React.FC<LastWatchedWidgetProps> = ({
  onResumeClick
}) => {
  const { user } = useAuth();
  const [lastWatched, setLastWatched] = useState<LastWatched[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLastWatched = async () => {
      try {
        const data = user 
          ? await lastWatchedService.getUserLastWatched(user.id)
          : await lastWatchedService.getGuestLastWatched();
        
        setLastWatched(data.slice(0, 5)); // Show only top 5
      } catch (error) {
        console.error('Failed to load last watched:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLastWatched();
  }, [user]);

  const handleRemove = async (item: LastWatched) => {
    // For simplicity, just remove from local state
    // In a real app, you'd want to call a delete API
    setLastWatched(prev => prev.filter(w => w.id !== item.id));
  };

  const formatProgress = (item: LastWatched) => {
    const percentage = Math.min((item.progress_seconds / item.runtime_seconds) * 100, 100);
    const minutes = Math.floor(item.progress_seconds / 60);
    return { percentage, minutes };
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-800 rounded mb-4 w-48" />
        <div className="flex space-x-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="w-32 h-48 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (lastWatched.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Clock size={20} className="text-red-600" />
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4">
        {lastWatched.map((item, index) => {
          const { percentage, minutes } = formatProgress(item);
          
          return (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative group min-w-[200px]"
            >
              <div 
                className="relative cursor-pointer"
                onClick={() => onResumeClick(item)}
              >
                <img
                  src={tmdbService.getPosterUrl(item.poster_path)}
                  alt={item.title}
                  className="w-full h-72 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300"
                />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-2">
                        <Play size={16} className="text-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 bg-opacity-75 rounded-b-lg">
                  <div
                    className="h-full bg-red-600 rounded-b-lg transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  className="absolute top-2 right-2 bg-black bg-opacity-75 hover:bg-opacity-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <X size={14} className="text-white" />
                </button>
              </div>

              <div className="mt-2 space-y-1">
                <h3 className="text-white font-medium text-sm line-clamp-2">
                  {item.title}
                  {item.item_type === 'tv' && item.season && item.episode && (
                    <span className="text-gray-400 ml-1">
                      S{item.season}:E{item.episode}
                    </span>
                  )}
                </h3>
                <p className="text-gray-400 text-xs">
                  {minutes}m watched • {Math.round(percentage)}% complete
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.section>
  );
};