'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import FixUsernameButton from './FixUsernameButton';

interface UserProfileData {
  id: string;
  name: string;
  username: string;
  profilePic: string;
  bio: string;
  joinDate: string;
  followersCount: number;
  followingCount: number;
  playlists: Array<{ id: string; name: string; trackCount: number; coverUrl: string; isPublic: boolean }>;
  favorites: Array<{ id: string; title: string; artist: string; thumbnail: string }>;
  tags: Array<{ id: string; name: string; color: string; trackCount: number }>;
  genres: Array<{ id: string; name: string; trackCount: number }>;
}

interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarUrl: string;
  isVerified: boolean;
  joinDate: string;
}

interface UserProfileProps {
  userId?: string;
  minimal?: boolean;
}

export default function UserProfile({ userId, minimal = false }: UserProfileProps) {
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'playlists' | 'favorites' | 'tags' | 'genres' | 'followers' | 'following'>('overview');
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [following, setFollowing] = useState<UserProfile[]>([]);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowing, setLoadingFollowing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    bio: ''
  });

  // Get auth for current user functionality
  const { user, isAuthenticated } = useAuth();

  // If no userId provided, use current user's ID
  const effectiveUserId = userId || user?.id;
  const isCurrentUser = !userId || (user && userId === user.id);



  // Fetch user profile data - SIMPLE VERSION
  useEffect(() => {
    if (!effectiveUserId) {
      setIsLoading(false);
      return;
    }

    // If viewing own profile, wait for authentication
    if (isCurrentUser && !isAuthenticated) {
      return;
    }

    // Reset state for new user
    setUserData(null);
    setError(null);
    setIsLoading(true);

    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);



        // Get user profile
        const profileResponse = await fetch(`/api/user/profile?userId=${effectiveUserId}`);
        if (!profileResponse.ok) {
          const errorText = await profileResponse.text();
          console.error('Profile fetch failed:', profileResponse.status, errorText);
          throw new Error(`Failed to fetch user profile: ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        const profile = profileData.user;

        // Get user's playlists
        let playlistsData = { playlists: [] };
        try {
          const playlistsResponse = await fetch(`/api/user/data/playlists?userId=${effectiveUserId}`);
          if (playlistsResponse.ok) {
            playlistsData = await playlistsResponse.json();
          }
        } catch (error) {
          console.error('Error fetching playlists:', error);
        }

        // Get user's favorites
        let favoritesData = { favorites: [] };
        try {
          const favoritesResponse = await fetch(`/api/user/data/favorites?userId=${effectiveUserId}`);
          if (favoritesResponse.ok) {
            favoritesData = await favoritesResponse.json();
          }
        } catch (error) {
          console.error('Error fetching favorites:', error);
        }

        // Get user's tags
        let tagsData = { tags: [] };
        try {
          const tagsResponse = await fetch(`/api/user/data/tags?userId=${effectiveUserId}`);
          if (tagsResponse.ok) {
            tagsData = await tagsResponse.json();
          }
        } catch (error) {
          console.error('Error fetching tags:', error);
        }

        // Get user's genres
        let genresData = { genres: [] };
        try {
          const genresResponse = await fetch(`/api/user/data/genres?userId=${effectiveUserId}`);
          if (genresResponse.ok) {
            genresData = await genresResponse.json();
          }
        } catch (error) {
          console.error('Error fetching genres:', error);
        }

        // Transform data to match our UI needs
        const transformedData: UserProfileData = {
          id: profile.id,
          name: profile.displayName || 'Unknown User',
          username: profile.username || 'unknown',
          profilePic: profile.avatarUrl || '/images/logo.png',
          bio: profile.bio || 'No bio yet',
          joinDate: new Date(profile.joinDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long'
          }),
          followersCount: profile.followers?.length || 0,
          followingCount: profile.following?.length || 0,
          playlists: (playlistsData.playlists || []).map((playlist: any) => ({
            id: playlist.id,
            name: playlist.name,
            trackCount: playlist.tracks?.length || 0,
            coverUrl: playlist.tracks?.length > 0 ? playlist.tracks[0].thumbnail : '/images/logo.png',
            isPublic: playlist.isPublic
          })),
          favorites: (favoritesData.favorites || []).map((fav: any) => ({
            id: fav.track?.id || fav.id || 'unknown',
            title: fav.track?.title || fav.title || 'Unknown Track',
            artist: fav.track?.artist || fav.artist || 'Unknown Artist',
            thumbnail: fav.track?.thumbnail || fav.thumbnail || '/images/logo.png'
          })),
          tags: (tagsData.tags || []).map((tag: any) => ({
            id: tag.id || 'unknown',
            name: tag.name || 'Unknown Tag',
            color: tag.color || '#3B82F6',
            trackCount: tag.trackIds?.length || tag._count?.tracks || 0
          })),
          genres: (genresData.genres || []).map((genre: any) => ({
            id: genre.id || 'unknown',
            name: genre.name || 'Unknown Genre',
            trackCount: genre.tracks?.length || genre._count?.tracks || 0
          }))
        };

        setUserData(transformedData);

        // Initialize edit form if this is the current user
        if (isCurrentUser) {
          setEditForm({
            displayName: profile.displayName || '',
            username: profile.username || '',
            bio: profile.bio || ''
          });
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [effectiveUserId, isAuthenticated]); // Depend on effectiveUserId and auth state

  // Load followers
  const loadFollowers = async () => {
    if (!effectiveUserId || loadingFollowers) return;

    try {
      setLoadingFollowers(true);
      const response = await fetch(`/api/user/${effectiveUserId}/followers`);
      if (response.ok) {
        const data = await response.json();
        setFollowers(data.followers || []);
      }
    } catch (error) {
      console.error('Error loading followers:', error);
    } finally {
      setLoadingFollowers(false);
    }
  };

  // Load following
  const loadFollowing = async () => {
    if (!effectiveUserId || loadingFollowing) return;

    try {
      setLoadingFollowing(true);
      const response = await fetch(`/api/user/${effectiveUserId}/following`);
      if (response.ok) {
        const data = await response.json();
        setFollowing(data.following || []);
      }
    } catch (error) {
      console.error('Error loading following:', error);
    } finally {
      setLoadingFollowing(false);
    }
  };

  // Load followers/following when tab changes
  useEffect(() => {
    if (activeTab === 'followers' && followers.length === 0) {
      loadFollowers();
    } else if (activeTab === 'following' && following.length === 0) {
      loadFollowing();
    }
  }, [activeTab, effectiveUserId]);

  // Handle edit profile form changes
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit profile form submission
  const handleEditProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isCurrentUser || !user) return;

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName: editForm.displayName,
          username: editForm.username,
          bio: editForm.bio
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const data = await response.json();
      const updatedProfile = data.user;

      if (updatedProfile && userData) {
        setUserData({
          ...userData,
          name: updatedProfile.displayName,
          username: updatedProfile.username,
          bio: updatedProfile.bio || 'No bio yet'
        });
        setIsEditing(false);
      }
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(err.message || 'Failed to update profile');
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="animate-pulse pb-8">
        <div className="relative h-64 mb-20 rounded-xl overflow-hidden bg-dark-lighter"></div>
        <div className="px-8 mb-8">
          <div className="h-8 bg-dark-lighter rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-dark-lighter rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-dark-lighter rounded w-full max-w-3xl"></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error || (!isLoading && !userData)) {
    return (
      <div className="bg-dark-lighter rounded-xl p-6 text-center">
        <p className="text-red-400 mb-4">{error || 'User not found'}</p>
        <Link href="/" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
          Go Home
        </Link>
      </div>
    );
  }

  // Render minimal profile for sidebar
  if (minimal && userData) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden">
            <Image
              src={userData.profilePic}
              alt={userData.name}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="font-bold text-lg">{userData.name}</h2>
            <p className="text-gray-400 text-sm">@{userData.username}</p>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <div>
                <span className="font-bold text-white">{userData.followersCount}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold text-white">{userData.followingCount}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
            </div>
            <p className="text-gray-400 text-xs mt-1">Joined {userData.joinDate}</p>
          </div>
        </div>
        <Link
          href={`/profile`}
          className="block w-full text-center bg-dark-lighter hover:bg-dark-lightest text-white font-medium py-2 px-4 rounded-lg transition-colors mt-4"
        >
          View Profile
        </Link>
      </div>
    );
  }

  // Render full profile
  return (
    <div className="pb-8">
      {/* Navigation */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
        >
          <svg
            className="w-5 h-5 transition-transform group-hover:-translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Profile Header */}
      <div className="bg-dark-lighter/50 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-dark-lightest/30">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Profile Picture */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20 flex-shrink-0">
            <Image
              src={userData.profilePic}
              alt={userData.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Profile Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">{userData.name}</h1>
                <p className="text-gray-400">@{userData.username}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <button
                    className="hover:text-white transition-colors"
                    onClick={() => setActiveTab('followers')}
                  >
                    <span className="font-bold text-white">{userData.followersCount}</span>
                    <span className="text-gray-400 ml-1">Followers</span>
                  </button>
                  <button
                    className="hover:text-white transition-colors"
                    onClick={() => setActiveTab('following')}
                  >
                    <span className="font-bold text-white">{userData.followingCount}</span>
                    <span className="text-gray-400 ml-1">Following</span>
                  </button>
                </div>
                <p className="text-gray-500 text-sm mt-1">Joined {userData.joinDate}</p>
              </div>

              {/* Action Button */}
              {isCurrentUser && (
                <button
                  className="bg-primary hover:bg-primary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>

            {/* Bio */}
            <p className="text-gray-300 max-w-2xl">{userData.bio}</p>
          </div>
        </div>
      </div>

      {/* Fix Username Alert - Only show for current user with problematic username */}
      {isCurrentUser && userData.username && (
        userData.username.startsWith('user_') ||
        userData.username.length > 20 ||
        /^[a-f0-9]{20,}$/.test(userData.username) // Matches long hex-like strings
      ) && (
        <FixUsernameButton />
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex overflow-x-auto border-b border-dark-lightest/50">
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'overview'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'playlists'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('playlists')}
          >
            Playlists ({userData.playlists.length})
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'favorites'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('favorites')}
          >
            Favorites ({userData.favorites.length})
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'tags'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('tags')}
          >
            Tags ({userData.tags.length})
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'genres'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('genres')}
          >
            Genres ({userData.genres.length})
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'followers'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('followers')}
          >
            Followers ({userData.followersCount})
          </button>
          <button
            className={`px-6 py-3 border-b-2 font-medium transition-colors ${
              activeTab === 'following'
                ? 'border-primary text-white'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
            onClick={() => setActiveTab('following')}
          >
            Following ({userData.followingCount})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-dark-lighter/50 rounded-xl p-6 text-center border border-dark-lightest/30">
              <h3 className="text-gray-400 text-sm mb-2">Playlists</h3>
              <p className="text-3xl font-bold text-primary">{userData.playlists.length}</p>
            </div>
            <div className="bg-dark-lighter/50 rounded-xl p-6 text-center border border-dark-lightest/30">
              <h3 className="text-gray-400 text-sm mb-2">Favorites</h3>
              <p className="text-3xl font-bold text-primary">{userData.favorites.length}</p>
            </div>
            <div className="bg-dark-lighter/50 rounded-xl p-6 text-center border border-dark-lightest/30">
              <h3 className="text-gray-400 text-sm mb-2">Tags</h3>
              <p className="text-3xl font-bold text-primary">{userData.tags.length}</p>
            </div>
            <div className="bg-dark-lighter/50 rounded-xl p-6 text-center border border-dark-lightest/30">
              <h3 className="text-gray-400 text-sm mb-2">Genres</h3>
              <p className="text-3xl font-bold text-primary">{userData.genres.length}</p>
            </div>
          </div>
        )}

        {/* Playlists Tab */}
        {activeTab === 'playlists' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{isCurrentUser ? 'Your' : `${userData.name}'s`} Playlists</h2>
              {isCurrentUser && (
                <Link href="/library" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg">
                  Create Playlist
                </Link>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userData.playlists.length > 0 ? (
                userData.playlists.map((playlist) => (
                  <Link
                    key={playlist.id}
                    href={`/playlist/${playlist.id}`}
                    className="bg-dark-lighter/50 rounded-xl p-4 hover:bg-dark-lighter transition-colors border border-dark-lightest/30"
                  >
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-4">
                      <Image
                        src={playlist.coverUrl}
                        alt={playlist.name}
                        fill
                        className="object-cover"
                      />
                      {!playlist.isPublic && (
                        <div className="absolute top-2 right-2">
                          <span className="bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                            Private
                          </span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-white truncate">{playlist.name}</h3>
                    <p className="text-sm text-gray-400">{playlist.trackCount} tracks</p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-dark-lighter/50 rounded-xl border border-dark-lightest/30">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"/>
                  </svg>
                  <p className="text-gray-400 mb-4">No playlists yet</p>
                  {isCurrentUser && (
                    <Link href="/library" className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg">
                      Create Your First Playlist
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Favorite Tracks</h2>
            <div className="space-y-3">
              {userData.favorites.length > 0 ? (
                userData.favorites.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center gap-4 p-4 bg-dark-lighter/50 rounded-xl hover:bg-dark-lighter transition-colors border border-dark-lightest/30"
                  >
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={track.thumbnail}
                        alt={track.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{track.title}</p>
                      <p className="text-sm text-gray-400 truncate">{track.artist}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-dark-lighter/50 rounded-xl border border-dark-lightest/30">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                  </svg>
                  <p className="text-gray-400">No favorite tracks yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags Tab */}
        {activeTab === 'tags' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Music Tags</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.tags.length > 0 ? (
                userData.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/tags`}
                    className="flex items-center gap-3 p-4 bg-dark-lighter/50 rounded-xl hover:bg-dark-lighter transition-colors border border-dark-lightest/30"
                  >
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{tag.name}</p>
                      <p className="text-sm text-gray-400">{tag.trackCount} tracks</p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-dark-lighter/50 rounded-xl border border-dark-lightest/30">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                  <p className="text-gray-400">No tags created yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Genres Tab */}
        {activeTab === 'genres' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Music Genres</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {userData.genres.length > 0 ? (
                userData.genres.map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/genre/${genre.id}`}
                    className="p-4 bg-dark-lighter/50 rounded-xl hover:bg-dark-lighter transition-colors border border-dark-lightest/30"
                  >
                    <h3 className="font-medium text-white mb-1">{genre.name}</h3>
                    <p className="text-sm text-gray-400">{genre.trackCount} tracks</p>
                  </Link>
                ))
              ) : (
                <div className="col-span-full text-center py-12 bg-dark-lighter/50 rounded-xl border border-dark-lightest/30">
                  <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
                  </svg>
                  <p className="text-gray-400">No genres organized yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Followers Tab */}
        {activeTab === 'followers' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Followers</h2>
            {loadingFollowers ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading followers...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {followers.length > 0 ? (
                  followers.map((follower) => (
                    <Link
                      key={follower.id}
                      href={`/user/${follower.username}`}
                      className="flex items-center gap-4 p-4 bg-dark-lighter/50 rounded-xl hover:bg-dark-lighter transition-colors border border-dark-lightest/30"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={follower.avatarUrl}
                          alt={follower.displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-white truncate">{follower.displayName}</p>
                          {follower.isVerified && (
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">@{follower.username}</p>
                        {follower.bio && (
                          <p className="text-xs text-gray-500 truncate mt-1">{follower.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-dark-lighter/50 rounded-xl border border-dark-lightest/30">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p className="text-gray-400">No followers yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Following Tab */}
        {activeTab === 'following' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Following</h2>
            {loadingFollowing ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-gray-400 mt-2">Loading following...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {following.length > 0 ? (
                  following.map((followedUser) => (
                    <Link
                      key={followedUser.id}
                      href={`/user/${followedUser.username}`}
                      className="flex items-center gap-4 p-4 bg-dark-lighter/50 rounded-xl hover:bg-dark-lighter transition-colors border border-dark-lightest/30"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <Image
                          src={followedUser.avatarUrl}
                          alt={followedUser.displayName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="font-medium text-white truncate">{followedUser.displayName}</p>
                          {followedUser.isVerified && (
                            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className="text-sm text-gray-400 truncate">@{followedUser.username}</p>
                        {followedUser.bio && (
                          <p className="text-xs text-gray-500 truncate mt-1">{followedUser.bio}</p>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-dark-lighter/50 rounded-xl border border-dark-lightest/30">
                    <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    <p className="text-gray-400">Not following anyone yet</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-dark-lighter rounded-lg w-full max-w-md animate-fade-in">
            <div className="p-4 border-b border-dark-lightest">
              <h2 className="text-xl font-semibold">Edit Profile</h2>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="p-4">
              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Display Name</label>
                <input
                  type="text"
                  name="displayName"
                  value={editForm.displayName}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={editForm.username}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-400 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleEditFormChange}
                  className="w-full bg-dark border border-dark-lightest rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-400 hover:text-white"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
