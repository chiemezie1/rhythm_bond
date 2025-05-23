'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from "@/components/layout/Layout";
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import TrackCard from '@/components/music/TrackCard';
import Link from 'next/link';
import Image from 'next/image';

// Default genre data with colors (for predefined genres)
const defaultGenres = {
  'afrobeats': { name: 'Afrobeats & Global Pop', color: 'from-green-500 to-emerald-500' },
  'pop': { name: 'Pop', color: 'from-pink-500 to-purple-500' },
  'hiphop': { name: 'Hip-Hop & Trap', color: 'from-blue-500 to-indigo-500' },
  'rnb': { name: 'R&B', color: 'from-purple-500 to-violet-500' },
  'blues': { name: 'Blues', color: 'from-amber-500 to-yellow-500' },
};

export default function GenrePage({ params: serverParams }: { params: { id: string } }) {
  const params = useParams();
  const genreId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : '';

  const { isAuthenticated } = useAuth();
  const { getGenreById, getTracksByGenre, searchTracks, addTrackToGenre, removeTrackFromGenre, getAllTracks, playTrack } = useMusic();

  const [genre, setGenre] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allTracks, setAllTracks] = useState<any[]>([]);
  const [sortOption, setSortOption] = useState<'default' | 'title' | 'artist'>('default');
  const [showAllTracks, setShowAllTracks] = useState(false);

  // Load genre and its tracks
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmounting

    const loadGenreData = async () => {
      try {
        if (!isMounted) return;
        setIsLoading(true);
        setError(null);

        // Fetch all tracks for the library only once
        if (allTracks.length === 0) {
          const libraryTracks = await getAllTracks();
          if (!isMounted) return;
          setAllTracks(libraryTracks);
        }

        // Check if this is a predefined genre or a user-created genre
        if (['afrobeats', 'pop', 'hiphop', 'rnb', 'blues'].includes(genreId)) {
          // This is a predefined genre
          const genreInfo = defaultGenres[genreId as keyof typeof defaultGenres];
          if (!isMounted) return;
          setGenre({
            id: genreId,
            name: genreInfo.name,
            color: genreInfo.color,
            isPredefined: true
          });

          // Fetch tracks for this predefined genre
          const genreTracks = await getTracksByGenre(genreId);
          if (!isMounted) return;
          setTracks(genreTracks);
        } else {
          // This is a user-created genre
          const userGenre = await getGenreById(genreId);
          if (!isMounted) return;

          if (userGenre) {
            setGenre({
              ...userGenre,
              isPredefined: false
            });
            setTracks(userGenre.tracks || []);
          } else {
            setError('Genre not found');
          }
        }

        if (!isMounted) return;
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading genre:', err);
        if (!isMounted) return;
        setError('Failed to load genre data. Please try again later.');
        setIsLoading(false);
      }
    };

    loadGenreData();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };
  }, [genreId, getGenreById, getTracksByGenre, getAllTracks, allTracks.length]);

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const results = await searchTracks(searchQuery);

      // Filter out tracks that are already in the genre
      const filteredResults = results.filter(
        (result: any) => !tracks.some((track) => track.id === result.id)
      );

      setSearchResults(filteredResults);
    } catch (error) {
      console.error('Error searching tracks:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle add track to genre
  const handleAddTrack = async (trackId: string) => {
    if (!isAuthenticated || genre?.isPredefined) return;

    try {
      // Find the track in search results or all tracks
      const track = searchResults.find((t) => t.id === trackId) ||
                   allTracks.find((t) => t.id === trackId);

      const success = await addTrackToGenre(genreId, trackId, track);

      if (success) {
        if (track) {
          setTracks([...tracks, track]);
          // Remove from search results if it was there
          setSearchResults(searchResults.filter((t) => t.id !== trackId));
        }
      }
    } catch (error) {
      console.error('Error adding track to genre:', error);
    }
  };

  // Handle remove track from genre
  const handleRemoveTrack = async (trackId: string) => {
    if (!isAuthenticated || genre?.isPredefined) return;

    try {
      const success = await removeTrackFromGenre(genreId, trackId);

      if (success) {
        setTracks(tracks.filter((t) => t.id !== trackId));
      }
    } catch (error) {
      console.error('Error removing track from genre:', error);
    }
  };

  // Get sorted tracks based on the selected sort option
  const getSortedTracks = (tracksToSort: any[]) => {
    switch (sortOption) {
      case 'title':
        return [...tracksToSort].sort((a, b) => a.title.localeCompare(b.title));
      case 'artist':
        return [...tracksToSort].sort((a, b) => a.artist.localeCompare(b.artist));
      default:
        return tracksToSort;
    }
  };

  // Filter all tracks to exclude those already in the genre
  const getAvailableTracks = () => {
    return allTracks.filter(
      (track) => !tracks.some((t) => t.id === track.id)
    );
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4">
        {/* Breadcrumb Navigation */}
        <div className="mb-6 pt-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link
              href="/categories"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Categories
            </Link>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">{genre?.name || 'Genre'}</span>
          </nav>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center mt-8">
            <p className="text-red-400 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/"
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Home
              </Link>
              <Link
                href="/categories"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Genre Header */}
            <div
              className={`rounded-xl p-8 mb-8 ${
                genre.isPredefined
                  ? `bg-gradient-to-r ${genre.color}`
                  : ''
              }`}
              style={!genre.isPredefined ? { backgroundColor: genre.color || '#3b82f6' } : {}}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Link
                    href="/"
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                  </Link>
                  <h1 className="text-3xl font-bold text-white">{genre.name}</h1>
                </div>

                {isAuthenticated && !genre.isPredefined && (
                  <Link
                    href={`/categories`}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md"
                  >
                    Manage Genres
                  </Link>
                )}
              </div>

              {genre.description && (
                <p className="text-white text-opacity-90 mb-4">{genre.description}</p>
              )}

              <p className="text-white text-opacity-80">
                {tracks.length} {tracks.length === 1 ? 'track' : 'tracks'}
              </p>
            </div>

            {/* Add Tracks Section (only for user-created genres) */}
            {isAuthenticated && !genre.isPredefined && (
              <div className="bg-dark-lighter rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Add Tracks</h2>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <label htmlFor="sortOption" className="text-sm text-gray-400">Sort by:</label>
                      <select
                        id="sortOption"
                        className="bg-dark-lightest text-white px-3 py-1 rounded-md border border-dark-lightest"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value as any)}
                      >
                        <option value="default">Default</option>
                        <option value="title">Title A-Z</option>
                        <option value="artist">Artist A-Z</option>
                      </select>
                    </div>

                    <button
                      className={`px-3 py-1 rounded-md text-sm ${
                        showAllTracks
                          ? 'bg-primary text-white'
                          : 'bg-dark-lightest text-gray-300'
                      }`}
                      onClick={() => setShowAllTracks(!showAllTracks)}
                    >
                      {showAllTracks ? 'Hide Library' : 'Show All Tracks'}
                    </button>
                  </div>
                </div>

                {!showAllTracks && (
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="text"
                      className="flex-1 bg-dark-lightest border border-dark-lightest rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Search for tracks to add..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button
                      className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                      onClick={handleSearch}
                      disabled={isSearching}
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </button>
                  </div>
                )}

                {!showAllTracks && searchResults.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-3">
                      {getSortedTracks(searchResults).map((track) => (
                        <div key={track.id} className="bg-dark-lightest hover:bg-dark-lighter rounded-xl p-4 transition-all duration-200 group">
                          <div className="flex items-center gap-4">
                            {/* Track Thumbnail */}
                            <div className="w-12 h-12 relative flex-shrink-0 bg-dark-lighter rounded-lg overflow-hidden">
                              {track.thumbnail ? (
                                <Image
                                  src={track.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg')}
                                  alt={track.title}
                                  fill
                                  className="object-cover"
                                  unoptimized
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const parent = e.currentTarget.parentElement;
                                    if (parent) {
                                      const icon = document.createElement('div');
                                      icon.className = 'flex items-center justify-center w-full h-full';
                                      icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                                      parent.appendChild(icon);
                                    }
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                    <path d="M9 18V5l12-2v13"></path>
                                    <circle cx="6" cy="18" r="3"></circle>
                                    <circle cx="18" cy="16" r="3"></circle>
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Track Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                                {track.title}
                              </h4>
                              <p className="text-sm text-gray-400 truncate">
                                {track.artist}
                              </p>
                              {track.duration && (
                                <p className="text-xs text-gray-500 font-mono mt-1">
                                  {track.duration}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                              {/* Play Button */}
                              <button
                                className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                                onClick={() => playTrack(track)}
                                title="Play track"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z"/>
                                </svg>
                              </button>

                              {/* Add Button */}
                              <button
                                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 group-hover:scale-105"
                                onClick={() => handleAddTrack(track.id)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add to Genre
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAllTracks && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      Your Music Library ({getAvailableTracks().length} available)
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                      {getAvailableTracks().length === 0 ? (
                        <div className="bg-dark-lightest rounded-xl p-8 text-center">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 bg-dark-lighter rounded-full flex items-center justify-center mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <p className="text-gray-400 font-medium">All tracks added!</p>
                            <p className="text-sm text-gray-500 mt-1">All tracks from your library are already in this genre</p>
                          </div>
                        </div>
                      ) : (
                        getSortedTracks(getAvailableTracks()).map((track) => (
                          <div key={track.id} className="bg-dark-lightest hover:bg-dark-lighter rounded-xl p-4 transition-all duration-200 group">
                            <div className="flex items-center gap-4">
                              {/* Track Thumbnail */}
                              <div className="w-12 h-12 relative flex-shrink-0 bg-dark-lighter rounded-lg overflow-hidden">
                                {track.thumbnail ? (
                                  <Image
                                    src={track.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg')}
                                    alt={track.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      const parent = e.currentTarget.parentElement;
                                      if (parent) {
                                        const icon = document.createElement('div');
                                        icon.className = 'flex items-center justify-center w-full h-full';
                                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                                        parent.appendChild(icon);
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="flex items-center justify-center w-full h-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                      <path d="M9 18V5l12-2v13"></path>
                                      <circle cx="6" cy="18" r="3"></circle>
                                      <circle cx="18" cy="16" r="3"></circle>
                                    </svg>
                                  </div>
                                )}
                              </div>

                              {/* Track Info */}
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                                  {track.title}
                                </h4>
                                <p className="text-sm text-gray-400 truncate">
                                  {track.artist}
                                </p>
                                {track.duration && (
                                  <p className="text-xs text-gray-500 font-mono mt-1">
                                    {track.duration}
                                  </p>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2">
                                {/* Play Button */}
                                <button
                                  className="w-8 h-8 bg-green-600 hover:bg-green-700 rounded-full flex items-center justify-center transition-colors"
                                  onClick={() => playTrack(track)}
                                  title="Play track"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </button>

                                {/* Add Button */}
                                <button
                                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 group-hover:scale-105"
                                  onClick={() => handleAddTrack(track.id)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add to Genre
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tracks List */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Tracks in {genre.name}</h2>

                {tracks.length > 0 && (
                  <div className="flex items-center gap-2">
                    <label htmlFor="genreTracksSortOption" className="text-sm text-gray-400">Sort by:</label>
                    <select
                      id="genreTracksSortOption"
                      className="bg-dark-lightest text-white px-3 py-1 rounded-md border border-dark-lightest"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as any)}
                    >
                      <option value="default">Default</option>
                      <option value="title">Title A-Z</option>
                      <option value="artist">Artist A-Z</option>
                    </select>
                  </div>
                )}
              </div>

              {tracks.length === 0 ? (
                <div className="bg-dark-lighter rounded-xl p-8 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-dark-lightest rounded-full flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-2v13M9 19c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm12-2c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No tracks yet</h3>
                    <p className="text-gray-400 mb-4">This genre doesn't have any tracks yet.</p>
                    {isAuthenticated && !genre.isPredefined && (
                      <p className="text-sm text-gray-500">
                        Use the search box above to add your first track to this genre.
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getSortedTracks(tracks).map((track, index) => (
                    <div
                      key={track.id}
                      className="bg-dark-lighter hover:bg-dark-lightest rounded-xl p-4 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-4">
                        {/* Track Number */}
                        <div className="w-8 h-8 flex items-center justify-center text-gray-400 font-medium text-sm">
                          {index + 1}
                        </div>

                        {/* Track Thumbnail */}
                        <div className="w-12 h-12 relative flex-shrink-0 bg-dark-lightest rounded-lg overflow-hidden">
                          {track.thumbnail ? (
                            <Image
                              src={track.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg')}
                              alt={track.title}
                              fill
                              className="object-cover"
                              unoptimized
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const icon = document.createElement('div');
                                  icon.className = 'flex items-center justify-center w-full h-full';
                                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                                  parent.appendChild(icon);
                                }
                              }}
                            />
                          ) : (
                            <div className="flex items-center justify-center w-full h-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Track Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                            {track.title}
                          </h3>
                          <p className="text-sm text-gray-400 truncate">
                            {track.artist}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="text-sm text-gray-400 font-mono">
                          {track.duration || '0:00'}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* Play Button */}
                          <button
                            className="w-8 h-8 bg-primary hover:bg-primary-dark rounded-full flex items-center justify-center transition-colors"
                            onClick={() => playTrack(track)}
                            title="Play track"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </button>

                          {/* Remove Button (only for user-created genres) */}
                          {!genre.isPredefined && (
                            <button
                              className="w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center transition-colors"
                              onClick={() => handleRemoveTrack(track.id)}
                              title="Remove from genre"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
