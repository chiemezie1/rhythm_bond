'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';
import TrackMenu from '@/components/music/TrackMenu';

export default function FavoritesPage() {
  const { getFavorites, playTrack, toggleFavorite } = useMusic();
  const { isAuthenticated, user } = useAuth();
  const [favorites, setFavorites] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isAuthenticated) {
          setFavorites([]);
          setIsLoading(false);
          return;
        }

        const userFavorites = getFavorites();
        setFavorites(userFavorites);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorites. Please try again later.');
        setIsLoading(false);
      }
    };

    loadFavorites();
  }, [isAuthenticated, getFavorites]);

  // Handle showing the track menu
  const handleShowTrackMenu = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Calculate position for the menu
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    
    setSelectedTrack(track);
    setShowTrackMenu(true);
  };

  // Handle removing a track from favorites
  const handleRemoveFavorite = async (track: Track, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const isNowLiked = await toggleFavorite(track);
    if (!isNowLiked) {
      // Update the local state to remove the track
      setFavorites(favorites.filter(t => t.id !== track.id));
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white">Your Favorites</h1>
          <p className="text-white text-opacity-90 mt-2">
            All your favorite tracks in one place
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
            <p className="text-gray-400 mb-4">Please log in to see your favorites.</p>
            <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
              Log In
            </Link>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">You haven't added any favorites yet.</p>
            <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
              Discover Music
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
                  <th className="py-4 px-6 hidden lg:table-cell">Genre</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {favorites.map((track, index) => (
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
                    <td className="py-4 px-6 text-gray-400 hidden lg:table-cell">{track.genre || 'Unknown'}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="text-primary hover:text-primary-light"
                          onClick={(e) => handleRemoveFavorite(track, e)}
                          title="Remove from favorites"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          className="text-gray-400 hover:text-white"
                          onClick={(e) => handleShowTrackMenu(e, track)}
                          title="More options"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Track Menu */}
        {showTrackMenu && selectedTrack && (
          <TrackMenu
            track={selectedTrack}
            onClose={() => setShowTrackMenu(false)}
            position={menuPosition}
          />
        )}
      </div>
    </Layout>
  );
}
