'use client';

import { useState, useEffect, useRef } from 'react';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicService';

interface YouTubePlayerProps {
  visible?: boolean;
}

export default function YouTubePlayer({ visible = false }: YouTubePlayerProps) {
  const { currentTrack, isPlaying, pauseTrack, nextTrack } = useMusic();
  const playerContainerRef = useRef<HTMLDivElement>(null);

  // Create the YouTube embed URL with API enabled
  const getYouTubeEmbedUrl = () => {
    if (!currentTrack) return '';

    return `https://www.youtube.com/embed/${currentTrack.youtubeId}?autoplay=${isPlaying ? 1 : 0}&mute=0&controls=1&rel=0&modestbranding=1&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`;
  };

  // Function to send player state to parent components
  const notifyPlayerState = (state: number) => {
    window.postMessage({ type: 'playerStateChange', state }, window.location.origin);
  };

  // Set up communication with the YouTube iframe
  useEffect(() => {
    // Function to handle messages from the YouTube iframe
    const handleYouTubeMessage = (event: MessageEvent) => {
      // Only process messages from YouTube
      if (event.origin !== 'https://www.youtube.com') return;

      try {
        const data = JSON.parse(event.data);

        // Handle YouTube API events
        if (data.event === 'onStateChange') {
          notifyPlayerState(data.info);

          // If video ended (state = 0), call nextTrack
          if (data.info === 0) {
            nextTrack();
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    };

    window.addEventListener('message', handleYouTubeMessage);

    return () => {
      window.removeEventListener('message', handleYouTubeMessage);
    };
  }, [nextTrack]);

  // Handle resizing the player container
  useEffect(() => {
    const handleResize = () => {
      if (playerContainerRef.current) {
        const width = visible ? '320px' : '0';
        playerContainerRef.current.style.width = width;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [visible]);

  if (!currentTrack) return null;

  return (
    <div
      ref={playerContainerRef}
      className="hidden" // Hide the player completely
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {/* YouTube player iframe - hidden but still playing audio */}
      <iframe
        src={getYouTubeEmbedUrl()}
        width="1"
        height="1"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title={`${currentTrack.title} by ${currentTrack.artist}`}
      ></iframe>
    </div>
  );
}
