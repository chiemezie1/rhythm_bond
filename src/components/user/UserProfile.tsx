'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import socialService from '@/services/socialService';
import userDataService from '@/services/userDataService';
import { useMusic } from '@/contexts/MusicContext';

interface UserProfileData {
  id: string;
  name: string;
  username: string;
  profilePic: string;
  coverPic: string;
  followers: number;
  following: number;
  joinDate: string;
  isPremium: boolean;
  bio: string;
  stats: {
    totalListeningTime: string;
    tracksPlayed: number;
    topGenres: Array<{ name: string; percentage: number }>;
    topArtists: Array<{ id: string; name: string; playCount: number; coverUrl: string }>;
    recentlyPlayed: Array<{ id: string; title: string; artist: string; playedAt: string; coverUrl: string }>;
  };
  playlists: Array<{ id: string; title: string; trackCount: number; coverUrl: string; isPublic: boolean }>;
}

interface UserProfileProps {
  userId?: string;
  minimal?: boolean;
}

export default function UserProfile({ userId, minimal = false }: UserProfileProps) {
  const { user, isAuthenticated, updateProfile } = useAuth();
  const { getUserRecentlyPlayed, getPlaylists } = useMusic();
  const [userData, setUserData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    bio: ''
  });

  // Determine which user ID to use
  const profileUserId = userId || (user?.id as string);
  const isCurrentUser = !userId || (user && userId === user.id);

  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!profileUserId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get user profile from social service
        const profile = await socialService.getUserProfile(profileUserId);

        if (!profile) {
          setError('User not found');
          setIsLoading(false);
          return;
        }

        // Get user's playlists
        const playlists = await userDataService.getPlaylists(profileUserId);

        // Get recently played tracks
        const recentlyPlayed = await userDataService.getRecentlyPlayed(profileUserId);

        // Check if current user is following this user
        let following = false;
        if (isAuthenticated && user && user.id !== profileUserId) {
          following = await socialService.isFollowing(user.id, profileUserId);
          setIsFollowing(following);
        }

        // Transform data to match our UI needs
        const transformedData: UserProfileData = {
          id: profile.id,
          name: profile.displayName,
          username: profile.username,
          profilePic: profile.avatarUrl,
          coverPic: profile.coverUrl,
          followers: profile.followers.length,
          following: profile.following.length,
          joinDate: new Date(profile.joinDate).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long'
          }),
          isPremium: profile.isVerified,
          bio: profile.bio || 'No bio yet',
          stats: {
            totalListeningTime: '0 hours', // This would come from a different service
            tracksPlayed: 0, // This would come from a different service
            topGenres: [
              { name: 'Unknown', percentage: 100 } // This would come from a different service
            ],
            topArtists: [], // This would come from a different service
            recentlyPlayed: recentlyPlayed.slice(0, 3).map(item => ({
              id: item.tracks[0].id,
              title: item.tracks[0].title,
              artist: item.tracks[0].artist,
              playedAt: new Date(item.timestamp).toLocaleString(),
              coverUrl: item.tracks[0].thumbnail
            }))
          },
          playlists: playlists.map(playlist => ({
            id: playlist.id,
            title: playlist.name,
            trackCount: playlist.tracks.length,
            coverUrl: playlist.tracks.length > 0 ? playlist.tracks[0].thumbnail : '/images/logo.png',
            isPublic: playlist.isPublic
          }))
        };

        setUserData(transformedData);

        // Initialize edit form if this is the current user
        if (isCurrentUser) {
          setEditForm({
            displayName: profile.displayName,
            username: profile.username,
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
  }, [profileUserId, isAuthenticated, user, isCurrentUser]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!isAuthenticated || !user || !profileUserId) {
      alert('Please log in to follow users');
      return;
    }

    try {
      if (isFollowing) {
        await socialService.unfollowUser(user.id, profileUserId);
        setIsFollowing(false);
      } else {
        await socialService.followUser(user.id, profileUserId);
        setIsFollowing(true);
      }

      // Refresh profile to update follower count
      const updatedProfile = await socialService.getUserProfile(profileUserId);
      if (updatedProfile && userData) {
        setUserData({
          ...userData,
          followers: updatedProfile.followers.length
        });
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      alert('Failed to update follow status');
    }
  };

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
      const updatedProfile = await updateProfile({
        displayName: editForm.displayName,
        username: editForm.username,
        bio: editForm.bio
      });

      if (updatedProfile && userData) {
        setUserData({
          ...userData,
          name: updatedProfile.displayName,
          username: updatedProfile.username,
          bio: updatedProfile.bio || 'No bio yet'
        });
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Failed to update profile');
    }
  };

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

  if (error || !userData) {
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
            <div className="flex items-center gap-4 mt-1 text-sm">
              <div>
                <span className="font-bold">{userData.followers}</span>
                <span className="text-gray-400 ml-1">Followers</span>
              </div>
              <div>
                <span className="font-bold">{userData.following}</span>
                <span className="text-gray-400 ml-1">Following</span>
              </div>
            </div>
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
      {/* Profile Header */}
      <div className="relative h-64 mb-20 rounded-xl overflow-hidden">
        {/* Cover Image */}
        <div className="absolute inset-0">
          <Image
            src={userData.coverPic}
            alt="Cover"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent"></div>
        </div>

        {/* Profile Picture */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-dark">
            <Image
              src={userData.profilePic}
              alt={userData.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="absolute bottom-4 right-4">
          {isCurrentUser ? (
            <button
              className="bg-dark-lighter hover:bg-dark-lightest text-white font-medium py-2 px-4 rounded-full transition-colors"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </button>
          ) : (
            <button
              className={`font-medium py-2 px-4 rounded-full transition-colors ${
                isFollowing
                  ? 'bg-primary text-white hover:bg-primary-dark'
                  : 'bg-dark-lighter text-white hover:bg-dark-lightest'
              }`}
              onClick={handleFollowToggle}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{userData.name}</h1>
              {userData.isPremium && (
                <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-400">@{userData.username}</p>
          </div>
          <div className="flex items-center gap-4 mt-2 md:mt-0">
            <div>
              <span className="font-bold">{userData.followers}</span>
              <span className="text-gray-400 ml-1">Followers</span>
            </div>
            <div>
              <span className="font-bold">{userData.following}</span>
              <span className="text-gray-400 ml-1">Following</span>
            </div>
            <div>
              <span className="text-gray-400">Joined {userData.joinDate}</span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 max-w-3xl mb-4">{userData.bio}</p>
      </div>

      {/* Tabs */}
      <div className="px-8 border-b border-dark-lightest mb-8">
        <div className="flex overflow-x-auto">
          <button className="px-4 py-2 border-b-2 border-primary text-white font-medium">
            Overview
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white">
            Playlists
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white">
            Listening History
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white">
            Following
          </button>
          <button className="px-4 py-2 border-b-2 border-transparent text-gray-400 hover:text-white">
            Followers
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="px-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Listening Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6 text-center">
            <h3 className="text-gray-400 text-sm mb-2">Total Listening Time</h3>
            <p className="text-3xl font-bold">{userData.stats.totalListeningTime}</p>
          </div>
          <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6 text-center">
            <h3 className="text-gray-400 text-sm mb-2">Tracks Played</h3>
            <p className="text-3xl font-bold">{userData.stats.tracksPlayed}</p>
          </div>
          <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6 text-center">
            <h3 className="text-gray-400 text-sm mb-2">Top Genre</h3>
            <p className="text-3xl font-bold">{userData.stats.topGenres[0].name}</p>
          </div>
        </div>
      </div>

      {/* Top Genres */}
      <div className="px-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Top Genres</h2>
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl p-6">
          {userData.stats.topGenres.map((genre, index) => (
            <div key={index} className="mb-3 last:mb-0">
              <div className="flex justify-between mb-1">
                <span>{genre.name}</span>
                <span>{genre.percentage}%</span>
              </div>
              <div className="h-2 bg-dark-lightest rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary"
                  style={{ width: `${genre.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Artists */}
      <div className="px-8 mb-8">
        <h2 className="text-xl font-bold mb-4">Top Artists</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {userData.stats.topArtists.map((artist) => (
            <Link
              key={artist.id}
              href={`/artist/${artist.id}`}
              className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-4 hover:bg-dark-lightest transition-colors text-center"
            >
              <div className="relative w-24 h-24 rounded-full overflow-hidden mx-auto mb-3">
                <Image
                  src={artist.coverUrl}
                  alt={artist.name}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="font-medium text-sm">{artist.name}</h3>
              <p className="text-xs text-gray-400">{artist.playCount} plays</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Your Playlists */}
      <div className="px-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{isCurrentUser ? 'Your' : `${userData.name}'s`} Playlists</h2>
          <Link href={isCurrentUser ? "/playlists" : `/user/${userData.username}/playlists`} className="text-sm text-primary hover:underline">
            See All
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {userData.playlists.length > 0 ? (
            userData.playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlist/${playlist.id}`}
                className="bg-dark-lighter dark:bg-dark-lighter rounded-lg p-3 hover:bg-dark-lightest transition-colors"
              >
                <div className="relative aspect-square rounded-md overflow-hidden mb-3">
                  <Image
                    src={playlist.coverUrl}
                    alt={playlist.title}
                    fill
                    className="object-cover"
                  />
                  {!playlist.isPublic && (
                    <div className="absolute top-2 right-2">
                      <span className="bg-dark-lighter bg-opacity-80 text-white text-xs px-2 py-0.5 rounded-full">
                        Private
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm">{playlist.title}</h3>
                <p className="text-xs text-gray-400">{playlist.trackCount} tracks</p>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-8 bg-dark-lighter rounded-xl">
              <p className="text-gray-400 mb-4">No playlists yet</p>
              {isCurrentUser && (
                <Link href="/playlist/create" className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-md">
                  Create a Playlist
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Recently Played */}
      <div className="px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recently Played</h2>
          <Link href={isCurrentUser ? "/history" : `/user/${userData.username}/history`} className="text-sm text-primary hover:underline">
            See All
          </Link>
        </div>
        <div className="bg-dark-lighter dark:bg-dark-lighter rounded-xl overflow-hidden">
          {userData.stats.recentlyPlayed.length > 0 ? (
            userData.stats.recentlyPlayed.map((track) => (
              <div
                key={track.id}
                className="flex items-center gap-4 p-4 hover:bg-dark-lightest transition-colors cursor-pointer border-b border-dark-lightest last:border-0"
              >
                <div className="relative h-12 w-12 rounded overflow-hidden flex-shrink-0">
                  <Image
                    src={track.coverUrl}
                    alt={track.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{track.title}</p>
                  <p className="text-sm text-gray-400">{track.artist}</p>
                </div>
                <span className="text-sm text-gray-400">{track.playedAt}</span>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-400">No recently played tracks</p>
            </div>
          )}
        </div>
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
