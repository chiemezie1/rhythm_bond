'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';
import TrackMenuButton from '@/components/ui/TrackMenuButton';

export default function TrackDetailPage() {
  const params = useParams();
  const trackId = params.id as string;
  
  const { playTrack, isFavorite, toggleFavorite, getSimilarTracks, getAllTracks } = useMusic();
  const { isAuthenticated } = useAuth();
  
  const [track, setTrack] = useState<Track | null>(null);
  const [similarTracks, setSimilarTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load track details
  useEffect(() => {
    const loadTrack = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all tracks and find the one with matching ID
        const allTracks = await getAllTracks();
        const foundTrack = allTracks.find(t => t.id === trackId || t.youtubeId === trackId);

        if (!foundTrack) {
          setError('Track not found');
          setIsLoading(false);
          return;
        }

        setTrack(foundTrack);

        // Load similar tracks
        try {
          const similar = await getSimilarTracks(foundTrack, 6);
          setSimilarTracks(similar);
        } catch (err) {
          console.error('Error loading similar tracks:', err);
          // Don't show error for similar tracks, just continue without them
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error loading track:', err);
        setError('Failed to load track details');
        setIsLoading(false);
      }
    };

    if (trackId) {
      loadTrack();
    }
  }, [trackId, getAllTracks, getSimilarTracks]);

  // Handle play/pause
  const handlePlayTrack = () => {
    if (track) {
      playTrack(track);
      setIsPlaying(true);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (track && isAuthenticated) {
      try {
        await toggleFavorite(track);
      } catch (err) {
        console.error('Error toggling favorite:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (error || !track) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Track Not Found</h1>
            <p className="text-gray-400 mb-6">{error || 'The track you are looking for does not exist.'}</p>
            <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-lg">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        {/* Track Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Track Artwork */}
            <div className="relative w-48 h-48 rounded-lg overflow-hidden flex-shrink-0 shadow-2xl">
              <Image
                src={track.thumbnail}
                alt={track.title}
                fill
                className="object-cover"
              />
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white text-opacity-80 text-sm font-medium mb-2">TRACK</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 break-words">
                {track.title}
              </h1>
              <div className="flex items-center gap-2 text-white text-opacity-90">
                <span className="text-lg font-medium">{track.artist}</span>
                {track.genre && (
                  <>
                    <span>•</span>
                    <span>{track.genre}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={handlePlayTrack}
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-full font-medium flex items-center gap-2 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Play
            </button>

            {isAuthenticated && (
              <button
                onClick={handleToggleFavorite}
                className={`p-3 rounded-full transition-colors ${
                  isFavorite(track.id)
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-white bg-opacity-20 hover:bg-opacity-30 text-white'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            )}

            <TrackMenuButton
              track={track}
              className="p-3 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white"
              iconColor="text-white"
              showBackground={false}
            />
          </div>
        </div>

        {/* Similar Tracks */}
        {similarTracks.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-6">Similar Tracks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {similarTracks.map((similarTrack) => (
                <div
                  key={similarTrack.id}
                  className="bg-dark-lighter rounded-lg p-4 hover:bg-dark-lightest transition-colors cursor-pointer group"
                  onClick={() => playTrack(similarTrack)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                      <Image
                        src={similarTrack.thumbnail}
                        alt={similarTrack.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate group-hover:text-primary transition-colors">
                        {similarTrack.title}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">{similarTrack.artist}</p>
                    </div>
                    <TrackMenuButton
                      track={similarTrack}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      iconSize={16}
                      showBackground={false}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back to Browse */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Browse
          </Link>
        </div>
      </div>
    </Layout>
  );
}
