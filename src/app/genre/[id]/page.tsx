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
  const { getGenreById, getTracksByGenre, searchTracks, addTrackToGenre, removeTrackFromGenre, getAllTracks } = useMusic();

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
      const success = await addTrackToGenre(genreId, trackId);

      if (success) {
        // Find the track in search results
        const track = searchResults.find((t) => t.id === trackId);

        if (track) {
          setTracks([...tracks, track]);
          // Remove from search results
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
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center mt-8">
            <p className="text-red-400 mb-4">{error}</p>
            <Link
              href="/categories"
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            >
              Browse Categories
            </Link>
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
                <h1 className="text-3xl font-bold text-white">{genre.name}</h1>

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
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Search Results</h3>
                    <div className="space-y-2">
                      {getSortedTracks(searchResults).map((track) => (
                        <div key={track.id} className="flex items-center justify-between bg-dark-lightest p-3 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative flex-shrink-0 bg-dark-lightest rounded">
                              {track.thumbnail ? (
                                <Image
                                  src={track.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg')}
                                  alt={track.title}
                                  fill
                                  className="object-cover rounded"
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
                            <div>
                              <p className="font-medium">{track.title}</p>
                              <p className="text-sm text-gray-400">{track.artist}</p>
                            </div>
                          </div>
                          <button
                            className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm"
                            onClick={() => handleAddTrack(track.id)}
                          >
                            Add
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {showAllTracks && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">All Available Tracks</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                      {getAvailableTracks().length === 0 ? (
                        <p className="text-gray-400 text-center py-4">All tracks are already in this genre</p>
                      ) : (
                        getSortedTracks(getAvailableTracks()).map((track) => (
                          <div key={track.id} className="flex items-center justify-between bg-dark-lightest p-3 rounded-md">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 relative flex-shrink-0 bg-dark-lightest rounded">
                                {track.thumbnail ? (
                                  <Image
                                    src={track.thumbnail.replace('mqdefault.jpg', 'hqdefault.jpg')}
                                    alt={track.title}
                                    fill
                                    className="object-cover rounded"
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
                              <div>
                                <p className="font-medium">{track.title}</p>
                                <p className="text-sm text-gray-400">{track.artist}</p>
                              </div>
                            </div>
                            <button
                              className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm"
                              onClick={() => handleAddTrack(track.id)}
                            >
                              Add
                            </button>
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
                  <p className="text-gray-400 mb-4">No tracks found for this genre.</p>
                  {isAuthenticated && !genre.isPredefined && (
                    <p className="text-sm text-gray-500">
                      Use the search box above to add tracks to this genre.
                    </p>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {getSortedTracks(tracks).map((track) => (
                    <TrackCard
                      key={track.id}
                      track={track}
                      onRemove={!genre.isPredefined ? () => handleRemoveTrack(track.id) : undefined}
                    />
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
