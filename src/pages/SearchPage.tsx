import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { tmdbService } from '../services/tmdb';
import { MediaGrid } from '../components/media/MediaGrid';

export const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<(Movie | TVShow)[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchMedia = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const searchResults = await tmdbService.searchMulti(query);
        setResults(searchResults);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    searchMedia();
  }, [query]);

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

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <Search size={64} className="text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-400 mb-2">Search for Movies & TV Shows</h2>
          <p className="text-gray-500">Enter a title to get started</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-black py-8"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Search Results for "{query}"
          </h1>
          <p className="text-gray-400">
            {loading ? 'Searching...' : `Found ${results.length} results`}
          </p>
        </div>

        {loading ? (
          <MediaGrid items={[]} onItemClick={handleItemClick} loading={true} />
        ) : results.length > 0 ? (
          <MediaGrid items={results} onItemClick={handleItemClick} />
        ) : (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No results found</h3>
            <p className="text-gray-500">Try searching with different keywords</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};