'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface Track {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  youtubeUrl: string;
}

interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  coverUrl: string;
  isPublic: boolean;
}

interface CreatePostProps {
  onPostCreated?: () => void;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showTrackSelector, setShowTrackSelector] = useState(false);
  const [showPlaylistSelector, setShowPlaylistSelector] = useState(false);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load tracks and playlists
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        // Load tracks
        const tracksResponse = await fetch('/api/music');
        if (tracksResponse.ok) {
          const tracksData = await tracksResponse.json();
          const allTracks: Track[] = [];
          tracksData.genres?.forEach((genre: any) => {
            if (genre.tracks) {
              allTracks.push(...genre.tracks);
            }
          });
          setTracks(allTracks);
        }

        // Load playlists
        const playlistsResponse = await fetch('/api/user/data/playlists');
        if (playlistsResponse.ok) {
          const playlistsData = await playlistsResponse.json();
          setPlaylists(playlistsData.playlists || []);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !user) {
      return;
    }

    // Validate that either content or media is provided
    if (!content.trim() && !selectedTrack && !selectedPlaylist) {
      return;
    }

    try {
      setIsLoading(true);

      const postData = {
        content: content.trim(),
        mediaType: selectedTrack ? 'track' : selectedPlaylist ? 'playlist' : null,
        mediaId: selectedTrack?.id || selectedPlaylist?.id || null,
        visibility: 'public'
      };

      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (response.ok) {
        // Reset form
        setContent('');
        setSelectedTrack(null);
        setSelectedPlaylist(null);
        setShowTrackSelector(false);
        setShowPlaylistSelector(false);

        // Notify parent component
        if (onPostCreated) {
          onPostCreated();
        }
      } else {
        throw new Error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMedia = () => {
    setSelectedTrack(null);
    setSelectedPlaylist(null);
  };

  const filteredTracks = tracks.filter(track =>
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPlaylists = playlists.filter(playlist =>
    playlist.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl p-6 border border-dark-lightest/30">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={user?.image || '/images/default-avatar.png'}
              alt={user?.name || 'User'}
              fill
              className="object-cover"
            />
          </div>

          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind? Share a track or playlist..."
              className="w-full bg-transparent text-white placeholder-gray-400 resize-none border-none outline-none text-lg"
              rows={3}
            />

            {/* Selected Media Preview */}
            {(selectedTrack || selectedPlaylist) && (
              <div className="mt-4 p-4 bg-dark-lighter rounded-xl border border-dark-lightest/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden">
                      <Image
                        src={selectedTrack?.thumbnail || selectedPlaylist?.coverUrl || '/images/logo.png'}
                        alt={selectedTrack?.title || selectedPlaylist?.name || 'Media'}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {selectedTrack?.title || selectedPlaylist?.name}
                      </p>
                      <p className="text-sm text-gray-400">
                        {selectedTrack ? selectedTrack.artist : `${selectedPlaylist?.tracks?.length || 0} tracks`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveMedia}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Track Selector */}
            {showTrackSelector && (
              <div className="mt-4 p-4 bg-dark-lighter rounded-xl border border-dark-lightest/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">Select a Track</h3>
                  <button
                    type="button"
                    onClick={() => setShowTrackSelector(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search tracks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-lightest text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-dark-lightest/50 mb-4"
                />

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredTracks.slice(0, 10).map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      onClick={() => {
                        setSelectedTrack(track);
                        setSelectedPlaylist(null);
                        setShowTrackSelector(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-lightest/50 transition-colors text-left"
                    >
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={track.thumbnail}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{track.title}</p>
                        <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Playlist Selector */}
            {showPlaylistSelector && (
              <div className="mt-4 p-4 bg-dark-lighter rounded-xl border border-dark-lightest/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-white">Select a Playlist</h3>
                  <button
                    type="button"
                    onClick={() => setShowPlaylistSelector(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Search playlists..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-lightest text-white placeholder-gray-400 px-4 py-2 rounded-lg border border-dark-lightest/50 mb-4"
                />

                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredPlaylists.map((playlist) => (
                    <button
                      key={playlist.id}
                      type="button"
                      onClick={() => {
                        setSelectedPlaylist(playlist);
                        setSelectedTrack(null);
                        setShowPlaylistSelector(false);
                        setSearchQuery('');
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-dark-lightest/50 transition-colors text-left"
                    >
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={playlist.coverUrl || '/images/logo.png'}
                          alt={playlist.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white truncate">{playlist.name}</p>
                        <p className="text-sm text-gray-400 truncate">{playlist.tracks.length} tracks</p>
                      </div>
                      {!playlist.isPublic && (
                        <span className="text-xs bg-dark-lightest text-gray-400 px-2 py-1 rounded">Private</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowTrackSelector(!showTrackSelector);
                    setShowPlaylistSelector(false);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showTrackSelector
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-lighter/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="text-sm">Track</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowPlaylistSelector(!showPlaylistSelector);
                    setShowTrackSelector(false);
                    setSearchQuery('');
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    showPlaylistSelector
                      ? 'bg-primary text-white'
                      : 'text-gray-400 hover:text-white hover:bg-dark-lighter/50'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <span className="text-sm">Playlist</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading || (!content.trim() && !selectedTrack && !selectedPlaylist)}
                className="bg-primary hover:bg-primary-dark disabled:bg-dark-lightest disabled:text-gray-500 text-white font-medium px-6 py-2 rounded-lg transition-colors"
              >
                {isLoading ? 'Posting...' : 'Share'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
