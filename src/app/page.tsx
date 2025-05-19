'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from "@/components/layout/Layout";
import MusicCategories from "@/components/music/MusicCategories";
import RecentlyPlayed from "@/components/music/RecentlyPlayed";
import RecommendedSection from "@/components/music/RecommendedSection";
import TrendingTracks from "@/components/music/TrendingTracks";
import SocialFeed from "@/components/social/SocialFeed";
import SimplifiedSocialFeed from "@/components/social/SimplifiedSocialFeed";
import SocialTabs from "@/components/social/SocialTabs";
import WelcomePage from "@/components/user/WelcomePage";
import FavoriteTracks from "@/components/music/FavoriteTracks";
import UserPlaylists from "@/components/music/UserPlaylists";
import CustomTags from "@/components/music/CustomTags";
import MostPlayedTracks from "@/components/music/MostPlayedTracks";
import HomeTabs from "@/components/HomeTabs";
import UserProfile from "@/components/user/UserProfile";

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState<'home' | 'social'>('home');
  const [suggestedUsers, setSuggestedUsers] = useState<any[]>([
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
  ]);
  const [trendingTopics, setTrendingTopics] = useState<{tag: string, count: string}[]>([
    { tag: '#NewMusic', count: '2.5K posts' },
    { tag: '#SummerPlaylist', count: '1.8K posts' },
    { tag: '#MusicFestival', count: '1.2K posts' },
    { tag: '#AcousticCovers', count: '950 posts' },
    { tag: '#ThrowbackThursday', count: '820 posts' }
  ]);

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
  };

  // Render home content
  const renderHomeContent = () => (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Main Content Area */}
      <div className="xl:col-span-3">
        {/* Music Categories */}
        <MusicCategories />

        {/* Recently Played */}
        <RecentlyPlayed />

        {/* Favorites Section */}
        <FavoriteTracks />

        {/* Most Played Section */}
        <MostPlayedTracks />

        {/* User Playlists Section */}
        <UserPlaylists />

        {/* Custom Tags Section */}
        <CustomTags />

        {/* Recommended Section */}
        <RecommendedSection />

        {/* Trending Tracks */}
        <TrendingTracks />
      </div>

      {/* Social Feed Sidebar */}
      <div className="hidden xl:block">
        <SocialFeed />
      </div>
    </div>
  );

  // Render social content
  const renderSocialContent = () => (
    <div className="max-w-6xl mx-auto">
      <SocialTabs />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2">
          <SimplifiedSocialFeed filter="all" />
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

            <button className="text-primary hover:text-primary-light text-sm mt-4 w-full text-center">
              See More
            </button>
          </div>

          {/* Trending Topics */}
          <div className="bg-background-card rounded-lg p-6 shadow-md">
            <h2 className="text-xl font-bold mb-4">Trending Topics</h2>

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
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout>
      {isLoading ? (
        // Loading state
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : isAuthenticated ? (
        // Authenticated user content
        <>
          <HomeTabs activeTab={activeTab} onTabChange={setActiveTab} />
          {activeTab === 'home' ? renderHomeContent() : renderSocialContent()}
        </>
      ) : (
        // Non-authenticated user content
        <WelcomePage />
      )}
    </Layout>
  );
}
