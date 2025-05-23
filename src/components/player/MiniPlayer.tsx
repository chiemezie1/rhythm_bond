'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Track } from '@/services/musicService';
import { useMusic } from '@/contexts/MusicContext';

interface MiniPlayerProps {
  track: Track;
  isPlaying: boolean;
  togglePlay: () => void;
}

export default function MiniPlayer({
  track,
  isPlaying = false,
  togglePlay
}: MiniPlayerProps) {
  const { nextTrack, previousTrack } = useMusic();
  const [volume, setVolume] = useState(80);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState("0:00");
  const [duration, setDuration] = useState("0:00");
  const [isLiked, setIsLiked] = useState(false);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const [playerState, setPlayerState] = useState<number | null>(null);

  const trackMenuRef = useRef<HTMLDivElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedTimeRef = useRef<number>(0);



  // Format time in seconds to MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Close track menu when clicking outside
  const handleClickOutside = (event: MouseEvent) => {
    if (trackMenuRef.current && !trackMenuRef.current.contains(event.target as Node)) {
      setShowTrackMenu(false);
    }
  };

  // Add event listener for outside clicks
  useEffect(() => {
    if (showTrackMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTrackMenu]);

  // Set up a timer to update the progress bar when playing
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }

    // Reset progress when track changes
    setProgress(0);
    setCurrentTime("0:00");
    setDuration("3:30"); // Default duration
    elapsedTimeRef.current = 0;

    // If playing, start the progress timer
    if (isPlaying) {
      startTimeRef.current = Date.now() - elapsedTimeRef.current * 1000;

      progressIntervalRef.current = setInterval(() => {
        // Calculate elapsed time in seconds
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000;
        elapsedTimeRef.current = elapsed;

        // Update current time display
        setCurrentTime(formatTime(elapsed));

        // Calculate progress percentage (assuming 3:30 = 210 seconds duration)
        const totalDuration = 210; // 3:30 in seconds
        const progressPercent = Math.min((elapsed / totalDuration) * 100, 100);
        setProgress(progressPercent);

        // If we've reached the end, stop the timer
        if (progressPercent >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
        }
      }, 1000);
    }

    // Clean up interval on unmount
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, track.id]);

  // Listen for YouTube player state changes from window
  useEffect(() => {
    const handleYouTubeStateChange = (event: any) => {
      if (event.data && typeof event.data === 'object' && event.data.type === 'playerStateChange') {
        setPlayerState(event.data.state);
      }
    };

    window.addEventListener('message', handleYouTubeStateChange);

    return () => {
      window.removeEventListener('message', handleYouTubeStateChange);
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-player bg-dark-lighter/95 backdrop-blur-sm dark:bg-dark-lighter/95 z-40 border-t border-dark-lightest flex items-center px-4">
      {/* Track Info */}
      <div className="flex items-center gap-3 w-1/4 min-w-[200px]">
        <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
          <Image
            src={track.thumbnail}
            alt={`${track.title} by ${track.artist}`}
            fill
            className="object-cover"
          />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-medium text-sm truncate">{track.title}</span>
          <span className="text-xs text-gray-400 truncate">{track.artist}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            className={`icon-btn ${isLiked ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
            onClick={() => setIsLiked(!isLiked)}
          >
            {isLiked ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>

          {/* 3-Dot Menu */}
          <div className="relative">
            <button
              className="icon-btn text-gray-400 hover:text-white"
              onClick={() => setShowTrackMenu(!showTrackMenu)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>

            {/* Track Options Menu */}
            {showTrackMenu && (
              <div
                ref={trackMenuRef}
                className="absolute bottom-10 left-0 w-56 bg-dark-lighter dark:bg-dark-lighter rounded-lg shadow-lg py-1 z-50 border border-dark-lightest"
              >
                <button className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add to playlist
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Add to queue
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Go to artist
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Go to album
                </button>
                <button className="flex items-center gap-3 w-full text-left px-4 py-2 hover:bg-dark-lightest">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="player-controls">
          <button
            className="icon-btn text-gray-400 hover:text-white"
            onClick={previousTrack}
            title="Previous Track"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </button>
          <button
            className="icon-btn bg-white dark:bg-white rounded-full p-2 hover:scale-105 transition-transform"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </button>
          <button
            className="icon-btn text-gray-400 hover:text-white"
            onClick={nextTrack}
            title="Next Track"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xl flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400">{currentTime}</span>
          <div
            className="flex-1 h-1 bg-dark-lightest rounded-full overflow-hidden group cursor-pointer"
            onClick={(e) => {
              // Calculate click position as percentage of width
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = (clickX / rect.width) * 100;

              // Update progress
              setProgress(percentage);

              // Calculate new time based on percentage (assuming 210 seconds total)
              const newTimeSeconds = (percentage / 100) * 210;
              setCurrentTime(formatTime(newTimeSeconds));

              // Update elapsed time reference
              elapsedTimeRef.current = newTimeSeconds;

              // Reset start time reference
              startTimeRef.current = Date.now() - newTimeSeconds * 1000;
            }}
          >
            <div
              className="h-full bg-primary group-hover:bg-primary-light"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="text-xs text-gray-400">{duration}</span>
        </div>
      </div>

      {/* Volume & Additional Controls */}
      <div className="w-1/4 min-w-[200px] flex items-center justify-end gap-3">


        {/* Queue Button */}
        <button className="icon-btn text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </button>
        <div className="flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.465a5 5 0 001.06-7.072M4.343 5.464a9 9 0 000 13.072" />
          </svg>
          <div className="w-20 h-1 bg-dark-lightest rounded-full overflow-hidden group cursor-pointer">
            <div
              className="h-full bg-gray-400 group-hover:bg-primary"
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>
        <button className="icon-btn text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
