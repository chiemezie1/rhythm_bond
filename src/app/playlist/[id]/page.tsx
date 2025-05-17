'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from "@/components/layout/Layout";
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { UserPlaylist } from '@/services/userDataService';
import PlaylistComments from '@/components/social/PlaylistComments';
import SharePlaylist from '@/components/social/SharePlaylist';
import socialService from '@/services/socialService';

export default function PlaylistPage({ params }: { params: { id: string } }) {
  const { getPlaylistById, playTrack, addTrackToPlaylist, getPlaylists } = useMusic();
  const { isAuthenticated, user } = useAuth();
  const [playlist, setPlaylist] = useState<UserPlaylist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showAddToPlaylistMenu, setShowAddToPlaylistMenu] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [isOwner, setIsOwner] = useState(false);

  // Fetch playlist data
  useEffect(() => {
    try {
      setIsLoading(true);

      // Get playlist by ID
      const playlistData = getPlaylistById(params.id);

      if (playlistData) {
        setPlaylist(playlistData);

        // Check if the current user is the owner of the playlist
        // In a real app, this would check the user ID against the playlist owner ID
        setIsOwner(true);
      } else {
        setError('Playlist not found');
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load playlist:', err);
      setError('Failed to load playlist. Please try again later.');
      setIsLoading(false);
    }
  }, [params.id, getPlaylistById]);

  // Handle playing the entire playlist
  const handlePlayPlaylist = () => {
    if (playlist && playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0]);
    }
  };

  // Handle sharing the playlist
  const handleSharePlaylist = (message: string, visibility: 'public' | 'followers' | 'private') => {
    if (!isAuthenticated || !user || !playlist) return;

    // In a real app, this would call the social service to share the playlist
    // socialService.sharePlaylist(user.id, playlist, message, visibility);

    // For now, just close the modal
    setShowShareModal(false);
  };

  // Handle showing the add to playlist menu
  const handleShowAddToPlaylistMenu = () => {
    if (!isAuthenticated) {
      alert('You need to be logged in to add this playlist to your library.');
      return;
    }

    // Get user's playlists
    const playlists = getPlaylists();
    setUserPlaylists(playlists);
    setShowAddToPlaylistMenu(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-background-elevated rounded-lg mb-6"></div>
            <div className="h-8 bg-background-elevated rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-background-elevated rounded w-1/2 mb-6"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-background-elevated rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !playlist) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto">
          <div className="bg-background-card rounded-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Playlist Not Found</h1>
            <p className="text-text-secondary mb-6">{error || 'The playlist you're looking for doesn't exist.'}</p>
            <Link href="/library" className="btn btn-primary">
              Go to Library
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Playlist Header */}
        <div className="relative mb-8">
          <div className="bg-gradient-to-r from-background-card to-background-elevated rounded-lg p-6 md:p-8">
            <div className="md:flex items-start gap-8">
              {/* Playlist Cover */}
              <div className="relative w-full md:w-64 h-64 rounded-lg overflow-hidden mb-6 md:mb-0 flex-shrink-0">
                {playlist.tracks.length > 0 ? (
                  <Image
                    src={playlist.tracks[0].thumbnail}
                    alt={playlist.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-background-dark flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Playlist Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-text-secondary text-sm">PLAYLIST</span>
                  {isOwner && (
                    <span className="bg-primary/20 text-primary text-xs px-2 py-0.5 rounded-full">
                      Your Playlist
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{playlist.name}</h1>
                {playlist.description && (
                  <p className="text-text-secondary mb-4">{playlist.description}</p>
                )}
                <div className="flex items-center gap-2 text-sm text-text-tertiary mb-6">
                  <span>{playlist.tracks.length} tracks</span>
                  <span>•</span>
                  <span>Created {formatDate(playlist.createdAt)}</span>
                  <span>•</span>
                  <span>Updated {formatDate(playlist.updatedAt)}</span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    className="btn btn-primary"
                    onClick={handlePlayPlaylist}
                    disabled={playlist.tracks.length === 0}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                    Play
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={() => setShowShareModal(true)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    Share
                  </button>
                  {!isOwner && (
                    <button
                      className="btn btn-ghost"
                      onClick={handleShowAddToPlaylistMenu}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add to Library
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Playlist Tracks */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Tracks</h2>

          {playlist.tracks.length === 0 ? (
            <div className="bg-background-card rounded-lg p-8 text-center">
              <p className="text-text-secondary mb-4">This playlist is empty</p>
              {isOwner && (
                <Link href="/search" className="btn btn-primary">
                  Add Tracks
                </Link>
              )}
            </div>
          ) : (
            <div className="bg-background-card rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-text-tertiary border-b border-background-elevated">
                    <th className="py-3 px-4 w-12">#</th>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4 hidden md:table-cell">Artist</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Genre</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {playlist.tracks.map((track, index) => (
                    <tr
                      key={track.id}
                      className="border-b border-background-elevated hover:bg-background-elevated/50 transition-colors cursor-pointer"
                      onClick={() => playTrack(track)}
                    >
                      <td className="py-3 px-4 text-text-tertiary">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={track.thumbnail}
                              alt={track.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{track.title}</p>
                            <p className="text-sm text-text-secondary truncate md:hidden">{track.artist}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-text-secondary hidden md:table-cell">{track.artist}</td>
                      <td className="py-3 px-4 text-text-tertiary hidden lg:table-cell">{track.genre}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="icon-btn text-text-secondary hover:text-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              playTrack(track);
                            }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            </svg>
                          </button>
                          {isOwner && (
                            <button
                              className="icon-btn text-text-secondary hover:text-error"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle removing track from playlist
                                alert(`Remove ${track.title} from playlist`);
                              }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className="mb-12">
          <PlaylistComments playlistId={playlist.id} playlistName={playlist.name} />
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <SharePlaylist
            playlist={playlist}
            onClose={() => setShowShareModal(false)}
            onShare={handleSharePlaylist}
          />
        )}

        {/* Add to Playlist Menu */}
        {showAddToPlaylistMenu && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-background-card rounded-lg w-full max-w-md animate-fade-in animate-slide-up">
              <div className="p-4 border-b border-background-elevated">
                <h2 className="text-xl font-semibold">Add to Playlist</h2>
              </div>

              <div className="p-4">
                {userPlaylists.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-text-secondary mb-4">You don't have any playlists yet.</p>
                    <Link
                      href="/library"
                      className="btn btn-primary"
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
                        onClick={() => {
                          // Add all tracks from this playlist to the selected playlist
                          playlist.tracks.forEach(track => {
                            addTrackToPlaylist(userPlaylist.id, track);
                          });
                          setShowAddToPlaylistMenu(false);
                        }}
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
              </div>

              <div className="p-4 border-t border-background-elevated flex justify-end">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowAddToPlaylistMenu(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
