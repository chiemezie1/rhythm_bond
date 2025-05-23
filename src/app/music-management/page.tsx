'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import TrackCard from '@/components/music/TrackCard';
import TrackMenuButton from '@/components/ui/TrackMenuButton';
import { Track } from '@/services/musicService';
import { useMusic } from '@/contexts/MusicContext';
import Link from 'next/link';

export default function MusicManagementPage() {
  const { playTrack } = useMusic();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);

  // Fetch tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/music');

        if (!response.ok) {
          throw new Error('Failed to fetch tracks');
        }

        const data = await response.json();

        // Flatten tracks from all genres
        let allTracks: Track[] = [];
        data.genres.forEach((genre: any) => {
          if (genre.tracks) {
            allTracks = [...allTracks, ...genre.tracks];
          }
        });

        // Remove duplicates by ID
        const uniqueTracks = Array.from(
          new Map(allTracks.map(track => [track.id, track])).values()
        );

        setTracks(uniqueTracks);
        setFilteredTracks(uniqueTracks);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching tracks:', error);
        setError('Failed to load tracks. Please try again later.');
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, []);

  // Filter tracks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTracks(tracks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tracks.filter(track =>
      track.title.toLowerCase().includes(query) ||
      track.artist.toLowerCase().includes(query) ||
      (track.genre && track.genre.toLowerCase().includes(query))
    );

    setFilteredTracks(filtered);
  }, [searchQuery, tracks]);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <div className="mb-6">
          <nav className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Home
            </Link>
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white">Music Management</span>
          </nav>
        </div>

        {/* Header with Back Button */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Music Management</h1>
              <p className="text-text-secondary">
                Organize your music collection with our sleek management interface
              </p>
            </div>
            <Link
              href="/"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{tracks.length}</p>
                  <p className="text-text-secondary text-sm">Total Tracks</p>
                </div>
              </div>
            </div>

            <div className="bg-background-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{filteredTracks.length}</p>
                  <p className="text-text-secondary text-sm">Filtered Results</p>
                </div>
              </div>
            </div>

            <div className="bg-background-card p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div>
                  <p className="text-2xl font-bold">{new Set(tracks.map(t => t.genre)).size}</p>
                  <p className="text-text-secondary text-sm">Unique Genres</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and view controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Search by title, artist, or genre..."
              className="w-full px-4 py-2 pl-10 bg-background-elevated rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-text-secondary">View:</span>
            <button
              className={`p-2 rounded-md ${view === 'grid' ? 'bg-primary text-white' : 'bg-background-elevated text-text-secondary'}`}
              onClick={() => setView('grid')}
              aria-label="Grid view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              className={`p-2 rounded-md ${view === 'list' ? 'bg-primary text-white' : 'bg-background-elevated text-text-secondary'}`}
              onClick={() => setView('list')}
              aria-label="List view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-background-elevated rounded-lg p-6 text-center">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && filteredTracks.length === 0 && (
          <div className="bg-background-elevated rounded-lg p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto mb-4 text-text-tertiary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
            <h2 className="text-xl font-semibold mb-2">No tracks found</h2>
            <p className="text-text-secondary mb-6">
              {searchQuery
                ? `No tracks match your search for "${searchQuery}"`
                : "Your music collection is empty"}
            </p>
            {searchQuery && (
              <button
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}

        {/* Grid view */}
        {!isLoading && !error && filteredTracks.length > 0 && view === 'grid' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredTracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                index={index}
                showIndex={false}
              />
            ))}
          </div>
        )}

        {/* List view */}
        {!isLoading && !error && filteredTracks.length > 0 && view === 'list' && (
          <div className="bg-background-card rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="text-left text-text-tertiary border-b border-background-elevated">
                  <th className="py-3 px-4 w-12">#</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4 hidden md:table-cell">Artist</th>
                  <th className="py-3 px-4 hidden lg:table-cell">Genre</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((track, index) => (
                  <tr
                    key={track.id}
                    className="border-b border-background-elevated hover:bg-background-elevated/50 transition-colors"
                  >
                    <td className="py-3 px-4 text-text-tertiary">{index + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={track.thumbnail || '/images/logo.png'}
                            alt={track.title}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-text-secondary truncate md:hidden">{track.artist}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-text-secondary hidden md:table-cell">{track.artist}</td>
                    <td className="py-3 px-4 text-text-tertiary hidden lg:table-cell">{track.genre || 'Unknown'}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-full hover:bg-background-elevated text-text-secondary hover:text-primary transition-colors"
                          onClick={() => playTrack(track)}
                          aria-label="Play track"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          </svg>
                        </button>
                        <TrackMenuButton
                          track={track}
                          menuPosition="left"
                          showBackground={false}
                          iconSize={18}
                          iconColor="text-text-secondary hover:text-white"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
