'use client';

import { useState, useRef } from 'react';
import TrackCard from './TrackCard';
import TrackMenu from './TrackMenu';
import { Track } from '@/services/musicService';

interface TrackCardWithMenuProps {
  track: Track;
  index?: number;
  showIndex?: boolean;
  showArtist?: boolean;
  showListeners?: boolean;
  showDuration?: boolean;
  onPlay?: (track: Track) => void;
  compact?: boolean;
}

export default function TrackCardWithMenu({
  track,
  index = 0,
  showIndex = true,
  showArtist = true,
  showListeners = false,
  showDuration = true,
  onPlay,
  compact = false,
}: TrackCardWithMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // If menu is already showing, hide it
    if (showMenu) {
      setShowMenu(false);
      return;
    }
    
    // Calculate position for the menu
    if (menuButtonRef.current) {
      const rect = menuButtonRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.right,
        y: rect.top
      });
    }
    
    setShowMenu(true);
  };

  return (
    <div className="relative group">
      <TrackCard
        track={track}
        index={index}
        showIndex={showIndex}
        showArtist={showArtist}
        showListeners={showListeners}
        showDuration={showDuration}
        onPlay={onPlay}
        compact={compact}
      />
      
      {/* Three-dot menu button */}
      <button
        ref={menuButtonRef}
        className="absolute top-3 right-3 p-1 rounded-full bg-dark-lighter opacity-0 group-hover:opacity-100 transition-opacity hover:bg-dark-lightest z-10"
        onClick={handleMenuClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      
      {/* Track menu */}
      {showMenu && menuPosition && (
        <TrackMenu
          track={track}
          onClose={() => setShowMenu(false)}
          position={menuPosition}
        />
      )}
    </div>
  );
}
