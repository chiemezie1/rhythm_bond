'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';

export default function GenresPage() {
  const { getGenres, createGenre, getTracksByGenre, playTrack, addTrackToGenre, removeTrackFromGenre } = useMusic();
  const { isAuthenticated, user } = useAuth();
  const [genres, setGenres] = useState<any[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<any | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newGenreName, setNewGenreName] = useState('');
  const [newGenreColor, setNewGenreColor] = useState('#3b82f6'); // Default blue color

  // Load genres
  useEffect(() => {
    const loadGenres = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isAuthenticated) {
          setGenres([]);
          setIsLoading(false);
          return;
        }

        const allGenres = await getGenres();
        setGenres(allGenres);

        // Select the first genre by default if available
        if (allGenres.length > 0 && !selectedGenre) {
          setSelectedGenre(allGenres[0]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading genres:', err);
        setError('Failed to load genres. Please try again later.');
        setIsLoading(false);
      }
    };

    loadGenres();
  }, [isAuthenticated, getGenres, selectedGenre]);

  // Load tracks for selected genre
  useEffect(() => {
    const loadTracksForGenre = async () => {
      if (!selectedGenre) {
        setTracks([]);
        return;
      }

      try {
        // In a real implementation, we would fetch tracks for the selected genre
        // For now, we'll just use a mock implementation
        const genreTracks = await getTracksByGenre(selectedGenre.id);
        setTracks(genreTracks);
      } catch (err) {
        console.error('Error loading tracks for genre:', err);
        setError('Failed to load tracks for this genre.');
      }
    };

    loadTracksForGenre();
  }, [selectedGenre, getTracksByGenre]);

  // Handle creating a new genre
  const handleCreateGenre = async () => {
    if (!newGenreName.trim() || !isAuthenticated) return;

    try {
      const newGenre = await createGenre(newGenreName, newGenreColor);
      if (newGenre) {
        setGenres([...genres, newGenre]);
        setSelectedGenre(newGenre);
        setNewGenreName('');
      }
    } catch (err) {
      console.error('Error creating genre:', err);
      setError('Failed to create genre. Please try again.');
    }
  };

  // Handle removing a track from the genre
  const handleRemoveFromGenre = async (track: Track, e?: React.MouseEvent) => {
    if (!selectedGenre) return;

    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      const success = await removeTrackFromGenre(selectedGenre.id, track.id);
      if (success) {
        // Update the local state to remove the track
        setTracks(tracks.filter(t => t.id !== track.id));
      }
    } catch (err) {
      console.error('Error removing track from genre:', err);
      setError('Failed to remove track from genre.');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white">Genres</h1>
          <p className="text-white text-opacity-90 mt-2">
            Organize your music by genres
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : !isAuthenticated ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">Please log in to manage genres.</p>
            <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
              Log In
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Genres Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-dark-lighter rounded-xl p-4 mb-4">
                <h2 className="text-xl font-bold mb-4">Genres</h2>

                {/* Create New Genre */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 bg-dark-lightest border border-dark-lightest rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="New genre name..."
                      value={newGenreName}
                      onChange={(e) => setNewGenreName(e.target.value)}
                    />
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer"
                      value={newGenreColor}
                      onChange={(e) => setNewGenreColor(e.target.value)}
                    />
                  </div>
                  <button
                    className="w-full bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded text-sm"
                    onClick={handleCreateGenre}
                    disabled={!newGenreName.trim()}
                  >
                    Create Genre
                  </button>
                </div>

                {/* Genre List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {genres.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No genres yet. Create your first genre above.
                    </p>
                  ) : (
                    genres.map(genre => (
                      <button
                        key={genre.id}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded text-left ${
                          selectedGenre?.id === genre.id ? 'bg-dark-lightest' : 'hover:bg-dark-lightest'
                        }`}
                        onClick={() => setSelectedGenre(genre)}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: genre.color }}
                        ></div>
                        <span className="truncate">{genre.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Tracks for Selected Genre */}
            <div className="md:col-span-3">
              {selectedGenre ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: selectedGenre.color }}
                    ></div>
                    <h2 className="text-2xl font-bold">{selectedGenre.name}</h2>
                  </div>

                  {tracks.length === 0 ? (
                    <div className="bg-dark-lighter rounded-xl p-8 text-center">
                      <p className="text-gray-400 mb-4">No tracks in this genre yet.</p>
                      <p className="text-gray-500 mb-4">
                        Use the three-dot menu on any track to add it to this genre.
                      </p>
                      <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
                        Browse Music
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-dark-lighter rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-dark-lightest text-left text-gray-400">
                            <th className="py-4 px-6 w-16">#</th>
                            <th className="py-4 px-6">Title</th>
                            <th className="py-4 px-6 hidden md:table-cell">Artist</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tracks.map((track, index) => (
                            <tr
                              key={track.id}
                              className="border-b border-dark-lightest hover:bg-dark-lightest transition-colors cursor-pointer"
                              onClick={() => playTrack(track)}
                            >
                              <td className="py-4 px-6 text-gray-400">{index + 1}</td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                      src={track.thumbnail}
                                      alt={track.title}
                                      fill
                                      className="object-cover"
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
                              <td className="py-4 px-6 text-gray-400 hidden md:table-cell">{track.artist}</td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  className="text-red-500 hover:text-red-400"
                                  onClick={(e) => handleRemoveFromGenre(track, e)}
                                  title="Remove from genre"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-dark-lighter rounded-xl p-8 text-center">
                  <p className="text-gray-400 mb-4">Select a genre or create a new one to view tracks.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
