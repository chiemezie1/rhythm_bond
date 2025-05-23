'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';

interface Playlist {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  shareCount: number;
  trackCount: number;
  totalShares: number;
  tags: string[];
  createdAt: string;
  creator: {
    id: string;
    name: string;
    username: string;
    image?: string;
  };
  previewTracks: Array<{
    id: string;
    title: string;
    artist: string;
    thumbnail: string;
  }>;
}

export default function DiscoverPlaylistsPage() {
  const { isAuthenticated } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([]);
  const [sortBy, setSortBy] = useState('shareCount');
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Load playlists
  const loadPlaylists = async (reset = false) => {
    if (!isAuthenticated) return;

    try {
      setIsLoading(true);
      const currentOffset = reset ? 0 : offset;
      
      const params = new URLSearchParams({
        search: searchQuery,
        tags: selectedTags.join(','),
        sortBy,
        limit: '20',
        offset: currentOffset.toString()
      });

      const response = await fetch(`/api/playlist/discover?${params}`);
      if (response.ok) {
        const data = await response.json();
        
        if (reset) {
          setPlaylists(data.playlists);
          setOffset(20);
        } else {
          setPlaylists(prev => [...prev, ...data.playlists]);
          setOffset(prev => prev + 20);
        }
        
        setHasMore(data.pagination.hasMore);
      }
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load popular tags
  const loadPopularTags = async () => {
    try {
      const response = await fetch('/api/playlist/discover', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setPopularTags(data.popularTags);
      }
    } catch (error) {
      console.error('Error loading popular tags:', error);
    }
  };

  // Copy playlist to user's library
  const copyPlaylist = async (playlistId: string) => {
    try {
      const response = await fetch(`/api/playlist/${playlistId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shareType: 'copy'
        })
      });

      if (response.ok) {
        const data = await response.json();
        alert('Playlist copied to your library!');
        // Update the playlist's share count
        setPlaylists(prev => prev.map(p => 
          p.id === playlistId 
            ? { ...p, shareCount: p.shareCount + 1 }
            : p
        ));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to copy playlist');
      }
    } catch (error) {
      console.error('Error copying playlist:', error);
      alert('Failed to copy playlist');
    }
  };

  // Toggle tag filter
  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Effects
  useEffect(() => {
    if (isAuthenticated) {
      loadPopularTags();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      loadPlaylists(true);
    }
  }, [isAuthenticated, searchQuery, selectedTags, sortBy]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to discover playlists</h1>
          <Link href="/auth/signin" className="bg-primary text-white px-6 py-2 rounded-lg">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Discover Playlists</h1>
          <p className="text-gray-400">Find and copy amazing playlists from other users</p>
        </div>

        {/* Filters */}
        <div className="bg-dark-lighter rounded-xl p-6 mb-8">
          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search playlists, creators, or descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-dark-lightest border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Sort */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Sort by</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-dark-lightest border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-primary"
            >
              <option value="shareCount">Most Shared</option>
              <option value="createdAt">Newest</option>
              <option value="name">Name</option>
            </select>
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Filter by tags</label>
              <div className="flex flex-wrap gap-2">
                {popularTags.slice(0, 10).map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-white'
                        : 'bg-dark-lightest text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {tag} ({count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Playlists Grid */}
        {isLoading && playlists.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {playlists.map((playlist) => (
                <div key={playlist.id} className="bg-dark-lighter rounded-xl overflow-hidden">
                  {/* Playlist Header */}
                  <div className="h-32 bg-gradient-to-br from-primary to-primary-dark p-4 flex items-end">
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg">{playlist.name}</h3>
                      <p className="text-white text-sm opacity-90">{playlist.trackCount} tracks</p>
                    </div>
                    {playlist.coverImage && (
                      <div className="w-16 h-16 rounded-lg overflow-hidden">
                        <Image
                          src={playlist.coverImage}
                          alt={playlist.name}
                          width={64}
                          height={64}
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>

                  {/* Playlist Content */}
                  <div className="p-4">
                    {/* Description */}
                    {playlist.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">{playlist.description}</p>
                    )}

                    {/* Creator */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {(playlist.creator.name || playlist.creator.username)?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-gray-400 text-sm">
                        by {playlist.creator.name || playlist.creator.username}
                      </span>
                    </div>

                    {/* Preview Tracks */}
                    {playlist.previewTracks.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Preview tracks:</p>
                        <div className="space-y-1">
                          {playlist.previewTracks.map((track) => (
                            <div key={track.id} className="text-xs text-gray-400 truncate">
                              {track.title} - {track.artist}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {playlist.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {playlist.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-dark-lightest text-gray-400 text-xs rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        {playlist.shareCount} shares
                      </div>
                      <button
                        onClick={() => copyPlaylist(playlist.id)}
                        className="bg-primary text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
                      >
                        Copy Playlist
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <button
                  onClick={() => loadPlaylists(false)}
                  disabled={isLoading}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Loading...' : 'Load More'}
                </button>
              </div>
            )}

            {/* No Results */}
            {playlists.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No playlists found</p>
                <p className="text-gray-500 text-sm mt-2">Try adjusting your search or filters</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
