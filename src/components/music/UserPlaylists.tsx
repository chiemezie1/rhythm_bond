'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { UserPlaylist } from '@/services/userDataService';

export default function UserPlaylists() {
  const { getPlaylists, createPlaylist, playTrack, deletePlaylist } = useMusic();
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDescription, setNewPlaylistDescription] = useState('');
  const formRef = useRef<HTMLDivElement>(null);

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

  // Handle clicks outside the form
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowCreateForm(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle creating a new playlist
  const handleCreatePlaylist = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPlaylistName.trim()) {
      return;
    }

    try {
      // Use a mock playlist for now since createPlaylist is async and might fail
      const mockPlaylist: UserPlaylist = {
        id: `temp-${Date.now()}`,
        name: newPlaylistName,
        description: newPlaylistDescription,
        tracks: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: '',
        isPublic: false
      };

      setPlaylists(prev => [...prev, mockPlaylist]);
      setNewPlaylistName('');
      setNewPlaylistDescription('');
      setShowCreateForm(false);

      // Try to create the playlist in the background
      try {
        await createPlaylist(newPlaylistName, newPlaylistDescription);
        // If successful, we could refresh the playlists, but we'll skip for now
      } catch (innerErr) {
        console.error('Failed to create playlist in the background:', innerErr);
      }
    } catch (err) {
      console.error('Failed to create playlist:', err);
    }
  };

  // Handle deleting a playlist
  const handleDeletePlaylist = (playlistId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();

    if (window.confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlistId);
      setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    }
  };

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
          <button
            className="text-primary hover:text-primary-light"
            onClick={() => setShowCreateForm(true)}
          >
            Create New
          </button>
          <Link href="/playlists" className="text-primary hover:text-primary-light">
            View All
          </Link>
        </div>
      </div>

      {/* Create Playlist Form */}
      {showCreateForm && (
        <div className="bg-dark-lighter rounded-xl p-4 mb-4" ref={formRef}>
          <form onSubmit={handleCreatePlaylist}>
            <h3 className="text-lg font-medium mb-3">Create New Playlist</h3>
            <div className="mb-3">
              <label htmlFor="playlistName" className="block text-sm font-medium text-gray-400 mb-1">
                Name
              </label>
              <input
                type="text"
                id="playlistName"
                className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="playlistDescription" className="block text-sm font-medium text-gray-400 mb-1">
                Description (optional)
              </label>
              <textarea
                id="playlistDescription"
                className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                value={newPlaylistDescription}
                onChange={(e) => setNewPlaylistDescription(e.target.value)}
                placeholder="A collection of my favorite tracks"
                rows={2}
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="px-4 py-2 text-gray-400 hover:text-white"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                disabled={!newPlaylistName.trim()}
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {playlists.length === 0 && !showCreateForm ? (
        <div className="bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't created any playlists yet.</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            onClick={() => setShowCreateForm(true)}
          >
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {playlists.slice(0, 5).map((playlist, index) => (
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
                      className="bg-red-500 rounded-full p-2 transform hover:scale-110 transition-transform"
                      onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      className="bg-gray-700 rounded-full p-2 transform hover:scale-110 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        // Open a menu with options like "Edit Playlist", "Share Playlist", etc.
                        // For now, we'll just show a simple menu with Link to the playlist page
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
