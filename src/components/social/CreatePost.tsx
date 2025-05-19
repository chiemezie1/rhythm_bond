'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicService';

interface CreatePostProps {
  onCreatePost: (content: string, mediaType?: string, mediaId?: string) => Promise<void>;
}

export default function CreatePost({ onCreatePost }: CreatePostProps) {
  const { isAuthenticated, user } = useAuth();
  const { currentTrack, playlists } = useMusic();
  const [postText, setPostText] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{
    type: 'track' | 'playlist';
    id: string;
    data: any;
  } | null>(null);
  
  // Handle post submission
  const handleSubmitPost = async () => {
    if (!postText.trim() || !isAuthenticated || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      await onCreatePost(
        postText,
        selectedMedia?.type,
        selectedMedia?.id
      );
      
      // Reset form
      setPostText('');
      setShowOptions(false);
      setSelectedMedia(null);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle selecting the current track
  const handleSelectCurrentTrack = () => {
    if (currentTrack) {
      setSelectedMedia({
        type: 'track',
        id: currentTrack.id,
        data: currentTrack
      });
    }
  };
  
  // Handle selecting a playlist
  const handleSelectPlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      setSelectedMedia({
        type: 'playlist',
        id: playlist.id,
        data: playlist
      });
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="bg-background-elevated rounded-lg p-4 mb-6 text-center">
        <p className="text-text-secondary mb-2">Sign in to share your thoughts</p>
        <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
          Sign In
        </button>
      </div>
    );
  }
  
  return (
    <div className="bg-background-elevated rounded-lg p-4 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="relative w-10 h-10 rounded-full overflow-hidden">
          <Image
            src={user?.image || '/images/logo.png'}
            alt={user?.name || 'Your avatar'}
            fill
            className="object-cover"
          />
        </div>
        <div
          className="flex-1 bg-background-dark rounded-full px-4 py-2 text-sm cursor-pointer"
          onClick={() => setShowOptions(true)}
        >
          {postText || <span className="text-text-secondary">What are you listening to?</span>}
        </div>
      </div>

      {showOptions && (
        <div className="bg-background-dark rounded-lg p-4 mt-2 animate-fade-in">
          <textarea
            className="w-full bg-background-elevated border border-background-dark rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            placeholder="Share what's on your mind..."
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
          />
          
          {/* Selected media preview */}
          {selectedMedia && (
            <div className="mt-3 p-3 bg-background-elevated rounded-lg relative">
              <button 
                className="absolute top-2 right-2 bg-background-dark rounded-full p-1"
                onClick={() => setSelectedMedia(null)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {selectedMedia.type === 'track' && (
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedMedia.data.thumbnail || '/images/logo.png'}
                      alt={`${selectedMedia.data.title} by ${selectedMedia.data.artist}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedMedia.data.title}</p>
                    <p className="text-sm text-text-secondary">{selectedMedia.data.artist}</p>
                  </div>
                </div>
              )}
              
              {selectedMedia.type === 'playlist' && (
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedMedia.data.coverImage || '/images/logo.png'}
                      alt={selectedMedia.data.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="font-medium">{selectedMedia.data.name}</p>
                    <p className="text-sm text-text-secondary">{selectedMedia.data.tracks?.length || 0} tracks</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <div className="flex gap-2">
              {/* Attach current track button */}
              <button 
                className={`icon-btn ${currentTrack ? 'text-text-secondary hover:text-white' : 'text-text-disabled cursor-not-allowed'}`}
                onClick={handleSelectCurrentTrack}
                disabled={!currentTrack}
                title={currentTrack ? "Share current track" : "No track playing"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </button>
              
              {/* Attach playlist dropdown */}
              <div className="relative group">
                <button 
                  className={`icon-btn ${playlists.length > 0 ? 'text-text-secondary hover:text-white' : 'text-text-disabled cursor-not-allowed'}`}
                  disabled={playlists.length === 0}
                  title={playlists.length > 0 ? "Share a playlist" : "No playlists available"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                </button>
                
                {playlists.length > 0 && (
                  <div className="absolute left-0 mt-2 w-48 bg-background-elevated rounded-md shadow-lg overflow-hidden z-10 hidden group-hover:block">
                    <div className="py-1">
                      {playlists.map(playlist => (
                        <button
                          key={playlist.id}
                          className="w-full text-left px-4 py-2 text-sm hover:bg-background-dark"
                          onClick={() => handleSelectPlaylist(playlist.id)}
                        >
                          {playlist.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                className="px-3 py-1 rounded-md text-text-secondary hover:text-white"
                onClick={() => {
                  setShowOptions(false);
                  setPostText('');
                  setSelectedMedia(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`px-3 py-1 rounded-md ${
                  postText.trim()
                    ? 'bg-primary hover:bg-primary-dark text-white'
                    : 'bg-background-dark text-text-disabled cursor-not-allowed'
                }`}
                onClick={handleSubmitPost}
                disabled={!postText.trim() || isSubmitting}
              >
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
