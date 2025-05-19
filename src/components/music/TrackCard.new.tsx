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
      </div>
    </div>
  );
}
