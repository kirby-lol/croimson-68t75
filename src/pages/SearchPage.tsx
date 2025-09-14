import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { Movie, TVShow } from '../types';
import { tmdbService } from '../services/tmdb';
import { MediaGrid } from '../components/media/MediaGrid';

interface SearchPageProps {
  query: string;
  onItemClick: (item: Movie | TVShow) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ query, onItemClick }) => {
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

    const debounceTimeout = setTimeout(searchMedia, 500);
    return () => clearTimeout(debounceTimeout);
  }, [query]);

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
          <MediaGrid items={[]} onItemClick={onItemClick} loading={true} />
        ) : results.length > 0 ? (
          <MediaGrid items={results} onItemClick={onItemClick} />
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