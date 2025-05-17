'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/contexts/MusicContext';
import { UserPlaylist } from '@/services/userDataService';
import socialService from '@/services/socialService';

interface SharedPlaylistProps {
  playlist: UserPlaylist;
  userId: string;
  username: string;
  userAvatar: string;
  timestamp: string;
  message?: string;
}

export default function SharedPlaylist({
  playlist,
  userId,
  username,
  userAvatar,
  timestamp,
  message
}: SharedPlaylistProps) {
  const { isAuthenticated, user } = useAuth();
  const { addTrackToPlaylist, getPlaylists, playTrack } = useMusic();
  const [showAddToPlaylistMenu, setShowAddToPlaylistMenu] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  
  // Handle adding the shared playlist to user's library
  const handleAddToLibrary = () => {
    if (!isAuthenticated) {
      alert('You need to be logged in to add this playlist to your library.');
      return;
    }
    
    // Get user's playlists
    const playlists = getPlaylists();
    setUserPlaylists(playlists);
    setShowAddToPlaylistMenu(true);
  };
  
  // Handle adding tracks to a selected playlist
  const handleAddToPlaylist = async (targetPlaylistId: string) => {
    if (!isAuthenticated || isAdding) return;
    
    try {
      setIsAdding(true);
      
      // Add all tracks from the shared playlist to the selected playlist
      let addedCount = 0;
      for (const track of playlist.tracks) {
        const success = addTrackToPlaylist(targetPlaylistId, track);
        if (success) addedCount++;
      }
      
      setAddSuccess(`Added ${addedCount} tracks to your playlist`);
      setTimeout(() => {
        setAddSuccess(null);
        setShowAddToPlaylistMenu(false);
      }, 2000);
      
      setIsAdding(false);
    } catch (error) {
      console.error('Failed to add tracks to playlist:', error);
      setIsAdding(false);
    }
  };
  
  // Handle playing the playlist
  const handlePlay = () => {
    if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };
  
  return (
    <div className="bg-background-card rounded-lg p-4 shadow-md">
      {/* User who shared the playlist */}
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/user/${userId}`} className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={userAvatar}
            alt={username}
            fill
            className="object-cover"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Link href={`/user/${userId}`} className="font-medium hover:underline">
              {username}
            </Link>
            <span className="text-text-tertiary">shared a playlist</span>
          </div>
          <p className="text-xs text-text-tertiary">{timestamp}</p>
        </div>
      </div>
      
      {/* Share message */}
      {message && (
        <p className="mb-4">{message}</p>
      )}
      
      {/* Playlist Card */}
      <div className="bg-background-elevated rounded-lg overflow-hidden mb-4">
        <div className="relative aspect-video w-full">
          {playlist.tracks.length > 0 ? (
            <Image
              src={playlist.tracks[0].thumbnail}
              alt={playlist.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-background-light flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 to-transparent flex items-end p-4">
            <div className="w-full">
              <h3 className="text-xl font-bold mb-1">{playlist.name}</h3>
              <p className="text-text-secondary mb-3">{playlist.tracks.length} tracks • Shared by {username}</p>
              <div className="flex gap-2">
                <button
                  className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-full font-medium"
                  onClick={handlePlay}
                  disabled={playlist.tracks.length === 0}
                >
                  Play
                </button>
                <button
                  className="bg-background-card hover:bg-background-light text-white px-4 py-2 rounded-full font-medium"
                  onClick={handleAddToLibrary}
                >
                  Add to Library
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Playlist Tracks Preview */}
        <div className="p-4">
          <h4 className="font-medium mb-2">Tracks</h4>
          <div className="space-y-2">
            {playlist.tracks.slice(0, 3).map((track, index) => (
              <div 
                key={track.id} 
                className="flex items-center gap-3 p-2 hover:bg-background-light rounded-md cursor-pointer"
                onClick={() => playTrack(track)}
              >
                <span className="text-text-tertiary w-5 text-center">{index + 1}</span>
                <div className="relative w-8 h-8 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{track.title}</p>
                  <p className="text-xs text-text-secondary truncate">{track.artist}</p>
                </div>
                <button className="text-text-secondary hover:text-primary">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </button>
              </div>
            ))}
            {playlist.tracks.length > 3 && (
              <Link 
                href={`/playlist/${playlist.id}`}
                className="block text-center text-primary hover:text-primary-light text-sm py-2"
              >
                View all {playlist.tracks.length} tracks
              </Link>
            )}
          </div>
        </div>
      </div>
      
      {/* Add to Playlist Menu */}
      {showAddToPlaylistMenu && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-lg w-full max-w-md animate-fade-in animate-slide-up">
            <div className="p-4 border-b border-background-elevated">
              <h2 className="text-xl font-semibold">Add to Playlist</h2>
            </div>
            
            <div className="p-4">
              {addSuccess ? (
                <div className="text-center py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-success mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-lg font-medium">{addSuccess}</p>
                </div>
              ) : (
                <>
                  {userPlaylists.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-secondary mb-4">You don't have any playlists yet.</p>
                      <Link 
                        href="/library"
                        className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium"
                        onClick={() => setShowAddToPlaylistMenu(false)}
                      >
                        Create a Playlist
                      </Link>
                    </div>
                  ) : (
                    <div className="max-h-60 overflow-y-auto">
                      {userPlaylists.map(userPlaylist => (
                        <button
                          key={userPlaylist.id}
                          className="flex items-center gap-3 w-full p-3 hover:bg-background-elevated rounded-md text-left"
                          onClick={() => handleAddToPlaylist(userPlaylist.id)}
                          disabled={isAdding}
                        >
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            {userPlaylist.tracks.length > 0 ? (
                              <Image
                                src={userPlaylist.tracks[0].thumbnail}
                                alt={userPlaylist.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-background-light flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{userPlaylist.name}</p>
                            <p className="text-xs text-text-secondary truncate">{userPlaylist.tracks.length} tracks</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="p-4 border-t border-background-elevated flex justify-end">
              <button
                className="px-4 py-2 text-text-secondary hover:text-white"
                onClick={() => setShowAddToPlaylistMenu(false)}
                disabled={isAdding}
              >
                {addSuccess ? 'Close' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
