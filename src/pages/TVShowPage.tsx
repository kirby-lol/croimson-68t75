import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Star, Calendar, ArrowLeft, Tv } from 'lucide-react';
import { TVShow, Episode } from '../types';
import { tmdbService } from '../services/tmdb';
import { VideoPlayer } from '../components/media/VideoPlayer';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const TVShowPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const autoplay = searchParams.get('autoplay') === 'true';
  const initialSeason = Number(searchParams.get('season')) || 1;
  const initialEpisode = Number(searchParams.get('episode')) || 1;
  
  const [tvShow, setTVShow] = useState<TVShow | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPlayer, setShowPlayer] = useState(autoplay);
  const [selectedSeason, setSelectedSeason] = useState(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState(initialEpisode);

  useEffect(() => {
    const loadTVShow = async () => {
      if (!id) return;
      
      try {
        const tvShowData = await tmdbService.getTVShowDetails(Number(id));
        setTVShow(tvShowData);
        
        // Load episodes for the initial season
        const seasonEpisodes = await tmdbService.getTVSeasonEpisodes(Number(id), initialSeason);
        setEpisodes(seasonEpisodes);
        
        if (autoplay) {
          setShowPlayer(true);
        }
      } catch (error) {
        console.error('Failed to load TV show:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTVShow();
  }, [id, autoplay, initialSeason]);

  const handleSeasonChange = async (season: number) => {
    if (!tvShow) return;
    
    try {
      const seasonEpisodes = await tmdbService.getTVSeasonEpisodes(tvShow.id, season);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">TV Show not found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const year = tvShow.first_air_date ? new Date(tvShow.first_air_date).getFullYear() : null;
  const currentEpisode = episodes.find(ep => ep.episode_number === selectedEpisode);

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
            src={tmdbService.getBackdropUrl(tvShow.backdrop_path)}
            alt={tvShow.name}
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
                  {tvShow.name}
                </h1>
                
                <div className="flex items-center space-x-4 mb-4 text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Star size={16} className="text-yellow-500 fill-current" />
                    <span>{tvShow.vote_average.toFixed(1)}</span>
                  </div>
                  {year && (
                    <div className="flex items-center space-x-1">
                      <Calendar size={16} />
                      <span>{year}</span>
                    </div>
                  )}
                  {tvShow.number_of_seasons && (
                    <div className="flex items-center space-x-1">
                      <Tv size={16} />
                      <span>{tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                  {tvShow.overview}
                </p>

                <div className="flex space-x-4">
                  <Button
                    size="lg"
                    onClick={() => setShowPlayer(true)}
                    className="flex items-center space-x-2"
                  >
                    <Play size={20} className="ml-0.5" />
                    <span>Play S{selectedSeason}:E{selectedEpisode}</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Episodes Section */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Episodes</h2>
                {tvShow.number_of_seasons && tvShow.number_of_seasons > 1 && (
                  <select
                    value={selectedSeason}
                    onChange={(e) => handleSeasonChange(Number(e.target.value))}
                    className="bg-gray-800 border border-gray-600 rounded px-3 py-2 text-white"
                  >
                    {Array.from({ length: tvShow.number_of_seasons }, (_, i) => i + 1).map((season) => (
                      <option key={season} value={season}>
                        Season {season}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-4">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      episode.episode_number === selectedEpisode
                        ? 'bg-red-900 bg-opacity-20 border-red-600'
                        : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                    }`}
                    onClick={() => handleEpisodeChange(episode.episode_number)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-white font-bold">{episode.episode_number}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">{episode.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{episode.overview}</p>
                        {episode.runtime && (
                          <p className="text-gray-500 text-xs mt-1">{episode.runtime}min</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <img
                src={tmdbService.getPosterUrl(tvShow.poster_path)}
                alt={tvShow.name}
                className="w-full rounded-lg shadow-lg mb-6"
              />
              
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">About</h3>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">{tvShow.overview}</p>
                
                {tvShow.genres && tvShow.genres.length > 0 && (
                  <div>
                    <h4 className="text-white font-medium mb-2">Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {tvShow.genres.map((genre) => (
                        <span
                          key={genre.id}
                          className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {tvShow && (
        <VideoPlayer
          isOpen={showPlayer}
          onClose={() => setShowPlayer(false)}
          item={tvShow}
          mediaType="tv"
          selectedSeason={selectedSeason}
          selectedEpisode={selectedEpisode}
          episodes={episodes}
          onSeasonChange={handleSeasonChange}
          onEpisodeChange={handleEpisodeChange}
        />
      )}
    </>
  );
};