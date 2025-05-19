'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/contexts/MusicContext';
import socialService, { SocialPost } from '@/services/socialService';
import SharedPlaylist from './SharedPlaylist';

// Fallback mock data for social feed
const initialSocialFeedItems = [
  {
    id: 1,
    type: 'listening',
    user: {
      name: 'Sarah Johnson',
      avatar: '/images/logo.png',
      username: 'sarahj'
    },
    content: {
      track: 'Blinding Lights',
      artist: 'The Weeknd',
      coverUrl: '/images/man_with_headse.png'
    },
    timestamp: '2 minutes ago'
  },
  {
    id: 2,
    type: 'playlist',
    user: {
      name: 'Mike Chen',
      avatar: '/images/logo_bg_white.png',
      username: 'mikemusic'
    },
    content: {
      action: 'created',
      playlist: 'Workout Motivation',
      coverUrl: '/images/two_people_enjoying_music.png'
    },
    timestamp: '35 minutes ago'
  },
  {
    id: 3,
    type: 'mood',
    user: {
      name: 'Alex Rivera',
      avatar: '/images/logo.png',
      username: 'devbeats'
    },
    content: {
      mood: 'Focused',
      emoji: '🧠',
      message: 'Deep work session with some ambient beats'
    },
    timestamp: '1 hour ago'
  },
  {
    id: 4,
    type: 'listening',
    user: {
      name: 'Jamie Lee',
      avatar: '/images/man_with_headse.png',
      username: 'jamielee'
    },
    content: {
      track: 'As It Was',
      artist: 'Harry Styles',
      coverUrl: '/images/logo_bg_white.png'
    },
    timestamp: '2 hours ago'
  },
  {
    id: 5,
    type: 'playlist',
    user: {
      name: 'Taylor Wong',
      avatar: '/images/two_people_enjoying_music.png',
      username: 'taylorw'
    },
    content: {
      action: 'updated',
      playlist: 'Indie Discoveries 2023',
      coverUrl: '/images/logo.png'
    },
    timestamp: '3 hours ago'
  },
  {
    id: 6,
    type: 'mood',
    user: {
      name: 'Jordan Smith',
      avatar: '/images/logo_bg_white.png',
      username: 'jsmith'
    },
    content: {
      mood: 'Energetic',
      emoji: '⚡',
      message: 'Monday motivation playlist on repeat!'
    },
    timestamp: '5 hours ago'
  }
];

interface SocialFeedProps {
  userId?: string; // If provided, show only posts from this user
  filter?: 'all' | 'following' | 'trending'; // Filter type
}

export default function SocialFeed({ userId, filter = 'all' }: SocialFeedProps) {
  const { isAuthenticated, user } = useAuth();
  const { playTrack } = useMusic();
  const [feedItems, setFeedItems] = useState(initialSocialFeedItems);
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [postText, setPostText] = useState('');
  const [showPostOptions, setShowPostOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch social feed posts
  useEffect(() => {
    // Create a flag to track if the component is mounted
    let isMounted = true;

    const fetchSocialFeed = async () => {
      // Only proceed if the component is still mounted
      if (!isMounted) return;

      // Only set loading state on initial load
      if (socialPosts.length === 0) {
        setIsLoading(true);
      }

      try {
        if (isAuthenticated && user) {
          // Get social feed from API
          const response = await fetch(`/api/social/feed?filter=${filter}${userId ? `&userId=${userId}` : ''}`);

          // Only proceed if the component is still mounted
          if (!isMounted) return;

          if (!response.ok) {
            throw new Error('Failed to fetch social feed');
          }

          const data = await response.json();
          setSocialPosts(data.posts);
        }

        // Only proceed if the component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        // Only proceed if the component is still mounted
        if (isMounted) {
          console.error('Failed to load social feed:', err);
          setError('Failed to load social feed. Please try again later.');
          setIsLoading(false);
        }
      }
    };

    fetchSocialFeed();

    // Cleanup function to set the flag to false when the component unmounts
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, filter, userId, socialPosts.length]);

  // Function to add a new post
  const addPost = async () => {
    if (!postText.trim() || !isAuthenticated || !user) return;

    try {
      // Create a post via the API
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'status',
          content: postText,
          visibility: 'public',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      // Refresh the feed to show the new post
      const feedResponse = await fetch(`/api/social/feed?filter=${filter}${userId ? `&userId=${userId}` : ''}`);
      const data = await feedResponse.json();
      setSocialPosts(data.posts);

      // Clear the post text and hide the post options
      setPostText('');
      setShowPostOptions(false);
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // Function to like a post
  const likePost = async (id: string) => {
    if (!isAuthenticated) {
      alert('Please log in to like posts');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/social/likes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to like post');
      }

      // Refresh the feed to update the like count
      const feedResponse = await fetch(`/api/social/feed?filter=${filter}${userId ? `&userId=${userId}` : ''}`);
      const data = await feedResponse.json();
      setSocialPosts(data.posts);
    } catch (error) {
      console.error('Error liking post:', error);
      alert('Failed to like post. Please try again.');
    }
  };

  // Function to comment on a post
  const commentPost = async (id: string, commentText: string) => {
    if (!isAuthenticated) {
      alert('Please log in to comment on posts');
      window.location.href = '/login';
      return;
    }

    try {
      const response = await fetch('/api/social/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: id,
          content: commentText,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Refresh the feed to show the new comment
      const feedResponse = await fetch(`/api/social/feed?filter=${filter}${userId ? `&userId=${userId}` : ''}`);
      const data = await feedResponse.json();
      setSocialPosts(data.posts);
    } catch (error) {
      console.error('Error commenting on post:', error);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Function to share a post
  const sharePost = async (id: string) => {
    if (!isAuthenticated) {
      alert('Please log in to share posts');
      window.location.href = '/login';
      return;
    }

    // For now, we'll just increment the share count
    try {
      const response = await fetch('/api/social/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'share',
          content: 'Shared a post',
          mediaId: id,
          mediaType: 'post',
          visibility: 'public',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to share post');
      }

      // Refresh the feed
      const feedResponse = await fetch(`/api/social/feed?filter=${filter}${userId ? `&userId=${userId}` : ''}`);
      const data = await feedResponse.json();
      setSocialPosts(data.posts);
    } catch (error) {
      console.error('Error sharing post:', error);
      alert('Failed to share post. Please try again.');
    }
  };

  return (
    <div className="bg-background-card rounded-lg p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Social Feed</h2>
        <div className="flex gap-2">
          <select
            className="bg-background-elevated text-text-secondary rounded-md px-2 py-1 text-sm"
            value={filter}
            onChange={(e) => window.location.href = `/social?filter=${e.target.value}`}
          >
            <option value="all">All Posts</option>
            <option value="following">Following</option>
            <option value="trending">Trending</option>
          </select>
          <button
            className="text-sm text-primary hover:underline"
            onClick={() => window.location.reload()}
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Post composer - Only show if authenticated */}
      {isAuthenticated ? (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10 rounded-full overflow-hidden">
              <Image
                src="/images/logo.png"
                alt="Your avatar"
                fill
                className="object-cover"
              />
            </div>
            <div
              className="flex-1 bg-background-elevated rounded-full px-4 py-2 text-sm cursor-pointer"
              onClick={() => setShowPostOptions(true)}
            >
              {postText || <span className="text-text-secondary">What are you listening to?</span>}
            </div>
          </div>

          {showPostOptions && (
            <div className="bg-background-elevated rounded-lg p-4 mt-2 animate-fade-in">
              <textarea
                className="w-full bg-background-dark border border-background-elevated rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Share what's on your mind..."
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={3}
              />

              <div className="flex justify-between items-center mt-3">
                <div className="flex gap-2">
                  <button className="icon-btn text-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </button>
                  <button className="icon-btn text-text-secondary hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded-md text-text-secondary hover:text-white"
                    onClick={() => setShowPostOptions(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className={`px-3 py-1 rounded-md ${
                      postText.trim()
                        ? 'bg-primary hover:bg-primary-light text-white'
                        : 'bg-background-elevated text-text-disabled cursor-not-allowed'
                    }`}
                    onClick={addPost}
                    disabled={!postText.trim()}
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-background-elevated rounded-lg p-4 mb-6 text-center">
          <p className="text-text-secondary mb-2">Sign in to share your thoughts</p>
          <Link href="/login">
            <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">Sign In</button>
          </Link>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="animate-pulse space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-background-elevated rounded-lg p-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-background-dark"></div>
                <div className="flex-1">
                  <div className="h-4 bg-background-dark rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-background-dark rounded w-1/6"></div>
                </div>
              </div>
              <div className="h-4 bg-background-dark rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-background-dark rounded w-1/2 mb-6"></div>
              <div className="h-40 bg-background-dark rounded mb-4"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-background-elevated rounded-lg p-6 text-center">
          <p className="text-error mb-4">{error}</p>
          <button
            className="btn btn-primary"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && socialPosts.length === 0 && feedItems.length === 0 && (
        <div className="bg-background-elevated rounded-lg p-6 text-center">
          <p className="text-text-secondary mb-2">No posts to show</p>
          {filter === 'following' && (
            <p className="text-text-tertiary text-sm">
              Follow more users to see their posts in your feed
            </p>
          )}
        </div>
      )}

      {/* Social Posts - Use real data if available, otherwise fallback to mock data */}
      <div className="space-y-6">
        {/* Real social posts from the API */}
        {socialPosts.map((post) => (
          <div key={post.id} className="animate-fade-in bg-background-elevated rounded-lg p-4 shadow-md">
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
              <span className="text-xs text-text-tertiary">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Post content */}
            <div className="mb-4">
              <p className="mb-2">{post.content}</p>

              {/* Render media based on type */}
              {post.type === 'playlist' && post.mediaId && (
                <SharedPlaylist
                  playlist={{
                    id: post.mediaId,
                    name: 'Shared Playlist',
                    description: post.content,
                    tracks: [],
                    createdAt: post.createdAt,
                    updatedAt: post.createdAt
                  }}
                  userId={post.userId}
                  username={post.user.username || post.user.id}
                  userAvatar={post.user.image || '/images/logo.png'}
                  timestamp={new Date(post.createdAt).toLocaleDateString()}
                  message={post.content}
                />
              )}

              {post.type === 'track' && post.mediaId && (
                <div className="flex items-center gap-3 bg-background-dark rounded-lg p-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src="/images/logo.png"
                      alt="Track"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">Track</p>
                    <p className="text-sm text-text-secondary truncate">Artist</p>
                  </div>
                  <button
                    className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Interaction buttons */}
            <div className="flex items-center gap-4">
              <button
                className={`flex items-center gap-1 ${
                  post.likes.some(like => like.userId === user?.id)
                    ? 'text-primary'
                    : 'text-text-secondary hover:text-primary'
                } transition-colors`}
                onClick={() => likePost(post.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes.length}</span>
              </button>
              <button
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                onClick={() => {
                  const comment = prompt('Enter your comment:');
                  if (comment) {
                    commentPost(post.id, comment);
                  }
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comments.length}</span>
              </button>
              <button
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors ml-auto"
                onClick={() => sharePost(post.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>{post.shareCount || 0}</span>
              </button>
            </div>

            {/* Comments */}
            {post.comments.length > 0 && (
              <div className="mt-4 pt-4 border-t border-background-dark">
                <h4 className="text-sm font-medium mb-2">Comments</h4>
                <div className="space-y-3">
                  {post.comments.slice(0, 3).map(comment => (
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

                  {post.comments.length > 3 && (
                    <button className="text-sm text-primary hover:underline">
                      View all {post.comments.length} comments
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Fallback to mock data if no real data is available */}
        {socialPosts.length === 0 && feedItems.map((item) => (
          <div key={item.id} className="bg-background-elevated rounded-lg p-4 shadow-md">
            {/* User info and timestamp */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Link href={`/user/${item.user.username}`} className="relative w-10 h-10 rounded-full overflow-hidden">
                  <Image
                    src={item.user.avatar}
                    alt={item.user.name}
                    fill
                    className="object-cover"
                  />
                </Link>
                <div>
                  <Link href={`/user/${item.user.username}`} className="font-medium hover:underline">
                    {item.user.name}
                  </Link>
                  <p className="text-xs text-text-tertiary">@{item.user.username}</p>
                </div>
              </div>
              <span className="text-xs text-text-tertiary">{item.timestamp}</span>
            </div>

            {/* Content based on type */}
            {item.type === 'listening' && (
              <div className="flex items-center gap-3 bg-background-dark rounded-lg p-3 mb-3">
                <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={item.content.coverUrl}
                    alt={`${item.content.track} by ${item.content.artist}`}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{item.content.track}</p>
                  <p className="text-sm text-text-secondary truncate">{item.content.artist}</p>
                </div>
                <button
                  className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform"
                  onClick={() => {
                    // Create a mock track to play
                    const mockTrack = {
                      id: `track-${Date.now()}`,
                      title: item.content.track,
                      artist: item.content.artist,
                      genre: 'Unknown',
                      youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                      youtubeId: 'dQw4w9WgXcQ',
                      thumbnail: item.content.coverUrl
                    };
                    playTrack(mockTrack);
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  </svg>
                </button>
              </div>
            )}

            {item.type === 'playlist' && (
              <div className="mb-3">
                <p className="mb-2">
                  {item.content.action === 'created' ? 'Created a new playlist:' : 'Updated playlist:'} <span className="font-medium">{item.content.playlist}</span>
                </p>
                <div className="relative w-full h-32 rounded-lg overflow-hidden">
                  <Image
                    src={item.content.coverUrl}
                    alt={item.content.playlist}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background-dark/70 to-transparent flex items-end p-3">
                    <button className="bg-primary rounded-full p-2 transform hover:scale-110 transition-transform">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {item.type === 'mood' && (
              <div className="bg-background-dark rounded-lg p-4 mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{item.content.emoji}</span>
                  <span className="font-medium">Feeling {item.content.mood}</span>
                </div>
                <p className="text-text-secondary">{item.content.message}</p>
              </div>
            )}

            {/* Interaction buttons */}
            <div className="flex items-center gap-4">
              <button
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                onClick={() => likePost(item.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Like</span>
              </button>
              <button
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
                onClick={() => commentPost(item.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>Comment</span>
              </button>
              <button
                className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors ml-auto"
                onClick={() => sharePost(item.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
