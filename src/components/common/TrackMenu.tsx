'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Track } from '@/services/musicDatabase';

interface TrackMenuProps {
  track: Track;
  onClose?: () => void;
}

export default function TrackMenu({ track, onClose }: TrackMenuProps) {
  // Don't play this track
  const handleDontPlayThis = () => {
    alert(`"${track.title}" will not be played in your recommendations`);
    if (onClose) onClose();
  };

  return (
    <div className="bg-dark-lighter rounded-lg shadow-lg py-1 z-50 border border-dark-lightest w-56">
      <Link 
        href={`/artist/${encodeURIComponent(track.artist)}`}
        className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
        onClick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Go to artist
      </Link>
      
      <Link
        href={track.youtubeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest"
        onClick={onClose}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        View on YouTube
      </Link>
      
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
  );
}
