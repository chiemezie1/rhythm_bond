'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicDatabase';
import userDataService from '@/services/userDataService';

// Define a type for our processed track data
interface RecentTrack extends Track {
  playedAt: string;
}

export default function RecentlyPlayed() {
  const { getUserRecentlyPlayed, playTrack, isLoading: musicLoading, error: musicError } = useMusic();
  const [tracks, setTracks] = useState<RecentTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get recently played tracks from the Music Context
  useEffect(() => {
    // Create an async function inside useEffect
    const loadRecentlyPlayed = async () => {
      try {
        // Get user's recently played tracks
        const recentTracks = getUserRecentlyPlayed(6);

        if (!recentTracks || recentTracks.length === 0) {
          setTracks([]);
          setIsLoading(false);
          return;
        }

        // Generate relative time strings
        const getRelativeTimeString = (timestamp: number): string => {
          const now = Date.now();
          const diff = now - timestamp;

          // Convert to minutes, hours, days
          const minutes = Math.floor(diff / (1000 * 60));
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));

          if (minutes < 1) return 'Just now';
          if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
          if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
          if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;

          // Format date for older items
          const date = new Date(timestamp);
          return date.toLocaleDateString();
        };

        // Process the tracks to add played at times (without relying on userDataService)
        const processedTracks = recentTracks.map((track, index) => {
          // Just use current time as timestamp for now
          const timestamp = Date.now() - (index * 3600000); // Each track is 1 hour older
          return {
            ...track,
            playedAt: getRelativeTimeString(timestamp)
          };
        });

        setTracks(processedTracks);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to process recent tracks:', err);
        setError('Failed to load recent tracks. Please try again later.');
        setIsLoading(false);
      }
    };

    // Call the async function
    loadRecentlyPlayed();
  }, [getUserRecentlyPlayed]);

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recently Played</h2>
        <Link href="/history" className="text-sm text-primary hover:underline">
          See All
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-8 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6 text-center">
          <p className="text-red-400 mb-3">{error}</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded-md text-sm"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors cursor-pointer">
              <div className="relative aspect-square rounded-md overflow-hidden mb-3 group">
                <Image
                  src={track.thumbnail}
                  alt={track.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
                    onClick={() => playTrack(track)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
              </div>
              <Link
                href={track.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-sm truncate block hover:text-primary"
              >
                {track.title}
              </Link>
              <span className="text-xs text-gray-400 truncate block">
                {track.artist}
              </span>
              <p className="text-xs text-gray-500 mt-1">{track.playedAt}</p>
            </div>
          ))}
        </div>
      )}

      {/* YouTube Attribution */}
      <div className="mt-4 text-right">
        <Link
          href="https://www.youtube.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-gray-400"
        >
          Powered by YouTube
        </Link>
      </div>
    </div>
  );
}
