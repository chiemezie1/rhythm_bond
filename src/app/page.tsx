'use client';

import { useAuth } from '@/hooks/useAuth';
import Layout from "@/components/layout/Layout";
import MusicCategories from "@/components/music/MusicCategories";
import RecentlyPlayed from "@/components/music/RecentlyPlayed";
import RecommendedSection from "@/components/music/RecommendedSection";
import TrendingTracks from "@/components/music/TrendingTracks";
import WelcomePage from "@/components/user/WelcomePage";
import FavoriteTracks from "@/components/music/FavoriteTracks";
import UserPlaylists from "@/components/music/UserPlaylists";
import MostPlayedTracks from "@/components/music/MostPlayedTracks";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Render home content
  const renderHomeContent = () => (
    <div className="max-w-7xl mx-auto">
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

      {/* Recommended Section */}
      <RecommendedSection />

      {/* Trending Tracks */}
      <TrendingTracks />
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
        renderHomeContent()
      ) : (
        // Non-authenticated user content
        <WelcomePage />
      )}
    </Layout>
  );
}
