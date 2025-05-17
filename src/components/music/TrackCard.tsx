'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';
import { UserPlaylist, CustomTag } from '@/services/userDataService';

interface TrackCardProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  showArtist?: boolean;
  showListeners?: boolean;
  showDuration?: boolean;
  onPlay?: (track: Track) => void;
  compact?: boolean;
}

export default function TrackCard({
  track,
  index = 0,
  showIndex = true,
  showArtist = true,
  showListeners = false,
  showDuration = true,
  onPlay,
  compact = false,
}: TrackCardProps) {
  const {
    playTrack,
    toggleFavorite,
    isFavorite,
    getPlaylists,
    addTrackToPlaylist,
    getCustomTags,
    addTagToTrack,
    createCustomTag
  } = useMusic();
  const { isAuthenticated, user } = useAuth();

  const [hoveredTrack, setHoveredTrack] = useState(false);
  const [activeMenu, setActiveMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [showTagsMenu, setShowTagsMenu] = useState(false);
  const [showGenresMenu, setShowGenresMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [newTagName, setNewTagName] = useState('');
  const [shareMessage, setShareMessage] = useState('');
  const [shareVisibility, setShareVisibility] = useState<'public' | 'followers' | 'private'>('public');

  const menuRef = useRef<HTMLDivElement>(null);
  const playlistMenuRef = useRef<HTMLDivElement>(null);
  const tagsMenuRef = useRef<HTMLDivElement>(null);
  const genresMenuRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Check if track is in favorites
  useEffect(() => {
    if (isAuthenticated) {
      setLiked(isFavorite(track.id));
    }
  }, [isAuthenticated, isFavorite, track.id]);

  // Handle clicking outside of menus
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(false);
      }
      if (playlistMenuRef.current && !playlistMenuRef.current.contains(event.target as Node)) {
        setShowPlaylistMenu(false);
      }
      if (tagsMenuRef.current && !tagsMenuRef.current.contains(event.target as Node)) {
        setShowTagsMenu(false);
      }
      if (genresMenuRef.current && !genresMenuRef.current.contains(event.target as Node)) {
        setShowGenresMenu(false);
      }
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggle like status
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to add tracks to your favorites');
      return;
    }

    const isNowLiked = toggleFavorite(track);
    setLiked(isNowLiked);
  };

  // Play the track
  const handlePlayTrack = () => {
    if (onPlay) {
      onPlay(track);
    } else {
      playTrack(track);
    }
  };

  // Load playlists when menu is opened
  const handleOpenPlaylistMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to add tracks to playlists');
      return;
    }

    setPlaylists(getPlaylists());
    setShowPlaylistMenu(true);
    setActiveMenu(false);
  };

  // Load tags when menu is opened
  const handleOpenTagsMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to add tags to tracks');
      return;
    }

    setTags(getCustomTags());
    setShowTagsMenu(true);
    setActiveMenu(false);
  };

  // Add track to playlist
  const handleAddToPlaylist = (playlistId: string) => {
    if (!isAuthenticated) return;

    const success = addTrackToPlaylist(playlistId, track);
    if (success) {
      alert(`Added "${track.title}" to playlist`);
      setShowPlaylistMenu(false);
    }
  };

  // Add tag to track
  const handleAddTag = (tagId: string) => {
    if (!isAuthenticated) return;

    const success = addTagToTrack(tagId, track.id);
    if (success) {
      alert(`Tag added to "${track.title}"`);
    }
  };

  // Create new tag
  const handleCreateTag = () => {
    if (!newTagName.trim() || !isAuthenticated) return;

    const newTag = createCustomTag(newTagName);
    setTags([...tags, newTag]);
    addTagToTrack(newTag.id, track.id);
    setNewTagName('');
  };

  // Open share menu
  const handleOpenShareMenu = () => {
    if (!isAuthenticated) {
      alert('Please log in to share tracks');
      return;
    }

    setShowShareMenu(true);
    setActiveMenu(false);
  };

  // Share track to social
  const handleShareTrack = () => {
    if (!isAuthenticated || !user) return;

    // Create a post with the track
    const post = {
      userId: user.id,
      type: 'track' as const,
      content: shareMessage || `Check out "${track.title}" by ${track.artist}`,
      timestamp: Date.now(),
      mediaId: track.id,
      mediaType: 'track',
      visibility: shareVisibility,
      likes: [],
      comments: [],
      shares: 0
    };

    // In a real implementation, this would call an API endpoint
    // For now, we'll just show an alert
    alert(`Shared "${track.title}" to your social feed`);
    setShowShareMenu(false);
  };

  // Don't play this track
  const handleDontPlayThis = () => {
    // In a real implementation, this would add the track to a "don't play" list
    // For now, we'll just show an alert
    alert(`"${track.title}" will not be played in your recommendations`);
    setActiveMenu(false);
  };

  return (
    <div
      className={`border-b border-dark-lightest hover:bg-dark-lightest transition-colors ${
        hoveredTrack ? 'bg-dark-lightest' : ''
      } ${compact ? 'p-2' : 'py-3 px-4'}`}
      onMouseEnter={() => setHoveredTrack(true)}
      onMouseLeave={() => setHoveredTrack(false)}
    >
      <div className="flex items-center gap-3">
        {/* Play/Index Column */}
        {showIndex && (
          <div className="flex-shrink-0 w-8 text-center text-gray-400">
            {hoveredTrack ? (
              <button
                className="text-white"
                onClick={handlePlayTrack}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                </svg>
              </button>
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
        )}

        {/* Track Info */}
        <div className="flex items-center gap-3 flex-grow min-w-0">
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
            <div className="text-sm text-gray-400 truncate">
              {track.artist}
            </div>
          </div>
        </div>

        {/* Artist Column (on larger screens) */}
        {showArtist && (
          <div className="hidden md:block text-gray-400 flex-shrink-0 min-w-[120px] max-w-[200px]">
            <span className="hover:underline truncate">
              {track.artist}
            </span>
          </div>
        )}

        {/* Listeners Column (optional) */}
        {showListeners && (
          <div className="hidden sm:block text-gray-400 text-right flex-shrink-0 w-20">
            <span>
              {Math.floor(Math.random() * 100) + 1}K
            </span>
          </div>
        )}

        {/* Duration & Like Button */}
        <div className="text-gray-400 text-right flex items-center gap-3 flex-shrink-0">
          {hoveredTrack && (
            <button
              className={`${liked ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
              onClick={handleToggleLike}
            >
              {liked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
          {showDuration && <span>{track.duration || '3:45'}</span>}
        </div>

        {/* 3-Dot Menu */}
        <div className="relative flex-shrink-0">
          <button
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-dark-lightest"
            onClick={() => setActiveMenu(!activeMenu)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {activeMenu && (
            <div
              ref={menuRef}
              className="absolute right-0 mt-1 w-56 bg-dark-lighter dark:bg-dark-lighter rounded-lg shadow-lg py-1 z-50 border border-dark-lightest"
            >
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
                onClick={handleOpenPlaylistMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to playlist
              </button>
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
                onClick={handleOpenTagsMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Add tags
              </button>
              <Link
                href={`/search?q=${encodeURIComponent(track.artist)}`}
                className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                More by this artist
              </Link>
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
                onClick={handleOpenShareMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Share to social
              </button>
              <div className="border-t border-dark-lightest my-1"></div>
              <Link
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View on YouTube
              </button>
              <button
                className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
                onClick={handleDontPlayThis}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                Don't play this
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add to Playlist Menu */}
      {showPlaylistMenu && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            ref={playlistMenuRef}
            className="bg-dark-lighter rounded-lg w-full max-w-md animate-fade-in"
          >
            <div className="p-4 border-b border-dark-lightest">
              <h2 className="text-xl font-semibold">Add to Playlist</h2>
            </div>

            <div className="p-4 max-h-60 overflow-y-auto">
              {playlists.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-400 mb-4">You don't have any playlists yet.</p>
                  <Link
                    href="/playlist/create"
                    className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                  >
                    Create a Playlist
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {playlists.map(playlist => (
                    <button
                      key={playlist.id}
                      className="flex items-center gap-3 w-full p-2 hover:bg-dark-lightest rounded-md text-left"
                      onClick={() => handleAddToPlaylist(playlist.id)}
                    >
                      <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                        {playlist.tracks.length > 0 ? (
                          <Image
                            src={playlist.tracks[0].thumbnail}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-dark-lightest flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{playlist.name}</p>
                        <p className="text-xs text-gray-400">{playlist.tracks.length} tracks</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-dark-lightest flex justify-end">
              <button
                className="px-4 py-2 text-gray-400 hover:text-white"
                onClick={() => setShowPlaylistMenu(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Tags Menu */}
      {showTagsMenu && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            ref={tagsMenuRef}
            className="bg-dark-lighter rounded-lg w-full max-w-md animate-fade-in"
          >
            <div className="p-4 border-b border-dark-lightest">
              <h2 className="text-xl font-semibold">Add Tags</h2>
            </div>

            <div className="p-4">
              <div className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 bg-dark-lightest border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Create new tag..."
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                  />
                  <button
                    className={`px-3 py-2 rounded-md ${
                      newTagName.trim() ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-dark-lightest text-gray-500 cursor-not-allowed'
                    }`}
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="max-h-60 overflow-y-auto">
                {tags.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-400">You don't have any tags yet. Create one above.</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map(tag => (
                      <button
                        key={tag.id}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: tag.color }}
                        onClick={() => handleAddTag(tag.id)}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-dark-lightest flex justify-end">
              <button
                className="px-4 py-2 text-gray-400 hover:text-white"
                onClick={() => setShowTagsMenu(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share to Social Menu */}
      {showShareMenu && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            ref={shareMenuRef}
            className="bg-dark-lighter rounded-lg w-full max-w-md animate-fade-in"
          >
            <div className="p-4 border-b border-dark-lightest">
              <h2 className="text-xl font-semibold">Share to Social</h2>
            </div>

            <div className="p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={track.thumbnail}
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
              </div>

              <div className="mb-4">
                <textarea
                  className="w-full bg-dark-lightest border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  placeholder="Add a message..."
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Who can see this?</label>
                <select
                  className="w-full bg-dark-lightest border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  value={shareVisibility}
                  onChange={(e) => setShareVisibility(e.target.value as any)}
                >
                  <option value="public">Everyone</option>
                  <option value="followers">Followers only</option>
                  <option value="private">Only me</option>
                </select>
              </div>
            </div>

            <div className="p-4 border-t border-dark-lightest flex justify-end gap-2">
              <button
                className="px-4 py-2 text-gray-400 hover:text-white"
                onClick={() => setShowShareMenu(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-md"
                onClick={handleShareTrack}
              >
                Share
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
