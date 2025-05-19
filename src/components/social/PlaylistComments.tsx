'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

// Define types for comments
interface Comment {
  id: string;
  userId: string;
  username: string;
  displayName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface PlaylistCommentsProps {
  playlistId: string;
  playlistName: string;
}

export default function PlaylistComments({ playlistId, playlistName }: PlaylistCommentsProps) {
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const replyInputRef = useRef<HTMLInputElement>(null);
  
  // Fetch comments for the playlist
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, this would be an API call to get the comments
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          // Generate mock comments
          const mockComments: Comment[] = [];
          
          // Generate different comments
          for (let i = 0; i < 5; i++) {
            const commentId = `comment-${Date.now()}-${i}`;
            const randomUserId = `user-${Math.floor(Math.random() * 100)}`;
            const randomUsername = `user_${randomUserId}`;
            
            // Create base comment
            const comment: Comment = {
              id: commentId,
              userId: randomUserId,
              username: randomUsername,
              displayName: `User ${randomUserId}`,
              userAvatar: '/images/logo.png',
              content: getRandomCommentContent(),
              timestamp: getRandomTimestamp(),
              likes: Math.floor(Math.random() * 20),
              isLiked: Math.random() > 0.7
            };
            
            // Add random replies
            if (Math.random() > 0.5) {
              const replyCount = Math.floor(Math.random() * 3);
              comment.replies = [];
              
              for (let j = 0; j < replyCount; j++) {
                const replyId = `reply-${Date.now()}-${j}`;
                const randomReplyUserId = `user-${Math.floor(Math.random() * 100)}`;
                
                comment.replies.push({
                  id: replyId,
                  userId: randomReplyUserId,
                  username: `user_${randomReplyUserId}`,
                  displayName: `User ${randomReplyUserId}`,
                  userAvatar: '/images/logo.png',
                  content: getRandomReplyContent(),
                  timestamp: getRandomTimestamp(),
                  likes: Math.floor(Math.random() * 10),
                  isLiked: Math.random() > 0.7
                });
              }
            }
            
            mockComments.push(comment);
          }
          
          setComments(mockComments);
          setIsLoading(false);
        }, 1000);
      } catch (err) {
        console.error('Failed to load comments:', err);
        setError('Failed to load comments. Please try again later.');
        setIsLoading(false);
      }
    };
    
    fetchComments();
  }, [playlistId]);
  
  // Helper functions for generating mock data
  function getRandomTimestamp(): string {
    const times = [
      'Just now',
      '2 minutes ago',
      '15 minutes ago',
      '1 hour ago',
      '3 hours ago',
      'Yesterday',
      '2 days ago'
    ];
    return times[Math.floor(Math.random() * times.length)];
  }
  
  function getRandomCommentContent(): string {
    const comments = [
      'Love this playlist! Perfect for my workout sessions.',
      'Great selection of tracks! I especially love the third one.',
      'This playlist has been on repeat for me all week.',
      'Thanks for sharing this amazing collection!',
      'I discovered so many new artists through this playlist.',
      'The transitions between songs are so smooth. Great curation!',
      'This playlist perfectly captures the vibe I was looking for.',
      'Added this to my library. Thanks for sharing!',
      'The mix of genres in this playlist is really interesting.',
      'This playlist got me through a long study session. Thank you!'
    ];
    return comments[Math.floor(Math.random() * comments.length)];
  }
  
  function getRandomReplyContent(): string {
    const replies = [
      'Totally agree!',
      'I feel the same way about it.',
      'Thanks for the feedback!',
      'Glad you enjoyed it!',
      "I'll add more tracks like that soon.",
      'Which track is your favorite?',
      'Have you checked out my other playlists?',
      'Thanks for listening!',
      'I appreciate your comment!',
      'Feel free to share it with others!'
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  }
  
  // Handle adding a new comment
  const handleAddComment = () => {
    if (!newComment.trim() || !isAuthenticated) return;
    
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || 'current-user',
      username: user?.username || 'current_user',
      displayName: user?.displayName || 'Current User',
      userAvatar: '/images/logo.png',
      content: newComment,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };
    
    setComments(prev => [newCommentObj, ...prev]);
    setNewComment('');
  };
  
  // Handle adding a reply to a comment
  const handleAddReply = (commentId: string) => {
    if (!replyContent.trim() || !isAuthenticated || !replyingTo) return;
    
    const newReplyObj: Comment = {
      id: `reply-${Date.now()}`,
      userId: user?.id || 'current-user',
      username: user?.username || 'current_user',
      displayName: user?.displayName || 'Current User',
      userAvatar: '/images/logo.png',
      content: replyContent,
      timestamp: 'Just now',
      likes: 0,
      isLiked: false
    };
    
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newReplyObj]
          };
        }
        return comment;
      })
    );
    
    setReplyContent('');
    setReplyingTo(null);
  };
  
  // Handle liking a comment
  const handleLikeComment = (commentId: string, isReply: boolean = false, parentId?: string) => {
    if (!isAuthenticated) return;
    
    if (!isReply) {
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === commentId) {
            const newIsLiked = !comment.isLiked;
            return {
              ...comment,
              isLiked: newIsLiked,
              likes: newIsLiked ? comment.likes + 1 : comment.likes - 1
            };
          }
          return comment;
        })
      );
    } else if (parentId) {
      setComments(prev => 
        prev.map(comment => {
          if (comment.id === parentId && comment.replies) {
            const updatedReplies = comment.replies.map(reply => {
              if (reply.id === commentId) {
                const newIsLiked = !reply.isLiked;
                return {
                  ...reply,
                  isLiked: newIsLiked,
                  likes: newIsLiked ? reply.likes + 1 : reply.likes - 1
                };
              }
              return reply;
            });
            
            return {
              ...comment,
              replies: updatedReplies
            };
          }
          return comment;
        })
      );
    }
  };
  
  // Focus on reply input when replying
  useEffect(() => {
    if (replyingTo && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [replyingTo]);
  
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-background-card rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-background-elevated"></div>
              <div className="flex-1">
                <div className="h-4 bg-background-elevated rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-background-elevated rounded w-1/6"></div>
              </div>
            </div>
            <div className="h-4 bg-background-elevated rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-background-elevated rounded w-1/2 mb-2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-background-card rounded-lg p-6 text-center">
        <p className="text-error mb-4">{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Comments</h2>
      
      {/* Add Comment Form */}
      {isAuthenticated ? (
        <div className="bg-background-card rounded-lg p-4 mb-6">
          <div className="flex gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="Your avatar"
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <textarea
                ref={commentInputRef}
                className="w-full bg-background-dark border border-background-elevated rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder={`Add a comment about "${playlistName}"...`}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  className="bg-primary hover:bg-primary-light text-white px-4 py-2 rounded-md font-medium disabled:opacity-50"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-background-card rounded-lg p-4 mb-6 text-center">
          <p className="text-text-secondary mb-2">Sign in to add a comment</p>
          <button className="btn btn-primary">Sign In</button>
        </div>
      )}
      
      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="bg-background-card rounded-lg p-6 text-center">
          <p className="text-text-secondary">No comments yet</p>
          <p className="text-text-tertiary text-sm mt-1">Be the first to comment on this playlist</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <div key={comment.id} className="bg-background-card rounded-lg p-4">
              {/* Comment Header */}
              <div className="flex items-start gap-3 mb-3">
                <Link href={`/user/${comment.userId}`} className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={comment.userAvatar}
                    alt={comment.displayName}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Link href={`/user/${comment.userId}`} className="font-medium hover:underline">
                      {comment.displayName}
                    </Link>
                    <span className="text-xs text-text-tertiary">@{comment.username}</span>
                    <span className="text-xs text-text-tertiary">•</span>
                    <span className="text-xs text-text-tertiary">{comment.timestamp}</span>
                  </div>
                  <p className="mt-1">{comment.content}</p>
                  
                  {/* Comment Actions */}
                  <div className="flex items-center gap-4 mt-2">
                    <button 
                      className={`flex items-center gap-1 text-sm ${comment.isLiked ? 'text-primary' : 'text-text-secondary'} hover:text-primary transition-colors`}
                      onClick={() => handleLikeComment(comment.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span>{comment.likes}</span>
                    </button>
                    {isAuthenticated && (
                      <button 
                        className="flex items-center gap-1 text-sm text-text-secondary hover:text-primary transition-colors"
                        onClick={() => setReplyingTo(comment.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                        </svg>
                        <span>Reply</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className="ml-12 mt-3 space-y-3">
                  {comment.replies.map(reply => (
                    <div key={reply.id} className="bg-background-elevated rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <Link href={`/user/${reply.userId}`} className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                          <Image
                            src={reply.userAvatar}
                            alt={reply.displayName}
                            fill
                            className="object-cover"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <Link href={`/user/${reply.userId}`} className="font-medium text-sm hover:underline">
                              {reply.displayName}
                            </Link>
                            <span className="text-xs text-text-tertiary">@{reply.username}</span>
                            <span className="text-xs text-text-tertiary">•</span>
                            <span className="text-xs text-text-tertiary">{reply.timestamp}</span>
                          </div>
                          <p className="text-sm mt-1">{reply.content}</p>
                          
                          {/* Reply Actions */}
                          <div className="flex items-center gap-4 mt-1">
                            <button 
                              className={`flex items-center gap-1 text-xs ${reply.isLiked ? 'text-primary' : 'text-text-secondary'} hover:text-primary transition-colors`}
                              onClick={() => handleLikeComment(reply.id, true, comment.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              <span>{reply.likes}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Reply Form */}
              {isAuthenticated && replyingTo === comment.id && (
                <div className="ml-12 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                      <Image
                        src="/images/logo.png"
                        alt="Your avatar"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        ref={replyInputRef}
                        type="text"
                        className="flex-1 bg-background-dark border border-background-elevated rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Add a reply..."
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddReply(comment.id);
                          }
                        }}
                      />
                      <button
                        className="bg-primary rounded-full p-1.5 text-white disabled:opacity-50"
                        disabled={!replyContent.trim()}
                        onClick={() => handleAddReply(comment.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </button>
                      <button
                        className="text-text-secondary hover:text-white p-1.5"
                        onClick={() => setReplyingTo(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
