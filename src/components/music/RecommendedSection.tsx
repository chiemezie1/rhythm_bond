'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useMusic } from '@/contexts/MusicContext';
import { Track, Genre } from '@/services/musicDatabase';
import TrackMenu from './TrackMenu';

// Define a type for our genre recommendations
interface GenreRecommendation {
  id: string;
  title: string;
  description: string;
  tracks: Track[];
  coverImage: string;
}

export default function RecommendedSection() {
  const { genres, playTrack, isLoading: musicLoading, error: musicError } = useMusic();
  const [recommendations, setRecommendations] = useState<GenreRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>(undefined);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (genres.length === 0) {
        return;
      }

      // Create recommendations from the genres
      const genreRecommendations = genres.map(genre => {
        // Get a random track from the genre to use as cover image
        const randomTrackIndex = Math.floor(Math.random() * genre.tracks.length);
        const coverTrack = genre.tracks[randomTrackIndex] || null;

        return {
          id: genre.id,
          title: genre.name,
          description: genre.description,
          tracks: genre.tracks.slice(0, 5), // Get up to 5 tracks
          coverImage: coverTrack ? coverTrack.thumbnail : '/images/logo.png'
        };
      });

      setRecommendations(genreRecommendations);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to process recommendations:', err);
      setError('Failed to load recommendations. Please try again later.');
      setIsLoading(false);
    }
  }, [genres]);

  // Handle showing the track menu
  const handleShowTrackMenu = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    e.preventDefault();

    // Calculate position for the menu - position it to the right of the button
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.right,
      y: rect.top
    });

    setSelectedTrack(track);
    setShowTrackMenu(true);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Recommended for You</h2>
        <Link href="/recommendations" className="text-sm text-primary hover:underline">
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map((recommendation) => {
            // Get the first track to feature
            const featuredTrack = recommendation.tracks[0];

            return (
              <div key={recommendation.id} className="playlist-card">
                <div className="relative">
                  {!recommendation.coverImage ? (
                    <div className="w-full aspect-square bg-dark-lightest flex items-center justify-center text-gray-500">
                      No Image Available
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={recommendation.coverImage}
                        alt={recommendation.title}
                        fill
                        className="object-cover rounded-md"
                      />

                      {/* Always visible three-dot menu at top right */}
                      {featuredTrack && (
                        <button
                          className="absolute top-2 right-2 p-1 rounded-full bg-dark-lighter hover:bg-dark-lightest z-20"
                          onClick={(e) => featuredTrack && handleShowTrackMenu(e, featuredTrack)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      )}

                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          className="bg-primary rounded-full p-3 transform hover:scale-110 transition-transform"
                          onClick={() => featuredTrack && playTrack(featuredTrack)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <h3 className="font-medium mt-2">{recommendation.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{recommendation.description}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <span>{recommendation.tracks.length} tracks</span>
                  <span className="mx-1">•</span>
                  <Link
                    href={`/genre/${recommendation.id}`}
                    className="hover:text-primary"
                  >
                    View All
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Track Menu */}
      {showTrackMenu && selectedTrack && (
        <TrackMenu
          track={selectedTrack}
          onClose={() => setShowTrackMenu(false)}
          position={menuPosition}
        />
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
