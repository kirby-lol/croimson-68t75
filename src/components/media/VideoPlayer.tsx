import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Movie, TVShow, Episode, MediaType } from '../../types';
import { videoServerService } from '../../services/videoServers';
import { lastWatchedService } from '../../services/lastWatched';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

interface VideoPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  item: Movie | TVShow;
  mediaType: MediaType;
  selectedSeason?: number;
  selectedEpisode?: number;
  episodes?: Episode[];
  onSeasonChange?: (season: number) => void;
  onEpisodeChange?: (episode: number) => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  isOpen,
  onClose,
  item,
  mediaType,
  selectedSeason = 1,
  selectedEpisode = 1,
  episodes = [],
  onSeasonChange,
  onEpisodeChange
}) => {
  const { user } = useAuth();
  const [selectedServer, setSelectedServer] = useState('server_1');
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());
  const progressIntervalRef = useRef<NodeJS.Timeout>();
  const saveIntervalRef = useRef<NodeJS.Timeout>();

  const servers = videoServerService.getServers();
  const embedUrl = videoServerService.getEmbedUrl(
    selectedServer,
    mediaType,
    item.id,
    'imdb_id' in item ? item.imdb_id : undefined,
    selectedSeason,
    selectedEpisode
  );

  const isMovie = 'title' in item;
  const title = isMovie ? item.title : item.name;
  const runtime = isMovie ? item.runtime || 120 : 45; // Default runtime in minutes

  useEffect(() => {
    if (isOpen) {
      // Start progress tracking
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setProgress(elapsed);
      }, 1000);

      // Save to last watched every 30 seconds
      saveIntervalRef.current = setInterval(async () => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        
        // Only save if user has watched for at least 30 seconds
        if (elapsed < 30) return;

        const lastWatchedItem = {
          item_type: mediaType,
          tmdb_id: item.id,
          imdb_id: 'imdb_id' in item ? item.imdb_id : undefined,
          server_id: selectedServer,
          season: mediaType === 'tv' ? selectedSeason : undefined,
          episode: mediaType === 'tv' ? selectedEpisode : undefined,
          progress_seconds: elapsed,
          runtime_seconds: runtime * 60,
          poster_path: item.poster_path,
          title,
        };

        try {
          if (user) {
            await lastWatchedService.saveUserLastWatched(user.id, lastWatchedItem);
          } else {
            await lastWatchedService.saveGuestLastWatched(lastWatchedItem);
          }
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }, 30000);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        if (saveIntervalRef.current) {
          clearInterval(saveIntervalRef.current);
        }
      };
    }
  }, [isOpen, startTime, user, selectedServer, mediaType, item, selectedSeason, selectedEpisode, runtime, title]);

  const handleClose = async () => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    
    // Save final progress before closing (only if watched for at least 30 seconds)
    if (elapsed >= 30) {
      const lastWatchedItem = {
        item_type: mediaType,
        tmdb_id: item.id,
        imdb_id: 'imdb_id' in item ? item.imdb_id : undefined,
        server_id: selectedServer,
        season: mediaType === 'tv' ? selectedSeason : undefined,
        episode: mediaType === 'tv' ? selectedEpisode : undefined,
        progress_seconds: elapsed,
        runtime_seconds: runtime * 60,
        poster_path: item.poster_path,
        title,
      };

      try {
        if (user) {
          await lastWatchedService.saveUserLastWatched(user.id, lastWatchedItem);
        } else {
          await lastWatchedService.saveGuestLastWatched(lastWatchedItem);
        }
      } catch (error) {
        console.error('Failed to save final progress:', error);
      }
    }

    onClose();
  };

  // Auto-hide controls
  useEffect(() => {
    if (!showControls) return;
    
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [showControls]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-[9999] flex flex-col"
        >
          {/* Header */}
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: showControls ? 0 : -100 }}
            className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black to-transparent p-4 z-[10000]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={handleClose}>
                  <X size={24} />
                </Button>
                <h2 className="text-xl font-bold text-white">
                  {title}
                  {mediaType === 'tv' && (
                    <span className="ml-2 text-gray-300">
                      S{selectedSeason}:E{selectedEpisode}
                    </span>
                  )}
                </h2>
              </div>

              <div className="flex items-center space-x-4">
                {/* Server Selector */}
                <select
                  value={selectedServer}
                  onChange={(e) => setSelectedServer(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
                >
                  {servers.map((server) => (
                    <option key={server.id} value={server.id}>
                      {server.name}
                    </option>
                  ))}
                </select>

                {/* Episode Selector for TV Shows */}
                {mediaType === 'tv' && episodes.length > 0 && (
                  <select
                    value={selectedEpisode}
                    onChange={(e) => onEpisodeChange?.(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-1 text-white"
                  >
                    {episodes.map((episode) => (
                      <option key={episode.id} value={episode.episode_number}>
                        Episode {episode.episode_number}: {episode.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </motion.div>

          {/* Video Player */}
          <div 
            className="flex-1 relative z-[9998]"
            onMouseMove={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            <iframe
              key={embedUrl} // Force re-render when URL changes
              src={embedUrl}
              className="w-full h-full relative z-[9997]"
              allowFullScreen
              frameBorder="0"
              title={`${title} - Player`}
              style={{ pointerEvents: 'auto' }}
            />
          </div>

          {/* Progress Bar */}
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: showControls ? 0 : 100 }}
            className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800 z-[10000]"
          >
            <div
              className="h-full bg-red-600 transition-all duration-1000"
              style={{ width: `${Math.min((progress / (runtime * 60)) * 100, 100)}%` }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};