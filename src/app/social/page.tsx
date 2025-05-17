'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Layout from "@/components/layout/Layout";
import SocialFeed from "@/components/social/SocialFeed";
import SocialTabs from "@/components/social/SocialTabs";
import UserProfile from "@/components/user/UserProfile";
import { useAuth } from '@/hooks/useAuth';

export default function SocialPage() {
  const { isAuthenticated, user } = useAuth();
  const searchParams = useSearchParams();
  const filter = searchParams.get('filter') as 'all' | 'following' | 'trending' || 'all';
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<{tag: string, count: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch suggested users to follow
  useEffect(() => {
    const fetchSuggestedUsers = async () => {
      try {
        setIsLoading(true);

        // In a real app, this would be an API call to get suggested users
        // For now, we'll simulate it with a timeout
        setTimeout(() => {
          // Generate mock suggested users
          const mockUsers = [
            {
              id: 'user-1',
              username: 'emmaw',
              displayName: 'Emma Wilson',
              avatarUrl: '/images/man_with_headse.png',
              bio: 'Music enthusiast and playlist creator',
              mutualFriends: 5,
              isFollowing: false
            },
            {
              id: 'user-2',
              username: 'alexj',
              displayName: 'Alex Johnson',
              avatarUrl: '/images/logo.png',
              bio: 'Hip-hop lover and DJ',
              mutualFriends: 3,
              isFollowing: false
            },
            {
              id: 'user-3',
              username: 'sophiac',
              displayName: 'Sophia Chen',
              avatarUrl: '/images/two_people_enjoying_music.png',
              bio: 'Classical pianist and music teacher',
              mutualFriends: 7,
              isFollowing: false
            }
          ];

          // Generate trending topics
          const mockTopics = [
            { tag: '#NewMusic', count: '2.5K posts' },
            { tag: '#SummerPlaylist', count: '1.8K posts' },
            { tag: '#MusicFestival', count: '1.2K posts' },
            { tag: '#AcousticCovers', count: '950 posts' },
            { tag: '#ThrowbackThursday', count: '820 posts' }
          ];

          setSuggestedUsers(mockUsers);
          setTrendingTopics(mockTopics);
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to load social data:', err);
        setIsLoading(false);
      }
    };

    fetchSuggestedUsers();
  }, []);

  // Handle following a user
  const handleFollowUser = (userId: string) => {
    if (!isAuthenticated || !user) {
      alert('You need to be logged in to follow users.');
      return;
    }

    // Update UI optimistically
    setSuggestedUsers(prev =>
      prev.map(suggestedUser => {
        if (suggestedUser.id === userId) {
          return {
            ...suggestedUser,
            isFollowing: !suggestedUser.isFollowing
          };
        }
        return suggestedUser;
      })
    );

    // In a real app, this would call the social service to follow/unfollow the user
    // if (user) {
    //   const isCurrentlyFollowing = suggestedUsers.find(u => u.id === userId)?.isFollowing;
    //   if (isCurrentlyFollowing) {
    //     socialService.unfollowUser(user.id, userId);
    //   } else {
    //     socialService.followUser(user.id, userId);
    //   }
    // }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Social</h1>

        <SocialTabs />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="lg:col-span-2">
            <SocialFeed filter={filter} />
          </div>

          <div className="lg:col-span-1">
            {/* User Profile Card - Only shown when authenticated */}
            {isAuthenticated && (
              <div className="bg-background-card rounded-lg overflow-hidden shadow-md mb-6">
                <UserProfile minimal={true} />
              </div>
            )}

            {/* Friend Suggestions */}
            <div className="bg-background-card rounded-lg p-6 mb-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Friend Suggestions</h2>

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-background-elevated"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-background-elevated rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-background-elevated rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {suggestedUsers.map(user => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden">
                          <img src={user.avatarUrl} alt={user.displayName} className="object-cover w-full h-full" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.displayName}</p>
                          <p className="text-xs text-text-secondary">@{user.username} • {user.mutualFriends} mutual friends</p>
                        </div>
                      </div>
                      <button
                        className={`text-xs ${user.isFollowing
                          ? 'border border-primary text-primary'
                          : 'bg-primary hover:bg-primary-light text-white'}
                          font-medium py-1.5 px-3 rounded-full transition-colors`}
                        onClick={() => handleFollowUser(user.id)}
                      >
                        {user.isFollowing ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button className="text-primary hover:text-primary-light text-sm mt-4 w-full text-center">
                See More
              </button>
            </div>

            {/* Trending Topics */}
            <div className="bg-background-card rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-bold mb-4">Trending Topics</h2>

              {isLoading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="h-4 bg-background-elevated rounded w-1/2 mb-2"></div>
                        <div className="h-3 bg-background-elevated rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{topic.tag}</p>
                        <p className="text-xs text-text-secondary">{topic.count}</p>
                      </div>
                      <button className="text-text-secondary hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}


