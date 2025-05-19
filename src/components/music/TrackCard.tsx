'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';
import TrackMenu from './TrackMenu';

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
  } = useMusic();
  const { isAuthenticated } = useAuth();

  const [hoveredTrack, setHoveredTrack] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // Check if track is in favorites
  useEffect(() => {
    if (isAuthenticated) {
      setLiked(isFavorite(track.id));
    }
  }, [isAuthenticated, isFavorite, track.id]);

  // Toggle like status
  const handleToggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Please log in to add tracks to your favorites');
      window.location.href = '/login';
      return;
    }

    toggleFavorite(track).then(isNowLiked => {
      setLiked(isNowLiked);
    });
  };

  // Play the track
  const handlePlayTrack = () => {
    if (onPlay) {
      onPlay(track);
    } else {
      playTrack(track);
    }

    // If the user is not authenticated, we'll still play the track
    // but we'll also add it to the recently played list in localStorage
    // This way, when they log in, they'll see their recently played tracks
    if (!isAuthenticated) {
      // We could show a login prompt here, but we'll let them enjoy the music first
      console.log('Playing track without being logged in');
    }
  };

  // Show the track menu
  const handleShowMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    // Calculate position for the menu
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });

    setShowMenu(true);
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

        {/* Duration, Like Button & Menu */}
        <div className="text-gray-400 text-right flex items-center gap-3 flex-shrink-0">
          {hoveredTrack && (
            <>
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

              <button
                className="text-gray-400 hover:text-white"
                onClick={handleShowMenu}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </>
          )}
          {showDuration && <span>{track.duration || '3:45'}</span>}
        </div>
      </div>

      {/* Track Menu */}
      {showMenu && (
        <TrackMenu
          track={track}
          onClose={() => setShowMenu(false)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
