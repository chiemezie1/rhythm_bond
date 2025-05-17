'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserPlaylist } from '@/services/userDataService';

interface SharePlaylistProps {
  playlist: UserPlaylist;
  onClose: () => void;
  onShare: (message: string, visibility: 'public' | 'followers' | 'private') => void;
}

export default function SharePlaylist({ playlist, onClose, onShare }: SharePlaylistProps) {
  const { isAuthenticated, user } = useAuth();
  const [message, setMessage] = useState(`Check out my playlist "${playlist.name}"!`);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('followers');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);
  
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);
  
  // Handle share submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('You need to be logged in to share playlists.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // In a real app, this would be an API call to share the playlist
      // For now, we'll simulate it with a timeout
      setTimeout(() => {
        onShare(message, visibility);
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (error) {
      console.error('Failed to share playlist:', error);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-background-card rounded-lg w-full max-w-md animate-fade-in animate-slide-up"
      >
        <div className="p-4 border-b border-background-elevated">
          <h2 className="text-xl font-semibold">Share Playlist</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {/* Playlist Preview */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-background-elevated rounded-lg">
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
              {playlist.tracks.length > 0 ? (
                <Image
                  src={playlist.tracks[0].thumbnail}
                  alt={playlist.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-background-light flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{playlist.name}</h3>
              <p className="text-sm text-text-secondary truncate">{playlist.tracks.length} tracks</p>
              <p className="text-xs text-text-tertiary">By {user?.username || 'you'}</p>
            </div>
          </div>
          
          {/* Share Message */}
          <div className="mb-4">
            <label htmlFor="shareMessage" className="block text-sm font-medium text-text-secondary mb-1">
              Message
            </label>
            <textarea
              id="shareMessage"
              className="w-full bg-background-dark border border-background-elevated rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              maxLength={280}
            />
            <div className="text-right text-xs text-text-tertiary mt-1">
              {message.length}/280
            </div>
          </div>
          
          {/* Visibility Options */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Who can see this?
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-2 rounded-md hover:bg-background-elevated cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="public"
                  checked={visibility === 'public'}
                  onChange={() => setVisibility('public')}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="font-medium">Public</p>
                  <p className="text-xs text-text-tertiary">Anyone on RhythmBond can see this</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-md hover:bg-background-elevated cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="followers"
                  checked={visibility === 'followers'}
                  onChange={() => setVisibility('followers')}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="font-medium">Followers Only</p>
                  <p className="text-xs text-text-tertiary">Only people who follow you can see this</p>
                </div>
              </label>
              <label className="flex items-center gap-2 p-2 rounded-md hover:bg-background-elevated cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="private"
                  checked={visibility === 'private'}
                  onChange={() => setVisibility('private')}
                  className="text-primary focus:ring-primary"
                />
                <div>
                  <p className="font-medium">Private Link</p>
                  <p className="text-xs text-text-tertiary">Only people with the link can see this</p>
                </div>
              </label>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-text-secondary hover:text-white"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  <span>Sharing...</span>
                </div>
              ) : (
                'Share'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
