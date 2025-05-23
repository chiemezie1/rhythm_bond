'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface User {
  id: string;
  name: string;
  username: string;
  image?: string;
}

interface GenreShareModalProps {
  genre: {
    id: string;
    name: string;
    description?: string;
    trackCount: number;
  };
  isOpen: boolean;
  onClose: () => void;
  onShare: (shareData: any) => void;
}

export default function GenreShareModal({ genre, isOpen, onClose, onShare }: GenreShareModalProps) {
  const { user } = useAuth();
  const [shareType, setShareType] = useState<'copy' | 'reference'>('copy');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Search for users to share with
  useEffect(() => {
    const searchUsers = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(`/api/user/search?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          // Filter out current user
          const filteredUsers = data.users.filter((u: User) => u.id !== user?.id);
          setSearchResults(filteredUsers);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, user?.id]);

  const handleShare = async () => {
    if (!selectedUser) return;

    setIsSharing(true);
    try {
      const shareData = {
        shareToUserId: selectedUser.id,
        shareType,
        message: message.trim() || undefined
      };

      await onShare(shareData);
      onClose();
    } catch (error) {
      console.error('Error sharing genre:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCreatePost = async () => {
    setIsSharing(true);
    try {
      // Create a post sharing this genre
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message.trim() || `Check out my "${genre.name}" genre with ${genre.trackCount} tracks!`,
          mediaType: 'genre',
          mediaId: genre.id,
          visibility: 'public'
        })
      });

      if (response.ok) {
        onClose();
        // Could trigger a refresh of the feed here
      }
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSharing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-lighter rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Share Genre</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Genre Info */}
          <div className="bg-dark-lightest rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-lg">{genre.name}</h3>
            {genre.description && (
              <p className="text-gray-400 text-sm mt-1">{genre.description}</p>
            )}
            <p className="text-primary text-sm mt-2">{genre.trackCount} tracks</p>
          </div>

          {/* Share Options */}
          <div className="space-y-4">
            {/* Share to User */}
            <div>
              <h4 className="font-medium mb-3">Share with a user</h4>
              
              {/* Share Type Selection */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setShareType('copy')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    shareType === 'copy'
                      ? 'bg-primary text-white'
                      : 'bg-dark-lightest text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Copy Genre
                </button>
                <button
                  onClick={() => setShareType('reference')}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    shareType === 'reference'
                      ? 'bg-primary text-white'
                      : 'bg-dark-lightest text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Share Link
                </button>
              </div>

              <p className="text-xs text-gray-400 mb-3">
                {shareType === 'copy' 
                  ? 'Creates a copy of this genre in their library'
                  : 'Shares a reference to your genre'
                }
              </p>

              {/* User Search */}
              <div className="relative mb-3">
                <input
                  type="text"
                  placeholder="Search for users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-dark-lightest border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                {isSearching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                  </div>
                )}
              </div>

              {/* Search Results */}
              {searchResults.length > 0 && (
                <div className="max-h-32 overflow-y-auto border border-gray-600 rounded-lg">
                  {searchResults.map((searchUser) => (
                    <button
                      key={searchUser.id}
                      onClick={() => {
                        setSelectedUser(searchUser);
                        setSearchQuery(searchUser.name || searchUser.username);
                        setSearchResults([]);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-dark-lightest transition-colors text-left"
                    >
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {(searchUser.name || searchUser.username)?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm">{searchUser.name || searchUser.username}</p>
                        {searchUser.username && searchUser.name && (
                          <p className="text-gray-400 text-xs">@{searchUser.username}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Selected User */}
              {selectedUser && (
                <div className="bg-dark-lightest rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {(selectedUser.name || selectedUser.username)?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{selectedUser.name || selectedUser.username}</p>
                      {selectedUser.username && selectedUser.name && (
                        <p className="text-gray-400 text-xs">@{selectedUser.username}</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery('');
                      }}
                      className="text-gray-400 hover:text-white"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Message */}
              <textarea
                placeholder="Add a message (optional)..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-dark-lightest border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                rows={3}
              />

              {/* Share Button */}
              <button
                onClick={handleShare}
                disabled={!selectedUser || isSharing}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed mt-3"
              >
                {isSharing ? 'Sharing...' : `${shareType === 'copy' ? 'Copy' : 'Share'} Genre`}
              </button>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-600 my-4"></div>

            {/* Share as Post */}
            <div>
              <h4 className="font-medium mb-3">Share as post</h4>
              <textarea
                placeholder={`Check out my "${genre.name}" genre with ${genre.trackCount} tracks!`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-dark-lightest border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none mb-3"
                rows={3}
              />
              <button
                onClick={handleCreatePost}
                disabled={isSharing}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSharing ? 'Posting...' : 'Share as Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
