'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicDatabase';

export default function FavoriteTracks() {
  const { getFavorites, toggleFavorite, playTrack } = useMusic();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get favorite tracks
  useEffect(() => {
    try {
      const favorites = getFavorites();
      setTracks(favorites);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load favorite tracks:', err);
      setError('Failed to load favorite tracks. Please try again later.');
      setIsLoading(false);
    }
  }, [getFavorites]);

  // Handle removing a track from favorites
  const handleRemoveFavorite = (track: Track, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering the row click (play)
    toggleFavorite(track);
    setTracks(prevTracks => prevTracks.filter(t => t.id !== track.id));
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Favorites</h2>
        </div>
        <div className="bg-dark-lighter rounded-xl p-8 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Favorites</h2>
        </div>
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Your Favorites</h2>
        <Link href="/favorites" className="text-primary hover:text-primary-light">
          View All
        </Link>
      </div>

      {tracks.length === 0 ? (
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't added any favorites yet.</p>
          <p className="text-gray-500">
            Click the heart icon on any track to add it to your favorites.
          </p>
        </div>
      ) : (
        <div className="bg-dark-lighter rounded-xl p-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-400 border-b border-dark-lightest">
                  <th className="py-2 px-4 w-12">#</th>
                  <th className="py-2 px-4">Title</th>
                  <th className="py-2 px-4 hidden md:table-cell">Artist</th>
                  <th className="py-2 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tracks.slice(0, 5).map((track, index) => (
                  <tr 
                    key={track.id} 
                    className="border-b border-dark-lightest hover:bg-dark-lightest/50 cursor-pointer"
                    onClick={() => playTrack(track)}
                  >
                    <td className="py-3 px-4 text-gray-400">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 relative mr-3 flex-shrink-0">
                          <Image
                            src={track.thumbnail}
                            alt={track.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="font-medium">{track.title}</div>
                          <div className="text-sm text-gray-400 md:hidden">{track.artist}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-400 hidden md:table-cell">{track.artist}</td>
                    <td className="py-3 px-4 text-right">
                      <button 
                        className="icon-btn text-red-500 hover:text-red-400"
                        onClick={(e) => handleRemoveFavorite(track, e)}
                        title="Remove from favorites"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
