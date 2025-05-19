'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { UserPlaylist } from '@/services/userDataService';

export default function PlaylistsSection() {
  const { getPlaylists, playTrack } = useMusic();
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get user playlists
  useEffect(() => {
    try {
      const userPlaylists = getPlaylists();
      setPlaylists(userPlaylists);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load playlists:', err);
      setError('Failed to load playlists. Please try again later.');
      setIsLoading(false);
    }
  }, [getPlaylists]);

  // Handle playing a playlist
  const handlePlayPlaylist = (playlist: UserPlaylist, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  // Get a default cover image for empty playlists
  const getDefaultCoverImage = (index: number) => {
    const colors = [
      'bg-gradient-to-br from-blue-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-teal-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-purple-500 to-pink-600',
      'bg-gradient-to-br from-yellow-500 to-amber-600',
    ];

    return (
      <div className={`w-full h-full flex items-center justify-center ${colors[index % colors.length]}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Playlists</h2>
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
          <h2 className="text-2xl font-bold">Your Playlists</h2>
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
        <h2 className="text-2xl font-bold">Your Playlists</h2>
        <div className="flex items-center gap-2">
          <Link href="/playlists" className="text-primary hover:text-primary-light">
            View All
          </Link>
        </div>
      </div>

      {playlists.length === 0 ? (
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't created any playlists yet.</p>
          <Link href="/playlists" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
            Create Your First Playlist
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.map((playlist, index) => (
            <Link
              key={playlist.id}
              href={`/playlist/${playlist.id}`}
              className="bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors"
            >
              <div className="relative aspect-square rounded-md overflow-hidden mb-3">
                {playlist.tracks.length > 0 ? (
                  <Image
                    src={playlist.tracks[0].thumbnail}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  getDefaultCoverImage(index)
                )}
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <button
                      className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
                      onClick={(e) => handlePlayPlaylist(playlist, e)}
                      disabled={playlist.tracks.length === 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                    <button
                      className="bg-gray-700 rounded-full p-2 transform hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        window.location.href = `/playlist/${playlist.id}`;
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <h3 className="font-medium truncate">{playlist.name}</h3>
              <p className="text-sm text-gray-400">{playlist.tracks.length} tracks</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
