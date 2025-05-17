/**
 * Social Service
 *
 * This service manages social interactions including:
 * - Following/unfollowing users
 * - Sharing playlists
 * - Comments and replies
 * - Social feed
 *
 * Data is stored in both localStorage (for quick access) and the database (for persistence)
 * using Prisma.
 */

import { UserPlaylist } from './userDataService';
import { Track } from './musicDatabase';
import { prisma } from '@/lib/prisma';

// Define types for social data
export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  isVerified: boolean;
  joinDate: string;
  followers: string[]; // Array of user IDs
  following: string[]; // Array of user IDs
}

export interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked
  replies?: Comment[];
}

export interface SocialPost {
  id: string;
  userId: string;
  type: 'playlist' | 'track' | 'album' | 'artist' | 'status';
  content: string;
  timestamp: number;
  mediaId?: string;
  mediaType?: string;
  visibility: 'public' | 'followers' | 'private';
  likes: string[]; // Array of user IDs who liked
  comments: Comment[];
  shares: number;
}

export interface PlaylistComment {
  id: string;
  playlistId: string;
  userId: string;
  content: string;
  timestamp: number;
  likes: string[]; // Array of user IDs who liked
  replies?: PlaylistComment[];
}

export interface SocialData {
  userProfiles: UserProfile[];
  posts: SocialPost[];
  playlistComments: PlaylistComment[];
  sharedPlaylists: {
    playlistId: string;
    userId: string;
    timestamp: number;
  }[];
}

// Default social data
const defaultSocialData: SocialData = {
  userProfiles: [],
  posts: [],
  playlistComments: [],
  sharedPlaylists: []
};

// Helper function to check if we're on the client side
const isClient = typeof window !== 'undefined';

/**
 * Load social data from localStorage and merge with database data
 */
const loadSocialData = async (): Promise<SocialData> => {
  // If not on client, return default data
  if (!isClient) {
    return defaultSocialData;
  }

  try {
    // First try to get from localStorage for quick access
    const localData = localStorage.getItem('socialData');
    let socialData = localData ? JSON.parse(localData) : defaultSocialData;

    try {
      // Get user profiles
      const userProfiles = await prisma.user.findMany({
        include: {
          followers: true,
          following: true
        }
      });

      // Get posts
      const posts = await prisma.post.findMany({
        include: {
          likes: true,
          comments: {
            include: {
              likes: true,
              replies: {
                include: {
                  likes: true
                }
              }
            }
          }
        }
      });

      // Get playlist comments
      const playlistComments = await prisma.playlistComment.findMany({
        include: {
          likes: true,
          replies: {
            include: {
              likes: true
            }
          }
        }
      });

      // Get shared playlists
      const sharedPlaylists = await prisma.sharedPlaylist.findMany();

      // Transform data to match our interface
      socialData = {
        userProfiles: userProfiles.map(user => ({
          id: user.id,
          username: user.username || `user_${user.id}`,
          displayName: user.name || `User ${user.id}`,
          bio: user.bio || '',
          avatarUrl: user.image || '/images/logo.png',
          coverUrl: user.coverImage || '/images/man_with_headse.png',
          isVerified: user.isVerified || false,
          joinDate: user.createdAt.toISOString(),
          followers: user.followers.map(f => f.followerId),
          following: user.following.map(f => f.followingId)
        })),
        posts: posts.map(post => ({
          id: post.id,
          userId: post.userId,
          type: post.type as any,
          content: post.content,
          timestamp: post.createdAt.getTime(),
          mediaId: post.mediaId || undefined,
          mediaType: post.mediaType || undefined,
          visibility: post.visibility as any,
          likes: post.likes.map(like => like.userId),
          comments: post.comments.map(comment => ({
            id: comment.id,
            userId: comment.userId,
            content: comment.content,
            timestamp: comment.createdAt.getTime(),
            likes: comment.likes.map(like => like.userId),
            replies: comment.replies.map(reply => ({
              id: reply.id,
              userId: reply.userId,
              content: reply.content,
              timestamp: reply.createdAt.getTime(),
              likes: reply.likes.map(like => like.userId)
            }))
          })),
          shares: post.shareCount
        })),
        playlistComments: playlistComments.map(comment => ({
          id: comment.id,
          playlistId: comment.playlistId,
          userId: comment.userId,
          content: comment.content,
          timestamp: comment.createdAt.getTime(),
          likes: comment.likes.map(like => like.userId),
          replies: comment.replies.map(reply => ({
            id: reply.id,
            playlistId: reply.playlistId,
            userId: reply.userId,
            content: reply.content,
            timestamp: reply.createdAt.getTime(),
            likes: reply.likes.map(like => like.userId)
          }))
        })),
        sharedPlaylists: sharedPlaylists.map(sp => ({
          playlistId: sp.playlistId,
          userId: sp.userId,
          timestamp: sp.sharedAt.getTime()
        }))
      };

      // Update localStorage with the merged data
      localStorage.setItem('socialData', JSON.stringify(socialData));
    } catch (dbError) {
      console.error('Error fetching social data from database:', dbError);
      // If database fetch fails, use localStorage data
    }

    return socialData;
  } catch (error) {
    console.error('Error loading social data:', error);
    return defaultSocialData;
  }
};

// Synchronous version for components that can't use async
const loadSocialDataSync = (): SocialData => {
  if (!isClient) {
    return defaultSocialData;
  }

  try {
    const localData = localStorage.getItem('socialData');
    return localData ? JSON.parse(localData) : defaultSocialData;
  } catch (error) {
    console.error('Error loading social data synchronously:', error);
    return defaultSocialData;
  }
};

/**
 * Save social data to localStorage and database
 */
const saveSocialData = async (socialData: SocialData): Promise<void> => {
  if (!isClient) {
    return;
  }

  try {
    // Always save to localStorage for quick access
    localStorage.setItem('socialData', JSON.stringify(socialData));

    try {
      // We'll implement the database saving in each specific function
      // as the operations are more complex than just saving the whole object
    } catch (dbError) {
      console.error('Error saving social data to database:', dbError);
    }
  } catch (error) {
    console.error('Error saving social data:', error);
  }
};

/**
 * Get user profile by ID
 */
const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    // First check localStorage for quick access
    const socialData = loadSocialDataSync();
    const localProfile = socialData.userProfiles.find(profile => profile.id === userId);

    if (localProfile) {
      return localProfile;
    }

    // If not in localStorage, fetch from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        followers: true,
        following: true
      }
    });

    if (!user) {
      return null;
    }

    // Transform to our interface
    const userProfile: UserProfile = {
      id: user.id,
      username: user.username || `user_${user.id}`,
      displayName: user.name || `User ${user.id}`,
      bio: user.bio || '',
      avatarUrl: user.image || '/images/logo.png',
      coverUrl: user.coverImage || '/images/man_with_headse.png',
      isVerified: user.isVerified || false,
      joinDate: user.createdAt.toISOString(),
      followers: user.followers.map(f => f.followerId),
      following: user.following.map(f => f.followingId)
    };

    // Update localStorage
    socialData.userProfiles = socialData.userProfiles.filter(p => p.id !== userId);
    socialData.userProfiles.push(userProfile);
    localStorage.setItem('socialData', JSON.stringify(socialData));

    return userProfile;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// Synchronous version for components that can't use async
const getUserProfileSync = (userId: string): UserProfile | null => {
  const socialData = loadSocialDataSync();
  return socialData.userProfiles.find(profile => profile.id === userId) || null;
};

/**
 * Create or update user profile
 */
const updateUserProfile = async (profile: Partial<UserProfile> & { id: string }): Promise<UserProfile> => {
  try {
    // First, check if the user exists in the database
    let user = await prisma.user.findUnique({
      where: { id: profile.id },
      include: {
        followers: true,
        following: true
      }
    });

    if (user) {
      // Update existing user
      user = await prisma.user.update({
        where: { id: profile.id },
        data: {
          username: profile.username,
          name: profile.displayName,
          bio: profile.bio,
          image: profile.avatarUrl,
          coverImage: profile.coverUrl,
          isVerified: profile.isVerified
        },
        include: {
          followers: true,
          following: true
        }
      });
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          id: profile.id,
          username: profile.username || `user_${profile.id}`,
          name: profile.displayName || `User ${profile.id}`,
          bio: profile.bio || '',
          image: profile.avatarUrl || '/images/logo.png',
          coverImage: profile.coverUrl || '/images/man_with_headse.png',
          isVerified: profile.isVerified || false
        },
        include: {
          followers: true,
          following: true
        }
      });
    }

    // Transform to our interface
    const userProfile: UserProfile = {
      id: user.id,
      username: user.username || `user_${user.id}`,
      displayName: user.name || `User ${user.id}`,
      bio: user.bio || '',
      avatarUrl: user.image || '/images/logo.png',
      coverUrl: user.coverImage || '/images/man_with_headse.png',
      isVerified: user.isVerified || false,
      joinDate: user.createdAt.toISOString(),
      followers: user.followers.map(f => f.followerId),
      following: user.following.map(f => f.followingId)
    };

    // Update localStorage
    const socialData = loadSocialDataSync();
    socialData.userProfiles = socialData.userProfiles.filter(p => p.id !== profile.id);
    socialData.userProfiles.push(userProfile);
    localStorage.setItem('socialData', JSON.stringify(socialData));

    return userProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);

    // Fall back to localStorage only
    const socialData = loadSocialDataSync();
    const existingProfileIndex = socialData.userProfiles.findIndex(p => p.id === profile.id);

    if (existingProfileIndex !== -1) {
      // Update existing profile
      const updatedProfile = {
        ...socialData.userProfiles[existingProfileIndex],
        ...profile
      };
      socialData.userProfiles[existingProfileIndex] = updatedProfile;
      localStorage.setItem('socialData', JSON.stringify(socialData));
      return updatedProfile;
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        id: profile.id,
        username: profile.username || `user_${profile.id}`,
        displayName: profile.displayName || `User ${profile.id}`,
        bio: profile.bio || '',
        avatarUrl: profile.avatarUrl || '/images/logo.png',
        coverUrl: profile.coverUrl || '/images/man_with_headse.png',
        isVerified: profile.isVerified || false,
        joinDate: profile.joinDate || new Date().toISOString(),
        followers: profile.followers || [],
        following: profile.following || []
      };

      socialData.userProfiles.push(newProfile);
      localStorage.setItem('socialData', JSON.stringify(socialData));
      return newProfile;
    }
  }
};

/**
 * Follow a user
 */
const followUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Check if already following in the database
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    if (existingFollow) {
      return false;
    }

    // Create follow relationship in database
    await prisma.follows.create({
      data: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });

    // Update localStorage for quick access
    const socialData = loadSocialDataSync();
    const currentUserIndex = socialData.userProfiles.findIndex(p => p.id === currentUserId);
    const targetUserIndex = socialData.userProfiles.findIndex(p => p.id === targetUserId);

    if (currentUserIndex !== -1) {
      if (!socialData.userProfiles[currentUserIndex].following.includes(targetUserId)) {
        socialData.userProfiles[currentUserIndex].following.push(targetUserId);
      }
    }

    if (targetUserIndex !== -1) {
      if (!socialData.userProfiles[targetUserIndex].followers.includes(currentUserId)) {
        socialData.userProfiles[targetUserIndex].followers.push(currentUserId);
      }
    }

    localStorage.setItem('socialData', JSON.stringify(socialData));
    return true;
  } catch (error) {
    console.error('Error following user:', error);

    // Fall back to localStorage only
    const socialData = loadSocialDataSync();
    const currentUserIndex = socialData.userProfiles.findIndex(p => p.id === currentUserId);
    const targetUserIndex = socialData.userProfiles.findIndex(p => p.id === targetUserId);

    if (currentUserIndex === -1 || targetUserIndex === -1) {
      return false;
    }

    // Check if already following
    if (socialData.userProfiles[currentUserIndex].following.includes(targetUserId)) {
      return false;
    }

    // Update following list for current user
    socialData.userProfiles[currentUserIndex].following.push(targetUserId);

    // Update followers list for target user
    socialData.userProfiles[targetUserIndex].followers.push(currentUserId);

    localStorage.setItem('socialData', JSON.stringify(socialData));
    return true;
  }
};

/**
 * Unfollow a user
 */
const unfollowUser = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Check if following in the database
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    if (!existingFollow) {
      return false;
    }

    // Delete follow relationship from database
    await prisma.follows.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    // Update localStorage for quick access
    const socialData = loadSocialDataSync();
    const currentUserIndex = socialData.userProfiles.findIndex(p => p.id === currentUserId);
    const targetUserIndex = socialData.userProfiles.findIndex(p => p.id === targetUserId);

    if (currentUserIndex !== -1) {
      socialData.userProfiles[currentUserIndex].following =
        socialData.userProfiles[currentUserIndex].following.filter(id => id !== targetUserId);
    }

    if (targetUserIndex !== -1) {
      socialData.userProfiles[targetUserIndex].followers =
        socialData.userProfiles[targetUserIndex].followers.filter(id => id !== currentUserId);
    }

    localStorage.setItem('socialData', JSON.stringify(socialData));
    return true;
  } catch (error) {
    console.error('Error unfollowing user:', error);

    // Fall back to localStorage only
    const socialData = loadSocialDataSync();
    const currentUserIndex = socialData.userProfiles.findIndex(p => p.id === currentUserId);
    const targetUserIndex = socialData.userProfiles.findIndex(p => p.id === targetUserId);

    if (currentUserIndex === -1 || targetUserIndex === -1) {
      return false;
    }

    // Check if not following
    if (!socialData.userProfiles[currentUserIndex].following.includes(targetUserId)) {
      return false;
    }

    // Update following list for current user
    socialData.userProfiles[currentUserIndex].following =
      socialData.userProfiles[currentUserIndex].following.filter(id => id !== targetUserId);

    // Update followers list for target user
    socialData.userProfiles[targetUserIndex].followers =
      socialData.userProfiles[targetUserIndex].followers.filter(id => id !== currentUserId);

    localStorage.setItem('socialData', JSON.stringify(socialData));
    return true;
  }
};

/**
 * Check if a user is following another user
 */
const isFollowing = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Check in database
    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      }
    });

    return !!existingFollow;
  } catch (error) {
    console.error('Error checking if user is following:', error);

    // Fall back to localStorage
    const socialData = loadSocialDataSync();
    const currentUserProfile = socialData.userProfiles.find(p => p.id === currentUserId);

    if (!currentUserProfile) {
      return false;
    }

    return currentUserProfile.following.includes(targetUserId);
  }
};

// Synchronous version for components that can't use async
const isFollowingSync = (currentUserId: string, targetUserId: string): boolean => {
  const socialData = loadSocialDataSync();
  const currentUserProfile = socialData.userProfiles.find(p => p.id === currentUserId);

  if (!currentUserProfile) {
    return false;
  }

  return currentUserProfile.following.includes(targetUserId);
};

/**
 * Share a playlist
 */
const sharePlaylist = async (
  userId: string,
  playlist: UserPlaylist,
  message: string,
  visibility: 'public' | 'followers' | 'private'
): Promise<SocialPost> => {
  try {
    // Create a new post in the database
    const dbPost = await prisma.post.create({
      data: {
        userId,
        type: 'playlist',
        content: message,
        mediaId: playlist.id,
        mediaType: 'playlist',
        visibility,
        shareCount: 0
      }
    });

    // Create shared playlist record
    await prisma.sharedPlaylist.create({
      data: {
        playlistId: playlist.id,
        userId,
        sharedAt: new Date()
      }
    });

    // Transform to our interface
    const newPost: SocialPost = {
      id: dbPost.id,
      userId,
      type: 'playlist',
      content: message,
      timestamp: dbPost.createdAt.getTime(),
      mediaId: playlist.id,
      mediaType: 'playlist',
      visibility: visibility as any,
      likes: [],
      comments: [],
      shares: 0
    };

    // Update localStorage for quick access
    const socialData = loadSocialDataSync();

    // Add to shared playlists
    socialData.sharedPlaylists.push({
      playlistId: playlist.id,
      userId,
      timestamp: Date.now()
    });

    // Add to posts
    socialData.posts.push(newPost);
    localStorage.setItem('socialData', JSON.stringify(socialData));

    return newPost;
  } catch (error) {
    console.error('Error sharing playlist:', error);

    // Fall back to localStorage only
    const socialData = loadSocialDataSync();

    // Create a new post
    const newPost: SocialPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type: 'playlist',
      content: message,
      timestamp: Date.now(),
      mediaId: playlist.id,
      mediaType: 'playlist',
      visibility,
      likes: [],
      comments: [],
      shares: 0
    };

    // Add to shared playlists
    socialData.sharedPlaylists.push({
      playlistId: playlist.id,
      userId,
      timestamp: Date.now()
    });

    // Add to posts
    socialData.posts.push(newPost);
    localStorage.setItem('socialData', JSON.stringify(socialData));

    return newPost;
  }
};

/**
 * Get social feed for a user
 */
const getSocialFeed = async (
  userId: string,
  filter: 'all' | 'following' | 'trending' = 'all'
): Promise<SocialPost[]> => {
  try {
    let dbPosts;

    if (filter === 'all') {
      // Get all public posts and posts from users the current user follows
      dbPosts = await prisma.post.findMany({
        where: {
          OR: [
            { visibility: 'public' },
            {
              visibility: 'followers',
              user: {
                followers: {
                  some: {
                    followerId: userId
                  }
                }
              }
            },
            { userId }
          ]
        },
        include: {
          likes: true,
          comments: {
            include: {
              likes: true,
              replies: {
                include: {
                  likes: true
                }
              }
            }
          },
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (filter === 'following') {
      // Get posts only from users the current user follows
      dbPosts = await prisma.post.findMany({
        where: {
          user: {
            followers: {
              some: {
                followerId: userId
              }
            }
          },
          visibility: {
            in: ['public', 'followers']
          }
        },
        include: {
          likes: true,
          comments: {
            include: {
              likes: true,
              replies: {
                include: {
                  likes: true
                }
              }
            }
          },
          user: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else if (filter === 'trending') {
      // Get posts sorted by engagement (likes + comments)
      dbPosts = await prisma.post.findMany({
        where: {
          visibility: 'public'
        },
        include: {
          likes: true,
          comments: {
            include: {
              likes: true,
              replies: {
                include: {
                  likes: true
                }
              }
            }
          },
          user: true
        }
      });

      // Sort by engagement
      dbPosts.sort((a, b) => {
        const aEngagement = a.likes.length + a.comments.length + a.shareCount;
        const bEngagement = b.likes.length + b.comments.length + b.shareCount;
        return bEngagement - aEngagement;
      });
    }

    if (!dbPosts) {
      return [];
    }

    // Transform to our interface
    return dbPosts.map(post => ({
      id: post.id,
      userId: post.userId,
      type: post.type as any,
      content: post.content,
      timestamp: post.createdAt.getTime(),
      mediaId: post.mediaId || undefined,
      mediaType: post.mediaType || undefined,
      visibility: post.visibility as any,
      likes: post.likes.map(like => like.userId),
      comments: post.comments.map(comment => ({
        id: comment.id,
        userId: comment.userId,
        content: comment.content,
        timestamp: comment.createdAt.getTime(),
        likes: comment.likes.map(like => like.userId),
        replies: comment.replies.map(reply => ({
          id: reply.id,
          userId: reply.userId,
          content: reply.content,
          timestamp: reply.createdAt.getTime(),
          likes: reply.likes.map(like => like.userId)
        }))
      })),
      shares: post.shareCount
    }));
  } catch (error) {
    console.error('Error getting social feed:', error);

    // Fall back to localStorage
    const socialData = loadSocialDataSync();
    const userProfile = socialData.userProfiles.find(p => p.id === userId);

    if (!userProfile) {
      return [];
    }

    let filteredPosts: SocialPost[] = [];

    if (filter === 'all') {
      // Get all public posts and posts from users the current user follows
      filteredPosts = socialData.posts.filter(post =>
        post.visibility === 'public' ||
        (post.visibility === 'followers' && isFollowingSync(userId, post.userId)) ||
        post.userId === userId
      );
    } else if (filter === 'following') {
      // Get posts only from users the current user follows
      filteredPosts = socialData.posts.filter(post =>
        userProfile.following.includes(post.userId) &&
        (post.visibility === 'public' || post.visibility === 'followers')
      );
    } else if (filter === 'trending') {
      // Get posts sorted by engagement (likes + comments)
      filteredPosts = socialData.posts
        .filter(post => post.visibility === 'public')
        .sort((a, b) => {
          const aEngagement = a.likes.length + a.comments.length + a.shares;
          const bEngagement = b.likes.length + b.comments.length + b.shares;
          return bEngagement - aEngagement;
        });
    }

    // Sort by timestamp (newest first)
    return filteredPosts.sort((a, b) => b.timestamp - a.timestamp);
  }
};

/**
 * Add a comment to a playlist
 */
const addPlaylistComment = (
  playlistId: string,
  userId: string,
  content: string
): PlaylistComment => {
  const socialData = loadSocialData();

  // Create a new comment
  const newComment: PlaylistComment = {
    id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    playlistId,
    userId,
    content,
    timestamp: Date.now(),
    likes: []
  };

  // Add to playlist comments
  socialData.playlistComments.push(newComment);
  saveSocialData(socialData);

  return newComment;
};

/**
 * Get comments for a playlist
 */
const getPlaylistComments = (playlistId: string): PlaylistComment[] => {
  const socialData = loadSocialData();

  // Get all comments for the playlist
  const comments = socialData.playlistComments.filter(comment =>
    comment.playlistId === playlistId && !comment.replies
  );

  // Sort by timestamp (newest first)
  return comments.sort((a, b) => b.timestamp - a.timestamp);
};

/**
 * Like a playlist comment
 */
const likePlaylistComment = (commentId: string, userId: string): boolean => {
  const socialData = loadSocialData();
  const commentIndex = socialData.playlistComments.findIndex(c => c.id === commentId);

  if (commentIndex === -1) {
    return false;
  }

  // Check if already liked
  if (socialData.playlistComments[commentIndex].likes.includes(userId)) {
    // Unlike
    socialData.playlistComments[commentIndex].likes =
      socialData.playlistComments[commentIndex].likes.filter(id => id !== userId);
  } else {
    // Like
    socialData.playlistComments[commentIndex].likes.push(userId);
  }

  saveSocialData(socialData);
  return true;
};

/**
 * Reply to a playlist comment
 */
const replyToPlaylistComment = (
  parentCommentId: string,
  userId: string,
  content: string
): PlaylistComment | null => {
  const socialData = loadSocialData();
  const parentCommentIndex = socialData.playlistComments.findIndex(c => c.id === parentCommentId);

  if (parentCommentIndex === -1) {
    return null;
  }

  const parentComment = socialData.playlistComments[parentCommentIndex];

  // Create a new reply
  const newReply: PlaylistComment = {
    id: `reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    playlistId: parentComment.playlistId,
    userId,
    content,
    timestamp: Date.now(),
    likes: []
  };

  // Initialize replies array if it doesn't exist
  if (!parentComment.replies) {
    parentComment.replies = [];
  }

  // Add reply to parent comment
  parentComment.replies.push(newReply);
  saveSocialData(socialData);

  return newReply;
};

/**
 * Search for users by username or display name
 */
const searchUsers = async (query: string): Promise<UserProfile[]> => {
  try {
    // Search in database
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { name: { contains: query, mode: 'insensitive' } }
        ]
      },
      include: {
        followers: true,
        following: true
      }
    });

    // Transform to our interface
    return users.map(user => ({
      id: user.id,
      username: user.username || '',
      displayName: user.name || '',
      bio: user.bio || '',
      avatarUrl: user.image || '',
      coverUrl: user.coverImage || '',
      isVerified: user.isVerified || false,
      joinDate: user.createdAt.toISOString(),
      followers: user.followers.map(f => f.followerId),
      following: user.following.map(f => f.followingId)
    }));
  } catch (error) {
    console.error('Error searching users:', error);

    // Fall back to localStorage
    const socialData = loadSocialDataSync();

    return socialData.userProfiles.filter(user =>
      user.username.toLowerCase().includes(query.toLowerCase()) ||
      user.displayName.toLowerCase().includes(query.toLowerCase())
    );
  }
};

const socialService = {
  // User profiles
  getUserProfile,
  getUserProfileSync,
  updateUserProfile,
  searchUsers,

  // Following
  followUser,
  unfollowUser,
  isFollowing,
  isFollowingSync,

  // Sharing
  sharePlaylist,
  getSocialFeed,

  // Comments
  addPlaylistComment,
  getPlaylistComments,
  likePlaylistComment,
  replyToPlaylistComment,

  // Data management
  loadSocialData,
  loadSocialDataSync
};

export default socialService;
