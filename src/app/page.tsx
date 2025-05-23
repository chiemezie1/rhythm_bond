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
import Link from "next/link";

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  // Render home content
  const renderHomeContent = () => (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to RhythmBond</h1>
          <p className="text-gray-400">Discover, organize, share and enjoy your music collection</p>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link
          href="/music-management"
          className="bg-gradient-to-br from-primary to-primary-dark p-6 rounded-xl text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <h3 className="font-semibold">Music Management</h3>
          </div>
          <p className="text-sm opacity-90">Organize and manage your entire music collection</p>
        </Link>

        <Link
          href="/library"
          className="bg-gradient-to-br from-secondary to-secondary-dark p-6 rounded-xl text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="font-semibold">Your Library</h3>
          </div>
          <p className="text-sm opacity-90">Browse your personal music library</p>
        </Link>

        <Link
          href="/search"
          className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="font-semibold">Discover Music</h3>
          </div>
          <p className="text-sm opacity-90">Search and discover new tracks</p>
        </Link>

        <Link
          href="/social"
          className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white hover:shadow-lg transition-all duration-300 hover:scale-105"
        >
          <div className="flex items-center gap-3 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="font-semibold">Social Feed</h3>
          </div>
          <p className="text-sm opacity-90">Connect with other music lovers</p>
        </Link>
      </div>

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
