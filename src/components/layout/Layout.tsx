import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    } else {
      navigate('/');
    }
  };

  // Extract search query from URL if on search page
  React.useEffect(() => {
    if (location.pathname === '/search') {
      const params = new URLSearchParams(location.search);
      const q = params.get('q') || '';
      setSearchQuery(q);
    } else if (location.pathname === '/') {
      setSearchQuery('');
    }
  }, [location]);

  return (
    <>
      <Header onSearch={handleSearch} searchQuery={searchQuery} />
      <Outlet />
    </>
  );
};