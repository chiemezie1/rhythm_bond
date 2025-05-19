'use client';

import { useState } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import TrackCardWithMenu from './TrackCardWithMenu';
import Image from 'next/image';
import { getFallbackThumbnail, DEFAULT_THUMBNAIL } from '@/utils/imageUtils';

export default function AdvancedSearch() {
  const { searchTracks } = useMusic();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [filters, setFilters] = useState({
    artist: '',
    genre: '',
    duration: {
      min: '',
      max: ''
    }
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim() && !filters.artist && !filters.genre) {
      setSearchResults([]);
      setHasSearched(true);
      return;
    }

    setIsLoading(true);
    try {
      // In a real implementation, we would pass the filters and sort options to the API
      const results = await searchTracks(searchQuery);

      // Apply client-side filtering (in a real app, this would be done on the server)
      let filteredResults = [...results];

      if (filters.artist && filters.artist.trim() !== '') {
        const artistFilter = filters.artist.toLowerCase().trim();
        filteredResults = filteredResults.filter(track =>
          track.artist.toLowerCase().includes(artistFilter)
        );
      }

      if (filters.genre && filters.genre.trim() !== '') {
        const genreFilter = filters.genre.toLowerCase().trim();
        filteredResults = filteredResults.filter(track =>
          track.genre.toLowerCase().includes(genreFilter)
        );
      }

      if (filters.duration.min) {
        const minSeconds = parseInt(filters.duration.min) * 60;
        filteredResults = filteredResults.filter(track =>
          track.duration >= minSeconds
        );
      }

      if (filters.duration.max) {
        const maxSeconds = parseInt(filters.duration.max) * 60;
        filteredResults = filteredResults.filter(track =>
          track.duration <= maxSeconds
        );
      }

      // Apply sorting
      if (sortBy === 'title-asc') {
        filteredResults.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'title-desc') {
        filteredResults.sort((a, b) => b.title.localeCompare(a.title));
      } else if (sortBy === 'artist-asc') {
        filteredResults.sort((a, b) => a.artist.localeCompare(b.artist));
      } else if (sortBy === 'artist-desc') {
        filteredResults.sort((a, b) => b.artist.localeCompare(a.artist));
      } else if (sortBy === 'duration-asc') {
        filteredResults.sort((a, b) => a.duration - b.duration);
      } else if (sortBy === 'duration-desc') {
        filteredResults.sort((a, b) => b.duration - a.duration);
      }

      setSearchResults(filteredResults);
      setHasSearched(true);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (field: string, value: string) => {
    if (field === 'duration.min' || field === 'duration.max') {
      const [parent, child] = field.split('.');
      setFilters(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev] as any,
          [child]: value
        }
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  // Handle search on Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Format track duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Left Column - Search Form */}
      <div className="w-full md:w-1/3 lg:w-1/4">
        <div className="bg-dark-lighter rounded-lg p-6 sticky top-24">
          <h2 className="text-2xl font-bold mb-4">Search</h2>

          {/* Main search input */}
          <div className="flex flex-col mb-6">
            <label className="block text-gray-400 mb-2">Keywords</label>
            <div className="flex">
              <input
                type="text"
                placeholder="Search for songs, artists..."
                className="flex-grow bg-dark-lightest text-white px-4 py-3 rounded-l-lg focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className="bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-r-lg transition-colors"
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold">Filters</h3>

            <div>
              <label className="block text-gray-400 mb-2">Artist</label>
              <input
                type="text"
                placeholder="Filter by artist"
                className="w-full bg-dark-lightest text-white px-4 py-2 rounded-lg focus:outline-none"
                value={filters.artist}
                onChange={(e) => handleFilterChange('artist', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Genre</label>
              <input
                type="text"
                placeholder="Filter by genre"
                className="w-full bg-dark-lightest text-white px-4 py-2 rounded-lg focus:outline-none"
                value={filters.genre}
                onChange={(e) => handleFilterChange('genre', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Duration (minutes)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  className="w-1/2 bg-dark-lightest text-white px-4 py-2 rounded-lg focus:outline-none"
                  value={filters.duration.min}
                  onChange={(e) => handleFilterChange('duration.min', e.target.value)}
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  className="w-1/2 bg-dark-lightest text-white px-4 py-2 rounded-lg focus:outline-none"
                  value={filters.duration.max}
                  onChange={(e) => handleFilterChange('duration.max', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Sort options */}
          <div>
            <label className="block text-gray-400 mb-2">Sort by</label>
            <select
              className="w-full bg-dark-lightest text-white px-4 py-2 rounded-lg focus:outline-none"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="relevance">Relevance</option>
              <option value="title-asc">Title (A-Z)</option>
              <option value="title-desc">Title (Z-A)</option>
              <option value="artist-asc">Artist (A-Z)</option>
              <option value="artist-desc">Artist (Z-A)</option>
              <option value="duration-asc">Duration (Shortest first)</option>
              <option value="duration-desc">Duration (Longest first)</option>
            </select>
          </div>

          <button
            className="w-full mt-6 bg-primary hover:bg-primary-dark text-white px-4 py-3 rounded-lg transition-colors"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Right Column - Search Results */}
      <div className="w-full md:w-2/3 lg:w-3/4">
        <div className="bg-dark-lighter rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-6">
            {searchResults.length > 0
              ? `Search Results (${searchResults.length})`
              : hasSearched
                ? 'No results found'
                : 'Enter a search term to find music'}
          </h2>

          {!hasSearched && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-gray-400">Use the search form to find music</p>
            </div>
          )}

          {hasSearched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-400">No results found. Try different search terms.</p>
            </div>
          )}

          {searchResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 border-b border-dark-lightest">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Track</th>
                    <th className="py-3 px-4 hidden md:table-cell">Artist</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Genre</th>
                    <th className="py-3 px-4 text-right">Duration</th>
                    <th className="py-3 px-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((track, index) => (
                    <tr
                      key={track.id}
                      className="border-b border-dark-lightest hover:bg-dark-lightest/50 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={track.thumbnail || DEFAULT_THUMBNAIL}
                              alt={track.title}
                              fill
                              className="object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = DEFAULT_THUMBNAIL;
                              }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-white hover:underline truncate">
                              {track.title}
                            </div>
                            <div className="text-sm text-gray-400 truncate md:hidden">
                              {track.artist}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-400 hidden md:table-cell">{track.artist}</td>
                      <td className="py-3 px-4 text-gray-400 hidden lg:table-cell">{track.genre}</td>
                      <td className="py-3 px-4 text-gray-400 text-right">{formatDuration(track.duration)}</td>
                      <td className="py-3 px-4">
                        <TrackCardWithMenu track={track} compact={true} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
