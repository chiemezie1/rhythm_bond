'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/contexts/MusicContext';
import { Track } from '@/services/musicService';

interface User {
  id: string;
  name: string;
  username?: string;
  image?: string;
}

interface Comment {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: User;
  likes: { userId: string }[];
}

export interface Post {
  id: string;
  content: string;
  userId: string;
  createdAt: string;
  user: User;
  likes: { userId: string }[];
  comments: Comment[];
  mediaType?: 'track' | 'playlist' | null;
  mediaId?: string;
  mediaData?: any;
}

interface SocialPostProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string, comment: string) => void;
  onShare: (postId: string) => void;
}

export default function SocialPost({ post, onLike, onComment, onShare }: SocialPostProps) {
  const { isAuthenticated, user } = useAuth();
  const { playTrack } = useMusic();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  // Check if the current user has liked this post
  const isLiked = post.likes.some(like => like.userId === user?.id);
  
  // Format date
  const formattedDate = new Date(post.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Handle submitting a comment
  const handleSubmitComment = () => {
    if (!commentText.trim()) return;
    
    onComment(post.id, commentText);
    setCommentText('');
  };
  
  // Handle playing a track
  const handlePlayTrack = (track: Track) => {
    playTrack(track);
  };
  
  return (
    <div className="bg-background-elevated rounded-lg p-4 shadow-md">
      {/* User info and timestamp */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link href={`/user/${post.user.username || post.user.id}`} className="relative w-10 h-10 rounded-full overflow-hidden">
            <Image
              src={post.user.image || '/images/logo.png'}
              alt={post.user.name || 'User'}
              fill
              className="object-cover"
            />
          </Link>
          <div>
            <Link href={`/user/${post.user.username || post.user.id}`} className="font-medium hover:underline">
              {post.user.name || 'User'}
            </Link>
            <p className="text-xs text-text-tertiary">@{post.user.username || post.user.id}</p>
          </div>
        </div>
        <span className="text-xs text-text-tertiary">{formattedDate}</span>
      </div>
      
      {/* Post content */}
      <div className="mb-4">
        <p className="mb-2">{post.content}</p>
        
        {/* Render media based on type */}
        {post.mediaType === 'track' && post.mediaData && (
          <div className="flex items-center gap-3 bg-background-dark rounded-lg p-3">
            <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
              <Image
                src={post.mediaData.thumbnail || '/images/logo.png'}
                alt={`${post.mediaData.title} by ${post.mediaData.artist}`}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{post.mediaData.title}</p>
              <p className="text-sm text-text-secondary truncate">{post.mediaData.artist}</p>
            </div>
            <button
              className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
              onClick={() => handlePlayTrack(post.mediaData)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              </svg>
            </button>
          </div>
        )}
        
        {post.mediaType === 'playlist' && post.mediaData && (
          <Link href={`/playlist/${post.mediaId}`} className="block">
            <div className="relative w-full h-32 rounded-lg overflow-hidden">
              <Image
                src={post.mediaData.coverImage || '/images/logo.png'}
                alt={post.mediaData.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background-dark/70 to-transparent flex items-end p-3">
                <div>
                  <p className="text-white font-medium">{post.mediaData.name}</p>
                  <p className="text-white text-opacity-80 text-sm">{post.mediaData.tracks?.length || 0} tracks</p>
                </div>
              </div>
            </div>
          </Link>
        )}
      </div>
      
      {/* Interaction buttons */}
      <div className="flex items-center gap-4">
        <button
          className={`flex items-center gap-1 ${
            isLiked ? 'text-primary' : 'text-text-secondary hover:text-primary'
          } transition-colors`}
          onClick={() => onLike(post.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{post.likes.length}</span>
        </button>
        <button
          className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
          onClick={() => setShowComments(!showComments)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span>{post.comments.length}</span>
        </button>
        <button
          className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors ml-auto"
          onClick={() => onShare(post.id)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </button>
      </div>
      
      {/* Comments section */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-background-dark">
          {/* Comment input */}
          {isAuthenticated && (
            <div className="flex gap-2 mb-4">
              <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={user?.image || '/images/logo.png'}
                  alt={user?.name || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 flex">
                <input
                  type="text"
                  className="flex-1 bg-background-dark rounded-l-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment()}
                />
                <button
                  className="bg-primary text-white rounded-r-lg px-3 py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!commentText.trim()}
                  onClick={handleSubmitComment}
                >
                  Post
                </button>
              </div>
            </div>
          )}
          
          {/* Comments list */}
          <div className="space-y-3">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex gap-2">
                <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={comment.user.image || '/images/logo.png'}
                    alt={comment.user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 bg-background-dark rounded-lg p-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{comment.user.name || 'User'}</span>
                    <span className="text-xs text-text-tertiary">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              </div>
            ))}
            
            {post.comments.length === 0 && (
              <p className="text-center text-text-tertiary text-sm">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
