'use client';

import Layout from "@/components/layout/Layout";
import TrackCard from "@/components/music/TrackCard";
import { Track } from "@/services/musicService";
import { useEffect, useState } from "react";

// Genre data with colors
const genres = {
  'afrobeats': { name: 'Afrobeats & Global Pop', color: 'from-green-500 to-emerald-500' },
  'pop': { name: 'Pop', color: 'from-pink-500 to-purple-500' },
  'hiphop': { name: 'Hip-Hop & Trap', color: 'from-blue-500 to-indigo-500' },
  'rnb': { name: 'R&B', color: 'from-purple-500 to-violet-500' },
  'blues': { name: 'Blues', color: 'from-amber-500 to-yellow-500' },
};

export default function GenrePage({ params }: { params: { id: string } }) {
  // Store the genre ID in a state variable to avoid the async params warning
  const [genreId, setGenreId] = useState<string>('');
  const [genreInfo, setGenreInfo] = useState({ name: 'Loading...', color: 'from-gray-500 to-gray-700' });
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Set the genre ID from params when the component mounts
  useEffect(() => {
    if (params && params.id) {
      setGenreId(params.id);
      // Set genre info based on the ID
      setGenreInfo(genres[params.id as keyof typeof genres] || { name: 'Unknown Genre', color: 'from-gray-500 to-gray-700' });
    }
  }, [params]);

  // Fetch tracks for this genre
  useEffect(() => {
    // Only fetch if we have a genre ID
    if (!genreId) return;

    const fetchGenreTracks = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(`/api/music?genre=${genreId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch tracks: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.genre && data.genre.tracks) {
          setTracks(data.genre.tracks);
        } else {
          setTracks([]);
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching genre tracks:', err);
        setError('Failed to load tracks. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchGenreTracks();
  }, [genreId]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className={`bg-gradient-to-r ${genreInfo.color} rounded-xl p-8 mb-8`}>
          <h1 className="text-4xl font-bold text-white">{genreInfo.name}</h1>
          <p className="text-white text-opacity-90 mt-2">
            Explore the best {genreInfo.name} tracks and artists
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : tracks.length === 0 ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">No tracks found for this genre.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
