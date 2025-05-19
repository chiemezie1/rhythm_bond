'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useMusic } from '@/contexts/MusicContext';
import { useAuth } from '@/hooks/useAuth';
import { Track } from '@/services/musicService';
import { CustomTag } from '@/services/userDataService';
import TrackMenu from '@/components/music/TrackMenu';

export default function TagsPage() {
  const { getCustomTags, createCustomTag, getTagsForTrack, getTracksForTag, playTrack, removeTagFromTrack } = useMusic();
  const { isAuthenticated, user } = useAuth();
  const [tags, setTags] = useState<CustomTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<CustomTag | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3b82f6'); // Default blue color
  const [showTrackMenu, setShowTrackMenu] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | undefined>(undefined);

  // Load tags
  useEffect(() => {
    const loadTags = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!isAuthenticated) {
          setTags([]);
          setIsLoading(false);
          return;
        }

        const userTags = getCustomTags();
        setTags(userTags);
        
        // Select the first tag by default if available
        if (userTags.length > 0 && !selectedTag) {
          setSelectedTag(userTags[0]);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading tags:', err);
        setError('Failed to load tags. Please try again later.');
        setIsLoading(false);
      }
    };

    loadTags();
  }, [isAuthenticated, getCustomTags, selectedTag]);

  // Load tracks for selected tag
  useEffect(() => {
    const loadTracksForTag = async () => {
      if (!selectedTag) {
        setTracks([]);
        return;
      }

      try {
        const taggedTracks = getTracksForTag(selectedTag.id);
        setTracks(taggedTracks);
      } catch (err) {
        console.error('Error loading tracks for tag:', err);
        setError('Failed to load tracks for this tag.');
      }
    };

    loadTracksForTag();
  }, [selectedTag, getTracksForTag]);

  // Handle showing the track menu
  const handleShowTrackMenu = (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Calculate position for the menu
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
    
    setSelectedTrack(track);
    setShowTrackMenu(true);
  };

  // Handle creating a new tag
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !isAuthenticated) return;

    try {
      const newTag = await createCustomTag(newTagName, newTagColor);
      setTags([...tags, newTag]);
      setSelectedTag(newTag);
      setNewTagName('');
    } catch (err) {
      console.error('Error creating tag:', err);
      setError('Failed to create tag. Please try again.');
    }
  };

  // Handle removing a track from the tag
  const handleRemoveFromTag = async (track: Track, e?: React.MouseEvent) => {
    if (!selectedTag) return;
    
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    try {
      const success = await removeTagFromTrack(selectedTag.id, track.id);
      if (success) {
        // Update the local state to remove the track
        setTracks(tracks.filter(t => t.id !== track.id));
      }
    } catch (err) {
      console.error('Error removing track from tag:', err);
      setError('Failed to remove track from tag.');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-white">Your Tags</h1>
          <p className="text-white text-opacity-90 mt-2">
            Organize your music with custom tags
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
        ) : !isAuthenticated ? (
          <div className="bg-dark-lighter rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">Please log in to use tags.</p>
            <Link href="/login" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
              Log In
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Tags Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-dark-lighter rounded-xl p-4 mb-4">
                <h2 className="text-xl font-bold mb-4">Your Tags</h2>
                
                {/* Create New Tag */}
                <div className="mb-4">
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      className="flex-1 bg-dark-lightest border border-dark-lightest rounded px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="New tag name..."
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                    />
                    <input
                      type="color"
                      className="w-10 h-10 rounded cursor-pointer"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                    />
                  </div>
                  <button
                    className="w-full bg-primary hover:bg-primary-dark text-white px-3 py-2 rounded text-sm"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim()}
                  >
                    Create Tag
                  </button>
                </div>
                
                {/* Tag List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {tags.length === 0 ? (
                    <p className="text-gray-400 text-sm text-center py-4">
                      No tags yet. Create your first tag above.
                    </p>
                  ) : (
                    tags.map(tag => (
                      <button
                        key={tag.id}
                        className={`flex items-center gap-2 w-full px-3 py-2 rounded text-left ${
                          selectedTag?.id === tag.id ? 'bg-dark-lightest' : 'hover:bg-dark-lightest'
                        }`}
                        onClick={() => setSelectedTag(tag)}
                      >
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: tag.color }}
                        ></div>
                        <span className="truncate">{tag.name}</span>
                        <span className="ml-auto text-xs text-gray-400">
                          {getTracksForTag(tag.id).length}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Tracks for Selected Tag */}
            <div className="md:col-span-3">
              {selectedTag ? (
                <>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-6 h-6 rounded-full"
                      style={{ backgroundColor: selectedTag.color }}
                    ></div>
                    <h2 className="text-2xl font-bold">{selectedTag.name}</h2>
                  </div>
                  
                  {tracks.length === 0 ? (
                    <div className="bg-dark-lighter rounded-xl p-8 text-center">
                      <p className="text-gray-400 mb-4">No tracks with this tag yet.</p>
                      <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
                        Browse Music
                      </Link>
                    </div>
                  ) : (
                    <div className="bg-dark-lighter rounded-xl overflow-hidden">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-dark-lightest text-left text-gray-400">
                            <th className="py-4 px-6 w-16">#</th>
                            <th className="py-4 px-6">Title</th>
                            <th className="py-4 px-6 hidden md:table-cell">Artist</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tracks.map((track, index) => (
                            <tr
                              key={track.id}
                              className="border-b border-dark-lightest hover:bg-dark-lightest transition-colors cursor-pointer"
                              onClick={() => playTrack(track)}
                            >
                              <td className="py-4 px-6 text-gray-400">{index + 1}</td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="relative h-10 w-10 rounded overflow-hidden flex-shrink-0">
                                    <Image
                                      src={track.thumbnail}
                                      alt={track.title}
                                      fill
                                      className="object-cover"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-white hover:underline truncate">
                                      {track.title}
                                    </div>
                                    <div className="text-sm text-gray-400 truncate md:hidden">
                                      {track.artist}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-gray-400 hidden md:table-cell">{track.artist}</td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    className="text-red-500 hover:text-red-400"
                                    onClick={(e) => handleRemoveFromTag(track, e)}
                                    title="Remove from tag"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                  <button
                                    className="text-gray-400 hover:text-white"
                                    onClick={(e) => handleShowTrackMenu(e, track)}
                                    title="More options"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-dark-lighter rounded-xl p-8 text-center">
                  <p className="text-gray-400 mb-4">Select a tag or create a new one to view tracks.</p>
                </div>
              )}
            </div>
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
      </div>
    </Layout>
  );
}
