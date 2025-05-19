'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from "@/components/layout/Layout";
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import TrackCardWithMenu from '@/components/music/TrackCardWithMenu';
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
  const { getGenreById, getTracksByGenre, searchTracks, addTrackToGenre, removeTrackFromGenre } = useMusic();

  const [genre, setGenre] = useState<any>(null);
  const [tracks, setTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Load genre and its tracks
  useEffect(() => {
    const loadGenreData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if this is a predefined genre or a user-created genre
        if (['afrobeats', 'pop', 'hiphop', 'rnb', 'blues'].includes(genreId)) {
          // This is a predefined genre
          const genreInfo = defaultGenres[genreId as keyof typeof defaultGenres];
          setGenre({
            id: genreId,
            name: genreInfo.name,
            color: genreInfo.color,
            isPredefined: true
          });

          // Fetch tracks for this predefined genre
          const genreTracks = await getTracksByGenre(genreId);
          setTracks(genreTracks);
        } else {
          // This is a user-created genre
          const userGenre = await getGenreById(genreId);

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

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading genre:', err);
        setError('Failed to load genre data. Please try again later.');
        setIsLoading(false);
      }
    };

    loadGenreData();
  }, [genreId, getGenreById, getTracksByGenre]);

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
                <h2 className="text-xl font-bold mb-4">Add Tracks</h2>

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

                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Search Results</h3>
                    <div className="space-y-2">
                      {searchResults.map((track) => (
                        <div key={track.id} className="flex items-center justify-between bg-dark-lightest p-3 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 relative flex-shrink-0">
                              <Image
                                src={track.thumbnail || '/images/logo.png'}
                                alt={track.title}
                                fill
                                className="object-cover rounded"
                              />
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
              </div>
            )}

            {/* Tracks List */}
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
                {tracks.map((track) => (
                  <TrackCardWithMenu
                    key={track.id}
                    track={track}
                    onRemove={!genre.isPredefined ? () => handleRemoveTrack(track.id) : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
