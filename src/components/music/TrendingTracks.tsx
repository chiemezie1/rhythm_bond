'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicService';
import TrackMenuButton from '@/components/ui/TrackMenuButton';

// Define a type for our processed track data
interface TrackWithLikes extends Track {
  isLiked: boolean;
}

export default function TrendingTracks() {
  const { getTrendingTracks, playTrack, isLoading, error } = useMusic();
  const [tracks, setTracks] = useState<TrackWithLikes[]>([]);
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null);

  // Fetch trending tracks from our music database
  useEffect(() => {
    const fetchTrendingTracks = async () => {
      try {
        // Get trending tracks from the music context
        const trendingTracks = await getTrendingTracks(10);

        if (Array.isArray(trendingTracks)) {
          // Add isLiked property to each track
          const tracksWithLikes = trendingTracks.map(track => ({
            ...track,
            isLiked: false
          }));

          setTracks(tracksWithLikes);
        } else {
          console.error('Trending tracks is not an array:', trendingTracks);
          setTracks([]);
        }
      } catch (error) {
        console.error('Error fetching trending tracks:', error);
        setTracks([]);
      }
    };

    fetchTrendingTracks();
  }, [getTrendingTracks]);

  // No need for click outside handler with the new TrackMenuButton

  // Toggle like status
  const toggleLike = (id: string) => {
    setTracks(tracks.map(track =>
      track.id === id ? { ...track, isLiked: !track.isLiked } : track
    ));
  };

  // Play a track
  const handlePlayTrack = (id: string) => {
    const track = tracks.find(t => t.id === id);
    if (!track) return;

    // Call the playTrack function from the music context
    playTrack(track);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Trending Tracks</h2>
        <Link href="/trending" className="text-sm text-primary hover:underline">
          See All
        </Link>
      </div>

      {isLoading ? (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-12 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-8 text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="border-b border-dark-lightest">
              <tr className="text-left text-gray-400 text-sm">
                <th className="py-3 px-4 font-medium w-8">#</th>
                <th className="py-3 px-4 font-medium">Title</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">Artist</th>
                <th className="py-3 px-4 font-medium text-right hidden sm:table-cell">Listeners</th>
                <th className="py-3 px-4 font-medium text-right">Duration</th>
                <th className="py-3 px-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody>
              {tracks.map((track, index) => (
                <tr
                  key={track.id}
                  className={`border-b border-dark-lightest hover:bg-dark-lightest transition-colors ${
                    hoveredTrack === track.id ? 'bg-dark-lightest' : ''
                  }`}
                  onMouseEnter={() => setHoveredTrack(track.id)}
                  onMouseLeave={() => setHoveredTrack(null)}
                >
                  <td className="py-3 px-4 text-gray-400">
                    {hoveredTrack === track.id ? (
                      <button
                        className="text-white"
                        onClick={() => handlePlayTrack(track.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        </svg>
                      </button>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={track.thumbnail}
                          alt={track.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <Link
                          href={track.youtubeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-white hover:underline"
                        >
                          {track.title}
                        </Link>
                        <p className="text-sm text-gray-400">{track.artist}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400 hidden md:table-cell">
                    <span className="hover:underline">
                      {track.artist}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-right hidden sm:table-cell">
                    <span>
                      {Math.floor(Math.random() * 100) + 1}K
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {hoveredTrack === track.id && (
                        <button
                          className={`${track.isLiked ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                          onClick={() => toggleLike(track.id)}
                        >
                          {track.isLiked ? (
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
                      <span>3:45</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 relative">
                    {/* 3-Dot Menu Button */}
                    <TrackMenuButton
                      track={track}
                      menuPosition="left"
                      showBackground={false}
                      iconSize={18}
                      className="text-gray-400 hover:text-white"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
