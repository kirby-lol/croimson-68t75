import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/layout/Header';
import { HomePage } from './pages/HomePage';
import { SearchPage } from './pages/SearchPage';
import { VideoPlayer } from './components/media/VideoPlayer';
import { Movie, TVShow, Episode, MediaType } from './types';
import { tmdbService } from './services/tmdb';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'search'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<Movie | TVShow | null>(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(query ? 'search' : 'home');
  };

  const handleItemClick = async (item: Movie | TVShow) => {
    try {
      const isMovie = 'title' in item;
      const details = isMovie 
        ? await tmdbService.getMovieDetails(item.id)
        : await tmdbService.getTVShowDetails(item.id);
      
      setSelectedItem(details);
      
      // For TV shows, load first season episodes
      if (!isMovie) {
        const firstSeasonEpisodes = await tmdbService.getTVSeasonEpisodes(item.id, 1);
        setEpisodes(firstSeasonEpisodes);
        setSelectedSeason(1);
        setSelectedEpisode(1);
      }
      
      setShowPlayer(true);
    } catch (error) {
      console.error('Failed to load item details:', error);
    }
  };

  const handlePlayClick = (item: Movie | TVShow) => {
    handleItemClick(item);
  };

  const handleSeasonChange = async (season: number) => {
    if (!selectedItem || 'title' in selectedItem) return;
    
    try {
      const seasonEpisodes = await tmdbService.getTVSeasonEpisodes(selectedItem.id, season);
      setEpisodes(seasonEpisodes);
      setSelectedSeason(season);
      setSelectedEpisode(1);
    } catch (error) {
      console.error('Failed to load season episodes:', error);
    }
  };

  const handleEpisodeChange = (episode: number) => {
    setSelectedEpisode(episode);
  };

  const mediaType: MediaType = selectedItem && 'title' in selectedItem ? 'movie' : 'tv';

  return (
    <AuthProvider>
      <div className="min-h-screen bg-black text-white">
        <Header onSearch={handleSearch} searchQuery={searchQuery} />
        
        <AnimatePresence mode="wait">
          {currentPage === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <HomePage onItemClick={handleItemClick} onPlayClick={handlePlayClick} />
            </motion.div>
          ) : (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SearchPage query={searchQuery} onItemClick={handleItemClick} />
            </motion.div>
          )}
        </AnimatePresence>

        {selectedItem && (
          <VideoPlayer
            isOpen={showPlayer}
            onClose={() => {
              setShowPlayer(false);
              setSelectedItem(null);
            }}
            item={selectedItem}
            mediaType={mediaType}
            selectedSeason={selectedSeason}
            selectedEpisode={selectedEpisode}
            episodes={episodes}
            onSeasonChange={handleSeasonChange}
            onEpisodeChange={handleEpisodeChange}
          />
        )}
      </div>
    </AuthProvider>
  );
}

export default App;