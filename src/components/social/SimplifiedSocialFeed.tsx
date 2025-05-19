'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMusic } from '@/contexts/MusicContext';
import CreatePost from './CreatePost';
import SocialPost, { Post } from './SocialPost';
import { Track } from '@/services/musicService';

interface SocialFeedProps {
  filter?: 'all' | 'following' | 'trending';
}

export default function SimplifiedSocialFeed({ filter = 'all' }: SocialFeedProps) {
  const { isAuthenticated, user } = useAuth();
  const { getTrackById: getTrackByIdOriginal, getPlaylistById: getPlaylistByIdOriginal } = useMusic();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create stable references to the functions to prevent infinite re-renders
  const getTrackById = useCallback((trackId: string) => getTrackByIdOriginal(trackId), [getTrackByIdOriginal]);
  const getPlaylistById = useCallback((playlistId: string) => getPlaylistByIdOriginal(playlistId), [getPlaylistByIdOriginal]);

  // Fetch posts when component mounts or filter changes
  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        if (!isMounted) return;

        setIsLoading(true);
        setError(null);

        // Fetch posts from API
        const response = await fetch(`/api/social/feed?filter=${filter}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch posts: ${response.statusText}`);
        }

        const data = await response.json();

        if (!isMounted) return;

        // Process posts to include media data
        const processedPosts = await Promise.all(
          (data.posts || []).map(async (post: any) => {
            let mediaData = null;

            // Fetch media data if post has media
            if (post.mediaType === 'track' && post.mediaId) {
              try {
                mediaData = await getTrackById(post.mediaId);
              } catch (error) {
                console.error(`Error fetching track ${post.mediaId}:`, error);
              }
            } else if (post.mediaType === 'playlist' && post.mediaId) {
              try {
                mediaData = await getPlaylistById(post.mediaId);
              } catch (error) {
                console.error(`Error fetching playlist ${post.mediaId}:`, error);
              }
            }

            return {
              ...post,
              mediaData
            };
          })
        );

        if (!isMounted) return;

        setPosts(processedPosts);
      } catch (err) {
        console.error('Error fetching social feed:', err);
        if (isMounted) {
          setError('Failed to load social feed. Please try again later.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchPosts();

    // Cleanup function to prevent state updates after unmounting
    return () => {
      isMounted = false;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Handle creating a new post
  const handleCreatePost = async (content: string, mediaType?: string, mediaId?: string) => {
    if (!isAuthenticated || !user) {
      alert('You need to be logged in to create posts');
      return;
    }

    try {
      const response = await fetch('/api/social/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content,
          mediaType,
          mediaId,
          visibility: 'public'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const data = await response.json();

      // Add media data to the new post
      let mediaData = null;
      if (mediaType === 'track' && mediaId) {
        mediaData = await getTrackById(mediaId);
      } else if (mediaType === 'playlist' && mediaId) {
        mediaData = await getPlaylistById(mediaId);
      }

      // Add the new post to the list
      setPosts(prevPosts => [
        {
          ...data.post,
          mediaData
        },
        ...prevPosts
      ]);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  // Handle liking a post
  const handleLikePost = async (postId: string) => {
    if (!isAuthenticated || !user) {
      alert('You need to be logged in to like posts');
      return;
    }

    // Optimistically update UI
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const userLiked = post.likes.some(like => like.userId === user.id);

          return {
            ...post,
            likes: userLiked
              ? post.likes.filter(like => like.userId !== user.id)
              : [...post.likes, { userId: user.id }]
          };
        }
        return post;
      })
    );

    try {
      // Call API to update like status
      const response = await fetch(`/api/social/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      // Revert optimistic update on error by refetching posts
      window.location.reload();
    }
  };

  // Handle adding a comment
  const handleAddComment = async (postId: string, content: string) => {
    if (!isAuthenticated || !user || !content.trim()) {
      return;
    }

    try {
      const response = await fetch(`/api/social/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const data = await response.json();

      // Update posts with new comment
      setPosts(prevPosts =>
        prevPosts.map(post => {
          if (post.id === postId) {
            return {
              ...post,
              comments: [...post.comments, data.comment]
            };
          }
          return post;
        })
      );
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  // Handle sharing a post
  const handleSharePost = async (postId: string) => {
    if (!isAuthenticated) {
      alert('You need to be logged in to share posts');
      return;
    }

    // For now, just copy the post URL to clipboard
    const postUrl = `${window.location.origin}/social/post/${postId}`;

    try {
      await navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert(`Share this post: ${postUrl}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Create post component */}
      <CreatePost onCreatePost={handleCreatePost} />

      {/* Loading state */}
      {isLoading && (
        <div className="bg-background-elevated rounded-lg p-6 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
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
      {!isLoading && !error && posts.length === 0 && (
        <div className="bg-background-elevated rounded-lg p-6 text-center">
          <p className="text-text-secondary mb-4">No posts to show</p>
          {filter !== 'all' && (
            <button
              className="text-primary hover:underline"
              onClick={() => window.location.href = '/social'}
            >
              View all posts
            </button>
          )}
        </div>
      )}

      {/* Posts list */}
      {!isLoading && !error && posts.length > 0 && (
        <div className="space-y-4">
          {posts.map(post => (
            <SocialPost
              key={post.id}
              post={post}
              onLike={handleLikePost}
              onComment={handleAddComment}
              onShare={handleSharePost}
            />
          ))}
        </div>
      )}
    </div>
  );
}
